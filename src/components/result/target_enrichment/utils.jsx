/**
 * @author zacharyjuang
 * 11/9/18
 */
import _ from "lodash";

export function surround(s, p = '"', pre = ' ', default_ = '') {
  return s ? pre + p + s + p : default_;
}

function tableToCsv(table, keys) {
  let keyString = _(keys).map((k) => `"${k}"`).join(",");

  let csv = ('"analysis_id","targets",'
    + (keyString ? keyString + "," : "")
    + _(table.columns)
      .zip(new Array(_.get(table, 'columns.length', 0)).fill('count'))
      .flatten()
      .map((c) => `"${c}"`)
      .join(',')
    + "\n");

  csv += _(table.result).map((r) => {
    let keyVals = _(keys)
      .map((k) => `"${_.get(r, ['info', k], "")}"`)
      .join(",");

    return (`"${r['info']['analysis_id']}","${r['info'].targets}",`
      + (keyVals ? keyVals + "," : "")
      + _(r['p-value'])
        .zip(r['count'])
        .flatten()
        .join(","));
  }).join("\n") + "\n";

  return csv;
}

export const tableToCsvUri = _.flow(tableToCsv, encodeURIComponent);
