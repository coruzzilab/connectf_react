/**
 * @author zacharyjuang
 * 11/15/18
 */
import connect from "react-redux/es/connect/connect";
import React from "react";
import _ from "lodash";
import {ColHeader} from "./common";
import {QueryNameCell} from "../common";
import PropTypes from "prop-types";

const mapStateToProps = ({motifEnrichment, extraFields}) => {
  return {
    motifEnrichment,
    extraFields
  };
};

class HeatmapTableBody extends React.Component {
  render() {
    let {motifEnrichment, useLabel} = this.props;
    let extraFields = _.intersection(this.props.extraFields, this.props.extraFieldNames);

    return <div className="table-responsive" ref={this.props.tableRef}>
      <table className="table table-sm table-bordered">
        <thead>
        <tr>
          <th className="text-nowrap">Index</th>
          <th className="text-nowrap">Gene ID</th>
          <th className="text-nowrap">Filter</th>
          <th className="text-nowrap">Gene Name</th>
          <th className="text-nowrap">Analysis ID</th>
          {extraFields.map((f, i) => <th className="text-nowrap" key={i}>{f}</th>)}
        </tr>
        </thead>
        <tbody>
        {_.map(motifEnrichment.legend, (row, i) => {
          return <tr key={i}>
            <ColHeader data={row[0]}><span className="link">{useLabel ? row[0]['label'] : row[1]}</span></ColHeader>
            <td>{row[2]}</td>
            <QueryNameCell>{row[3]}</QueryNameCell>
            <QueryNameCell>{row[4]}</QueryNameCell>
            <td>{row[5]}</td>
            {_(extraFields).map((e) => _.get(row[0], e, '')).map((r, i) => <td key={i}>{r}</td>).value()}
          </tr>;
        })}
        </tbody>
      </table>
    </div>;
  }
}

HeatmapTableBody.propTypes = {
  motifEnrichment: PropTypes.shape({legend: PropTypes.array}),
  extraFields: PropTypes.arrayOf(PropTypes.string),
  forwardedRef: PropTypes.object,
  extraFieldNames: PropTypes.arrayOf(PropTypes.string),
  tableRef: PropTypes.object,
  useLabel: PropTypes.bool
};

const HeatmapTable = connect(mapStateToProps)(HeatmapTableBody);

export default HeatmapTable;
