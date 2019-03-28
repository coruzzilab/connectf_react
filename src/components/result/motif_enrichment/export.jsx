/**
 * @author zacharyjuang
 * 11/9/18
 */
import {BASE_URL} from "../../../utils/axios_instance";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import {getColName} from "../../../utils";

function getRowName(r) {
  return r['name'] + '_' + r['Family'];
}

function tableToCsv(table) {
  let columns = _(table.columns)
    .map(getColName)
    .map((c) => _.map(table.regions, (r) => c + '_' + r))
    .flatten();

  let csv = "," + columns.map((c) => `"${c}"`).join(',') + '\n';

  csv += _(table.result).map((row) => {
    return '"' + getRowName(row[0]) + '",' + row.slice(1).join(',');
  }).join("\n") + "\n";

  return csv;
}

const tableToCsvUri = _.flow(tableToCsv, encodeURIComponent);

const Export = ({table}) => {
  return <div className="container-fluid">
    <div className="row mt-2">
      <div className="col">
        <a href={new URL('/api/motif_enrichment/cluster_info.csv', BASE_URL)} className="btn btn-primary">
          Cluster Information<FontAwesomeIcon icon="file-csv" className="ml-2"/></a>
        <p>
          CSV file that includes consensus motif sequence, motif family name, and number of motifs.
        </p>
      </div>
    </div>
    <div className="row mt-2">
      <div className="col">
        <a className="btn btn-primary" href={"data:text/csv," + tableToCsvUri(table)}
           download="motif_enrichment_table.csv">
          Table Data<FontAwesomeIcon icon="file-csv" className="ml-2"/></a>
        <p>P-values of enriched motifs in a CSV format.</p>
      </div>
    </div>
  </div>;
};

Export.propTypes = {
  table: PropTypes.object
};

export default Export;
