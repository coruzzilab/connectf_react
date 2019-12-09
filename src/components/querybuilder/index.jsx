/**
 * Created by zacharyjuang on 11/24/16.
 */
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import classNames from "classnames";
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
  setQuery,
  setWarnSubmit
} from '../../actions';
import {getQuery} from "../../utils";
import {AdditionalOptions, Edges, QueryInfo} from "./common";
import History from "./history";
import {getTargetGeneLists, getTargetNetworks} from "../../utils/axios_instance";
import {CancelToken} from "axios";
import {FilterTfFile, TargetGeneFile, TargetNetworkFile} from "./query_file";
import QueryBox from "./query_box";
import AdvancedQuery from "./advanced_query";
import RandomButton from "./random_button";

const WarningModalContent = ({data, queryTree}) => {
  let [targetGenes, setTargetGenes] = useState("");
  let [filterTfs, setFilterTfs] = useState("");
  let [targetNetworks, setTargetNetworks] = useState("");
  let [warnBuild, setWarnBuild] = useState(false);
  useEffect(() => {
    let targetGenesFile, filterTfsFile, targetNetworksFile;

    targetGenesFile = data.get('targetgenes');
    if (targetGenesFile) {
      if (targetGenesFile instanceof Blob) {
        targetGenesFile.slice(0, 100).text().then((text) => {
          setTargetGenes(text.length < 100 ? text : text + '...');
        });
      } else {
        setTargetGenes(targetGenesFile);
      }
    }

    filterTfsFile = data.get('filtertfs');
    if (filterTfsFile) {
      if (filterTfsFile instanceof Blob) {
        filterTfsFile.slice(0, 100).text().then((text) => {
          setFilterTfs(text.length < 100 ? text : text + '...');
        });
      } else {
        setFilterTfs(filterTfsFile);
      }
    }

    targetNetworksFile = data.get('targetnetworks');
    if (targetNetworksFile) {
      if (targetNetworksFile instanceof Blob) {
        targetNetworksFile.slice(0, 100).text().then((text) => {
          setTargetNetworks(text.length < 100 ? text : text + '...');
        });
      } else {
        setTargetNetworks(targetNetworksFile);
      }
    }

    let query = data.get('query');
    let builtQuery = getQuery(queryTree);
    setWarnBuild(query && builtQuery && query !== builtQuery);
  });

  return <div>
    <h6>Query</h6>
    <div className={classNames(warnBuild ? "text-warning" : null)}>{data.get('query')}</div>
    <div className="mb-2">
      {warnBuild ?
        <div><small>Current query is different from the one in Query Builder. Click on
          <span className="text-nowrap">&quot;Build Query&quot;</span> if necessary</small>
        </div> :
        null}
    </div>
    <h6>Additional Edges</h6>
    <div className="mb-2">{data.has('edges') ?
      <ul>{_.map(data.getAll('edges'), (e, i) => <li key={i}>{e}</li>)}</ul> :
      "No Additional Edges selected"}
    </div>
    <h6>Target Genes</h6>
    <div className="mb-2">{data.has('targetgenes') ? targetGenes : "No Target Genes Selected"}</div>
    <h6>Filter TFs</h6>
    <div className="mb-2">{data.has('filtertfs') ? filterTfs : "No Filter TFs Selected"}</div>
    <h6>Target Networks</h6>
    <div className="mb-2">{data.has('targetnetworks') ? targetNetworks : "No Target Networks Selected"}</div>
  </div>;
};

WarningModalContent.propTypes = {
  data: PropTypes.object,
  queryTree: PropTypes.arrayOf(PropTypes.object)
};

const mapStateToProps = ({busy, query, queryTree, edges, edgeList, queryError, tempLists, warnSubmit}) => {
  return {
    busy,
    query,
    queryTree,
    edges,
    edgeList,
    queryError,
    tempLists,
    warnSubmit
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

      isOpen: false,
      data: null,
      submitFunc: _.noop
    };

    this.cancels = [];
  }

  toggleWarnSubmit() {
    this.setState({
      isOpen: !this.state.isOpen
    });
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

  createSubmitData() {
    let {query, edges, queryTree, tempLists} = this.props;
    let {targetGene, filterTf, targetNetwork} = this.state;
    let data = new FormData();

    if (!this.props.query) {
      query = getQuery(queryTree);
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
    } else if (targetGene) {
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
    } else if (filterTf) {
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
    } else if (targetNetwork) {
      data.set('targetnetworks', targetNetwork);
    }

    return data;
  }

  submitData(data) {
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
    let {query, setQuery, warnSubmit} = this.props;

    this.cancelRequests();

    let data = this.createSubmitData();

    if (!this.props.query) {
      setQuery(query);
    }

    if (warnSubmit) {
      this.setState({
        data,
        submitFunc: this.submitData.bind(this, data)
      });
      this.toggleWarnSubmit();
    } else {
      this.submitData(data);
    }
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
    if (typeof e === 'string') {
      this.setState({
        [key]: e
      });
    } else {
      this.setState({
        [key]: e.target.value
      });
    }

  }

  handleEdgeCheck(name, e) {
    if (e.target.checked) {
      this.props.addEdge(name);
    } else {
      this.props.removeEdge(name);
    }
  }

  render() {
    let {targetGenes, targetGene, filterTfs, filterTf, targetNetworks, targetNetwork, isOpen, data} = this.state;
    let {edges, edgeList, queryError, queryTree, tempLists, warnSubmit, setWarnSubmit} = this.props;

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

          <Modal isOpen={isOpen} toggle={this.toggleWarnSubmit.bind(this)} backdrop={false}>
            <ModalHeader toggle={this.toggleWarnSubmit.bind(this)}>Submit</ModalHeader>
            <ModalBody>
              {data ?
                <WarningModalContent data={data} queryTree={queryTree}/> :
                null}
            </ModalBody>
            <ModalFooter>
              <button className="btn btn-danger" type="button" onClick={this.toggleWarnSubmit.bind(this)}>Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={() => {
                this.toggleWarnSubmit();
                this.state.submitFunc();
              }}>Submit
              </button>
            </ModalFooter>
          </Modal>

          <div className="form-row m-1">
            <div className="col">
              <label>
                <input type="checkbox"
                       checked={warnSubmit}
                       onChange={(e) => setWarnSubmit(e.target.checked)}/> Confirm Query Before Submit
              </label>
            </div>
          </div>

          <div className="form-row m-1">
            <div className="col">
              <RandomButton/> Give me some random Transcription Factors!
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
  tempLists: PropTypes.object,
  warnSubmit: PropTypes.bool,
  setWarnSubmit: PropTypes.func
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
  clearQueryError,
  setWarnSubmit
})(QuerybuilderBody);

export default Querybuilder;
