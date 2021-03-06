/**
 * @author zacharyjuang
 * 11/13/18
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import qs from "querystring";
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

function mapStateToProps({busy, extraFields, extraFieldNames, requestId, analysisEnrichment: {data, hidden}}) {
  return {
    requestId,
    busy,
    extraFields,
    extraFieldNames,
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
    let {busy, className, data, requestId, hidden, extraFieldNames} = this.props;
    let {collapse} = this.state;

    let extraFields = _.intersection(this.props.extraFields, extraFieldNames);

    let url = `${BASE_URL}/api/analysis_enrichment/${requestId}.csv`;
    if (_.size(extraFields)) {
      url += '?' + qs.stringify({fields: extraFields});
    }

    return <div className={className}>
      <div className="row my-2">
        <div className="col">
          <EnrichmentInfo/>
        </div>
      </div>
      <div className="row my-2">
        <div className="col d-flex flex-row-reverse align-items-center">
          <a className="btn btn-primary ml-1" href={url}>
            <FontAwesomeIcon icon="file-download" className="mr-1"/>Export CSV (*.csv)
          </a>
          <button type="button" className="btn btn-primary ml-1" onClick={this.toggle.bind(this)}>
            <FontAwesomeIcon icon="cog" className="mr-1"/>Extra Fields
          </button>
          {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
        </div>
      </div>
      <Collapse isOpen={collapse}>
        <div className="row">
          <ExtraFields className="col border rounded m-2"/>
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
                {_.map(extraFields, (e, i) => <th key={i}>{e}</th>)}
                <th>Gene</th>
                <th>Gene Name</th>
                <th>Filter</th>
                <th>Count</th>
              </tr>
              </thead>
              <tbody>
              {_.map(data.info, (info, i) => {
                return <tr key={i}>
                  <RowHeader info={info}>{columnString(i + 1)}</RowHeader>
                  <td className="text-center"><input type="checkbox" checked={hidden.indexOf(i) === -1}
                                                     onChange={this.toggleShow.bind(this, i)}/></td>
                  {_(extraFields)
                    .map((e) => _.get(info, [1, e], ""))
                    .map((e, j) => <td key={j}>{e}</td>)
                    .value()}
                  <td>{info[0][0]}</td>
                  <td>{info[1]['gene_name']}</td>
                  <td>{info[0][1]}</td>
                  <td>{info[1]['Count']}</td>
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
  extraFieldNames: PropTypes.arrayOf(PropTypes.string),
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
