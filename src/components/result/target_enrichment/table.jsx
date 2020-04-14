/**
 * @author zacharyjuang
 * 11/9/18
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import {colorShader, getLogMinMax, redShader} from "../../../utils";
import {SortButton} from "../common";
import {RowHeader} from "./common";
import {surround} from "./utils";
import PropTypes from "prop-types";

const percentShader = _.partial(colorShader('b2182b', 'fddbc7', false), _, 0, 1);

const mapStateToProps = ({extraFields}) => {
  return {extraFields};
};

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortCol: null,
      ascending: true
    };
  }

  sortFunc(i) {
    let {sortCol, ascending} = this.state;

    if (sortCol !== i) {
      this.setState({
        sortCol: i,
        ascending: true
      });
    } else if (ascending) {
      this.setState({
        ascending: false
      });
    } else if (!ascending) {
      this.setState({
        ascending: true,
        sortCol: null
      });
    }
  }

  render() {
    let {table, height, extraFields, tableKey} = this.props;
    let {sortCol, ascending} = this.state;
    let min, max;
    if (tableKey === "p-value") {
      [min, max] = getLogMinMax(_.map(_.get(table, 'result', []), 'p-value'));
    }

    return <div className="table-responsive" ref={this.table} style={{maxHeight: height, overflowY: 'scroll'}}>
      <table className="table table-sm table-bordered">
        <thead>
        <tr>
          <th/>
          {_.map(extraFields, (f, i) => <th key={i}>{f}</th>)}
          {_(_.get(table, 'columns', {}))
            .map((val, key) => [val, key])
            .map(([val, key], i) => {
              return <th key={key}>
                <div className="container-fluid">
                  <div className="row align-items-center">
                    <div className="col">
                      {val}
                    </div>
                    <div className="col-1">
                      <SortButton sorted={sortCol === i} sortFunc={this.sortFunc.bind(this, i)}
                                  ascending={ascending}/>
                    </div>
                  </div>
                </div>
              </th>;
            })
            .value()}
        </tr>
        </thead>
        <tbody>
        {_(_.get(table, 'result', []))
          .orderBy((row) => _.isNull(row) ? row : row[tableKey][sortCol], ascending ? 'asc' : 'desc')
          .map((row, i) => {
            let geneId = _.get(row, 'info.gene_id');
            let geneName = _.get(row, 'info.gene_name');
            let name = geneId + (geneName ? ` (${geneName})` : '');

            return <tr key={i}>
              <RowHeader info={row['info']}>
                <div>{name} {surround(row['info'].filter)} ({row['info'].targets})</div>
                {row['info']['label'] ? <div>{row['info']['label']}</div> : null}
              </RowHeader>
              {_(row['info']).pick(extraFields).values().map((f, i) => <td key={i}
                                                                           className="text-nowrap">{f}</td>).value()}
              {_(row[tableKey]).zip(row['count']).map(([first, count], j) => {
                if (tableKey === "p-value") {
                  return <td style={redShader(first, min, max)} key={j}>{first.toExponential(2)} ({count})</td>;
                }
                return <td style={percentShader(first)} key={j}>
                  {first.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 2})} ({count})
                </td>;
              }).value()}
            </tr>;
          })
          .value()}
        </tbody>
      </table>
    </div>;
  }
}

TableBody.propTypes = {
  table: PropTypes.object.isRequired,
  height: PropTypes.number,
  extraFields: PropTypes.array,
  tableKey: PropTypes.string
};

const Table = connect(mapStateToProps)(TableBody);

export default Table;
