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
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Collapse
} from 'reactstrap';
import {BASE_URL} from "../../actions";
import {blueShader, getLogMinMax, svgAddTable} from '../../utils';
import {getMotifEnrichment, getMotifEnrichmentLegend, setError} from "../../actions/motif_enrichment";
import {InfoTootip, QueryNameCell, SortButton, SVGWarningTooltip} from "./common";


export const BASE_COLORS = {
  'a': '#59C83B',
  't': '#CC2B1D',
  'c': '#0012D3',
  'g': '#F5BD41',
  'other': '#888888'
};

const mapStateToProps = ({requestId, motifEnrichment}) => {
  return {
    requestId,
    motifEnrichment
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
    let {colSpan, data, sorted, ascending, sortFunc, sortable} = this.props;

    return <th colSpan={colSpan}>
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            <a className="text-primary link" onClick={this.showModal.bind(this)}>{this.props.children}</a>
          </div>
          {sortable ?
            <div className="col-1" style={{cursor: 'pointer'}}>
              <SortButton sortFunc={sortFunc} ascending={ascending} sorted={sorted}/>
            </div> :
            null}
        </div>
      </div>


      <Modal isOpen={visible} toggle={this.hideModal.bind(this)}>
        <ModalHeader toggle={this.hideModal.bind(this)}>
          Meta Data
        </ModalHeader>
        <ModalBody>
          <table className="table table-responsive table-sm">
            <tbody>
            {_(data).map((val, key) => {
              return <tr key={key}>
                <th>{key}</th>
                <td>{val}</td>
              </tr>;
            }).value()}
            </tbody>
          </table>
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
  children: PropTypes.node,
  sortable: PropTypes.bool,
  sortFunc: PropTypes.func,
  sorted: PropTypes.bool,
  ascending: PropTypes.bool
};

ColHeader.defaultProps = {
  sortable: true,
  colSpan: 1,
  sorted: false,
  ascending: true
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
      <a className="text-secondary" onClick={this.showModal.bind(this)}>{`${data.name} ${data['Family']}`}</a>
      <Modal isOpen={visible} toggle={this.hideModal.bind(this)}>
        <ModalHeader toggle={this.hideModal.bind(this)}>
          {`${data.name} ${data['Family']}`}
        </ModalHeader>
        <ModalBody>
          <table className="table table-responsive table-sm">
            <tbody>
            <tr>
              <th className="font-weight-bold">Number of Motifs</th>
              <td>{data['# Motifs']}</td>
            </tr>
            <tr>
              <th className="font-weight-bold">Consensus</th>
              <td className="font-weight-bold">
                {_.map(data['Consensus'], (cons, i) => {
                  return <span key={i}
                               style={{
                                 color: _.get(BASE_COLORS, _.lowerCase(cons), BASE_COLORS['other'])
                               }}>{cons}</span>;
                })}
              </td>
            </tr>
            <tr>
              <th className="font-weight-bold">Family</th>
              <td>{data['Family']}</td>
            </tr>
            </tbody>
          </table>
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

class HeatmapTableBody extends React.Component {
  componentDidMount() {
    this.getTableData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.getTableData();
    }
  }


  getTableData() {
    this.props.getMotifEnrichmentLegend(this.props.requestId);
  }

  render() {
    return <table className="table table-responsive table-sm table-bordered" ref={this.props.forwardedRef}>
      <thead>
      <tr>
        <th>Index</th>
        <th>Gene ID</th>
        <th>Filter</th>
        <th>Gene Name</th>
        <th>Analysis ID</th>
      </tr>
      </thead>
      <tbody>
      {_.map(this.props.motifEnrichment.legend, (row, i) => {
        return <tr key={i}>
          <ColHeader data={row[0]} sortable={false}>{row[1]}</ColHeader>
          <td>{row[2]}</td>
          <QueryNameCell>{row[3]}</QueryNameCell>
          <QueryNameCell>{row[4]}</QueryNameCell>
          <td>{row[5]}</td>
        </tr>;
      })}
      </tbody>
    </table>;
  }
}

HeatmapTableBody.propTypes = {
  requestId: PropTypes.string,
  motifEnrichment: PropTypes.shape({legend: PropTypes.array}),
  getMotifEnrichmentLegend: PropTypes.func,
  forwardedRef: PropTypes.object
};

const HeatmapTable = connect(mapStateToProps, {getMotifEnrichmentLegend})(HeatmapTableBody);

class MotifEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();

    this.imgData = null;
    this.xhr = null;

    this.state = {
      alpha: 0.05,
      body: 'no',
      upper: '',
      lower: '',
      colSpan: 1,
      imgSrc: `${BASE_URL}/queryapp/motif_enrichment/${this.props.requestId}/heatmap.svg`,
      imgDataUri: null,
      key: "table",
      sortCol: null,
      ascending: true,
      collapse: false
    };
  }

  componentDidMount() {
    this.getMotifEnrichment();
    this.setImgURL();
  }

  componentWillUnmount() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  getMotifEnrichment() {
    this.props.getMotifEnrichment(this.props.requestId, this.state.alpha, this.state.body === 'yes')
      .then(() => {
        this.setState({
          colSpan: this.state.body === 'yes' ? 2 : 1
        });
      });
  }

  setImgURL() {
    let {alpha, lower, upper} = this.state;

    this.setState({
      imgSrc: `${BASE_URL}/queryapp/motif_enrichment/${this.props.requestId}/heatmap.svg?${$.param({
        alpha,
        body: this.state.body === 'yes' ? 1 : 0,
        lower,
        upper
      })}`
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.requestId !== this.props.requestId) {
      this.getMotifEnrichment();
      this.setImgURL();
    }

    if (this.state.imgSrc && prevState.imgSrc !== this.state.imgSrc) {
      this.getImgData();
    }
  }

  handleMotifForm(e) {
    e.preventDefault();
    this.getMotifEnrichment();
    this.setImgURL();
    this.toggle()
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
      let svg = svgAddTable(imgData.documentElement, this.legend.current);

      e.currentTarget.href = 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML);
    }
  }

  render() {
    let {motifEnrichment} = this.props;
    let {body, colSpan, key, lower, upper, sortCol, ascending, imgDataUri, collapse} = this.state;
    let [min, max] = getLogMinMax(_.get(motifEnrichment.table, 'result', []));

    return <div>
      {motifEnrichment.error ? <div className="text-danger">No motifs enriched.</div> : null}
      <button type="button" className="btn btn-primary m-2" onClick={this.toggle.bind(this)}>
        <FontAwesomeIcon icon="cog" className="mr-1"/>Options</button>
      <Collapse isOpen={collapse}>
        <form onSubmit={this.handleMotifForm.bind(this)} className="m-2">
          <div className="container-fluid">
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
      </Nav>
      <TabContent id="motif_enrichment" activeTab={key}>
        <TabPane tabId="table">
          <table className="table-responsive table-bordered table-sm">
            <thead>
            <tr>
              <th/>
              {_(_.get(motifEnrichment.table, 'columns', {})).map((val, key) => [val, key]).map(([val, key], i) => {
                let line1 = _(val).pick(['TRANSCRIPTION_FACTOR_ID', 'TRANSCRIPTION_FACTOR_NAME']).values().join('-');
                let line2 = _(val).pick(['EXPRESSION_TYPE', 'ANALYSIS_METHOD']).values().join('-');
                let line3 = _.get(val, 'list_name', '');
                return <ColHeader key={key}
                                  data={val}
                                  colSpan={colSpan}
                                  sortFunc={this.sortFunc.bind(this, i + 1)}
                                  sorted={sortCol === i + 1}
                                  sortable={colSpan === 1}
                                  ascending={ascending}>
                  {!_.isEmpty(val) ?
                    <div>{line1 ? <p className="m-0">{line1}</p> : null}
                      {line2 ? <p className="m-0">{line2}</p> : null}
                      <p className="m-0">{line3}</p>
                    </div> :
                    key}
                </ColHeader>;
              }).value()}
            </tr>
            <tr>
              <th/>
              {colSpan === 2 ?
                _(_.get(motifEnrichment.table, 'columns', [])).map((val, i) => {
                  let [first, second] = [i * 2 + 1, i * 2 + 2];
                  return [
                    <th key={first}>
                      <span className="mr-1">promoter (p-value)</span>
                      <SortButton sorted={sortCol === first}
                                  sortFunc={this.sortFunc.bind(this, first)}
                                  ascending={ascending}/>
                    </th>,
                    <th key={second}>
                      <span className="mr-1">gene body (p-value)</span>
                      <SortButton sorted={sortCol === second}
                                  sortFunc={this.sortFunc.bind(this, second)}
                                  ascending={ascending}/>
                    </th>
                  ];
                }).flatten().value() :
                _(_.get(motifEnrichment.table, 'columns', {})).map((val, key) => {
                  return <th key={key}>promoter (p-value)</th>;
                }).value()
              }
            </tr>
            </thead>
            <tbody>
            {_(_.get(motifEnrichment.table, 'result', []))
              .orderBy(
                _.isNull(sortCol) ?
                  (row) => parseInt(row[0].name.split('_')[1]) :
                  (row) => typeof row[sortCol] === 'number' ?
                    row[sortCol] :
                    (ascending ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY),
                ascending ? 'asc' : 'desc')
              .map((row, i) => {
                return <tr key={i}>
                  <RowHeader data={row[0]}/>
                  {_.map(row.slice(1), (c, j) => {
                    if (typeof c === 'number') {
                      let [background, color] = blueShader(c, min, max);

                      return <td key={j}
                                 style={{background, color}}>{typeof c === 'number' ? c.toExponential(5) : null}</td>
                    }

                    return <td key={j}/>;
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
                  <a className="btn btn-primary" download="motif_enrichment.svg" href="#"
                     onClick={this.exportSVG.bind(this)}>
                    <FontAwesomeIcon icon="file-export" className="mr-1"/>Export SVG</a>
                </SVGWarningTooltip>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <img className="img-fluid" src={imgDataUri}/>
              </div>
              <div className="col-4">
                <HeatmapTable forwardedRef={this.legend}/>
              </div>
            </div>
          </div>
        </TabPane>
      </TabContent>
    </div>;
  }
}

MotifEnrichmentBody.propTypes = {
  requestId: PropTypes.string,
  getMotifEnrichment: PropTypes.func,
  motifEnrichment: PropTypes.object,
  setError: PropTypes.func
};

const MotifEnrichment = connect(mapStateToProps, {getMotifEnrichment, setError})(MotifEnrichmentBody);

export default MotifEnrichment;
