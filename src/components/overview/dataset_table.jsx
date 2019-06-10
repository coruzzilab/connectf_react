/**
 * @author zacharyjuang
 * 2019-05-30
 */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import {SortButton} from "../result/common";

const HEADER = ['ID', 'Gene ID', 'Gene Name'];

function flattenRow(row) {
  return [row.id, row['gene_id'], row['gene_name'], ..._.values(row['metadata'])];
}

function renderRow(row) {
  return <tr key={row[0]}>
    <th>{row[0]}</th>
    {_.map(row.slice(1), (r, i) => <td key={i}>{r}</td>)}
  </tr>;
}

class DatasetTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      sortCol: null,
      ascending: true
    };
  }

  sortFunc(i) {
    let {sortCol, ascending} = this.state;

    if (i === sortCol) {
      if (ascending) {
        this.setState({ascending: false});
      } else {
        this.setState({
          ascending: true,
          sortCol: null
        });
      }
    } else {
      this.setState({
        sortCol: i,
        ascending: true
      });
    }
  }

  render() {
    let {datasets} = this.props;
    let {sortCol, ascending} = this.state;

    return <div className="table-responsive">
      <table className="table">
        <thead>
        <tr className="text-nowrap align-items-center">
          {_(HEADER)
            .concat(_.keys(_.get(datasets, '0.metadata', {})))
            .map((k, i) => {
              return <th key={i}>{k} <SortButton sorted={sortCol === i} sortFunc={this.sortFunc.bind(this, i)}
                                                 ascending={ascending}/></th>;
            })
            .value()}

        </tr>
        </thead>
        <tbody>
        {_(datasets)
          .map(flattenRow)
          .orderBy(...(_.isNull(sortCol) ? [['gene_id', 'id']] : [sortCol, ascending ? 'asc' : 'desc']))
          .map(renderRow)
          .value()}
        </tbody>
      </table>
    </div>;
  }
}

DatasetTable.propTypes = {
  datasets: PropTypes.array.isRequired
};

DatasetTable.defaultProps = {
  datasets: []
};

export default DatasetTable;
