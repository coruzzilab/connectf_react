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

function mapStateToProps({busy, extraFields, requestId}) {
  return {
    requestId,
    busy,
    extraFields
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

  render() {
    let {busy, className, data, requestId} = this.props;
    let {collapse} = this.state;

    let extraFieldNames = _(data.info).map(1).map(_.keys).flatten().uniq().sortBy().value();
    let extraFields = _.intersection(this.props.extraFields, extraFieldNames);

    return <div className={className}>
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
              <tr>
                <th>Index</th>
                <th>Gene</th>
                <th>Filter</th>
                <th>Analysis ID</th>
                {_.map(extraFields, (e, i) => <th key={i}>{e}</th>)}
              </tr>
              </thead>
              <tbody>
              {_.map(data.info, (info, i) => {
                return <tr key={i}>
                  <RowHeader info={info}>{columnString(i + 1)}</RowHeader>
                  {_.map(info[0], (c, j) => <td key={j}>{c}</td>)}
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
  extraFields: PropTypes.arrayOf(PropTypes.string)
};

EnrichmentTableBody.defaultProps = {
  extraFields: []
};

const EnrichmentTable = connect(mapStateToProps)(EnrichmentTableBody);

EnrichmentTable.propTypes = {
  data: PropTypes.object.isRequired,
  className: PropTypes.string
};

export default EnrichmentTable;
