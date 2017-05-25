/**
 * @author zacharyjuang
 * 2/5/17
 */
import React from 'react';
import {connect} from 'react-redux';
import cytoscape from 'cytoscape';
import {getCytoscape, setCytoscape} from '../../actions';
import _ from 'lodash';
import PropTypes from 'prop-types';

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId,
    cytoscapeData: state.cytoscape
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getCytoscape: (requestId) => {
      dispatch(getCytoscape(requestId));
    },
    setCytoscape: (data) => dispatch(setCytoscape(data))
  }
};

class CytoscapeBody extends React.Component {
  componentDidMount() {
    let {requestId, getCytoscape, cytoscapeData} = this.props;
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
            //'font-size': function( ele ){ return ele.data('weight')/2},
            'text-rotation': 270,
            //'text-outline-width': function( ele ){ return ele.data('weight')/40},
            'text-outline-color': '#000000',
            'text-valign': 'center',
            'color': '#000000',
            'shape': function (ele) {
              return ele.data('shape')
            },
            'background-color': function (ele) {
              return ele.data('color')
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
            'arrow-resize': 15,
            'control-point-distance': 500
          }
        }
      ],
      // @todo: move url to outer scope
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

    if (_.isEmpty(cytoscapeData)) {
      getCytoscape(requestId);
    } else {
      this.updateCytoscapeData();
    }
  }

  updateCytoscapeData() {
    let {cytoscapeData} = this.props;
    this.cy.batch(() => {
      this.cy.add(cytoscapeData.elements);
      this.cy.layout({
        name: 'breadthfirst'
      });
    });
  }

  componentDidUpdate() {
    this.updateCytoscapeData();
  }

  componentWillUnmount() {
    this.props.setCytoscape({});
  }

  render() {
    return <div>
      <div ref={(c) => {this.cyRef = c}} style={{height: '100vh', width: '100vw'}}/>
    </div>;
  }
}

CytoscapeBody.propTypes = {
  requestId: PropTypes.string,
  cytoscapeData: PropTypes.object,
  getCytoscape: PropTypes.func,
  setCytoscape: PropTypes.func
};

const Cytoscape = connect(mapStateToProps, mapDispatchToProps)(CytoscapeBody);

export default Cytoscape;
