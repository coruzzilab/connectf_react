/**
 * @author zacharyjuang
 * 6/24/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {BASE_URL, getHeatmap} from '../../actions';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';
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
      <Modal isOpen={visible} toggle={this.showModal.bind(this, false)}>
        <ModalHeader toggle={this.showModal.bind(this, false)}>{info.name}</ModalHeader>
        <ModalBody>
          {_.map(info, (val, key) => {
            return <p key={key}>{key}: {val}</p>;
          })}
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.showModal.bind(this, false)}><FontAwesomeIcon icon="times"/> Close</Button>
        </ModalFooter>
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
      upper: '',
      lower: '',
      imgSrc: `${BASE_URL}/queryapp/heatmap/${this.props.requestId}.svg`,
      key: "table"
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

  onTabClick(key) {
    this.setState({key});
  }

  render() {
    let {heatmap} = this.props;
    let {success, lower, upper, imgSrc, key} = this.state;
    let [min, max] = getLogMinMax(_.get(heatmap, 'result', []));

    return <div>
      <form onSubmit={this.handleSubmit.bind(this)} className="m-2">
        <div className="form-group mb-2">
          <label>Lower Bound (-log10):</label>
          <input type="number" className="form-control" min={0} value={lower} step="any"
                 onChange={this.handleLower.bind(this)}/>
        </div>
        <div className="form-group mb-2">
          <label>Upper Bound (-log10):</label>
          <input type="number" className="form-control" min={0} value={upper} step="any"
                 onChange={this.handleUpper.bind(this)}/>
        </div>
        <button className="btn btn-primary" type="submit">Submit</button>
      </form>

      <Nav tabs>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "table")} active={key === "table"}>
            Table
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "heatmap")} active={key === "heatmap"}>
            Heat Map
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={key}>
        <TabPane tabId="table">
          <table className="table table-bordered">
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
        </TabPane>
        <TabPane tabId="heatmap">
          <img src={imgSrc}
               onError={this.toggleSuccess.bind(this, false)}
               onLoad={this.toggleSuccess.bind(this, true)}/>

          {!success ?
            <div>Heatmap is not available for this query.</div> :
            null}
        </TabPane>
      </TabContent>
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

