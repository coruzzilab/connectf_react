/**
 * @author zacharyjuang
 * 6/23/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import cytoscape from 'cytoscape';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import DropZone from 'react-dropzone';
import {Alert} from 'reactstrap';
import classNames from 'classnames';
import uuid4 from 'uuid/v4';

import {getNetwork, setNetwork} from '../../actions';
import {UploadSifInfoPopover} from "./common";
import {blobFromString, networkJSONStringify} from "../../utils";

const clampWeight = _.memoize(_.partial(_.clamp, _, 1, 5));

const edge_value = _.unary(_.partial(_.pick, _, ['data.source', 'data.target', 'data.name']));
const edge_compare = _.overArgs(_.isEqual, [edge_value, edge_value]);

const networkPNG = _.flow(
  _.partial(_.split, _, ',', 2),
  _.partial(_.get, _, 1),
  atob,
  _.partial(blobFromString, _, 'image/png'),
  URL.createObjectURL
);

const mapStateToProps = ({busy, requestId, network}) => {
  return {
    busy,
    requestId,
    network
  };
};

class NetworkBody extends React.Component {
  constructor(props) {
    super(props);
    this.cyRef = React.createRef();
    this.info = React.createRef();

    this.state = {
      height: Math.floor(document.documentElement.clientHeight * 0.8),
      busy: false,
      color: "#ffff00",
      alertOpen: false,
      alertMessage: ""
    };

    this.setHeight = _.debounce(this.setHeight.bind(this), 100);
    this.setUserEdgeColor = _.debounce(this.setUserEdgeColor.bind(this), 50, {maxWait: 200});
    this.searchNode = _.debounce(this.searchNode.bind(this), 200, {leading: true});
  }

  componentDidMount() {
    let self = this;

    this.cy = cytoscape({
      container: this.cyRef.current,
      boxSelectionEnabled: true,
      maxZoom: 20,
      minZoom: 0.05,
      style: [
        {
          selector: 'node',
          style: {
            'font-family': 'helvetica',
            'text-rotation': 270,
            'text-outline-color': '#000000',
            'text-valign': 'center',
            'color': '#000000',
            'shape': 'data(shape)',
            'background-color': 'data(color)',
            'width': 'data(size)',
            'height': 'data(size)',
            'min-zoomed-font-size': 3
          }
        },
        {
          selector: "node[?showLabel]",
          style: {
            'content': function (ele) {
              let name = ele.data('name');
              if (!name) {
                return ele.data('id');
              }
              return `${ele.data('id')} (${ele.data('name')})`;
            }
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'data(color)',
            'curve-style': 'bezier',
            'line-color': 'data(color)',
            'arrow-scale': 0.5,
            'min-zoomed-font-size': 3
          }
        },
        {
          selector: 'edge[weight]',
          style: {
            'width': function (ele) {
              return clampWeight(ele.data('weight'));
            }
          }
        }
      ],
      layout: {
        name: 'preset'
      }
    });

    this.cy.on('mouseover', 'edge', function (event) {
      let ele = event.target;
      ele.style({
        'label': ele.data('name')
      });
    });

    this.cy.on('mouseout', 'edge', function (event) {
      event.target.removeStyle('label');
    });

    this.cy.on('mouseover', "node[!showLabel]", function (event) {
      let ele = event.target;
      ele.style({
        'content': function (ele) {
          let name = ele.data('name');
          if (!name) {
            return ele.data('id');
          }
          return `${ele.data('id')} (${ele.data('name')})`;
        },
        'z-compound-depth': 'top'
      });
    });

    this.cy.on('mouseover', "node[!showLabel]:unselected", function (event) {
      event.target.style({
        'border-width': '2px',
        'border-color': 'red'
      });
    });

    this.cy.on('mouseout', "node[!showLabel]:unselected", function (event) {
      event.target.removeStyle('border-width border-color');
    });

    this.cy.on('mouseout', "node[!showLabel]", function (event) {
      let ele = event.target;
      ele.style({'content': null});
      ele.removeStyle('z-compound-depth');
    });

    this.cy.on('select', 'node', function (event) {
      event.target.style({'border-width': '2px', 'border-color': 'rgb(49,123,246)'});
    });

    this.cy.on('unselect', 'node', function (event) {
      event.target.removeStyle('border-width border-color');
    });

    this.cy.on('click', function () {
      if (self.cyRef.current !== document.activeElement) {
        self.cyRef.current.focus();
      }
    });

    this.setHeight();

    if (_.isEmpty(this.props.network)) {
      this.props.getNetwork(this.props.requestId);
    } else {
      this.resetCytoscape();
    }

    window.addEventListener("resize", this.setHeight);
  }

  componentDidUpdate(prevProp) {
    if (prevProp.requestId !== this.props.requestId) {
      this.props.getNetwork(this.props.requestId);
    }

    if (prevProp.network !== this.props.network) {
      this.resetCytoscape();
    }
  }

  componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
    window.removeEventListener("resize", this.setHeight);
  }

  setHeight() {
    this.setState({height: document.documentElement.clientHeight - this.cyRef.current.getBoundingClientRect().top});
    if (this.cy) {
      this.cy.resize();
    }
  }

  runCyLayout() {
    if (!this.layout) {
      this.layout = this.cy.layout({
        name: 'preset'
      });
    }
    this.layout.run();
  }

  fitCytoscape() {
    this.cy.fit();
  }

  exportCytoscape(e) {
    e.currentTarget.href = networkPNG(this.cy.png());
  }

  exportJSON(e) {
    e.currentTarget.download = 'network.cyjs';
    e.currentTarget.href = 'data:application/json,' + networkJSONStringify(this.cy.elements().jsons());
  }

  setData(data) {
    this.cy.batch(() => {
      this.cy.json({elements: _.cloneDeep(data)});
      this.cy.nodes(':selected').unselect();
      this.runCyLayout();
    });
  }

  resetCytoscape() {
    this.setData(this.props.network);
  }

  back() {
    this.props.history.push('/result/network');
  }

  setBusy(busy) {
    this.setState({busy});
  }

  setColor(e) {
    this.setState({
      color: e.target.value
    });

    this.setUserEdgeColor(e.target.value);
  }

  setUserEdgeColor(color) {
    this.cy.batch(() => {
      this.cy.edges('[?user]').data('color', color);
    });
  }

  handleUpload(acceptedFiles, rejectedFiles) {
    if (rejectedFiles.length) {
      this.setAlertMessage("File type not accepted.");
    } else if (acceptedFiles.length) {
      let reader = new FileReader();

      reader.readAsText(acceptedFiles[0]);
      reader.onload = () => {
        this.handleEdges(reader.result);
      };
    }
  }

  handleEdges(text) {
    let {color} = this.state;
    try {
      this.setBusy(true);
      let res = _(text)
        .split("\n")
        .filter(_.negate(_.isEmpty))
        .map((o) => {
          if (o.indexOf('\t') !== -1) {
            return _.split(o, '\t');
          }
          return o.split(/\s+/);
        })
        .map(_.unary(_.partial(_.map, _, _.trim)))
        .map(_.unary(_.partial(_.compact)))
        .map((o) => {
          return [..._.map(o.slice(0, 1), _.toUpper), ...o.slice(1, 2), ..._.map(o.slice(2), _.toUpper)];
        });

      if (res.some((o) => o.length < 3)) {
        this.setAlertMessage("Every row need to have at least 3 columns.");
        return;
      }

      let edges = res
        .map(([s, e, ...ts]) => {
          return _.map(ts, (t) => {
            return {
              data: {
                id: uuid4(),
                source: s,
                target: t,
                name: e,
                color,
                user: true
              }
            };
          });
        })
        .flatten();

      let nodes = _(this.cy.nodes())
        .invokeMap('data', 'id')
        .value();

      let uniqExistEdges = edges
        .filter((e) => {
          return _.indexOf(nodes, e.data.source) !== -1 && _.indexOf(nodes, e.data.target) !== -1;
        })
        .uniqWith(edge_compare)
        .value();

      if (!uniqExistEdges.length) {
        this.setAlertMessage("No edges added.");
        setTimeout(this.setAlertMessage.bind(this, "", false), 10000);
      } else {
        this.cy.batch(() => {
          this.cy.add(uniqExistEdges);
          this.cy.forceRender();
        });
      }
    } finally {
      this.setBusy(false);
    }
  }

  deleteEdges() {
    this.cy.batch(() => {
      this.cy.remove(this.cy.edges('[?user]'));
      this.cy.forceRender();
    });
  }

  toggleAlert() {
    this.setState({
      alertOpen: !this.state.alertOpen
    });
  }

  setAlertMessage(alertMessage, alertOpen = true) {
    this.setState({
      alertMessage,
      alertOpen
    });
  }

  searchNode(value) {
    value = value.replace(/'/g, "\\'");
    if (value) {
      this.cy.batch(() => {
        this.cy.nodes(':selected').unselect();
        this.cy.nodes(`[id @*= '${value}']`).select();
        this.cy.edges(`[name @*= '${value}']`).targets().select();
      });
    } else {
      this.cy.nodes(':selected').unselect();
    }
  }

  handleSearch(e) {
    this.searchNode(e.target.value);
  }

  handleZoom(e) {
    let zoomLevel = this.cy.zoom();

    if (e.key === '+') {
      this.cy.zoom(zoomLevel + 0.01);
    } else if (e.key === '-') {
      this.cy.zoom(zoomLevel - 0.01);
    }
  }

  render() {
    let {height, busy, color, alertOpen, alertMessage} = this.state;

    return <div className="container-fluid">
      <Alert color="danger" isOpen={alertOpen} toggle={this.toggleAlert.bind(this)}>{alertMessage}</Alert>
      <div className="row">
        <div className="btn-toolbar m-1 col align-items-center">
          <div className="btn-group mr-2">
            <button onClick={this.back.bind(this)} className="btn btn-warning">
              <FontAwesomeIcon icon="arrow-circle-left" className="mr-1"/>Back
            </button>
            <button className="btn btn-danger" onClick={this.resetCytoscape.bind(this)}>
              <FontAwesomeIcon icon="redo" className="mr-1"/>Reset
            </button>
            <button className="btn btn-light" onClick={this.fitCytoscape.bind(this)}>
              <FontAwesomeIcon icon="expand" className="mr-1"/>Fit
            </button>
            <a className="btn btn-light" download="query.png" onClick={this.exportCytoscape.bind(this)}>
              <FontAwesomeIcon icon="image" className="mr-1"/>Export Image</a>
            <a className="btn btn-light" onClick={this.exportJSON.bind(this)}>
              <FontAwesomeIcon icon="file-download" className="mr-1"/>Download JSON</a>
          </div>
          <div className="input-group mr-2">
            <div className="input-group-prepend">
              <DropZone accept={['text/*', '', '.sif', '.tsv']}
                        onDrop={this.handleUpload.bind(this)}>
                {({getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject}) => {
                  return <div {...getRootProps()}
                              className={classNames('dropzone', {'dropzone--isActive': isDragActive},
                                "btn", !busy ? "btn-outline-primary" : "btn-outline-warning",
                                isDragAccept && "btn-outline-success",
                                isDragReject && "btn-outline-danger")}>
                    <input {...getInputProps()} />
                    {!busy ? <span><FontAwesomeIcon icon="file-upload" className="mr-1"/>Upload Edges</span> :
                      <FontAwesomeIcon icon="circle-notch" spin className="mx-5"/>}
                  </div>;
                }}
              </DropZone>
              <span className="input-group-text">Edge Color:</span>
            </div>
            <input type="color" className="form-control" style={{width: '80px'}} value={color}
                   onChange={this.setColor.bind(this)}/>
            <div className="input-group-append">
              <div className="btn btn-outline-dark" ref={this.info}>
                <FontAwesomeIcon icon="info-circle"/>
              </div>
            </div>
            <UploadSifInfoPopover target={() => this.info.current} placement="right"/>
          </div>
          <div className="btn-group mr-1">
            <button type="button" className="btn btn-danger"
                    title="remove user uploaded edges"
                    onClick={this.deleteEdges.bind(this)}>
              <FontAwesomeIcon icon="trash-alt" className="mr-1"/>Remove Edges
            </button>
          </div>
          {this.props.busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg" className="d-block"/> : null}
          <div className="input-group ml-auto">
            <div className="input-group-prepend">
              <span className="input-group-text"><FontAwesomeIcon icon="search"/></span>
            </div>
            <input type="text" className="form-control" placeholder="Search"
                   onChange={this.handleSearch.bind(this)}/>
          </div>
        </div>
      </div>
      <div className="row" style={{height}}>
        <div className="col h-100" ref={this.cyRef} tabIndex="0" style={{outline: 'none'}}
             onKeyPress={this.handleZoom.bind(this)}/>
      </div>
    </div>;
  }
}

NetworkBody.propTypes = {
  busy: PropTypes.number,
  history: PropTypes.object,
  requestId: PropTypes.string,
  network: PropTypes.array,
  getNetwork: PropTypes.func,
  setNetwork: PropTypes.func
};

const Network = connect(mapStateToProps, {getNetwork, setNetwork})(NetworkBody);

export default Network;