/**
 * @author zacharyjuang
 * 8/21/17
 */

import React from 'react';
import $ from 'jquery';
import {BASE_URL} from '../actions';
import _ from 'lodash';

const pickIdKeys = _.partial(_.pick, _, ['tf_id', 'experimenter', 'submission_date', 'experiment_type']);

const initialFormData = {
  experiment_id: '',
  tf_id: '',
  experiment: '',
  experiment_type: 'expression',
  experiment_subtype: 'RNAseq',
  direction: 0,
  genotype: '',
  data_source: 'coruzzilab',
  time: 0,
  growth_period: 0,
  growth_medium: '',
  plasmid: '',
  control: 'mDEX',
  control_other: '',
  treatments: '',
  replicates: '',
  batch: '',
  analysis_method: 'one-way ANOVA',
  analysis_method_other: '',
  analysis_cutoff: '',
  analysis_command: '',
  analysis_batch: 'YES',
  analysis_notes: '',
  tf_history_notes: '',
  experimenter: '',
  metadata_notes: '',
  errors: {}
};

function getInitials(name) {
  return name.split(/[\s_]/).reduce((t, s) => t[0] + s[0]);
}

function isFormData(value, key) {
  return !/_(?:list|other)$/.test(key);
}

class UploadExperiment extends React.Component {
  constructor(props) {
    super(props);
    let today = new Date();

    this.state = Object.assign({
      tf_id_list: [],
      genotype_list: [],
      experimenter_list: [],
      submission_date: today.toISOString().split('T')[0],
      experiment_date: today.toISOString().split('T')[0]
    }, initialFormData);
  }

  componentDidMount() {
    $.getJSON(`${BASE_URL}/api/tfs/`).done((tf_id_list) => {
      this.setState({
        tf_id_list
      });
    });

    $.getJSON(`${BASE_URL}/api/metas/search_type/Genotype/`).done((genotype_list) => {
      this.setState({
        genotype_list
      });
    });

    $.getJSON(`${BASE_URL}/api/metas/search_type/Experimenter/`).done((experimenter_list) => {
      this.setState({
        experimenter_list
      });
    })
  }

  componentDidUpdate(prevProps, prevState) {
    let nowIdData = pickIdKeys(this.state);
    let prevIdData = pickIdKeys(prevState);

    if (!_.isEqual(nowIdData, prevIdData)) {
      // build experiment id
      let {tf_id, experimenter, submission_date, experiment_type} = this.state;
      this.setState({
        experiment_id: `${tf_id}_${getInitials(experimenter)}${submission_date.split('-').join('')}_${experiment_type}`.toUpperCase()
      });
    }
  }

  changeKey(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  changeExperimentType(e) {
    if (e.target.value === "expression") {
      this.setState({
        experiment_subtype: 'RNAseq'
      });
    } else if (e.target.value === "binding") {
      this.setState({
        experiment_subtype: 'ChIPseq'
      });
    }
    this.changeKey(e);
  }

  submit(e) {
    let data = new FormData();

    e.preventDefault();

    _.forEach(_.pickBy(this.state, isFormData), (val, key) => {
      data.set(key, val);
    });

    // add files
    data.set('gene_list', _.get(this.geneList, 'files.0'));
    data.set('expression_values', _.get(this.expressionValues, 'files.0'));
    data.set('design', _.get(this.design, 'files.0'));

    $.ajax({
      url: `${BASE_URL}/upload/`,
      data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST'
    })
      .done(() => {
        alert("Data Submitted!");

        this.form.reset();

        this.setState(initialFormData);
      })
      .fail((res) => {
        this.setState({
          errors: res.responseJSON
        })
      });
  }

  render() {
    let {
      tf_id_list, genotype_list, experimenter_list, experiment_id, tf_id, experiment, experiment_type,
      experiment_subtype, direction, genotype, data_source, time, growth_period,
      growth_medium, plasmid, control, control_other, treatments, replicates,
      batch, analysis_method, analysis_method_other, analysis_cutoff, analysis_command,
      analysis_batch, analysis_notes, tf_history_notes, experimenter, submission_date,
      experiment_date, metadata_notes, errors
    } = this.state;

    return <div className="col-xs-6 col-xs-offset-3">
      <form onSubmit={this.submit.bind(this)} ref={(c) => {
        this.form = c;
      }}>
        <div className="form-group">
          <label htmlFor="experiment_id">Experiment ID:</label>
          <input type="text" id="experiment_id" className="form-control" value={experiment_id}
                 placeholder="AT4G24020_AS090116_RNASEQ (TFID_ExperimenterInitials&ExperimentDate_Type)"
                 onChange={this.changeKey.bind(this)} required/>
        </div>
        {_.map(errors['experiment_id'], (val, i) => {
          return <div className="help-block" key={i}>{val}</div>;
        })}

        <div className="form-group">
          <label htmlFor="tf_id">Transcription Factor ID:</label>
          <input type="text" id="tf_id" className="form-control" list="tf_id_list" value={tf_id}
                 onChange={this.changeKey.bind(this)}
                 placeholder="AT4G24020" required/>
          <datalist id="tf_id_list">
            {_(tf_id_list).sortBy('value').map((l, i) => {
              return <option key={i} value={l.value}>{l.name}</option>;
            }).value()}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="experiment">Experiment:</label>
          <input type="text" id="experiment" className="form-control" value={experiment}
                 onChange={this.changeKey.bind(this)}
                 placeholder="Target/Inplanta etc." required/>
        </div>
        <div className="form-group">
          <label htmlFor="experiment_type">Experiment:</label>
          <select id="experiment_type" className="form-control" value={experiment_type}
                  onChange={this.changeExperimentType.bind(this)}>
            <option value="expression">Expression</option>
            <option value="binding">Binding</option>
          </select>
        </div>
        {experiment_type === "expression" ?
          <div className="form-group">
            <label htmlFor="expression_subtype">Expression Type:</label>
            <select id="experiment_subtype" className="form-control" value={experiment_subtype}
                    onChange={this.changeKey.bind(this)}>
              <option value="RNAseq">RNAseq</option>
              <option value="Microarray">Microarray</option>
              <option value="4tU">4tU</option>
            </select>
          </div> :
          null}
        {experiment_type === "binding" ?
          <div className="form-group">
            <label htmlFor="experiment_subtype">Binging Type:</label>
            <select id="experiment_subtype" className="form-control" value={experiment_subtype}
                    onChange={this.changeKey.bind(this)}>
              <option value="ChIPseq">ChIPseq</option>
              <option value="DamID">DamID</option>
            </select>
          </div> :
          null}

        <div className="form-group">
          <label htmlFor="direction">Direction:</label>
          <select id="direction" className="form-control" value={direction} onChange={this.changeKey.bind(this)}>
            <option value="0">0</option>
            <option value="1">1</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="genotype">Genotype:</label>
          <input type="text" className="form-control" id="genotype" list="genotype_list" value={genotype}
                 placeholder="COL-0"
                 onChange={this.changeKey.bind(this)} required/>
          <datalist id="genotype_list">
            {_(genotype_list).map('value').sortBy().map((l, i) => {
              return <option key={i} value={l}>{l}</option>;
            }).value()}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="data_source">Data Source:</label>
          <select id="data_source" className="form-control" value={data_source}
                  onChange={this.changeKey.bind(this)}>
            <option value="coruzzilab">CoruzziLab</option>
            <option value="pubmed">Pubmed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="time">Time (min):</label>
          <input type="number" className="form-control" id="time" min="0" step="1" value={time}
                 placeholder="0"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="growth_period">Growth Period (days):</label>
          <input type="number" className="form-control" id="growth_period" min="0" step="1" value={growth_period}
                 placeholder="0"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="growth_medium">Growth Medium:</label>
          <input type="text" id="growth_medium" className="form-control" value={growth_medium}
                 placeholder="plates,1mM_KNO3"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="plasmid">Plasmid:</label>
          <input type="text" id="plasmid" className="form-control" value={plasmid}
                 placeholder="NLP7pBOB11"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="control">Control:</label>
          <select name="control" id="control" className="form-control" value={control}
                  onChange={this.changeKey.bind(this)}>
            <option>mDEX</option>
            <option>EmptyVector</option>
            <option value="other">other</option>
          </select>
          {control === "other" ?
            <input type="text" id="control_other" className="form-control" value={control_other}
                   placeholder="other"
                   onChange={this.changeKey.bind(this)}/> :
            null}
        </div>

        <div className="form-group">
          <label htmlFor="treatments">Treatments:</label>
          <input type="text" id="treatments" className="form-control" value={treatments}
                 placeholder="PN,MDEX,PDEX,PCHX"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="replicates">Replicates:</label>
          <input type="text" id="replicates" className="form-control" value={replicates}
                 placeholder="PN+PCHX(3),PN+PDEX+PCHX(3)"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="batch">Batch:</label>
          <input type="text" id="batch" className="form-control" value={batch}
                 placeholder="List the exp ids for experiments done together (comma separated)"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="analysis_method">Analysis Method:</label>
          <select name="analysis_method" id="analysis_method" className="form-control" value={analysis_method}
                  onChange={this.changeKey.bind(this)}>
            <option>one-way ANOVA</option>
            <option>two-way ANOVA</option>
            <option>three-way ANOVA</option>
            <option>edgeR</option>
            <option>deseq</option>
            <option>deseq2</option>
            <option>MACS</option>
            <option>MACS2</option>
            <option value="other">other</option>
          </select>
          {analysis_method === "other" ?
            <input type="text" id="analysis_method_other" className="form-control" value={analysis_method_other}
                   placeholder="other"
                   onChange={this.changeKey.bind(this)}/> :
            null}
        </div>

        <div className="form-group">
          <label htmlFor="analysis_cutoff">Analysis Cutoff:</label>
          <input type="text" id="analysis_cutoff" className="form-control" value={analysis_cutoff}
                 placeholder="FDR<0.1"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="analysis_command">Analysis Command:</label>
          <input type="text" id="analysis_command" className="form-control" value={analysis_command}
                 placeholder="aov(dataframe$y~dataframe$Nitrogen*dataframe$Genotype*dataframe$Tissue)"
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="analysis_batch">Analysis Batch Effect:</label>
          <select id="analysis_batch" className="form-control" value={analysis_batch}
                  onChange={this.changeKey.bind(this)}>
            <option>YES</option>
            <option>NO</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="analysis_notes">Analysis Notes:</label>
          <textarea id="analysis_notes" className="form-control" value={analysis_notes}
                    rows={4}
                    placeholder="Add notes about the analysis (alignment method, annotation version, read count tool  etc.)"
                    onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="tf_history_notes">TF History Notes:</label>
          <textarea id="tf_history_notes" className="form-control" value={tf_history_notes}
                    rows={4}
                    placeholder="Wang_2009_Plant_physiology, Castaings_2009_Plant_journal"
                    onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="experimenter">Experimenter:</label>
          <input type="text" id="experimenter" className="form-control" value={experimenter}
                 placeholder="Your Name Here" list="experimenter_list"
                 onChange={this.changeKey.bind(this)} required/>
          <datalist id="experimenter_list">
            {_(experimenter_list).map('value').sortBy().map((l, i) => {
              return <option key={i}>{l}</option>
            }).value()}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="submission_date">Submission Date:</label>
          <input type="date" id="submission_date" className="form-control" value={submission_date} disabled/>
        </div>

        <div className="form-group">
          <label htmlFor="experiment_date">Experiment Date:</label>
          <input type="date" id="experiment_date" className="form-control" value={experiment_date}
                 onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="metadata_notes">Metadata Notes:</label>
          <textarea id="metadata_notes" className="form-control" value={metadata_notes}
                    rows={4}
                    placeholder="Add notes for this data"
                    onChange={this.changeKey.bind(this)} required/>
        </div>

        <div className="form-group">
          <label htmlFor="gene_list">Upload Gene List:</label>
          <input type="file" className="form-control-file" id="gene_list" ref={(c) => {
            this.geneList = c;
          }} required/>
        </div>

        <div className="form-group">
          <label htmlFor="expression_values">Upload Raw Expression Values:</label>
          <input type="file" className="form-control-file" id="expression_values" ref={(c) => {
            this.expressionValues = c;
          }} required/>
        </div>

        <div className="form-group">
          <label htmlFor="design">Upload Experimental Design:</label>
          <input type="file" className="form-control-file" id="design" ref={(c) => {
            this.design = c;
          }} required/>
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>;
  }
}

export default UploadExperiment;
