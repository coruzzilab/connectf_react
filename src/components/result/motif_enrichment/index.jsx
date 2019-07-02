/**
 * @author zacharyjuang
 * 4/2/18
 */
import React from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Collapse, Nav, NavItem, NavLink, TabContent, TabPane, UncontrolledTooltip} from 'reactstrap';
import {setBusy} from "../../../actions/index";
import {svgAddTable} from '../../../utils';
import {
  getMotifEnrichment,
  getMotifEnrichmentImage,
  getMotifEnrichmentLegend,
  setError
} from "../../../actions/motif_enrichment";
import {getKeys, getMotifRegions} from "../../../utils/axios_instance";
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

class MotifRegionCheckbox extends React.Component {
  constructor(props) {
    super(props);

    this.label = React.createRef();
  }

  render() {
    let {name, desc} = this.props;
    return <div className="form-check form-check-inline">
      <label className="form-check-label" ref={this.label}>
        <input className="form-check-input" type="checkbox"
               value={name}
               checked={this.props.checked}
               onChange={this.props.onChange}/>
        {name}
      </label>
      <UncontrolledTooltip target={() => this.label.current} delay={0}>
        {desc}
      </UncontrolledTooltip>
    </div>;
  }
}

MotifRegionCheckbox.propTypes = {
  name: PropTypes.string,
  desc: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func
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
      upper: '',
      lower: '',
      colSpan: 1,
      key: "table",
      collapse: false,
      exportSrc: null,
      motifRegions: [],
      selectedMotifRegions: [],
      heatmapKeys: [],
      heatmapKeysChecked: []
    };

    this.cancels = [];
  }

  componentDidMount() {
    this.getMotifEnrichment();
    this.getImgData();
    this.getMotifRegions();
    this.getHeatmapKeys();
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

  getMotifRegions() {
    getMotifRegions().then(({data}) => {
      this.setState({
        motifRegions: data['regions'],
        selectedMotifRegions: data['default_regions'],
        colSpan: data['default_regions'].length
      });
    });
  }

  getHeatmapKeys() {
    getKeys({all: true}).then(({data}) => {
      this.setState({
        heatmapKeys: data
      });
    });
  }

  handleMotifRegionSelect(r, e) {
    if (e.target.checked) {
      this.setState((state) => {
        return {
          selectedMotifRegions: [...state.selectedMotifRegions, r]
        };
      });
    } else {
      this.setState((state) => {
        return {
          selectedMotifRegions: state.selectedMotifRegions.filter((s) => s !== r)
        };
      });
    }
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

  getMotifEnrichment() {
    this.props.getMotifEnrichment(this.props.requestId, this.state.alpha, this.state.selectedMotifRegions, {
      cancelToken: new CancelToken((c) => {
        this.cancels.push(c);
      })
    })
      .then(() => {
        this.setState({
          colSpan: _.get(this.props.motifEnrichment.table, 'regions.length', 1)
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
    let {alpha, lower, upper, selectedMotifRegions, heatmapKeysChecked} = this.state;
    let {requestId, getMotifEnrichmentImage, getMotifEnrichmentLegend} = this.props;

    return Promise.all([
      getMotifEnrichmentImage(requestId, {
        alpha,
        regions: selectedMotifRegions,
        fields: heatmapKeysChecked,
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
    let {
      colSpan, key, lower, upper, collapse, exportSrc, motifRegions, selectedMotifRegions,
      heatmapKeys, heatmapKeysChecked
    } = this.state;

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
                <legend className="col-form-label col-2">Show Enrichment of Gene Regions:</legend>
                <div className="col-10">
                  {_.map(motifRegions, (val, key) => <MotifRegionCheckbox
                    key={key}
                    name={key}
                    desc={val}
                    checked={selectedMotifRegions.indexOf(key) !== -1}
                    onChange={this.handleMotifRegionSelect.bind(this, key)}/>)}
                </div>
              </div>
              <div className="form-group row align-items-center">
                <legend className="col-form-label col-2">Additional Fields in Heatmap:</legend>
                <div className="col-10">
                  {_.map(heatmapKeys, (k, i) => {
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
          <Export table={table}/>
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
