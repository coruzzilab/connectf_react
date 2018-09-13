/**
 * @author zacharyjuang
 * 6/24/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {setBusy} from '../../actions';
import {InfoTootip, QueryNameCell, SortButton, SVGWarningTooltip} from "./common";
import {
  Button,
  Collapse,
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
import {
  getTargetEnrichmentImage,
  getTargetEnrichmentLegend,
  getTargetEnrichmentTable,
  setError
} from "../../actions/target_enrichment";

function surround(s, p = '"', pre = ' ', default_ = '') {
  return s ? pre + p + s + p : default_;
}

const mapStateToProps = ({busy, requestId, targetEnrichment}) => {
  return {
    busy,
    requestId,
    targetEnrichment
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
  render() {
    let {targetEnrichment} = this.props;

    return <table className="table table-responsive table-sm table-bordered" ref={this.props.forwardedRef}>
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
      {_.map(targetEnrichment.legend, (row, i) => {
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
  targetEnrichment: PropTypes.shape({legend: PropTypes.array}),
  forwardedRef: PropTypes.object
};

const HeatmapTable = connect(mapStateToProps)(HeatmapTableBody);

const TargetEnrichmentWarning = () => (
  <div className="text-danger text-lg-left text-sm-center">Target Enrichment is not available for this query: No
    gene list uploaded or no enrichment.</div>);

class TargetEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();

    this.state = {
      upper: '',
      lower: '',
      key: "table",
      sortCol: null,
      ascending: true,
      collapse: false,
      exportSrc: null
    };
  }

  componentDidMount() {
    this.props.getTargetEnrichmentTable(this.props.requestId);
    this.getImgData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.props.getTargetEnrichmentTable(this.props.requestId);
      this.getImgData();
    }
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.getImgData();
    this.toggle();
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
    let {requestId, getTargetEnrichmentImage, getTargetEnrichmentLegend} = this.props;
    let {lower, upper} = this.state;

    return Promise.all([
      getTargetEnrichmentImage(requestId, {lower, upper}),
      getTargetEnrichmentLegend(requestId)
    ]).then((data) => {
      if (this.legend.current) {
        let svg = svgAddTable(data[0].documentElement, this.legend.current);
        this.setState({
          exportSrc: 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML)
        });
      }
    });
  }

  render() {
    let {targetEnrichment, busy} = this.props;
    let {lower, upper, key, sortCol, ascending, collapse, exportSrc} = this.state;
    let [min, max] = getLogMinMax(_.get(targetEnrichment.table, 'result', []));

    return <div>
      {targetEnrichment.error ?
        <TargetEnrichmentWarning/> :
        <div>
          <button type="button" className="btn btn-primary m-2" onClick={this.toggle.bind(this)}>
            <FontAwesomeIcon icon="cog" className="mr-1"/>Options
          </button>
          {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
          <Collapse isOpen={collapse}>
            <form onSubmit={this.handleSubmit.bind(this)} className="m-2">
              <div className="container-fluid">
                <div className="form-group row align-items-center">
                  <label className="col-sm-2 col-form-label">
                    Lower Bound (-log10):
                    <InfoTootip className="ml-1 d-inline">
                      Lower bound -log10 p-value for the color scale on the heat map.
                    </InfoTootip>
                  </label>
                  <div className="col-sm">
                    <input type="number" className="form-control" min={0} value={lower} step="any"
                           onChange={this.handleLower.bind(this)}/>
                  </div>
                </div>
                <div className="form-group row align-items-center">
                  <label className="col-sm-2 col-form-label">Upper Bound (-log10):
                    <InfoTootip className="ml-1 d-inline">
                      Upper bound -log10 p-value for the color scale on the heat map.
                    </InfoTootip>
                  </label>
                  <div className="col-sm">
                    <input type="number" className="form-control" min={0} value={upper} step="any"
                           onChange={this.handleUpper.bind(this)}/>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col">
                    <button className="btn btn-primary" type="submit">Submit</button>
                  </div>
                </div>
              </div>
            </form>
          </Collapse>

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
                  {_(_.get(targetEnrichment.table, 'columns', {}))
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
                {_(_.get(targetEnrichment.table, 'result', []))
                  .orderBy((row) => _.isNull(row) ? row : row[sortCol], ascending ? 'asc' : 'desc')
                  .map((row, i) => {
                    return <tr key={i}>
                      <RowHeader info={row[0]}>{row[0].name + surround(row[0].filter)}</RowHeader>
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
                <div className="row my-1">
                  <div className="col">
                    <SVGWarningTooltip className="float-right">
                      <a className="btn btn-primary" download="list_enrichment.svg" href={exportSrc}>
                        <FontAwesomeIcon icon="file-export" className="mr-1"/>Export SVG</a>
                    </SVGWarningTooltip>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    <img className="img-fluid" src={targetEnrichment.image}/>
                  </div>
                  <div className="col-4">
                    <HeatmapTable forwardedRef={this.legend}/>
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
  busy: PropTypes.number,
  requestId: PropTypes.string,
  getTargetEnrichmentTable: PropTypes.func,
  targetEnrichment: PropTypes.object,
  setError: PropTypes.func,
  setBusy: PropTypes.func,
  getTargetEnrichmentImage: PropTypes.func,
  getTargetEnrichmentLegend: PropTypes.func
};

const TargetEnrichment = connect(mapStateToProps, {
  getTargetEnrichmentTable,
  setError,
  setBusy,
  getTargetEnrichmentImage,
  getTargetEnrichmentLegend
})(TargetEnrichmentBody);

export default TargetEnrichment;

