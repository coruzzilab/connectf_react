/**
 * @author zacharyjuang
 * 8/10/17
 */
import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import {BASE_URL} from '../actions';
import classNames from 'classnames';

class UploadAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tf: "",
      experiments: [],
      experiment: "",
      analysisId: "",
      analysisCutoff: "",
      analysisMethod: "",
      analysisBatch: "YES",
      analysisNotes: "",
      errors: {}
    }
  }

  componentDidMount() {
    $.getJSON(`${BASE_URL}/api/tfs/search_name/`)
      .done((data) => {
        let experiments = _(data).sortBy('value').value();

        this.setState({
          experiments,
          tf: _.get(experiments, '0.value'),
          experiment: _.get(experiments, '0.experiments.0')
        })
      });
  }

  submit(e) {
    let {
      experiments, experiment, analysisId, analysisCutoff,
      analysisMethod, analysisBatch, analysisNotes
    } = this.state;

    e.preventDefault();
    let data = new FormData();
    data.set('experiment', experiment);
    data.set('analysis_id', analysisId);
    data.set('analysis_cutoff', analysisCutoff);
    data.set('analysis_method', analysisMethod);
    data.set('analysis_batch', analysisBatch);
    data.set('analysis_notes', analysisNotes);
    data.set('gene_list', this.geneList.files[0]);
    data.set('experimental_design', this.experimentalDesign.files[0]);

    $.ajax({
      url: `${BASE_URL}/upload/analysis/`,
      data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST'
    })
      .done(() => {
        alert("Data Submitted!");

        this.form.reset();

        this.setState({
          tf: _.get(experiments, '0.value'),
          experiment: "",
          analysisId: "",
          analysisCutoff: "",
          analysisMethod: "",
          analysisBatch: "YES",
          analysisNotes: "",
          errors: {}
        });
      })
      .fail((res) => {
        this.setState({
          errors: res.responseJSON
        })
      });
  }

  changeKey(key, e) {
    this.setState({
      [key]: e.target.value
    });
  }

  render() {
    let {
      experiments, experiment, tf, analysisId, analysisCutoff,
      analysisMethod, analysisBatch, analysisNotes, errors
    } = this.state;

    return <div className="col-xs-6 col-xs-offset-3">
      <form onSubmit={this.submit.bind(this)} ref={(c) => {
        this.form = c;
      }}>
        <div className="form-group">
          <label htmlFor="experiment">Select TF:</label>
          <select className="form-control" value={tf}
                  onChange={this.changeKey.bind(this, 'tf')}
                  id="tf">
            {_.map(experiments, (e, i) => {
              return <option value={e.value} key={i}>{e.value}</option>;
            })}
          </select>
        </div>
        <div className={classNames("form-group", {"has-danger": 'experiment' in errors})}>
          <label htmlFor="experiment">Select Experiment:</label>
          <select className="form-control" value={experiment}
                  onChange={this.changeKey.bind(this, 'experiment')}
                  id="experiment">
            {_.map(_.get(_.find(experiments, ['value', tf]), 'experiments', []), (e, i) => {
              return <option value={e} key={i}>{e}</option>;
            })}
          </select>
          {_.map(errors['experiment'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'analysis_id' in errors})}>
          <label htmlFor="analysisId">Analysis ID:</label>
          <input type="text" className="form-control" id="analysisId" required value={analysisId}
                 onChange={this.changeKey.bind(this, 'analysisId')}/>
          <p id="idHelpBlock" className="form-text text-muted">
            Can only contain letters, numbers, underscore, or hyphen.
          </p>
          {_.map(errors['analysis_id'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'analysis_cutoff' in errors})}>
          <label htmlFor="analysisCutoff">Analysis Cutoff:</label>
          <input type="text" className="form-control" id="analysisCutoff" required value={analysisCutoff}
                 onChange={this.changeKey.bind(this, 'analysisCutoff')}/>
          {_.map(errors['analysis_cutoff'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'analysis_method' in errors})}>
          <label htmlFor="analysisMethod">Analysis Method:</label>
          <input type="text" className="form-control" id="analysisMethod" required value={analysisMethod}
                 onChange={this.changeKey.bind(this, 'analysisMethod')}/>
          {_.map(errors['analysis_method'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'analysis_batch' in errors})}>
          <label htmlFor="analysisBatch">Analysis Batch Effect:</label>
          <select className="form-control" id="analysisBatch" value={analysisBatch}
                  onChange={this.changeKey.bind(this, 'analysisBatch')}>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
          {_.map(errors['analysis_batch'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'analysis_notes' in errors})}>
          <label htmlFor="analysisNotes">Analysis Notes:</label>
          <textarea className="form-control" id="analysisNotes" rows="3" required value={analysisNotes}
                    onChange={this.changeKey.bind(this, 'analysisNotes')}/>
          {_.map(errors['analysis_notes'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'gene_list' in errors})}>
          <label htmlFor="geneList">Gene List:</label>
          <input type="file" className="form-control-file" id="geneList" required ref={(c) => {
            this.geneList = c;
          }}/>
          {_.map(errors['gene_list'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group", {"has-danger": 'experimental_design' in errors})}>
          <label htmlFor="experimentalDesign">Experimental Design:</label>
          <input type="file" className="form-control-file" id="experimentalDesign" required ref={(c) => {
            this.experimentalDesign = c;
          }}/>
          {_.map(errors['experimental_design'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>;
  }
}

export default UploadAnalysis;
