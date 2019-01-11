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

import {getNetwork, getStats, setBusy} from '../../../actions';
import {networkJSONStringify} from "../../../utils";
import {BASE_URL} from "../../../utils/axios";

function mapStateToProps({busy, requestId, stats, network}) {
  return {
    busy,
    requestId,
    stats,
    network
  };
}

class Aupr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      precisionCutoff: 0,
      url: this.props.src
    };

    this.setUrl = _.debounce(this.setUrl.bind(this), 100);
  }

  setUrl() {
    this.setState((state) => ({
      url: this.props.src + `?precision=${state.precisionCutoff || ''}`
    }));
  }

  componentDidMount() {
    this.setUrl();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.precisionCutoff !== this.state.precisionCutoff) {
      this.setUrl();
    }
  }

  handlePrecision(e) {
    this.setState({
      precisionCutoff: parseFloat(e.target.value)
    });
  }

  render() {
    let {precisionCutoff, url} = this.state;

    return <div className={this.props.className}>
      <div className="col">
        <div className="row">
          <div className="col">
            <h3>AUPR</h3>
          </div>
        </div>
        <div className="form-row align-items-center">
          <div className="col-auto">
            <span className="mr-1">Precision Cutoff:</span>
          </div>
          <div className="col-auto">
            <input type="range" min={0} max={1} step={0.01} className="mr-1 form-control-range"
                   value={precisionCutoff} onChange={this.handlePrecision.bind(this)}/>
          </div>
          <div className="col-auto">
            <input type="number" min={0} max={1} step={0.01} className="mr-1 form-control"
                   value={precisionCutoff} onChange={this.handlePrecision.bind(this)}/>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <img src={url}
                 alt="network prediction"
                 onLoad={this.props.onLoad}
                 onError={this.props.onError}/>
          </div>
        </div>
      </div>
    </div>;
  }
}

Aupr.propTypes = {
  className: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  src: PropTypes.string
};

class Network extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      aupr: true,
      hideAupr: true
    };
  }

  componentDidMount() {
    let {requestId, getStats, getNetwork, setBusy} = this.props;

    if (requestId) {
      getStats(requestId);
      getNetwork(requestId);
      setBusy(true);
    }
  }

  componentDidUpdate(prevProps) {
    let {requestId, getStats, getNetwork} = this.props;

    if (prevProps.requestId !== requestId) {
      getStats(requestId);
      getNetwork(requestId);
      setBusy(true);
      this.resetAupr();
    }
  }

  resetAupr() {
    this.setState({
      aupr: true,
      hideAupr: true
    });
  }

  onAuprLoad() {
    this.props.setBusy(false);
    this.setState({hideAupr: false});
  }

  onAuprError() {
    this.props.setBusy(false);
    this.setState({aupr: false});
  }

  render() {
    let {busy, stats, network, requestId} = this.props;
    let {aupr, hideAupr} = this.state;

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
              with {stats.num_targets.toLocaleString()} targets.</p>
            <p>Duplicated edges are collapsed into one single edge.</p>
            <p className="text-warning">Warning! Graphs of over 3,000 edges might affect browser performance.</p>
          </div>
        </div> :
        null}
      <div className="row">
        <div className="col m-1">
          <Link to="/network"
                className={classNames("btn mr-2", stats.num_edges > 3000 ? "btn-warning" : "btn-primary")}>Open
            Network</Link>
          {!_.isEmpty(network) ?
            <a className="btn btn-light" download="query.cyjs"
               href={networkJSONStringify(network)}>
              <FontAwesomeIcon icon="file-download" className="mr-1"/>Download JSON</a> :
            null}
        </div>
      </div>
      {aupr ?
        <Aupr className={classNames("row mt-1", hideAupr ? "d-none" : null)}
              src={`${BASE_URL}/queryapp/aupr/${requestId}/`}
              onLoad={this.onAuprLoad.bind(this)}
              onError={this.onAuprError.bind(this)}/> :
        null}
    </div>;
  }
}

Network.propTypes = {
  busy: PropTypes.number,
  requestId: PropTypes.string,
  stats: PropTypes.object,
  getStats: PropTypes.func,
  getNetwork: PropTypes.func,
  network: PropTypes.array,
  setBusy: PropTypes.func
};

export default connect(mapStateToProps, {getStats, getNetwork, setBusy})(Network);
