/**
 * @author zacharyjuang
 * 8/10/17
 */
import React from 'react';
import _ from 'lodash';
import {getExperiments, getTFs, submitAnalysis} from '../utils/axios';
import classNames from 'classnames';

const pickIdData = _.partial(_.pick, _, ['tf', 'analysisMethod', 'analysisMethodOther', 'analysisCutoff']);

const initialState = {
  tf: "",
  experiment: "",
  analysisId: "",
  analysisCutoff: "",
  analysisMethod: "one_way_anova",
  analysisMethodOther: "",
  analysisBatch: "YES",
  analysisNotes: "",
  errors: {}
};

class UploadAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, {
      experiments: [],
      tfs: []
    }, initialState);
  }

  componentDidMount() {
    this.getTfs();
  }

  getTfs() {
    return getTFs({all: 0})
      .then((response) => {
        this.setState({
          tfs: response.data,
          tf: _.get(response.data, '0.value', '')
        });
      })
      .then(this.getExperiments.bind(this));
  }

  getExperiments() {
    let {tf} = this.state;
    return getExperiments({tf})
      .then((response) => {
        this.setState({
          experiment: response.data[0],
          experiments: response.data
        });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    let prevIdData = pickIdData(prevState);
    let nowIdData = pickIdData(this.state);

    if (!_.isEqual(prevIdData, nowIdData)) {
      let {tf, analysisMethod, analysisMethodOther, analysisCutoff} = this.state;

      if (analysisMethod === "other") {
        analysisMethod = analysisMethodOther;
      }

      this.setState({
        analysisId: `${tf}_${analysisMethod.replace(/[\s_]+/ig, '')}_${analysisCutoff}`.toUpperCase()
      });
    }

    if (this.state.tf !== prevState.tf) {
      this.getExperiments();
    }
  }

  submit(e) {
    let {
      experiment, analysisId, analysisCutoff,
      analysisMethod, analysisMethodOther, analysisBatch, analysisNotes
    } = this.state;

    e.preventDefault();
    let data = new FormData();
    data.set('experiment', experiment);
    data.set('analysis_id', analysisId);
    data.set('analysis_cutoff', analysisCutoff);
    if (analysisMethod === "other") {
      analysisMethod = analysisMethodOther;
    }
    data.set('analysis_method', analysisMethod);
    data.set('analysis_batch', analysisBatch);
    data.set('analysis_notes', analysisNotes);
    data.set('gene_list', this.geneList.files[0]);
    data.set('experimental_design', this.experimentalDesign.files[0]);

    submitAnalysis(data)
      .then(() => {
        alert("Data Submitted!");

        this.form.reset();

        this.setState(Object.assign({}, initialState));
      })
      .catch((err) => {
        this.setState({
          errors: err.response.responseJSON
        });
      });
  }

  changeKey(key, e) {
    this.setState({
      [key]: e.target.value
    });
  }

  render() {
    let {
      experiments, experiment, tf, analysisId, analysisCutoff, tfs,
      analysisMethod, analysisMethodOther, analysisBatch, analysisNotes, errors
    } = this.state;

    return <div className="container-fluid">
      <h1>Upload Analysis</h1>
      <form onSubmit={this.submit.bind(this)} ref={(c) => {
        this.form = c;
      }}>
        <div className="form-row">
          <div className="form-group col">
            <label htmlFor="experiment">Select TF:</label>
            <select className="form-control" value={tf}
                    onChange={this.changeKey.bind(this, 'tf')}
                    id="tf">
              {_.map(tfs, (tf, i) => {
                let name = tf.value;

                if (tf.name) {
                  name += ` (${tf.name})`;
                }
                return <option value={tf.value} key={i}>{name}</option>;
              })}
            </select>
          </div>
          <div className={classNames("form-group col", {"has-danger": 'experiment' in errors})}>
            <label htmlFor="experiment">Select Experiment:</label>
            <select className="form-control" value={experiment}
                    onChange={this.changeKey.bind(this, 'experiment')}
                    id="experiment">
              {_.map(experiments, (e) => {
                return <option value={e} key={e}>{e}</option>;
              })}
            </select>
            {_.map(errors['experiment'], (val, i) => {
              return <div className="help-block" key={i}>{val}</div>;
            })}
          </div>
        </div>

        <div className="form-row">
          <div className={classNames("form-group col", {"has-danger": 'analysis_method' in errors})}>
            <label htmlFor="analysisMethod">Analysis Method:</label>
            <select className="form-control" id="analysisMethod" value={analysisMethod}
                    onChange={this.changeKey.bind(this, 'analysisMethod')}>
              <option value="one_way_anova">one-way ANOVA</option>
              <option value="two_way_anova">two-way ANOVA</option>
              <option value="three_way_anova">three-way ANOVA</option>
              <option>edgeR</option>
              <option>DESeq</option>
              <option>DESeq2</option>
              <option>MACS</option>
              <option>MACS2</option>
              <option value="other">Other</option>
            </select>
            {analysisMethod === "other" ?
              <input type="text" id="analysis_method_other" className="form-control" value={analysisMethodOther}
                     placeholder="Other"
                     onChange={this.changeKey.bind(this, 'analysisMethodOther')}/> :
              null}
            {_.map(errors['analysis_method'], (val, i) => {
              return <div className="help-block" key={i}>{val}</div>;
            })}
          </div>
          <div className={classNames("form-group col", {"has-danger": 'analysis_cutoff' in errors})}>
            <label htmlFor="analysisCutoff">Analysis Cutoff:</label>
            <input type="text" className="form-control" id="analysisCutoff" required value={analysisCutoff}
                   onChange={this.changeKey.bind(this, 'analysisCutoff')}/>
            {_.map(errors['analysis_cutoff'], (val, i) => {
              return <div className="help-block" key={i}>{val}</div>;
            })}
          </div>
        </div>


        <div className={classNames("form-group form-row", {"has-danger": 'analysis_id' in errors})}>
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
        <div className={classNames("form-group form-row", {"has-danger": 'analysis_batch' in errors})}>
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
        <div className={classNames("form-group form-row", {"has-danger": 'analysis_notes' in errors})}>
          <label htmlFor="analysisNotes">Analysis Notes:</label>
          <textarea className="form-control" id="analysisNotes" rows="3" required value={analysisNotes}
                    onChange={this.changeKey.bind(this, 'analysisNotes')}/>
          {_.map(errors['analysis_notes'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group form-row", {"has-danger": 'gene_list' in errors})}>
          <label htmlFor="geneList">Gene List:</label>
          <input type="file" className="form-control-file" id="geneList" required ref={(c) => {
            this.geneList = c;
          }}/>
          {_.map(errors['gene_list'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <div className={classNames("form-group form-row", {"has-danger": 'experimental_design' in errors})}>
          <label htmlFor="experimentalDesign">Experimental Design:</label>
          <input type="file" className="form-control-file" id="experimentalDesign" required ref={(c) => {
            this.experimentalDesign = c;
          }}/>
          {_.map(errors['experimental_design'], (val, i) => {
            return <div className="help-block" key={i}>{val}</div>;
          })}
        </div>
        <button type="submit" className="btn btn-primary btn-lg">Submit</button>
      </form>
    </div>;
  }
}

export default UploadAnalysis;
