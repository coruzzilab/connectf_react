/**
 * @author zacharyjuang
 * 4/2/18
 */
import React from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import _ from 'lodash';
import $ from 'jquery';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import {getMotifEnrichment, BASE_URL} from "../../actions";
import {blueShader, getLogMinMax} from '../../utils';

export const BASE_COLORS = {
  'a': '#59C83B',
  't': '#CC2B1D',
  'c': '#0012D3',
  'g': '#F5BD41',
  'other': '#888888'
};

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    motifEnrichment: state.motifEnrichment
  };
};

export class ColHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
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
    return <th colSpan={this.props.colSpan}>
      <a onClick={this.showModal.bind(this)}>{this.props.children}</a>
      <Modal isOpen={visible} toggle={this.hideModal.bind(this)}>
        <ModalHeader toggle={this.hideModal.bind(this)}>
          Meta Data
        </ModalHeader>
        <ModalBody>
          {_(this.props.data).map((val, key) => {
            return <p key={key}><b>{key}:</b> {val}</p>;
          }).value()}
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.hideModal.bind(this)}><FontAwesomeIcon icon="times" className="mr-1"/>Close</Button>
        </ModalFooter>
      </Modal>
    </th>;
  }
}

ColHeader.propTypes = {
  colSpan: PropTypes.number,
  name: PropTypes.string,
  data: PropTypes.object,
  children: PropTypes.node
};

ColHeader.defaultProps = {
  colSpan: 1
};

export class RowHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
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
    let {data} = this.props;

    return <td>
      <a onClick={this.showModal.bind(this)}>{`${data.name} ${data['Family']}`}</a>
      <Modal isOpen={visible} toggle={this.hideModal.bind(this)}>
        <ModalHeader toggle={this.hideModal.bind(this)}>
          {`${data.name} ${data['Family']}`}
        </ModalHeader>
        <ModalBody>
          <p><span style={{fontWeight: 'bold'}}>Number of Motifs:</span> {data['# Motifs']}</p>
          <p style={{fontWeight: 'bold'}}>Consensus: {_.map(data['Consensus'], (cons, i) => {
            return <span key={i}
                         style={{
                           color: _.get(BASE_COLORS, _.lowerCase(cons), BASE_COLORS['other'])
                         }}>
              {cons}
              </span>;
          })}</p>
          <p><span style={{fontWeight: 'bold'}}>Family:</span> {data['Family']}</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.hideModal.bind(this)}><FontAwesomeIcon icon="times" className="mr-1"/>Close</Button>
        </ModalFooter>
      </Modal>
    </td>;
  }
}

RowHeader.propTypes = {
  data: PropTypes.object,
  children: PropTypes.node
};

class MotifEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alpha: 0.05,
      body: 'no',
      colSpan: 1,
      img: `${BASE_URL}/queryapp/motif_enrichment/${this.props.requestId}/heatmap.svg`,
      key: "table"
    };
  }

  componentDidMount() {
    this.getMotifEnrichment();
    this.setImgURL();
  }

  getMotifEnrichment() {
    this.props.getMotifEnrichment(this.props.requestId, this.state.alpha, this.state.body === 'yes');
  }

  setImgURL() {
    this.setState({
      img: `${BASE_URL}/queryapp/motif_enrichment/${this.props.requestId}/heatmap.svg?${$.param({
        alpha: this.state.alpha,
        body: this.state.body === 'yes' ? 1 : 0
      })}`
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.getMotifEnrichment();
      this.setImgURL();
    }
  }

  handleMotifForm(e) {
    e.preventDefault();
    this.getMotifEnrichment();
    this.setImgURL();
    this.setState({
      colSpan: this.state.body === 'yes' ? 2 : 1
    });
  }

  handleAlpha(e) {
    this.setState({
      alpha: e.target.value
    });
  }

  handleBody(e) {
    this.setState({
      body: e.target.value
    });
  }

  onTabClick(key) {
    this.setState({key});
  }

  render() {
    let {motifEnrichment} = this.props;
    let {body, img, colSpan, key} = this.state;
    let [min, max] = getLogMinMax(_.get(motifEnrichment, 'result', []));

    return <div className="table table-bordered">
      <form onSubmit={this.handleMotifForm.bind(this)}>
        <div>
          <label>Alpha:</label>
          <input type="number" min={0} max={1} step={1e-8} style={{width: '10em'}} placeholder={0.05}
                 defaultValue={0.05} onChange={this.handleAlpha.bind(this)} className="form-control"/>
        </div>
        <div>
          <p style={{fontWeight: 'bold'}}>Show Enrichment of Gene Body:</p>
          <div>
            <label><input type='radio' value='yes' checked={body === 'yes'}
                          onChange={this.handleBody.bind(this)}/>Yes</label>
          </div>
          <div>
            <label><input type='radio' value='no' checked={body === 'no'}
                          onChange={this.handleBody.bind(this)}/>No</label>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
      <Nav tabs>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "table")} active={key === "table"}>
            Table
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "heatmap")} active={key === "heatmap"}>
            Heatmap
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent id="motif_enrichment" activeTab={key}>
        <TabPane tabId="table">
          <table>
            <thead>
            <tr>
              <th/>
              {_(_.get(motifEnrichment, 'columns', {})).map((val, key) => {
                let line1 = _(val).pick(['TRANSCRIPTION_FACTOR_ID', 'TRANSCRIPTION_FACTOR_NAME']).values().join('-');
                let line2 = _(val).pick(['EXPRESSION_TYPE', 'ANALYSIS_METHOD']).values().join('-');
                let line3 = _.get(val, 'list_name', '');
                return <ColHeader key={key}
                                  data={val}
                                  colSpan={colSpan}>
                  {!_.isEmpty(val) ?
                    <div>{line1 ? <span>{line1}<br/></span> : null}
                      {line2 ? <span>{line2}<br/></span> : null}
                      {line3}
                    </div> :
                    key}
                </ColHeader>;
              }).value()}
            </tr>
            <tr>
              <th/>
              {colSpan === 2 ?
                _(_.get(motifEnrichment, 'columns', {})).map((val, key) => {
                  return [<th key={key}>promoter (p-value)</th>, <th key={key + 1}>gene body (p-value)</th>];
                }).flatten().value() :
                _(_.get(motifEnrichment, 'columns', {})).map((val, key) => {
                  return <th key={key}>promoter (p-value)</th>;
                }).value()
              }
            </tr>
            </thead>
            <tbody>
            {_(_.get(motifEnrichment, 'result', [])).sortBy((row) => parseInt(row[0].name.split('_')[1])).map((row, i) => {
              return <tr key={i}>
                <RowHeader data={row[0]}/>
                {_.map(row.slice(1), (c, j) => {
                  let [background, color] = blueShader(c, min, max);
                  return <td key={j}
                             style={{background, color}}>{typeof c === 'number' ? c.toExponential(5) : null}</td>;
                })}
              </tr>;
            }).value()}
            </tbody>
          </table>
        </TabPane>
        <TabPane tabId="heatmap">
          <img
            src={img}
            alt="heatmap"/>
        </TabPane>
      </TabContent>

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
