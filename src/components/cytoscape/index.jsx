/**
 * @author zacharyjuang
 * 6/23/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import cytoscape from 'cytoscape';
import {connect} from 'react-redux';

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

    this.props.getCytoscape(this.props.requestId);
  }

  componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
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
    this.props.router.goBack();
  }

  render() {
    return <div style={{height: '100%'}}>
      <div>
        <button onClick={this.back.bind(this)} className="btn btn-warning">Back</button>
        <button className="btn btn-default" onClick={this.resetCytoscape.bind(this)}>Reset</button>
        <button className="btn btn-default" onClick={this.fitCytoscape.bind(this)}>Fit</button>
        <a className="btn btn-default" onClick={this.exportCytoscape.bind(this)}>Export Image</a>
      </div>
      <div ref={this.cyRef} style={{height: '85%', width: '100%'}}/>
    </div>;
  }
}

CytoscapeBody.propTypes = {
  router: PropTypes.object,
  requestId: PropTypes.string,
  cytoscapeData: PropTypes.array,
  getCytoscape: PropTypes.func,
  setCytoscape: PropTypes.func
};

const Cytoscape = connect(mapStateToProps, {getCytoscape, setCytoscape})(CytoscapeBody);

export default Cytoscape;
