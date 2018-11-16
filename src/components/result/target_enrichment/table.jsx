/**
 * @author zacharyjuang
 * 11/9/18
 */
import React from "react";
import _ from "lodash";
import {blueShader, getLogMinMax} from "../../../utils";
import {SortButton} from "../common";
import {RowHeader} from "./common";
import {surround} from "./utils";
import PropTypes from "prop-types";

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.table = React.createRef();

    this.state = {
      height: 0,
      sortCol: null,
      ascending: true
    };

    this.setHeight = _.debounce(this.setHeight.bind(this), 100);
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener('resize', this.setHeight);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight);
  }

  setHeight() {
    this.setState({
      height: document.documentElement.clientHeight - this.table.current.getBoundingClientRect().top
    });
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
    let {table} = this.props;
    let {sortCol, ascending, height} = this.state;
    let [min, max] = getLogMinMax(_.get(table, 'result', []));

    return <div className="table-responsive" ref={this.table} style={{maxHeight: height, overflowY: 'scroll'}}>
      <table className="table table-sm table-bordered">
        <thead>
        <tr>
          <th/>
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
                      <SortButton sorted={sortCol === i + 1} sortFunc={this.sortFunc.bind(this, i + 1)}
                                  ascending={ascending} style={{cursor: 'pointer'}}/>
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
          .orderBy((row) => _.isNull(row) ? row : row[sortCol], ascending ? 'asc' : 'desc')
          .map((row, i) => {
            return <tr key={i}>
              <RowHeader info={row[0]}>{row[0].name + surround(row[0].filter)}</RowHeader>
              {_.map(row.slice(1), (cell, j) => {
                return <td style={blueShader(cell, min, max)} key={j}>{cell.toExponential(2)}</td>;
              })}
            </tr>;
          })
          .value()}
        </tbody>
      </table>
    </div>;
  }
}

Table.propTypes = {
  table: PropTypes.object.isRequired
};

export default Table;
