/**
 * @author zacharyjuang
 * 7/27/18
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {getStats} from '../../actions';

function mapStateToProps({busy, requestId, stats}) {
  return {
    busy,
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
    let {busy, stats} = this.props;

    return <div className="container-fluid">
      {busy ?
        <div className="row">
          <div className="col">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
        </div> :
        null}
      {!_.isEmpty(stats) ?
        <div className="row">
          <div className="col m-1">
            <p>There are {stats.num_edges.toLocaleString()} edges in the network,
              with {stats.num_targets.toLocaleString()} targets.</p>
            <p>Duplicated edges are collapsed into one single edge.</p>
            <p className="text-warning">Warning! Graphs of over 3,000 edges might affect browser performance.</p>
          </div>
        </div> :
        null}
      <div className="row">
        <div className="col m-1">
          <Link to="/cytoscape" className={classNames("btn", stats.num_edges > 3000 ? "btn-warning" : "btn-primary")}>Open
            Cytoscape</Link>
        </div>
      </div>
    </div>;
  }
}

Cytoscape.propTypes = {
  busy: PropTypes.number,
  requestId: PropTypes.string,
  stats: PropTypes.object,
  getStats: PropTypes.func
};

export default connect(mapStateToProps, {getStats})(Cytoscape);
