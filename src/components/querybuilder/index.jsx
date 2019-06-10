/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  addEdge,
  clearEdges,
  clearQuery,
  clearQueryError,
  clearQueryTree,
  clearRequestId,
  getEdgeList,
  postQuery,
  removeEdge,
  setEdges,
  setQuery
} from '../../actions';
import {getQuery} from "../../utils";
import {Edges} from "./common";
import History from "./history";
import {getTargetGeneLists, getTargetNetworks} from "../../utils/axios_instance";
import {CancelToken} from "axios";
import {FilterTfFile, TargetGeneFile, TargetNetworkFile} from "./query_file";
import QueryBox from "./query_box";
import AdvancedQuery from "./advanced_query";

const mapStateToProps = ({busy, query, queryTree, edges, edgeList, queryError, tempLists}) => {
  return {
    busy,
    query,
    queryTree,
    edges,
    edgeList,
    queryError,
    tempLists
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

    this.targetGenesInput = React.createRef();
    this.filterTfsInput = React.createRef();
    this.targetNetworksInput = React.createRef();

    this.state = {
      targetGenes: [],
      targetGene: '',
      filterTfs: [],
      filterTf: '',
      targetNetworks: [],
      targetNetwork: '',
      shouldBuild: false
    };

    this.cancels = [];
  }

  componentDidMount() {
    Promise.all([getTargetGeneLists(), getTargetNetworks()])
      .then(([targetGenes, targetNetworks]) => {
        this.setState({targetGenes, targetNetworks});
      });

    this.props.getEdgeList()
      .then(() => {
        this.props.setEdges(_.intersection(this.props.edges, this.props.edgeList));
      });

    this.props.clearQueryError();
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
    let {query, setQuery, edges, queryTree, tempLists} = this.props;
    let {targetGene, filterTf, targetNetwork} = this.state;
    let data = new FormData();

    this.cancelRequests();

    if (!this.props.query) {
      query = getQuery(queryTree);
      setQuery(query);
    }

    data.append('query', query);

    for (let edge of edges) {
      data.append('edges', edge);
    }

    // prep files for upload
    if (targetGene === "other" && this.targetGenes.current) {
      let files = this.targetGenes.current.files;
      if (files && files.length) {
        data.set('targetgenes', files[0]);
      }
    } else if (targetGene === "input" && this.targetGenesInput.current) {
      data.set('targetgenes',
        new Blob([this.targetGenesInput.current.value], {type: 'text/plain'}),
        'targetgenes.txt');
    } else if (_.has(tempLists, targetGene)) {
      data.set('targetgenes',
        new Blob([tempLists[targetGene]], {type: 'text/plain'}),
        'targetgenes.txt');
    } else {
      data.set('targetgenes', targetGene);
    }

    if (filterTf === "other" && this.filterTfs.current) {
      let files = this.filterTfs.current.files;
      if (files && files.length) {
        data.set('filtertfs', files[0]);
      }
    } else if (filterTf === "input" && this.filterTfsInput.current) {
      data.set('filtertfs',
        new Blob([this.filterTfsInput.current.value], {type: 'text/plain'}),
        'filtertfs.txt');
    } else if (_.has(tempLists, filterTf)) {
      data.set('filtertfs',
        new Blob([tempLists[filterTf]], {type: 'text/plain'}),
        'filtertfs.txt');
    } else {
      data.set('filtertfs', filterTf);
    }

    if (targetNetwork === "other" && this.targetNetworks.current) {
      let files = this.targetNetworks.current.files;
      if (files && files.length) {
        data.set('targetnetworks', files[0]);
      }
    } else if (targetNetwork === "input" && this.targetNetworksInput.current) {
      data.set('targetnetworks',
        new Blob([this.targetNetworksInput.current.value], {type: 'text/plain'}),
        'targetnetworks.txt');
    } else {
      data.set('targetnetworks', targetNetwork);
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
        // this.props.history.push('/result/table');
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

    try {
      if (this.targetGenesInput.current) {
        this.targetGenesInput.current.value = null;
      }
      if (this.filterTfsInput.current) {
        this.filterTfsInput.current.value = null;
      }
      if (this.targetNetworksInput.current) {
        this.targetNetworksInput.current.value = null;
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
      targetGene: "",
      filterTf: "",
      targetNetwork: ""
    });
  }

  handleFileSelect(key, e) {
    this.setState({
      [key]: e.target.value
    });
  }

  handleEdgeCheck(name, e) {
    if (e.target.checked) {
      this.props.addEdge(name);
    } else {
      this.props.removeEdge(name);
    }
  }

  render() {
    let {targetGenes, targetGene, filterTfs, filterTf, targetNetworks, targetNetwork} = this.state;
    let {edges, edgeList, queryError, tempLists} = this.props;

    return <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="container-fluid">
          <div className="row m-2">
            <h2>Query</h2>
          </div>
          <div className="form-row m-1">
            <div className="col">
              <div className="btn-group">
                <History/>
              </div>
            </div>
          </div>

          <QueryBox reset={this.reset.bind(this)}/>

          {queryError.message ?
            <div className="row m-2">
              <span className="text-danger" id="error">{queryError.message}</span>
            </div> :
            null}

          <div className="row m-2">
            <div className="col border rounded">
              <AdvancedQuery/>

              {edgeList.length ?
                <Edges edgeList={edgeList} edges={edges} onChange={this.handleEdgeCheck.bind(this)}/> :
                null}

              <TargetGeneFile fileRef={this.targetGenes} list={targetGenes} tempLists={tempLists}
                              inputRef={this.targetGenesInput}
                              onChange={this.handleFileSelect.bind(this, 'targetGene')}
                              value={targetGene}/>
              <FilterTfFile fileRef={this.filterTfs} list={filterTfs} tempLists={tempLists}
                            inputRef={this.filterTfsInput}
                            onChange={this.handleFileSelect.bind(this, 'filterTf')}
                            value={filterTf}/>
              <TargetNetworkFile fileRef={this.targetNetworks} list={targetNetworks}
                                 inputRef={this.targetNetworksInput}
                                 onChange={this.handleFileSelect.bind(this, 'targetNetwork')}
                                 value={targetNetwork}/>
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
  postQuery: PropTypes.func,
  clearQuery: PropTypes.func,
  clearQueryTree: PropTypes.func,
  setQuery: PropTypes.func,
  addEdge: PropTypes.func,
  removeEdge: PropTypes.func,
  clearEdges: PropTypes.func,
  edges: PropTypes.arrayOf(PropTypes.string),
  edgeList: PropTypes.arrayOf(PropTypes.string),
  setEdges: PropTypes.func,
  getEdgeList: PropTypes.func,
  clearRequestId: PropTypes.func,
  queryError: PropTypes.shape({error: PropTypes.bool, message: PropTypes.string}),
  clearQueryError: PropTypes.func,
  tempLists: PropTypes.object
};

const Querybuilder = connect(mapStateToProps, {
  postQuery,
  setQuery,
  clearQuery,
  clearQueryTree,
  addEdge,
  removeEdge,
  clearEdges,
  setEdges,
  getEdgeList,
  clearRequestId,
  clearQueryError
})(QuerybuilderBody);

export default Querybuilder;
