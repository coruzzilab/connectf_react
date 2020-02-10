/**
 * @author zacharyjuang
 * 2019-01-08
 */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect} from "react-redux";
import {BASE_URL, getAuprImg} from "../../../utils/axios_instance";
import {setBusy, setPrecisionCutoff} from "../../../actions";
import classNames from "classnames";

function mapStateToProps({requestId, precisionCutoff}) {
  return {
    requestId,
    precisionCutoff
  };
}

class AuprAdjusterBody extends React.PureComponent {
  handlePrecision(e) {
    this.props.setPrecisionCutoff(parseFloat(e.target.value));
  }

  render() {
    let {precisionCutoff, className} = this.props;

    return <div className={classNames("row align-items-center", className)}>
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
    </div>;
  }
}

AuprAdjusterBody.propTypes = {
  className: PropTypes.string,
  precisionCutoff: PropTypes.number,
  setPrecisionCutoff: PropTypes.func
};

export const AuprAdjuster = connect(mapStateToProps, {setPrecisionCutoff})(AuprAdjusterBody);

AuprAdjuster.propTypes = {
  className: PropTypes.string
};

class AuprBody extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      url: ''
    };

    this.setUrl = _.debounce(this.setUrl.bind(this), 100);
  }

  setUrl() {
    this.props.setBusy(true);
    getAuprImg(this.props.requestId, this.props.precisionCutoff || undefined)
      .then(({data}) => {
        this.setState({
          url: URL.createObjectURL(data)
        });
      })
      .finally(this.props.setBusy.bind(undefined, false));
  }

  componentDidMount() {
    this.setUrl();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.precisionCutoff !== this.props.precisionCutoff) {
      this.setUrl();
    }
  }

  render() {
    let {requestId, precisionCutoff} = this.props;
    let {url} = this.state;

    return <div className={this.props.className}>
      <div className="col">
        <div className="row">
          <div className="col">
            <h3>Precision Recall Analysis (AUPR)</h3>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <span className="text-secondary">The uploaded network file should contain edge scores or edges
            should be ordered from the most to least confident. The results of the AUPR will <b>not</b> make sense
            otherwise.</span>
          </div>
        </div>
        <div className="form-row align-items-center">
          <div className="col-auto">
            <AuprAdjuster/>
          </div>
          <div className="col-auto">
            <a className="btn btn-primary" type="text/csv" download
               href={`${BASE_URL}/api/aupr/${requestId}/pruned/${precisionCutoff}/`}>
              <FontAwesomeIcon icon="file-csv" className="mr-1"/>Export Pruned Network</a>
          </div>
        </div>
        <div className="row">
          <div className="col">
            {url ? <img src={url} alt="network prediction"/> : null}
          </div>
        </div>
      </div>
    </div>;
  }
}

AuprBody.propTypes = {
  className: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  requestId: PropTypes.string,
  setBusy: PropTypes.func,
  precisionCutoff: PropTypes.number
};

const Aupr = connect(mapStateToProps, {setBusy})(AuprBody);

Aupr.propTypes = {
  className: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default Aupr;
