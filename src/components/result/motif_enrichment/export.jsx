/**
 * @author zacharyjuang
 * 11/9/18
 */
import {BASE_URL} from "../../../utils/axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import {getColName} from "../../../utils";

function getRowName(r) {
  return r['name'] + '_' + r['Family'];
}

function tableToCsv(table, body = false) {
  let columns = _(table.columns).map(getColName);

  if (body) {
    columns = columns
      .map((c) => [c + '_promo', c + '_body'])
      .flatten();
  }

  let csv = "," + columns.map((c) => `"${c}"`).join(',') + '\n';

  csv += _(table.result).map((row) => {
    return '"' + getRowName(row[0]) + '",' + row.slice(1).join(',');
  }).join("\n") + "\n";

  return csv;
}

const tableToCsvUri = _.flow(tableToCsv, encodeURIComponent);

const Export = ({table, body}) => {
  return <div className="container-fluid">
    <div className="row mt-2">
      <div className="col">
        <a href={new URL('/queryapp/motif_enrichment/cluster_info.csv', BASE_URL)} className="btn btn-primary">
          Cluster Information<FontAwesomeIcon icon="file-csv" className="ml-2"/></a>
        <p>
          CSV file that includes consensus motif sequence, motif family name, and number of motifs.
        </p>
      </div>
    </div>
    <div className="row mt-2">
      <div className="col">
        <a className="btn btn-primary" href={"data:text/csv," + tableToCsvUri(table, body)}
           download="motif_enrichment_table.csv">
          Table Data<FontAwesomeIcon icon="file-csv" className="ml-2"/></a>
        <p>P-values of enriched motifs in a CSV format.</p>
      </div>
    </div>
  </div>;
};

Export.propTypes = {
  table: PropTypes.object,
  body: PropTypes.bool
};

Export.defaultProps = {
  body: false
};

export default Export;
