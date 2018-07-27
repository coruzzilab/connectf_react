/**
 * @author zacharyjuang
 * 7/27/18
 */
import React from 'react';
import {Link} from 'react-router-dom';

class Cytoscape extends React.Component {
  render() {
    return <div>
      <Link to="/cytoscape" className="btn btn-primary">Open Cytoscape</Link>
    </div>;
  }
}

export default Cytoscape;
