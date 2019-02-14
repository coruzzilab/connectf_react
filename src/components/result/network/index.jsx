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
import {Collapse} from 'reactstrap';

import {getNetwork, getStats, setBusy} from '../../../actions';
import {networkJSONStringify} from "../../../utils";
import Aupr from "./aupr";
import {NetworkAdditionalEdges} from "../../common";
import {checkAupr} from "../../../utils/axios_instance";

function mapStateToProps({busy, requestId, edges, edgeList, stats, network}) {
  return {
    busy,
    requestId,
    edges,
    edgeList,
    stats,
    network
  };
}

class NetworkBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      aupr: false,
      collapse: false
    };
  }

  componentDidMount() {
    let {requestId, getStats, getNetwork, edges} = this.props;

    if (requestId) {
      getStats(requestId);
      getNetwork(requestId, edges, 0);
      this.checkAupr();
    }
  }

  componentDidUpdate(prevProps) {
    let {requestId, getStats, getNetwork, busy, edges} = this.props;

    if (prevProps.requestId !== requestId) {
      getStats(requestId);
      getNetwork(requestId, edges, 0);
      this.checkAupr();
    }

    if (!busy && prevProps.busy !== busy && this.state.collapse) {
      this.toggleCollapse();
    }
  }

  toggleCollapse() {
    this.setState((state) => {
      return {
        collapse: !state.collapse
      };
    });
  }

  checkAupr() {
    checkAupr(this.props.requestId)
      .then(() => {
        this.setState({aupr: true});
      })
      .catch(() => {
        this.setState({aupr: false});
      });
  }

  render() {
    let {busy, stats, network} = this.props;
    let {aupr, collapse} = this.state;

    return <div className="container-fluid">
      {busy ?
        <div className="row">
          <div className="col">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
        </div> :
        null}
      <div className="row">
        <div className="col">
          <h3>Network</h3>
        </div>
      </div>
      {!_.isEmpty(stats) ?
        <div className="row">
          <div className="col m-1">
            <p>There are {stats.num_edges.toLocaleString()} edges in the network,
              with {stats.num_tfs.toLocaleString()} TFs and {stats.num_targets.toLocaleString()} targets.</p>
            <p>Duplicated edges are collapsed into one single edge.</p>
            <p className="text-warning">Warning! Displaying graphs of over 3,000 edges might affect browser
              performance.</p>
          </div>
        </div> :
        null}
      <div className="row">
        <div className="col m-1">
          <Link to="/network"
                className={classNames("btn mr-1", stats.num_edges > 3000 ? "btn-warning" : "btn-primary")}>
            <FontAwesomeIcon icon="external-link-alt" className="mr-1"/>Open Network
          </Link>
          <button className="btn btn-outline-primary mr-1" onClick={this.toggleCollapse.bind(this)}>
            <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Additional Edges
          </button>
          {!_.isEmpty(network) ?
            <a className="btn btn-light" download="query.cyjs"
               href={networkJSONStringify(network)}>
              <FontAwesomeIcon icon="file-download" className="mr-1"/>Download JSON</a> :
            null}
        </div>
      </div>
      <Collapse isOpen={collapse}>
        <NetworkAdditionalEdges className="border rounded"/>
      </Collapse>

      {aupr ?
        <Aupr className="row mt-1"
              onLoad={this.props.setBusy.bind(undefined, false)}
              onError={this.props.setBusy.bind(undefined, false)}/> :
        null}
    </div>;
  }
}

NetworkBody.propTypes = {
  busy: PropTypes.number,
  requestId: PropTypes.string,
  edges: PropTypes.arrayOf(PropTypes.string),
  stats: PropTypes.object,
  getStats: PropTypes.func,
  getNetwork: PropTypes.func,
  network: PropTypes.array,
  setBusy: PropTypes.func
};

const Network = connect(mapStateToProps, {
  getStats,
  getNetwork,
  setBusy
})(NetworkBody);

export default Network;
