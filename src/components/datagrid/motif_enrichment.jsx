/**
 * @author zacharyjuang
 * 4/2/18
 */
import React from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import _ from 'lodash';
import $ from 'jquery';
import {Modal, Button, Tab, Tabs} from 'react-bootstrap';
import {getMotifEnrichment, BASE_URL} from "../../actions";

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    motifEnrichment: state.motifEnrichment
  };
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  showModal() {
    this.setState({
      visible: true
    });
  }

  hideModal() {
    this.setState({
      visible: false
    });
  }

  render() {
    let {visible} = this.state;
    return <th colSpan={2}>
      <a onClick={this.showModal.bind(this)}>{this.props.children}</a>
      <Modal show={visible} onHide={this.hideModal.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Meta Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {_(this.props.data).map((val, key) => {
            return <p key={key}><b>{key}:</b> {val}</p>
          }).value()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.hideModal.bind(this)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </th>;
  }
}

Header.propTypes = {
  name: PropTypes.string,
  data: PropTypes.object,
  children: PropTypes.node
};

class MotifEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alpha: 0.05
    };
    this.alpha = React.createRef();
  }

  componentDidMount() {
    this.props.getMotifEnrichment(this.props.requestId, this.state.alpha);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.requestId !== this.props.requestId || prevState.alpha !== this.state.alpha) {
      this.props.getMotifEnrichment(this.props.requestId, this.state.alpha);
    }
  }

  handleAlpha(e) {
    e.preventDefault();
    this.setState({
      alpha: this.alpha.current.value
    });
  }

  render() {
    let {motifEnrichment, requestId} = this.props;
    let res = _(_.get(motifEnrichment, 'result', [])).flatten().filter((n) => typeof n === 'number');
    let min = Math.floor(Math.log10(res.min()));
    let max = Math.ceil(Math.log10(res.max()));

    return <div className="motif">
      <form onSubmit={this.handleAlpha.bind(this)}>
        <label>Alpha:</label>
        <input type="number" min={0} max={1} step={1e-8} style={{width: '10em'}} ref={this.alpha} placeholder={0.05}
               defaultValue={0.05}/>
        <button type="submit">Submit</button>
      </form>
      <Tabs id="motif_enrichment">
        <Tab title={"Table"} eventKey={1}>
          <table>
            <thead>
            <tr>
              <th/>
              {_(_.get(motifEnrichment, 'columns', {})).map((val, key) => {
                return <Header key={key}
                               data={val}>
                  {!_.isEmpty(val) ?
                    <div>{_(val).pick(['TRANSCRIPTION_FACTOR_ID', 'TRANSCRIPTION_FACTOR_NAME']).values().join('-')}<br/>
                      {_(val).pick(['EXPRESSION_TYPE', 'ANALYSIS_METHOD']).values().join('-')}
                    </div> :
                    key}
                </Header>;
              }).value()}
            </tr>
            <tr>
              <th/>
              {_(_.get(motifEnrichment, 'columns', {})).map((val, key) => {
                return [<th key={key}>promoter (p-value)</th>, <th key={key + 1}>gene body (p-value)</th>];
              }).flatten().value()}
            </tr>
            </thead>
            <tbody>
            {_(_.get(motifEnrichment, 'result', [])).sortBy((row) => parseInt(row[0].split('_')[1])).map((row, i) => {
              return <tr key={i}>
                <td>{row[0]}</td>
                {_.map(row.slice(1), (c, j) => {
                  let l = 48 + Math.round(52 * ((Math.log10(c) - min) / (max - min)));
                  l = l < 48 ? 48 : l;
                  let background = c ? `hsl(228,89%,${l}%)` : '#FFFFFF';
                  let color = l <= 65 && l >= 48 ? 'white' : 'black';
                  return <td key={j}
                             style={{background, color}}>{typeof c === 'number' ? c.toExponential(5) : null}</td>
                })}
              </tr>;
            }).value()}
            </tbody>
          </table>
        </Tab>
        <Tab title={"Heatmap"} eventKey={2}>
          <img
            src={`${BASE_URL}/queryapp/motif_enrichment/${requestId}/heatmap.svg?${$.param({alpha: this.state.alpha})}`}
            alt="heatmap"/>
        </Tab>
      </Tabs>

    </div>;
  }
}

MotifEnrichmentBody.propTypes = {
  requestId: PropTypes.string,
  getMotifEnrichment: PropTypes.func,
  motifEnrichment: PropTypes.object
};

const MotifEnrichment = connect(mapStateToProps, {getMotifEnrichment})(MotifEnrichmentBody);

export default MotifEnrichment;
