/**
 * @author zacharyjuang
 * 7/27/18
 */
import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Collapse, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown} from 'reactstrap';
import qs from 'qs';

import {getNetwork, getStats, setBusy} from '../../../actions';
import {networkJSONStringify} from "../../../utils";
import Aupr from "./aupr";
import {NetworkAdditionalEdges} from "../../common";
import {BASE_URL, checkAupr} from "../../../utils/axios_instance";
import store from "../../../store";

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

    // this.getNetwork = _.throttle(this.getNetwork.bind(this), 200, {leading: true, trailing: true});
  }

  componentDidMount() {
    let {requestId, getStats} = this.props;

    if (requestId) {
      getStats(requestId);
      this.getNetwork();
      this.checkAupr();
    }
  }

  componentDidUpdate(prevProps) {
    let {requestId, getStats, busy} = this.props;

    if (prevProps.requestId !== requestId) {
      getStats(requestId);
      this.getNetwork();
      this.checkAupr();
    }

    if (!busy && prevProps.busy !== busy && this.state.collapse) {
      this.toggleCollapse();
    }
  }

  getNetwork() {
    let {precisionCutoff} = store.getState();

    this.props.setBusy(true);
    return this.props.getNetwork(this.props.requestId, this.props.edges, precisionCutoff)
      .finally(this.props.setBusy.bind(undefined, false));
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

  handleDownload() {
    let a = document.createElement('a');
    this.getNetwork().then(() => {
      a.setAttribute('download', 'query.cyjs');
      a.setAttribute('href', networkJSONStringify(this.props.network));
      a.setAttribute('style', 'display: none');
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
    });
  }

  openCytoscape(e) {
    e.preventDefault();
    return this.getNetwork()
      .then(() => {
        this.props.history.push('/network');
      });
  }

  sifUrl(expand = false) {
    let {requestId, edges} = this.props;
    let {precisionCutoff} = store.getState();

    return `${BASE_URL}/api/network/${requestId}.sif?${qs.stringify({
      edges,
      precision: precisionCutoff,
      expand: expand ? 1 : undefined
    }, {
      arrayFormat: 'repeat'
    })}`;
  }

  render() {
    let {busy, stats, network} = this.props;
    let {aupr, collapse} = this.state;

    return <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-1">
          <h3>Network</h3>
        </div>
        {busy ?
          <div className="col">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div> :
          null}
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
      {!_.isEmpty(network) ?
        <div className="row">
          <div className="col m-1">
            <Link onClick={this.openCytoscape.bind(this)} to="/network"
                  className={classNames("btn mr-1", stats.num_edges > 3000 ? "btn-warning" : "btn-primary")}>
              <FontAwesomeIcon icon="external-link-alt" className="mr-1"/>Open Network
            </Link>
            <button className="btn btn-outline-primary mr-1" onClick={this.toggleCollapse.bind(this)}>
              <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Additional Edges
            </button>
            <div className="btn-group">
              <button className="btn btn-light" type="button" onClick={this.handleDownload.bind(this)}>
                <FontAwesomeIcon icon="file-download" className="mr-1"/>Download JSON
              </button>
              <UncontrolledButtonDropdown>
                <a className="btn btn-light" href={this.sifUrl(true)}>
                  <FontAwesomeIcon icon="file-download" className="mr-1"/>Download SIF (*.sif)
                </a>
                <DropdownToggle caret color="light"/>
                <DropdownMenu>
                  <DropdownItem href={this.sifUrl()}>Download compact SIF (*.sif)</DropdownItem>
                </DropdownMenu>
              </UncontrolledButtonDropdown>

            </div>
          </div>
        </div> :
        null}

      <Collapse isOpen={collapse}>
        <NetworkAdditionalEdges className="border rounded"/>
      </Collapse>

      {aupr ?
        <Aupr className="row mt-1"/> :
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
  setBusy: PropTypes.func,
  history: PropTypes.object
};

const Network = connect(mapStateToProps, {
  getStats,
  getNetwork,
  setBusy
})(withRouter(NetworkBody));

export default Network;
