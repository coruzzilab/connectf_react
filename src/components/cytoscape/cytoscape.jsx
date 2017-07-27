/**
 * @author zacharyjuang
 * 6/23/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import cytoscape from 'cytoscape';
import {connect} from 'react-redux';

import {getCytoscape, setCytoscape} from '../../actions/index';

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    cytoscapeData: state.cytoscape
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getCytoscape: (requestId, type = 'dbase_view1_cy') => {
      dispatch(getCytoscape(requestId, type));
    },
    setCytoscape: (data) => dispatch(setCytoscape(data))
  };
};

class CytoscapeBody extends React.Component {
  componentDidMount() {
    let {requestId, getCytoscape, type} = this.props;
    this.cy = cytoscape({
      container: this.cyRef,
      boxSelectionEnabled: false,
      autounselectify: true,
      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(name)',
            'font-family': 'helvetica',
            'font-size': function (ele) {
              return ele.data('weight') / 2;
            },
            'text-rotation': 270,
            //'text-outline-width': function( ele ){ return ele.data('weight')/40},
            'text-outline-color': '#000000',
            'text-valign': 'center',
            'color': '#000000',
            'shape': 'data(shape)',
            'background-color': function (ele) {
              return ele.data('color');
            }
          }
        },
        {
          selector: 'edge',
          style: {
            //'width': function( ele ){ return ele.data('weight')/2},
            //'line-color': function( ele ){ return ele.data('color')},
            'target-arrow-shape': 'triangle',
            //'target-arrow-color': function( ele ){ return ele.data('color')},
            'curve-style': 'bezier',
            'arrow-scale': 4,
            'control-point-distance': 500
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        fit: true, // whether to fit the viewport to the graph
        directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        roots: undefined, // the roots of the trees
        maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
        animate: true, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
      }
    });

    getCytoscape(requestId, type);
    // this.updateCytoscapeData();
  }

  componentWillUnmount() {
    this.cy.destroy();
  }

  updateCytoscapeData() {
    let {cytoscapeData} = this.props;
    this.cy.batch(() => {
      this.cy.add(cytoscapeData.elements);
      let layout = this.layout = this.cy.layout({
        name: 'breadthfirst'
      });
      layout.run();
    });
  }

  resetCytoscape() {
    if (!this.layout) {
      this.layout = this.cy.layout({
        name: 'breadthfirst'
      })
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

  componentDidUpdate(prevProp) {
    if (prevProp.cytoscapeData !== this.props.cytoscapeData) {
      this.updateCytoscapeData();
    }
  }

  render() {
    return <div style={{height: '100%'}}>
      <div>
        <Link to={{pathname: "/datagrid", query: {tab: "3"}}} className="btn btn-danger">Back</Link>
        <button className="btn btn-default" onClick={this.resetCytoscape.bind(this)}>Reset</button>
        <button className="btn btn-default" onClick={this.fitCytoscape.bind(this)}>Fit</button>
        <a className="btn btn-default"
           ref={(c) => {
             this.image = c;
           }}
           onClick={this.exportCytoscape.bind(this)}>Export Image</a>
      </div>
      <div ref={(c) => {
        this.cyRef = c;
      }} style={{height: '85%', width: '100%'}}/>
    </div>;
  }
}

CytoscapeBody.propTypes = {
  requestId: PropTypes.string,
  type: PropTypes.string,
  cytoscapeData: PropTypes.object,
  getCytoscape: PropTypes.func,
  setCytoscape: PropTypes.func
};

const Cytoscape = connect(mapStateToProps, mapDispatchToProps)(CytoscapeBody);

export default Cytoscape;
