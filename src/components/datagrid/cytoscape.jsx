/**
 * @author zacharyjuang
 * 7/27/18
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {getStats} from '../../actions';

function mapStateToProps({requestId, stats}) {
  return {
    requestId,
    stats
  };
}

class Cytoscape extends React.Component {
  componentDidMount() {
    let {requestId, getStats, stats} = this.props;

    if (requestId || _.isEmpty(stats)) {
      getStats(requestId);
    }
  }

  componentDidUpdate(prevProps) {
    let {requestId, getStats} = this.props;

    if (prevProps.requestId !== requestId) {
      getStats(requestId);
    }
  }

  render() {
    let {stats} = this.props;

    return <div className="container-fluid">
      {!_.isEmpty(stats) ?
        <div className="row">
          <div className="col m-1">
            <p>There are {stats.num_edges.toLocaleString()} edges in the network,
              with {stats.num_targets.toLocaleString()} targets.</p>
            <p className="text-warning">Warning! Graphs of over 5,000 edges might affect browser performance.</p>
          </div>
        </div> :
        null}
      <div className="row">
        <div className="col m-1">
          <Link to="/cytoscape" className="btn btn-primary">Open Cytoscape</Link>
        </div>
      </div>
    </div>;
  }
}

Cytoscape.propTypes = {
  requestId: PropTypes.string,
  stats: PropTypes.object,
  getStats: PropTypes.func
};

export default connect(mapStateToProps, {getStats})(Cytoscape);
