/**
 * @author zacharyjuang
 * 6/24/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import {connect} from 'react-redux';
import {BASE_URL, getHeatmap} from '../../actions';
import {Tabs, Tab, Modal, Button} from 'react-bootstrap';
import {blueShader, getLogMinMax} from "../../utils";

class RowHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  showModal(visible = true) {
    this.setState({
      visible
    });
  }

  render() {
    let {visible} = this.state;
    let {info} = this.props;

    return <td>
      <a onClick={this.showModal.bind(this, undefined)}>{info.name}</a>
      <Modal show={visible} onHide={this.showModal.bind(this, false)}>
        <Modal.Header closeButton>{info.name}</Modal.Header>
        <Modal.Body>
          {_.map(info, (val, key) => {
            return <p key={key}>{key}: {val}</p>;
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.showModal.bind(this, false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </td>;
  }
}

RowHeader.propTypes = {
  info: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    heatmap: state.heatmap
  };
};

class HeatMapBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: true,
      upper: 30,
      lower: 0,
      imgSrc: `${BASE_URL}/queryapp/heatmap/${this.props.requestId}.svg`
    };
  }

  componentDidMount() {
    this.props.getHeatmap(this.props.requestId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.props.getHeatmap(this.props.requestId);
      this.setImageSrc();
    }
  }

  toggleSuccess(success) {
    this.setState({success});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setImageSrc();
  }

  handleUpper(e) {
    this.setState({
      upper: e.target.value
    });
  }

  handleLower(e) {
    this.setState({
      lower: e.target.value
    });
  }

  setImageSrc() {
    let {upper, lower} = this.state;

    this.setState({
      imgSrc: `${BASE_URL}/queryapp/heatmap/${this.props.requestId}.svg?${$.param({
        upper,
        lower
      })}`
    });
  }

  render() {
    let {heatmap} = this.props;
    let {success, lower, upper, imgSrc} = this.state;
    let [min, max] = getLogMinMax(_.get(heatmap, 'result', []));

    return <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <label>Lower Bound (-log10):</label><input type="number" className="form-control" min={0} value={lower}
                                                   step="any" onChange={this.handleLower.bind(this)}/>
        <label>Upper Bound (-log10):</label><input type="number" className="form-control" min={0} value={upper}
                                                   step="any" onChange={this.handleUpper.bind(this)}/>
        <button className="btn btn-primary" type="submit">Submit</button>
      </form>
      <Tabs id="heatmap">
        <Tab title="Heat Map" eventKey={1}>
          <img src={imgSrc}
               onError={this.toggleSuccess.bind(this, false)}
               onLoad={this.toggleSuccess.bind(this, true)}/>

          {!success ?
            <div>Heatmap is not available for this query.</div> :
            null}
        </Tab>
        <Tab title="Table" eventKey={2}>
          <table className="motif">
            <thead>
            <tr>
              <th/>
              {_.map(_.get(heatmap, 'columns', {}), (val, i) => {
                return <th key={i}>{val}</th>;
              })}
            </tr>
            </thead>
            <tbody>
            {_.map(_.get(heatmap, 'result', []), (row, i) => {
              return <tr key={i}>
                <RowHeader info={row[0]}/>
                {_.map(row.slice(1), (cell, j) => {
                  let [background, color] = blueShader(cell, min, max);
                  return <td style={{background, color}} key={j}>{cell.toExponential(2)}</td>;
                })}
              </tr>;
            })}
            </tbody>
          </table>
        </Tab>
      </Tabs>
    </div>;
  }
}

HeatMapBody.propTypes = {
  requestId: PropTypes.string,
  getHeatmap: PropTypes.func,
  heatmap: PropTypes.object
};

const HeatMap = connect(mapStateToProps, {getHeatmap})(HeatMapBody);

export default HeatMap;

