/**
 * @author zacharyjuang
 * 2/5/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

class CytoscapeFrame extends React.Component {
  render() {
    return <div>
      <div><Link to={{pathname: "/datagrid", query: {tab: "3"}}} className="btn btn-default">Back</Link></div>
      {this.props.children}
    </div>;
  }
}

CytoscapeFrame.propTypes = {
  children: PropTypes.node
};

export default CytoscapeFrame;
