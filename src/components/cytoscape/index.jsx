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

import {getCytoscape, setCytoscape} from '../../actions';

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    cytoscapeData: state.cytoscape
  };
};

class CytoscapeBody extends React.Component {
  constructor(props) {
    super(props);
    this.cyRef = React.createRef();
    this.state = {
      height: Math.floor(document.documentElement.clientHeight * 0.8)
    };

    this.setHeight = _.debounce(this.setHeight.bind(this), 100);
  }

  componentDidMount() {
    this.cy = cytoscape({
      container: this.cyRef.current,
      boxSelectionEnabled: false,
      autounselectify: true,
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
            'height': 'data(size)'
          }
        },
        {
          selector: "node[showLabel = 'show']",
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
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'data(color)',
            'curve-style': 'bezier',
            'line-color': 'data(color)'
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
        'label': ele.data('name'),
        'z-compound-depth': 'top'
      });
    });

    this.cy.on('mouseout', 'edge', function (event) {
      let ele = event.target;
      ele.removeStyle('label z-compound-depth');
    });

    this.cy.on('mouseover', "node[showLabel != 'show']", function (event) {
      let ele = event.target;
      ele.style({
        'content': function (ele) {
          let name = ele.data('name');
          if (!name) {
            return ele.data('id');
          }
          return `${ele.data('id')} (${ele.data('name')})`;
        }
      });
    });

    this.cy.on('mouseout', "node[showLabel != 'show']", function (event) {
      let ele = event.target;
      ele.style({'content': null});
    });

    this.setHeight();

    if (this.props.requestId) {
      this.props.getCytoscape(this.props.requestId);
    }

    window.addEventListener("resize", this.setHeight);
  }

  componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
    window.removeEventListener("resize", this.setHeight);
  }

  setHeight() {
    this.setState({height: document.documentElement.clientHeight - this.cyRef.current.offsetTop});
  }

  resetCytoscape() {
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
    e.currentTarget.download = 'query.png';
    e.currentTarget.href = this.cy.png();
  }

  exportJSON(e) {
    let {cytoscapeData} = this.props;

    let data = {
      "format_version" : "1.0",
      "generated_by" : "tf2targetdb",
      elements: {
        nodes: _.filter(cytoscapeData, ['group', 'nodes']),
        edges: _.filter(cytoscapeData, ['group', 'edges'])
      }
    };

    e.currentTarget.download = 'cytoscape.cyjs';
    e.currentTarget.href = 'data:application/json,' + JSON.stringify(data);
  }

  setData(data) {
    this.cy.batch(() => {
      this.cy.json({elements: data});
      this.resetCytoscape();
    });
  }

  componentDidUpdate(prevProp) {
    if (prevProp.requestId !== this.props.requestId) {
      this.props.getCytoscape(this.props.requestId);
    }

    if (prevProp.cytoscapeData !== this.props.cytoscapeData) {
      this.setData(this.props.cytoscapeData);
    }
  }

  back() {
    this.props.history.goBack();
  }

  render() {
    let {height} = this.state;

    return <div className="container-fluid">
      <div className="row">
        <div className="btn-group m-2">
          <button onClick={this.back.bind(this)} className="btn btn-warning">
            <FontAwesomeIcon icon="arrow-circle-left" className="mr-1"/>Back</button>
          <button className="btn btn-light" onClick={this.resetCytoscape.bind(this)}>
            <FontAwesomeIcon icon="redo" className="mr-1"/>Reset</button>
          <button className="btn btn-light" onClick={this.fitCytoscape.bind(this)}>
            <FontAwesomeIcon icon="expand" className="mr-1"/>Fit</button>
          <a className="btn btn-light" onClick={this.exportCytoscape.bind(this)}>
            <FontAwesomeIcon icon="file-export" className="mr-1"/>Export Image</a>
          <a className="btn btn-light" onClick={this.exportJSON.bind(this)}>
            <FontAwesomeIcon icon="file-download" className="mr-1"/>Download JSON</a>
        </div>
      </div>
      <div className="row" ref={this.cyRef} style={{height}}/>
    </div>;
  }
}

CytoscapeBody.propTypes = {
  history: PropTypes.object,
  requestId: PropTypes.string,
  cytoscapeData: PropTypes.array,
  getCytoscape: PropTypes.func,
  setCytoscape: PropTypes.func
};

const Cytoscape = connect(mapStateToProps, {getCytoscape, setCytoscape})(CytoscapeBody);

export default Cytoscape;
