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
import {Export, TargetEnrichmentWarning} from "./common";
import HeatmapTable from "./heatmap_table";
import Table from "./table";

const mapStateToProps = ({busy, requestId, targetEnrichment}) => {
  return {
    busy,
    requestId,
    targetEnrichment
  };
};

class TargetEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();

    this.state = {
      upper: '',
      lower: '',
      key: "table",
      collapse: false,
      exportSrc: null
    };

    this.cancels = [];
  }

  componentDidMount() {
    this.getTableData();
    this.getImgData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
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

  getTableData() {
    this.props.getTargetEnrichmentTable(this.props.requestId, {
      cancelToken: new CancelToken((c) => {
        this.cancels.push(c);
      })
    });
  }

  getImgData() {
    let {requestId, getTargetEnrichmentImage, getTargetEnrichmentLegend} = this.props;
    let {lower, upper} = this.state;

    return Promise.all([
      getTargetEnrichmentImage(requestId, {lower, upper}, {
        cancelToken: new CancelToken((c) => {
          this.cancels.push(c);
        })
      }),
      getTargetEnrichmentLegend(requestId, {
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

  cancelRequests() {
    if (this.cancels.length) {
      for (let c of this.cancels) {
        c();
      }
      this.cancels = [];
    }
  }

  render() {
    let {targetEnrichment: {table, legend, image, error}, busy} = this.props;
    let {lower, upper, key, collapse, exportSrc} = this.state;

    let extraFieldNames = _(legend).map(0).map(_.keys).flatten().uniq().sortBy().value();

    return <div>
      {error ?
        <TargetEnrichmentWarning/> :
        <div>
          <button type="button" className="btn btn-primary m-2" onClick={this.toggle.bind(this)}>
            <FontAwesomeIcon icon="cog" className="mr-1"/>Options
          </button>
          {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
          <Collapse isOpen={collapse}>
            <div className="container-fluid">
              <form onSubmit={this.handleSubmit.bind(this)} className="border rounded m-1 p-2 row">
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
                  <div className="form-group row">
                    <div className="col">
                      <button className="btn btn-primary" type="submit">Submit</button>
                    </div>
                  </div>
                </div>
              </form>
              <div className="row m-1 p-2 border rounded">
                <ExtraFields extraFieldNames={extraFieldNames} className="col"/>
              </div>
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
            <NavItem>
              <NavLink onClick={this.onTabClick.bind(this, "export")} active={key === "export"}>
                Export
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={key}>
            <TabPane tabId="table">
              <Table table={table}/>
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
                    <img className="img-fluid" src={image}/>
                  </div>
                  <div className="col-4">
                    <HeatmapTable forwardedRef={this.legend}/>
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane tabId="export">
              <Export table={table}/>
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

