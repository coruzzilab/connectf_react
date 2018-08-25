/**
 * @author zacharyjuang
 * 6/24/17
 */
import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {BASE_URL} from '../../actions';
import {QueryNameCell, SortButton, InfoTootip, SVGWarningTooltip} from "./common";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import {blueShader, getLogMinMax, svgAddTable} from "../../utils";
import {getHeatmapLegend, getHeatmapTable, setError} from "../../actions/heatmap";

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    heatmap: state.heatmap
  };
};

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

class HeatmapTableBody extends React.Component {
  componentDidMount() {
    this.props.getHeatmapLegend(this.props.requestId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.props.getHeatmapLegend(this.props.requestId);
    }
  }

  render() {
    let {heatmap} = this.props;

    return <table className="table table-responsive table-sm table-bordered">
      <thead>
      <tr>
        <th>Index</th>
        <th>Gene ID</th>
        <th>Filter</th>
        <th>No. Targets</th>
        <th>Gene Name</th>
        <th>Analysis ID</th>
      </tr>
      </thead>
      <tbody>
      {_.map(heatmap.legend, (row, i) => {
        return <tr key={i}>
          <RowHeader info={row[0]}>{row[1]}</RowHeader>
          <td>{row[2]}</td>
          <QueryNameCell>{row[3]}</QueryNameCell>
          <td>{row[4]}</td>
          <QueryNameCell>{row[5]}</QueryNameCell>
          <td>{row[6]}</td>
        </tr>;
      })}
      </tbody>
    </table>;
  }
}

HeatmapTableBody.propTypes = {
  requestId: PropTypes.string,
  getHeatmapLegend: PropTypes.func,
  heatmap: PropTypes.shape({legend: PropTypes.array})
};

const HeatmapTable = connect(mapStateToProps, {getHeatmapLegend})(HeatmapTableBody);

class TargetEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();

    this.imgData = null;
    this.xhr = null;

    this.state = {
      upper: '',
      lower: '',
      imgSrc: `${BASE_URL}/queryapp/list_enrichment/${this.props.requestId}.svg`,
      imgDataUri: null,
      key: "table",
      sortCol: null,
      ascending: true
    };
  }

  componentDidMount() {
    this.props.getHeatmapTable(this.props.requestId);
    this.getImgData();
  }

  componentWillUnmount() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.requestId !== this.props.requestId) {
      this.props.getHeatmapTable(this.props.requestId);
      this.setImageSrc();
    }

    if (this.state.imgSrc && prevState.imgSrc !== this.state.imgSrc) {
      this.getImgData();
    }
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

  getImgData() {
    let {setError} = this.props;

    this.xhr = $.ajax(this.state.imgSrc)
      .done((data) => {
        this.imgData = data;
        this.setState({
          imgDataUri: 'data:image/svg+xml,' + encodeURIComponent(data.documentElement.outerHTML)
        });
        setError(false);
      })
      .fail(() => {
        setError(true);
      });
  }

  exportSVG(e) {
    let {imgData} = this;

    if (imgData) {
      let svg = svgAddTable(imgData.documentElement, ReactDOM.findDOMNode(this.legend.current));

      e.currentTarget.href = 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML);
    } else {
      e.preventDefault();
    }
  }

  render() {
    let {heatmap} = this.props;
    let {lower, upper, key, sortCol, ascending, imgDataUri} = this.state;
    let [min, max] = getLogMinMax(_.get(heatmap.table, 'result', []));

    return <div>
      {heatmap.error ?
        <div className="text-danger text-lg-left text-sm-center">Target Enrichment is not available for this query: No
          gene list uploaded or no enrichment.</div> :
        <div>
          <form onSubmit={this.handleSubmit.bind(this)} className="m-2">
            <div className="form-group row align-items-center">
              <label className="col-sm-2 col-form-label">Lower Bound (-log10):</label>
              <div className="col-sm-9">
                <input type="number" className="form-control" min={0} value={lower} step="any"
                       onChange={this.handleLower.bind(this)}/>
              </div>
              <div className="col-sm-1">
                <InfoTootip>
                  Lower bound -log10 p-value for the color scale on the heat map.
                </InfoTootip>
              </div>
            </div>
            <div className="form-group row align-items-center">
              <label className="col-sm-2 col-form-label">Upper Bound (-log10):</label>
              <div className="col-sm-9">
                <input type="number" className="form-control" min={0} value={upper} step="any"
                       onChange={this.handleUpper.bind(this)}/>
              </div>
              <div className="col-sm-1">
                <InfoTootip>
                  Upper bound -log10 p-value for the color scale on the heat map.
                </InfoTootip>
              </div>
            </div>
            <div className="form-group row">
              <div className="col">
                <button className="btn btn-primary" type="submit">Submit</button>
              </div>
            </div>
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
                  {_(_.get(heatmap.table, 'columns', {}))
                    .map((val, key) => [val, key])
                    .map(([val, key], i) => {
                      return <th key={key}>
                        <div className="container-fluid">
                          <div className="row align-items-center">
                            <div className="col">
                              {val}
                            </div>
                            <div className="col-1">
                              <SortButton sorted={sortCol === i + 1} sortFunc={this.sortFunc.bind(this, i + 1)}
                                          ascending={ascending} style={{cursor: 'pointer'}}/>
                            </div>
                          </div>
                        </div>
                      </th>;
                    })
                    .value()}
                </tr>
                </thead>
                <tbody>
                {_(_.get(heatmap.table, 'result', []))
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
                <div className="row my-1 align-items-center">
                  <div className="col">
                    <div className="float-right">
                      <SVGWarningTooltip/>
                      <a className="btn btn-primary" onClick={this.exportSVG.bind(this)}
                                      download="list_enrichment.svg" href="#">
                      <FontAwesomeIcon icon="file-export" className="mr-1"/>Export SVG</a>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <img className="img-fluid" src={imgDataUri}/>
                  </div>
                  <div className="col">
                    <HeatmapTable ref={this.legend}/>
                  </div>
                </div>
              </div>
            </TabPane>
          </TabContent>
        </div>}
    </div>;
  }
}

TargetEnrichmentBody.propTypes = {
  requestId: PropTypes.string,
  getHeatmapTable: PropTypes.func,
  heatmap: PropTypes.object,
  setError: PropTypes.func
};

const TargetEnrichment = connect(mapStateToProps, {getHeatmapTable, setError})(TargetEnrichmentBody);

export default TargetEnrichment;
