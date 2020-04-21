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
    <h6>Additional Edge Features</h6>
    <div className="mb-2">{data.has('edges') ?
      <ul>{_.map(data.getAll('edges'), (e, i) => <li key={i}>{e}</li>)}</ul> :
      "No Additional Edge Features Selected"}
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
    this.cancelRequests();

    this.props.resetQuery();
    this.setState({
      targetGene: "",
      filterTf: "",
      targetNetwork: ""
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
    let {isOpen, data} = this.state;
    let {edges, edgeList, queryError, queryTree, warnSubmit, setWarnSubmit} = this.props;

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
  history: PropTypes.object.isRequired,
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
