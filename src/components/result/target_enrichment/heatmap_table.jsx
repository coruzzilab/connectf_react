/**
 * @author zacharyjuang
 * 11/9/18
 */
import connect from "react-redux/es/connect/connect";
import React from "react";
import _ from "lodash";
import {RowHeader} from "./common";
import {QueryNameCell} from "../common";
import PropTypes from "prop-types";

const mapStateToProps = ({requestId, targetEnrichment, extraFields}) => {
  return {
    requestId,
    targetEnrichment,
    extraFields
  };
};

class HeatmapTableBody extends React.Component {
  render() {
    let {targetEnrichment, useLabel} = this.props;
    let extraFields = _.intersection(this.props.extraFields, this.props.extraFieldNames);

    return <div className="table-responsive" ref={this.props.tableRef}>
      <table className="table table-sm table-bordered">
        <thead>
        <tr>
          <th className="text-nowrap">Index</th>
          <th className="text-nowrap">Gene ID</th>
          <th className="text-nowrap">Filter</th>
          <th className="text-nowrap">No. Targets</th>
          <th className="text-nowrap">Gene Name</th>
          <th className="text-nowrap">Analysis ID</th>
          {extraFields.map((f, i) => <th className="text-nowrap" key={i}>{f}</th>)}
        </tr>
        </thead>
        <tbody>
        {_.map(targetEnrichment.legend, (row, i) => {
          return <tr key={i}>
            <RowHeader info={row[0]}>{useLabel ? row[0]['label'] : row[1]}</RowHeader>
            <td>{row[2]}</td>
            <QueryNameCell>{row[3]}</QueryNameCell>
            <td>{row[4]}</td>
            <QueryNameCell>{row[5]}</QueryNameCell>
            <td>{row[6]}</td>
            {_(row[0]).pick(extraFields).values().map((r, i) => <td key={i}>{r}</td>).value()}
          </tr>;
        })}
        </tbody>
      </table>
    </div>;
  }
}

HeatmapTableBody.propTypes = {
  tableRef: PropTypes.object,
  requestId: PropTypes.string,
  targetEnrichment: PropTypes.shape({legend: PropTypes.array}),
  extraFields: PropTypes.arrayOf(PropTypes.string),
  extraFieldNames: PropTypes.arrayOf(PropTypes.string),
  useLabel: PropTypes.bool
};

const HeatmapTable = connect(mapStateToProps)(HeatmapTableBody);

export default HeatmapTable;
