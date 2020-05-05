/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  addEdge,
  clearQueryError,
  getEdgeList,
  postQuery,
  removeEdge,
  resetQuery,
  setEdges,
  setQuery,
  setWarnSubmit
} from '../../actions';
import {getQuery} from "../../utils";
import {AdditionalOptions, QueryInfo} from "./common";
import History from "./history";
import {CancelToken} from "axios";
import {BackgroundGenesFile, FilterTfFile, TargetGeneFile, TargetNetworkFile} from "./query_file";
import QueryBox from "./query_box";
import AdvancedQuery from "./advanced_query";
import RandomButton from "./random_button";
import AdditionalEdges from "./additional_edges";
import WarningModal from "./warning_modal";

const mapStateToProps = ({busy, query, queryTree, edges, edgeList, queryError, warnSubmit, uploadFiles}) => {
  return {
    busy,
    query,
    queryTree,
    edges,
    edgeList,
    queryError,
    warnSubmit,
    uploadFiles
  };
};

/**
 * Builds queries for tgdbbackend
 */
class QuerybuilderBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };

    this.cancels = [];
  }

  toggleWarnSubmit() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  componentDidMount() {
    this.props.getEdgeList()
      .then(() => {
        this.props.setEdges(_.intersection(this.props.edges, this.props.edgeList));
      });

    this.props.clearQueryError();

    if (_.get(this.props.location, 'state.submit', false)) {
      this.props.history.replace();
      this.submit();
    }
  }

  cancelRequests() {
    if (this.cancels.length) {
      for (let c of this.cancels) {
        c();
      }
      this.cancels = [];
    }
  }

  createSubmitData() {
    let {query, edges, queryTree, uploadFiles} = this.props;
    let data = new FormData();

    if (!this.props.query) {
      query = getQuery(queryTree);
    }

    data.append('query', query);

    for (let edge of edges) {
      data.append('edges', edge);
    }

    // prep files for upload
    _.forEach(uploadFiles, (val, key) => {
      if (_.isNull(val.content)) {
        data.set(key, val.name);
      } else {
        data.set(key,
          new Blob([val.content], {type: 'text/plain'}), `${val.name}.txt`);
      }
    });

    return data;
  }

  submit() {
    let {query, setQuery} = this.props;

    this.cancelRequests();

    let data = this.createSubmitData();

    if (!this.props.query) {
      setQuery(query);
    }

    return this.props.postQuery({
      data,
      cancelToken: new CancelToken((c) => {
        this.cancels.push(c);
      })
    }).then(() => {
      this.props.history.push('/result/summary');
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.props.warnSubmit) {
      this.toggleWarnSubmit();
    } else {
      this.submit();
    }
  }

  toggleAndSubmit() {
    this.toggleWarnSubmit();
    this.submit();
  }

  reset() {
    // add additional reset code
    this.cancelRequests();

    this.props.resetQuery();
  }

  handleEdgeCheck(name, e) {
    if (e.target.checked) {
      this.props.addEdge(name);
    } else {
      this.props.removeEdge(name);
    }
  }

  render() {
    let {isOpen} = this.state;
    let {edges, edgeList, queryError, warnSubmit, setWarnSubmit} = this.props;

    return <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="container-fluid">
          <div className="row m-2">
            <h2>Query</h2>
          </div>
          <div className="form-row m-1">
            <div className="col">
              <div className="btn-group mr-2">
                <History/>
              </div>
              <div className="btn-group">
                <RandomButton/>
              </div>
            </div>
          </div>

          <QueryBox reset={this.reset.bind(this)}/>
          <WarningModal isOpen={isOpen}
                        toggle={this.toggleWarnSubmit.bind(this)}
                        submit={this.toggleAndSubmit.bind(this)}/>

          <div className="form-row m-1">
            <div className="col">
              <label>
                <input type="checkbox"
                       checked={warnSubmit}
                       onChange={(e) => setWarnSubmit(e.target.checked)}/> Confirm Query Before Submit
              </label>
            </div>
          </div>

          <QueryInfo/>

          {queryError.message ?
            <div className="row m-2">
              <span className="text-danger" id="error">{queryError.message}</span>
            </div> :
            null}

          <div className="row m-2">
            <div className="col border rounded">
              <AdvancedQuery/>

              {edgeList.length ?
                <AdditionalEdges edgeList={edgeList} edges={edges} onChange={this.handleEdgeCheck.bind(this)}/> :
                null}

              <TargetGeneFile/>
              <FilterTfFile/>
              <TargetNetworkFile/>
              <BackgroundGenesFile/>
              <AdditionalOptions/>
            </div>
          </div>
        </div>
      </form>
    </div>;
  }
}

/**
 * @memberOf QuerybuilderBody
 */
QuerybuilderBody.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  busy: PropTypes.number,
  query: PropTypes.string,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  postQuery: PropTypes.func,
  setQuery: PropTypes.func,
  addEdge: PropTypes.func,
  removeEdge: PropTypes.func,
  edges: PropTypes.arrayOf(PropTypes.string),
  edgeList: PropTypes.arrayOf(PropTypes.string),
  setEdges: PropTypes.func,
  getEdgeList: PropTypes.func,
  queryError: PropTypes.shape({error: PropTypes.bool, message: PropTypes.string}),
  clearQueryError: PropTypes.func,
  warnSubmit: PropTypes.bool,
  setWarnSubmit: PropTypes.func,
  resetQuery: PropTypes.func,
  uploadFiles: PropTypes.object
};

const Querybuilder = connect(mapStateToProps, {
  postQuery,
  setQuery,
  addEdge,
  removeEdge,
  setEdges,
  getEdgeList,
  setWarnSubmit,
  clearQueryError,
  resetQuery
})(QuerybuilderBody);

export default Querybuilder;
