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

import {getCytoscape, getStats} from '../../actions';
import {cytoscapeJSONStringify} from "../../utils";

function mapStateToProps({busy, requestId, stats, cytoscape}) {
  return {
    busy,
    requestId,
    stats,
    cytoscape
  };
}

class Cytoscape extends React.Component {
  componentDidMount() {
    let {requestId, getStats, getCytoscape} = this.props;

    if (requestId) {
      getStats(requestId);
      getCytoscape(requestId);
    }
  }

  componentDidUpdate(prevProps) {
    let {requestId, getStats, getCytoscape} = this.props;

    if (prevProps.requestId !== requestId) {
      getStats(requestId);
      getCytoscape(requestId);
    }
  }

  render() {
    let {busy, stats, cytoscape} = this.props;

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
          <Link to="/cytoscape"
                className={classNames("btn mr-2", stats.num_edges > 3000 ? "btn-warning" : "btn-primary")}>Open
            Cytoscape</Link>
          {!_.isEmpty(cytoscape) ?
            <a className="btn btn-light" download="query.cyjs"
               href={cytoscapeJSONStringify(cytoscape)}>
              <FontAwesomeIcon icon="file-download" className="mr-1"/>Download JSON</a> :
            null}
        </div>
      </div>
    </div>;
  }
}

Cytoscape.propTypes = {
  busy: PropTypes.number,
  requestId: PropTypes.string,
  stats: PropTypes.object,
  getStats: PropTypes.func,
  getCytoscape: PropTypes.func,
  cytoscape: PropTypes.array
};

export default connect(mapStateToProps, {getStats, getCytoscape})(Cytoscape);
