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
import {QueryNameCell} from "./motif_enrichment";
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

    return <th>
      <a className="text-primary link" onClick={this.showModal.bind(this, undefined)}>{this.props.children}</a>
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
    </th>;
  }
}

RowHeader.propTypes = {
  info: PropTypes.object.isRequired,
  children: PropTypes.node
};

class HeatmapTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    this.getTableData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tableUrl !== this.props.tableUrl) {
      this.getTableData();
    }
  }


  getTableData() {
    $.ajax({
      url: this.props.tableUrl
    })
      .done((data) => {
        this.setState({data});
        this.props.onSuccess();
      })
      .fail(this.props.onError);
  }

  render() {
    return <table className="table table-responsive table-sm">
      <thead>
      <tr>
        <th>Index</th>
        <th>Name</th>
        <th>No. Targets</th>
        <th>Gene Name</th>
        <th>Analysis ID</th>
      </tr>
      </thead>
      <tbody>
      {_.map(this.state.data, (row, i) => {
        return <tr key={i}>
          <RowHeader info={row[0]}>{row[1]}</RowHeader>
          <QueryNameCell>{row[2]}</QueryNameCell>
          <td>{row[3]}</td>
          <td>{row[4]}</td>
          <td>{row[5]}</td>
        </tr>;
      })}
      </tbody>
    </table>;
  }
}

HeatmapTable.propTypes = {
  tableUrl: PropTypes.string,
  onError: PropTypes.func,
  onSuccess: PropTypes.func
};

HeatmapTable.defaultProps = {
  onError: _.noop,
  onSuccess: _.noop
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
      imgSrc: `${BASE_URL}/queryapp/list_enrichment/${this.props.requestId}.svg`,
      key: "table",
      sortCol: null,
      ascending: true
    };
  }

  componentDidMount() {
    this.props.getHeatmap(this.props.requestId);
  }

  componentDidUpdate(prevProps) {
    let {heatmap} = this.props;

    if (prevProps.requestId !== this.props.requestId) {
      this.props.getHeatmap(this.props.requestId);
      this.setImageSrc();
    }

    if (!_.isEqual(prevProps.heatmap, heatmap)) {
      this.toggleSuccess(!heatmap.error);
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
      imgSrc: `${BASE_URL}/queryapp/list_enrichment/${this.props.requestId}.svg?${$.param({
        upper,
        lower
      })}`
    });
  }

  onTabClick(key) {
    this.setState({key});
  }

  sortFunc(i) {
    let {sortCol, ascending} = this.state;

    if (sortCol !== i) {
      this.setState({
        sortCol: i,
        ascending: true
      });
    } else if (ascending) {
      this.setState({
        ascending: false
      });
    } else if (!ascending) {
      this.setState({
        ascending: true,
        sortCol: null
      });
    }
  }

  render() {
    let {heatmap} = this.props;
    let {success, lower, upper, imgSrc, key, sortCol, ascending} = this.state;
    let [min, max] = getLogMinMax(_.get(heatmap, 'result', []));

    return <div>
      {!success ? <div className="text-danger">Heatmap is not available for this query.</div> : null}
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
          <table className="table-responsive table-sm table-bordered">
            <thead>
            <tr>
              <th/>
              {_(_.get(heatmap, 'columns', {}))
                .map((val, key) => [val, key])
                .map(([val, key], i) => {
                  return <th key={key}>
                    <div className="container-fluid">
                      <div className="row align-items-center">
                        <div className="col">
                          {val}
                        </div>
                        <div className="col-1" onClick={this.sortFunc.bind(this, i + 1)} style={{cursor: 'pointer'}}>
                          {sortCol !== i + 1 ?
                            <FontAwesomeIcon icon="sort"/> :
                            (ascending ? <FontAwesomeIcon icon="sort-up"/> : <FontAwesomeIcon icon="sort-down"/>)}
                        </div>
                      </div>
                    </div>
                  </th>;
                })
                .value()}
            </tr>
            </thead>
            <tbody>
            {_(_.get(heatmap, 'result', []))
              .orderBy((row) => _.isNull(row) ? row : row[sortCol], ascending ? 'asc' : 'desc')
              .map((row, i) => {
                return <tr key={i}>
                  <RowHeader info={row[0]}>{row[0].name}</RowHeader>
                  {_.map(row.slice(1), (cell, j) => {
                    let [background, color] = blueShader(cell, min, max);
                    return <td style={{background, color}} key={j}>{cell.toExponential(2)}</td>;
                  })}
                </tr>;
              })
              .value()}
            </tbody>
          </table>
        </TabPane>
        <TabPane tabId="heatmap">
          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <img src={imgSrc}
                     onError={this.toggleSuccess.bind(this, false)}
                     onLoad={this.toggleSuccess.bind(this, true)}/>
              </div>
              <div className="col">
                <HeatmapTable tableUrl={`${BASE_URL}/queryapp/list_enrichment/${this.props.requestId}/legend/`}
                              onSuccess={this.toggleSuccess.bind(this, true)}
                              onError={this.toggleSuccess.bind(this, false)}/>
              </div>
            </div>
          </div>
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

