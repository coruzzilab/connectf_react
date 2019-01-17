/**
 * @author zacharyjuang
 * 2019-01-08
 */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import qs from "qs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {BASE_URL} from "../../../utils/axios";

class Aupr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      precisionCutoff: 0,
      url: `${BASE_URL}/queryapp/aupr/${this.props.requestId}/`
    };

    this.setUrl = _.debounce(this.setUrl.bind(this), 150);
  }

  setUrl() {
    this.setState((state) => ({
      url: `${BASE_URL}/queryapp/aupr/${this.props.requestId}/` + '?' + qs.stringify({precision: state.precisionCutoff || undefined})
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
          <div className="col-auto">
            <a className="btn btn-primary"
               href={`${BASE_URL}/queryapp/aupr/${this.props.requestId}/pruned/${precisionCutoff}/`}>
              <FontAwesomeIcon icon="file-csv" className="mr-1"/>Export Pruned Network</a>
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
  requestId: PropTypes.string,
  setBusy: PropTypes.func
};

export default Aupr;
