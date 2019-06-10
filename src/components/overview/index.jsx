/**
 * @author zacharyjuang
 * 2019-05-17
 */
import React from 'react';
import {instance} from "../../utils/axios_instance";
import _ from 'lodash';
import DatasetTable from "./dataset_table";
import OverviewChart from "./overview_chart";

class Overview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      results: {},
      autocomplete: [],
      chartKey: ''
    };
  }

  componentDidMount() {
    instance.get('/api/overview/autocomplete/').then((resp) => {
      this.setState({
        autocomplete: resp.data
      });
    });
    this.search().then((resp) => {
      this.setState({
        results: resp.data
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.results !== this.state.results) {
      let {results: {summary}, chartKey} = this.state;
      let chartKeys = _(summary).keys();

      if (!chartKey || chartKeys.indexOf(chartKey) === -1) {
        let c = chartKeys.find((o) => /^tech/i.test(o));

        if (c) {
          this.setState({
            chartKey: c
          });
        } else {
          this.setState({
            chartKey: chartKeys.head()
          });
        }
      }
    }
  }

  setChartKey(e) {
    this.setState({chartKey: e.target.value});
  }

  search(query = '') {
    return instance.get('/api/overview/', {params: {search: query}});
  }

  submit(e) {
    e.preventDefault();
    this.search(this.state.query).then((resp) => {
      this.setState({
        results: resp.data
      });
    }).then(() => {
      this.setState({query: ''});
    });
  }

  setQuery(e) {
    this.setState({query: e.target.value});
  }

  render() {
    let {datasets, summary, total} = this.state.results;
    let {chartKey} = this.state;

    return <div className="container-fluid">
      <div className="row mb-1">
        <div className="col">
          <form onSubmit={this.submit.bind(this)}>
            <div className="form-row">
              <div className="col">
                <div className="input-group input-group-lg">
                  <input type="text" className="form-control" name="search" value={this.state.query}
                         placeholder="Search" onChange={this.setQuery.bind(this)} list="search_list" autoFocus/>
                  <datalist id="search_list">
                    {_.map(this.state.autocomplete, (v, i) => <option key={i} value={v}/>)}
                  </datalist>
                  <div className="input-group-append">
                    <button type="submit" className="btn btn-primary">Search</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="row mb-1">
        <div className="col">
          <select className="form-control" value={chartKey} onChange={this.setChartKey.bind(this)}>
            {_(summary).keys().map((k, i) => {
              return <option key={i} value={k}>{k}</option>;
            }).value()}
          </select>
        </div>
      </div>

      <div className="row mb-1">
        <div className="col">
          <OverviewChart summary={summary} chartKey={chartKey}/>
        </div>
      </div>

      <div className="row mb-1">
        <div className="col">
          Rows: {_.size(datasets).toLocaleString()} / {(total || 0).toLocaleString()}
        </div>
      </div>

      <div className="row">
        <div className="col">
          <DatasetTable datasets={datasets}/>
        </div>
      </div>
    </div>;
  }
}

export default Overview;
