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
import {AddTFButton, AddTFGroupButton, Copied, Edges, TargetGeneInfo, UploadFile} from "./common";
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

    this.targetGenes = React.createRef();
    this.filterTfs = React.createRef();
    this.targetNetworks = React.createRef();

    this.state = {
      targetGenes: [],
      edgeList: [],
      targetGene: '',
      filterTf: '',
      targetNetwork: '',
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
    let {targetGene, filterTf, targetNetwork} = this.state;
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

    // prep files for upload
    if (targetGene === "other" && this.targetGenes.current) {
      let files = this.targetGenes.current.files;
      if (files && files.length) {
        data.set('targetgenes', files[0]);
      }
    } else {
      data.set('targetgenes', targetGene);
    }

    if (filterTf === "other" && this.filterTfs.current) {
      let files = this.filterTfs.current.files;
      if (files && files.length) {
        data.set('filtertfs', files[0]);
      }
    } else {
      data.set('filtertfs', targetGene);
    }

    if (targetNetwork === "other" && this.targetNetworks.current) {
      let files = this.targetNetworks.current.files;
      if (files && files.length) {
        data.set('targetnetworks', files[0]);
      }
    } else {
      data.set('targetnetworks', targetGene);
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
      if (this.targetGenes.current) {
        this.targetGenes.current.value = null;
      }
      if (this.filterTfs.current) {
        this.filterTfs.current.value = null;
      }
      if (this.targetNetworks.current) {
        this.targetNetworks.current.value = null;
      }
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

  handleFileSelect(key, e) {
    this.setState({
      [key]: e.target.value
    });
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
    let {targetGenes, targetGene, filterTf, targetNetwork, edgeList, shouldBuild} = this.state;
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
                  <CopyButton text={query} className="btn-lg" content={Copied}/>
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

          <div className="row m-2">
            <div className="col border rounded">
              {edgeList.length ?
                <Edges edgeList={edgeList} edges={edges} onChange={this.handleEdgeCheck.bind(this)}/> :
                null}

              <div className="row m-2 align-items-center">
                <h4>Target Genes</h4>
                <TargetGeneInfo/>
              </div>
              <div className="form-row m-2">
                <p className="text-secondary">
                  By default, all targets of each transcription factor is displayed. Select a
                  Target Gene List (or upload your own) to filter the results.
                </p>
              </div>
              <div className="form-row m-2">
                <select className="form-control" value={targetGene}
                        onChange={this.handleFileSelect.bind(this, 'targetGene')}>
                  <option value="">----</option>
                  {_.map(targetGenes, (l, i) => {
                    return <option key={i} value={l}>{l}</option>;
                  })}
                  <option disabled>──────────</option>
                  <option value="other">Upload Target Genes</option>
                </select>
              </div>
              {targetGene === "other" ?
                <div className="form-row m-2">
                  <UploadFile inputRef={this.targetGenes}/>
                </div> :
                null}

              <div className="row m-2">
                <h4>Filter TFs</h4>
              </div>
              <div className="row m-2">
                <p className="text-secondary">
                  Provide a gene list to limit the TFs in your query. Typically used
                  with &quot;oralltfs&quot; or &quot;multitype&quot; to limit the size of the output.
                </p>
              </div>
              <div className="form-row m-2">
                <select className="form-control"
                        onChange={this.handleFileSelect.bind(this, 'filterTf')}>
                  <option value="">----</option>
                  <option disabled>──────────</option>
                  <option value="other">Upload Gene List</option>
                </select>
              </div>
              {filterTf === "other" ?
                <div className="form-row m-2">
                  <UploadFile inputRef={this.filterTfs}/>
                </div> :
                null}

              <div className="row m-2">
                <h4>Target Network</h4>
              </div>
              <div className="row m-2">
                <p className="text-secondary">
                  Provide a gene network that restricts both the query TFs and the targeted genes.
                </p>
              </div>
              <div className="form-row m-2">
                <select className="form-control"
                        onChange={this.handleFileSelect.bind(this, 'targetNetwork')}>
                  <option value="">----</option>
                  <option disabled>──────────</option>
                  <option value="other">Upload Network</option>
                </select>
              </div>
              {targetNetwork === "other" ?
                <div className="form-row m-2">
                  <UploadFile inputRef={this.targetNetworks}/>
                </div> :
                null}
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
