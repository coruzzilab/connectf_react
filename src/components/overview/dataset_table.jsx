/**
 * @author zacharyjuang
 * 2019-05-30
 */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import {SortButton} from "../result/common";
import {withRouter} from 'react-router-dom';
import {postQuery, setQuery} from "../../actions";
import {connect} from 'react-redux';

const HEADER = ['ID', 'Gene ID', 'Gene Name'];

class AnalysisIdBody extends React.Component {
  submitQuery() {
    let data = new FormData();
    let geneId = this.props.row[1];
    let analysisId = this.props.row[0];

    let query = `${geneId}[id=${analysisId}]`;

    data.append('query', query);
    this.props.postQuery({data}).then(() => {
      this.props.setQuery(query);
      this.props.history.push('/result/summary');
    });
  }

  render() {
    return <th>
      <button type="button" className="btn btn-link p-0"
              onClick={this.submitQuery.bind(this)}>{this.props.row[0]}</button>
    </th>;
  }
}

AnalysisIdBody.propTypes = {
  row: PropTypes.array,
  postQuery: PropTypes.func,
  setQuery: PropTypes.func,
  history: PropTypes.object
};

const AnalysisId = withRouter(connect(null, {postQuery, setQuery})(AnalysisIdBody));

AnalysisId.propTypes = {
  row: PropTypes.array.isRequired
};

class GeneIdBody extends React.Component {
  submitQuery() {
    let data = new FormData();
    let geneId = this.props.row[1];

    data.append('query', geneId);
    this.props.postQuery({data}).then(() => {
      this.props.setQuery(geneId);
      this.props.history.push('/result/summary');
    });
  }

  render() {
    return <td>
      <button type="button" className="btn btn-link p-0"
              onClick={this.submitQuery.bind(this)}>{this.props.row[1]}</button>
    </td>;
  }
}

GeneIdBody.propTypes = {
  row: PropTypes.array,
  postQuery: PropTypes.func,
  setQuery: PropTypes.func,
  history: PropTypes.object
};

const GeneId = withRouter(connect(null, {postQuery, setQuery})(GeneIdBody));

GeneId.propTypes = {
  row: PropTypes.array.isRequired
};

function flattenRow(row) {
  return [row.id, row['gene_id'], row['gene_name'], ..._.values(row['metadata'])];
}

function renderRow(row) {
  return <tr key={row[0]}>
    <AnalysisId row={row}/>
    <GeneId row={row}/>
    {_.map(row.slice(2), (r, i) => <td key={i}>{r}</td>)}
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
