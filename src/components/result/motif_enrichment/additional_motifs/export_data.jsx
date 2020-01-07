/**
 * @author zacharyjuang
 * 1/2/20
 */
import classNames from "classnames";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";

function enrichmentToCsv(data) {
  let _columns = _(_.get(data, 'columns'));
  if (!_columns.size()) {
    return '';
  }
  let header = _columns
    .map((col) => {
      let h = '"' + _(col).omit(['motifs']).toPairs().map(([key, val]) => `${key}=${val}`).join(';') + '",';
      return _.repeat(h, col['motifs'].length).replace(/,$/, '');
    })
    .join(',');
  let content = 'region,' + header + '\n';
  content += ',' + _columns.map('motifs').flatten().join(',') + '\n';
  content += _(_.get(data, 'result')).map((row) => {
    return `"${row[0]}",` + _(row).slice(1).join(',');
  }).join('\n');
  content += '\n';
  return content;
}

const ExportData = ({className, enrichmentData}) => {
  const handleClick = () => {
    let a = document.createElement('a');
    a.download = 'individual_motifs.csv';
    a.href = 'data:text/csv,' + encodeURIComponent(enrichmentToCsv(enrichmentData));
    document.body.append(a);
    a.click();
    a.remove();
  };

  return <button className={classNames("btn btn-primary", className)} onClick={handleClick}>
    <Icon icon="file-csv" className="mr-1"/>Export Data</button>;
};

ExportData.propTypes = {
  className: PropTypes.string,
  enrichmentData: PropTypes.object
};

export default ExportData;
