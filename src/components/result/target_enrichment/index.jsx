/**
 * @author zacharyjuang
 * 6/24/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {setBusy} from '../../../actions/index';
import {ExtraFields, InfoTootip, SVGWarningTooltip} from "../common";
import {Collapse, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import {svgAddTable} from "../../../utils/index";
import {
  getTargetEnrichmentImage,
  getTargetEnrichmentLegend,
  getTargetEnrichmentTable,
  setError
} from "../../../actions/target_enrichment";
import {CancelToken} from "axios";
import {TargetEnrichmentWarning} from "./common";
import HeatmapTable from "./heatmap_table";
import Table from "./table";
import {tableToCsvUri} from "./utils";
import {ResizeComponent} from "../../common";

const TargetEnrichmentInfo = () => {
  return <p className="text-secondary">
    Significance of overlap between target gene lists and queried analyses. Significance is calculated by the
    Fisher&apos;s Exact Test.
  </p>;
};

const mapStateToProps = ({busy, requestId, result, targetEnrichment, extraFields, extraFieldNames}) => {
  return {
    busy,
    requestId,
    result,
    targetEnrichment,
    extraFields,
    extraFieldNames
  };
};

class TargetEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();

    this.state = {
      key: "table",
      collapse: false,

      upper: '',
      lower: '',
      useLabel: false,

      heatmapKeys: [],
      heatmapKeysChecked: [],

      exportSrc: null,

      tableKey: "p-value"
    };

    this.cancels = [];
  }

  componentDidMount() {
    this.getTableData();
    this.getImgData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId || prevProps.result !== this.props.result) {
      this.getTableData();
      this.getImgData();
    }
  }

  componentWillUnmount() {
    this.cancelRequests();
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.getImgData();
    this.getTableData();
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

  handleLabel(e) {
    this.setState({
      useLabel: e.target.checked
    });
  }

  onTabClick(key) {
    this.setState({key});
  }

  getTableData() {
    this.props.getTargetEnrichmentTable(this.props.requestId, this.state.useLabel, {
      cancelToken: new CancelToken((c) => {
        this.cancels.push(c);
      })
    });
  }

  getImgData() {
    let {requestId, getTargetEnrichmentImage, getTargetEnrichmentLegend} = this.props;
    let {lower, upper, useLabel, heatmapKeysChecked} = this.state;

    return Promise.all([
      getTargetEnrichmentImage(requestId, {lower, upper, fields: heatmapKeysChecked, useLabel}, {
        cancelToken: new CancelToken((c) => {
          this.cancels.push(c);
        })
      }),
      getTargetEnrichmentLegend(requestId, useLabel, {
        cancelToken: new CancelToken((c) => {
          this.cancels.push(c);
        })
      })
    ]).then((data) => {
      if (this.legend.current) {
        let svg = svgAddTable(data[0].documentElement, this.legend.current);
        this.setState({
          exportSrc: 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML)
        });
      }
    });
  }

  handleHeatmapKeySelect(r, e) {
    if (e.target.checked) {
      this.setState((state) => {
        return {
          heatmapKeysChecked: [...state.heatmapKeysChecked, r]
        };
      });
    } else {
      this.setState((state) => {
        return {
          heatmapKeysChecked: state.heatmapKeysChecked.filter((s) => s !== r)
        };
      });
    }
  }

  cancelRequests() {
    if (this.cancels.length) {
      for (let c of this.cancels) {
        c();
      }
      this.cancels = [];
    }
  }

  render() {
    let {targetEnrichment: {table, image, error}, busy, extraFields, extraFieldNames} = this.props;
    let {lower, upper, useLabel, key, collapse, exportSrc, heatmapKeysChecked, tableKey} = this.state;

    return <div className="container-fluid p-0">
      {error ?
        <TargetEnrichmentWarning/> :
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col">
                <TargetEnrichmentInfo/>
              </div>
            </div>
            <div className="row m-1">
              <div className="col p-0">
                <button type="button" className="btn btn-primary" onClick={this.toggle.bind(this)}>
                  <FontAwesomeIcon icon="cog" className="mr-1"/>Options
                </button>
                {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
              </div>
            </div>
            <Collapse isOpen={collapse}>
              <div className="row m-1">
                <div className="col">
                  <form onSubmit={this.handleSubmit.bind(this)} className="border rounded row">
                    <div className="col">
                      <div className="row">
                        <h3 className="col">Recalculate Data:</h3>
                      </div>
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
                      <div className="form-group row align-items-center">
                        <label className="col-sm-2 col-form-label">Use Custom Labels:
                          <InfoTootip className="ml-1 d-inline">
                            Use custom labels for heatmaps.
                          </InfoTootip>
                        </label>
                        <div className="col-sm">
                          <input type="checkbox" value={useLabel} step="any"
                                 onChange={this.handleLabel.bind(this)}/>
                        </div>
                      </div>
                      <div className="form-group row align-items-center">
                        <legend className="col-form-label col-2">Additional Fields in Heatmap:</legend>
                        <div className="col-10">
                          {_.map(extraFieldNames, (k, i) => {
                            return <div className="form-check form-check-inline" key={i}>
                              <label className="form-check-label">
                                <input className="form-check-input" type="checkbox"
                                       value={k}
                                       checked={heatmapKeysChecked.indexOf(k) !== -1}
                                       onChange={this.handleHeatmapKeySelect.bind(this, k)}/>
                                {k}
                              </label>
                            </div>;
                          })}
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col">
                          <button className="btn btn-primary" type="submit">Submit</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="row border rounded m-1">
                <ExtraFields className="col"/>
              </div>
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
                <div className="row m-1">
                  <div className="col p-0">
                    <div className="form-check form-check-inline float-left">
                      <label className="form-check-label">
                        <input className="form-check-input" type="radio"
                               checked={tableKey === "p-value"}
                               onChange={() => {
                                 this.setState({tableKey: "p-value"});
                               }}/>P-value
                      </label>
                    </div>
                    <div className="form-check form-check-inline float-left">
                      <label className="form-check-label">
                        <input className="form-check-input" type="radio"
                               checked={tableKey === "influence"}
                               onChange={() => {
                                 this.setState({tableKey: "influence"});
                               }}/>Influence (Percent of Gene List)
                      </label>
                    </div>
                    <div className="form-check form-check-inline float-left">
                      <label className="form-check-label">
                        <input className="form-check-input" type="radio"
                               checked={tableKey === "specificity"}
                               onChange={() => {
                                 this.setState({tableKey: "specificity"});
                               }}/>Specificity (Percent of Targets)
                      </label>
                    </div>
                    <a className="btn btn-primary float-right"
                       href={"data:text/csv," + tableToCsvUri(table, extraFields)}
                       download="target_enrichment_table.csv">
                      <FontAwesomeIcon icon="file-csv" className="mr-1"/>Export Table Data</a>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <ResizeComponent>
                      <Table table={table} tableKey={tableKey}/>
                    </ResizeComponent>
                  </div>
                </div>
              </TabPane>
              <TabPane tabId="heatmap">
                <div className="row">
                  <div className="col-8">
                    <img className="img-fluid" src={image} alt="heatmap"/>
                  </div>
                  <div className="col-4">
                    <div className="row m-1">
                      <div className="col d-flex flex-row-reverse p-0">
                        <SVGWarningTooltip>
                          <a className="btn btn-primary" download="list_enrichment.svg" href={exportSrc}>
                            <FontAwesomeIcon icon="file-export" className="mr-1"/>Export SVG</a>
                        </SVGWarningTooltip>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <HeatmapTable tableRef={this.legend} extraFieldNames={extraFieldNames} useLabel={useLabel}/>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPane>
            </TabContent>
          </div>
        </div>}
    </div>;
  }
}

TargetEnrichmentBody.propTypes = {
  busy: PropTypes.number,
  requestId: PropTypes.string,
  result: PropTypes.object,
  getTargetEnrichmentTable: PropTypes.func,
  targetEnrichment: PropTypes.object,
  setError: PropTypes.func,
  setBusy: PropTypes.func,
  getTargetEnrichmentImage: PropTypes.func,
  getTargetEnrichmentLegend: PropTypes.func,
  extraFields: PropTypes.arrayOf(PropTypes.string),
  extraFieldNames: PropTypes.arrayOf(PropTypes.string)
};

const TargetEnrichment = connect(mapStateToProps, {
  getTargetEnrichmentTable,
  setError,
  setBusy,
  getTargetEnrichmentImage,
  getTargetEnrichmentLegend
})(TargetEnrichmentBody);

export default TargetEnrichment;

