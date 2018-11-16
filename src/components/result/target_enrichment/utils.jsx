/**
 * @author zacharyjuang
 * 11/9/18
 */
import _ from "lodash";
import {getColName} from "../../../utils";

export function surround(s, p = '"', pre = ' ', default_ = '') {
  return s ? pre + p + s + p : default_;
}

function tableToCsv(table) {
  let csv = "," + _(table.columns).map((c) => `"${c}"`).join(',') + "\n";

  csv += _(table.result).map((r, i) => {
    return `"${getColName(r[0], i)}",` + r.slice(1).join(",");
  }).join("\n") + "\n";

  return csv;
}

export const tableToCsvUri = _.flow(tableToCsv, encodeURIComponent);
