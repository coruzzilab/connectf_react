/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  addEdge,
  addGroup,
  addTF,
  clearEdges,
  clearQuery,
  clearQueryError,
  clearQueryTree,
  clearRequestId,
  postQuery,
  removeEdge,
  setEdges,
  setQuery
} from '../../actions';
import {getQuery} from "../../utils";
import {AddTFButton, AddTFGroupButton, TargetGeneInfo, TargetGenesFile} from "./common";
import History from "./history";
import QueryAutocomplete from "./query_autocomplete";
import {getAdditionalEdges, getTargetGeneLists} from "../../utils/axios";
import {CancelToken} from "axios";
import {CopyButton} from "../common";
import Value from "./value";
import Group from "./group";
import QueryBox from "./query_box";

const mapStateToProps = ({busy, query, queryTree, edges, queryError}) => {
  return {
    busy,
    query,
    queryTree,
    edges,
    queryError
  };
};

/**
 * Builds queries for tgdbbackend
 */
class QuerybuilderBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetGenes: [],
      edgeList: [],
      targetGene: '',
      files: null,
      shouldBuild: false
    };

    this.cancels = [];

    this.checkShouldBuild = _.debounce(this.checkShouldBuild.bind(this), 100);
  }

  componentDidMount() {
    getTargetGeneLists()
      .then(({data}) => {
        this.setState({targetGenes: data});
      });

    getAdditionalEdges()
      .then(({data}) => {
        this.setState({edgeList: data});
        this.props.setEdges(_.intersection(this.props.edges, data));
      });

    this.checkShouldBuild();
    this.props.clearQueryError();
  }

  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query || !_.isEqual(this.props.queryTree, prevProps.queryTree)) {
      this.checkShouldBuild();
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

  handleSubmit(e) {
    e.preventDefault();
    let {query, setQuery, edges} = this.props;
    let {targetGene, files} = this.state;
    let data = new FormData();

    this.cancelRequests();

    if (!this.props.query) {
      query = this.buildQuery();
      setQuery(query);
    }

    data.append('query', query);

    for (let e of edges) {
      data.append('edges', e);
    }

    if (targetGene === "other") {
      if (files && files.length) {
        data.set('targetgenes', files[0]);
      }
    } else {
      data.set('targetgenes', targetGene);
    }

    this.props.postQuery(
      {
        data,
        cancelToken: new CancelToken((c) => {
          this.cancels.push(c);
        })
      },
      () => {
        this.props.history.push('/result/summary');
      });
  }

  reset() {
    // add additional reset code
    try {
      this.targetGenes.current.value = null;
    } catch (e) {
      // Ignore for now
    }

    this.cancelRequests();

    this.props.clearQuery();
    this.props.clearQueryTree();
    this.props.clearEdges();
    this.props.clearRequestId();
    this.props.clearQueryError();
    this.setState({
      targetGene: ""
    });
  }

  handleTargetGene(e) {
    this.setState({
      targetGene: e.target.value
    });
  }

  handleFile(files) {
    this.setState({files});
  }

  buildQuery() {
    let {queryTree} = this.props;
    return getQuery(queryTree);
  }

  setQuery() {
    this.props.setQuery(this.buildQuery());
  }

  handleEdgeCheck(name, e) {
    if (e.target.checked) {
      this.props.addEdge(name);
    } else {
      this.props.removeEdge(name);
    }
  }

  checkShouldBuild() {
    let query = getQuery(this.props.queryTree);

    this.setState({
      shouldBuild: query && this.props.query !== query
    });
  }

  render() {
    let {targetGenes, targetGene, edgeList, shouldBuild} = this.state;
    let {addTF, addGroup, queryTree, edges, query, busy, queryError, setQuery} = this.props;

    return <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="container-fluid">
          <div className="row m-2">
            <h2>Query</h2>
          </div>
          <div className="form-row m-1">
            <div className="col">
              <div className="btn-group">
                <AddTFButton onClick={addTF.bind(undefined, '', undefined, undefined, undefined, undefined)} large/>
                <AddTFGroupButton onClick={addGroup.bind(undefined, undefined, undefined, undefined, undefined)} large/>
              </div>
              <div className="btn-group float-right">
                <History/>
              </div>
            </div>
          </div>
          <QueryBox>
            {_(queryTree).filter((o) => _.isUndefined(o.parent)).map((o, i, a) => {
              let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
              if (o.nodeType === 'TF') {
                return <Value key={o.id}
                              first={first}
                              node={o}/>;
              } else if (o.nodeType === 'GROUP') {
                return <Group key={o.id} first={first} node={o}/>;
              }
            }).value()}
          </QueryBox>
          <div className="form-row">
            <div className="col m-2">
              <div className="input-group">
                <div className="input-group-prepend">
                  <CopyButton text={query}
                              className="btn-lg"
                              content={(copied) => (<span>
                                <FontAwesomeIcon icon="copy" className="mr-1"/>{copied ? "Copied!" : "Copy"}</span>)}/>
                  <button type="button"
                          className={classNames("btn btn-lg", shouldBuild ? "btn-warning" : "btn-secondary")}
                          onClick={this.setQuery.bind(this)}>
                    <FontAwesomeIcon icon="edit" className="mr-1"/>Build Query
                  </button>
                </div>
                <QueryAutocomplete value={query} setQuery={setQuery}/>
                <div className="input-group-append">
                  {busy ?
                    <button type="submit" className="btn btn-warning btn-lg">
                      <FontAwesomeIcon icon="circle-notch" spin size="lg" className="mr-2"/>Querying
                    </button> :
                    <button type="submit"
                            className={classNames("btn btn-lg", queryError.error ? "btn-danger" : "btn-primary")}>
                      <FontAwesomeIcon icon="arrow-circle-up" className="mr-2"/>Submit
                    </button>}
                  <button type="button" className="btn btn-outline-danger btn-lg" onClick={this.reset.bind(this)}>
                    <FontAwesomeIcon icon="redo" className="mr-2"/>Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row m-2">
            <span className="text-danger">{queryError.message}</span>
          </div>

          {edgeList.length ?
            <div className="row m-2">
              <h2>Additional Edges</h2>
            </div> :
            null}
          <div className="form-row m-2">
            <div className="col-auto">
              {_.map(edgeList, (e, i) => {
                return <div className="form-check" key={i}>
                  <input className="form-check-input" type="checkbox" value={e}
                         checked={_.indexOf(edges, e) !== -1}
                         onChange={this.handleEdgeCheck.bind(this, e)}/>
                  <label className="form-check-label">{e}</label>
                </div>;
              })}
            </div>
          </div>

          <div className="row m-2 align-items-center">
            <h2>Target Genes</h2>
            <TargetGeneInfo/>
          </div>
          <div className="form-row m-2">
            <p className="text-secondary">
              By default, all targets of each transcription factor is displayed. Select a
              Target Gene List (or upload your own) to filter the results.
            </p>
          </div>
          <div className="form-row m-2">
            <select className="form-control mr-1" value={targetGene} onChange={this.handleTargetGene.bind(this)}>
              <option value="">----</option>
              {_.map(targetGenes, (l, i) => {
                return <option key={i} value={l}>{l}</option>;
              })}
              <option value="other">Upload Target Genes</option>
            </select>
          </div>
          {targetGene === "other" ?
            <div className="form-row m-2">
              <TargetGenesFile handleChange={this.handleFile.bind(this)}/>
            </div> :
            null}
        </div>
      </form>
    </div>;
  }
}

/**
 * @memberOf QuerybuilderBody
 */
QuerybuilderBody.propTypes = {
  history: PropTypes.object.isRequired,
  busy: PropTypes.number,
  query: PropTypes.string,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  addTF: PropTypes.func,
  addGroup: PropTypes.func,
  postQuery: PropTypes.func,
  clearQuery: PropTypes.func,
  clearQueryTree: PropTypes.func,
  setQuery: PropTypes.func,
  addEdge: PropTypes.func,
  removeEdge: PropTypes.func,
  clearEdges: PropTypes.func,
  edges: PropTypes.arrayOf(PropTypes.string),
  setEdges: PropTypes.func,
  clearRequestId: PropTypes.func,
  queryError: PropTypes.shape({error: PropTypes.bool, message: PropTypes.string}),
  clearQueryError: PropTypes.func
};

const Querybuilder = connect(mapStateToProps, {
  postQuery,
  setQuery,
  clearQuery,
  addTF,
  addGroup,
  clearQueryTree,
  addEdge,
  removeEdge,
  clearEdges,
  setEdges,
  clearRequestId,
  clearQueryError
})(QuerybuilderBody);

export default Querybuilder;
