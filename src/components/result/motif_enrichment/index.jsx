/**
 * @author zacharyjuang
 * 4/2/18
 */
import React from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Collapse, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import {setBusy} from "../../../actions/index";
import {svgAddTable} from '../../../utils/index';
import {
  getMotifEnrichment,
  getMotifEnrichmentImage,
  getMotifEnrichmentLegend,
  setError
} from "../../../actions/motif_enrichment";
import {ExtraFields, InfoTootip, SVGWarningTooltip} from "../common";
import {CancelToken} from "axios";
import Export from "./export";
import MotifEnrichmentTable from "./motif_enrichment_table";
import HeatmapTable from "./heatmap_table";


export const BASE_COLORS = {
  'a': '#59C83B',
  't': '#CC2B1D',
  'c': '#0012D3',
  'g': '#F5BD41',
  'other': '#888888'
};

const mapStateToProps = ({busy, requestId, motifEnrichment, extraFields}) => {
  return {
    busy,
    requestId,
    motifEnrichment,
    extraFields
  };
};

class MotifEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();

    this.state = {
      alpha: 0.05,
      body: 'no',
      upper: '',
      lower: '',
      colSpan: 1,
      key: "table",
      collapse: false,
      exportSrc: null
    };

    this.cancels = [];
  }

  componentDidMount() {
    this.getMotifEnrichment();
    this.getImgData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.getMotifEnrichment();
      this.getImgData();
    }
  }

  componentWillUnmount() {
    this.cancelRequests();
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  getMotifEnrichment() {
    this.props.getMotifEnrichment(this.props.requestId, this.state.alpha, this.state.body === 'yes', {
      cancelToken: new CancelToken((c) => {
        this.cancels.push(c);
      })
    })
      .then(() => {
        this.setState({
          colSpan: this.state.body === 'yes' ? 2 : 1
        });
      });
  }

  handleMotifForm(e) {
    e.preventDefault();
    this.getMotifEnrichment();
    this.getImgData();
    this.toggle();
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

  getImgData() {
    let {alpha, body, lower, upper} = this.state;
    let {requestId, getMotifEnrichmentImage, getMotifEnrichmentLegend} = this.props;

    return Promise.all([
      getMotifEnrichmentImage(requestId, {
        alpha,
        body: body === 'yes' ? 1 : 0,
        lower,
        upper
      }, {
        cancelToken: new CancelToken((c) => {
          this.cancels.push(c);
        })
      }),
      getMotifEnrichmentLegend(requestId, {
        cancelToken: new CancelToken((c) => {
          this.cancels.push(c);
        })
      })
    ])
      .then((data) => {
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
    let {motifEnrichment: {table, legend, image, error}, busy} = this.props;
    let {body, colSpan, key, lower, upper, collapse, exportSrc} = this.state;

    let extraFieldNames = _(legend).map(0).map(_.keys).flatten().uniq().sortBy().value();

    return <div>
      {error ? <div className="text-danger">No motifs enriched.</div> : null}
      <button type="button" className="btn btn-primary m-2" onClick={this.toggle.bind(this)}>
        <FontAwesomeIcon icon="cog" className="mr-1"/>Options
      </button>
      {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
      <Collapse isOpen={collapse}>
        <div className="container-fluid">
          <form onSubmit={this.handleMotifForm.bind(this)} className="border rounded m-1 p-2 row">
            <div className="col">
              <div className="row">
                <h3 className="col">Recalculate Data:</h3>
              </div>
              <div className="form-group row align-items-center">
                <label className="col-sm-2 col-form-label">
                  Alpha:
                  <InfoTootip className="ml-1 d-inline">
                    P-value cutoff for motif enrichment.
                  </InfoTootip>
                </label>
                <div className="col-sm">
                  <input type="number" min={0} max={1} step="any" placeholder={0.05}
                         defaultValue={0.05} onChange={this.handleAlpha.bind(this)} className="form-control"/>
                </div>

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
                <label className="col-sm-2 col-form-label">
                  Upper Bound (-log10):
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
                <legend className="col-form-label col-sm-2">Show Enrichment of Gene Body:</legend>
                <div className="col-sm-10">
                  <div className="form-check form-check-inline">
                    <input type='radio' value='yes' checked={body === 'yes'} className="form-check-input"
                           onChange={this.handleBody.bind(this)}/>
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input type='radio' value='no' checked={body === 'no'} className="form-check-input"
                           onChange={this.handleBody.bind(this)}/>
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </div>
              <div className="form-group row">
                <div className="col">
                  <button type="submit" className="btn btn-primary">Submit</button>
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
            Heatmap
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "export")} active={key === "export"}>
            Export
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent id="motif_enrichment" activeTab={key}>
        <TabPane tabId="table">
          <MotifEnrichmentTable table={table} colSpan={colSpan}/>
        </TabPane>
        <TabPane tabId="heatmap">
          <div className="container-fluid">
            <div className="row">
              <div className="col-8">
                <img className="img-fluid" src={image} alt="heatmap"/>
              </div>
              <div className="col-4">
                <div className="row my-1">
                  <div className="col">
                    <SVGWarningTooltip className="float-right">
                      <a className="btn btn-primary" download="motif_enrichment.svg" href={exportSrc}
                         aria-disabled={!exportSrc}>
                        <FontAwesomeIcon icon="file-export" className="mr-1"/>Export SVG</a>
                    </SVGWarningTooltip>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <HeatmapTable ref={this.legend} extraFieldNames={extraFieldNames}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPane>
        <TabPane tabId="export">
          <Export table={table} body={colSpan === 2}/>
        </TabPane>
      </TabContent>
    </div>;
  }
}

MotifEnrichmentBody.propTypes = {
  busy: PropTypes.number,
  requestId: PropTypes.string,
  getMotifEnrichment: PropTypes.func,
  motifEnrichment: PropTypes.object,
  setError: PropTypes.func,
  setBusy: PropTypes.func,
  getMotifEnrichmentImage: PropTypes.func,
  getMotifEnrichmentLegend: PropTypes.func
};

const MotifEnrichment = connect(mapStateToProps, {
  getMotifEnrichment,
  setError,
  setBusy,
  getMotifEnrichmentImage,
  getMotifEnrichmentLegend
})(MotifEnrichmentBody);

export default MotifEnrichment;
