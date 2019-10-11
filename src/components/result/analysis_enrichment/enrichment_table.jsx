/**
 * @author zacharyjuang
 * 11/13/18
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import {Collapse} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ExtraFields} from "../common";
import {RowHeader} from "./common";
import {columnString} from "../../../utils";
import PropTypes from "prop-types";
import {BASE_URL} from "../../../utils/axios_instance";
import {addHidden, clearHidden, removeHidden, setHidden} from "../../../actions/analysis_enrichment";

const EnrichmentInfo = () => {
  return <p className="text-secondary">
    Testing pairwise significance of overlap between all analyses queried. Significance is calculated by Fisher&apos;s
    Exact Test.
  </p>;
};

function mapStateToProps({busy, extraFields, requestId, analysisEnrichment: {data, hidden}}) {
  return {
    requestId,
    busy,
    extraFields,
    data,
    hidden
  };
}

class EnrichmentTableBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false
    };
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  toggleShow(index, e) {
    if (e.target.checked) {
      this.props.removeHidden(index);
    } else {
      this.props.addHidden(index);
    }
  }

  toggleShowAll(e) {
    if (e.target.checked) {
      this.props.clearHidden();
    } else {
      this.props.setHidden(_.range(_.size(this.props.data.info)));
    }
  }

  render() {
    let {busy, className, data, requestId, hidden} = this.props;
    let {collapse} = this.state;

    let extraFieldNames = _(data.info).map(1).map(_.keys).flatten().uniq().sortBy().value();
    let extraFields = _.intersection(this.props.extraFields, extraFieldNames);

    return <div className={className}>
      <div className="row my-2">
        <div className="col">
          <EnrichmentInfo/>
        </div>
      </div>
      <div className="row my-2">
        <div className="col d-flex flex-row-reverse align-items-center">
          <a className="btn btn-primary ml-1" href={`${BASE_URL}/api/analysis_enrichment/${requestId}.csv`}>
            <FontAwesomeIcon icon="file-download" className="mr-1"/>Export CSV (*.csv)
          </a>
          <button type="button" className="btn btn-primary ml-1" onClick={this.toggle.bind(this)}>
            <FontAwesomeIcon icon="cog" className="mr-1"/>Options
          </button>
          {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
        </div>
      </div>
      <Collapse isOpen={collapse}>
        <div className="row">
          <ExtraFields extraFieldNames={extraFieldNames} className="col border rounded m-2"/>
        </div>
      </Collapse>
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table">
              <thead>
              <tr className="text-nowrap">
                <th>Index</th>
                <th>
                  <label className="mb-0">Show <input type="checkbox" checked={!hidden.length}
                                                      onChange={this.toggleShowAll.bind(this)}/></label>
                </th>
                <th>Analysis ID</th>
                <th>Gene</th>
                <th>Gene Name</th>
                <th>Filter</th>
                <th>Count</th>
                {_.map(extraFields, (e, i) => <th key={i}>{e}</th>)}
              </tr>
              </thead>
              <tbody>
              {_.map(data.info, (info, i) => {
                return <tr key={i}>
                  <RowHeader info={info}>{columnString(i + 1)}</RowHeader>
                  <td className="text-center"><input type="checkbox" checked={hidden.indexOf(i) === -1}
                                                     onChange={this.toggleShow.bind(this, i)}/></td>
                  <td>{info[0][3]}</td>
                  <td>{info[0][0]}</td>
                  <td>{info[1]['gene_name']}</td>
                  <td>{info[0][1]}</td>
                  <td>{info[1]['Count']}</td>
                  {_(info[1]).pick(extraFields).values().map((e, j) => <td key={j}>{e}</td>).value()}
                </tr>;
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
  }
}

EnrichmentTableBody.propTypes = {
  requestId: PropTypes.string,
  busy: PropTypes.number,
  data: PropTypes.object,
  className: PropTypes.string,
  extraFields: PropTypes.arrayOf(PropTypes.string),
  hidden: PropTypes.arrayOf(PropTypes.number),
  addHidden: PropTypes.func,
  removeHidden: PropTypes.func,
  setHidden: PropTypes.func,
  clearHidden: PropTypes.func
};

EnrichmentTableBody.defaultProps = {
  extraFields: []
};

const EnrichmentTable = connect(mapStateToProps, {
  addHidden,
  removeHidden,
  setHidden,
  clearHidden
})(EnrichmentTableBody);

EnrichmentTable.propTypes = {
  className: PropTypes.string
};

export default EnrichmentTable;
