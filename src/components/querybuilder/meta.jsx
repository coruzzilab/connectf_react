/**
 * @author zacharyjuang
 * 12/5/16
 */
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

import Query from '../../containers/querybuilder/query';
import {MetaTree, getRoot, getChildQuery} from './tree';

import {setQuery, BASE_URL} from '../../actions';

const VALUE_OPTS = [
  ["Analysis_batcheffect", "Analysis_batcheffect"],
  ["Analysis_Cutoff", "Analysis_Cutoff"],
  ["Analysis_Command", "Analysis_Command"],
  ["Analysis_Id", "Analysis_Id"],
  ["Analysis_method", "Analysis_method"],
  ["Binding_Type", "Binding_Type"],
  ["Control", "Control"],
  ["Direction", "Direction"],
  ["Data_Source", "Data_Source"],
  ["Experiment", "Experiment"],
  ["Experimenter", "Experimenter"],
  ["Experiment_date", "Experiment_date"],
  ["Experiment_ID", "Experiment_ID"],
  ["Experiment_Type", "Experiment_Type"],
  ["Genotype", "Genotype"],
  ["Growth_Medium", "Growth_Medium"],
  ["Growth_Period", "Growth_Period"],
  ["Plasmids", "Plasmids"],
  ["P-value", "P-value"],
  ["Publication", "Publication"],
  ["Submission_date", "Submission_date"],
  ["TF_History", "TF_History"],
  ["Time", "Time"],
  ["Transcription_Factor_ID", "Transcription_Factor_ID"],
  ["Transcription_Factor_NAME", "Transcription_Factor_NAME"],
  ["Treatments", "Treatments"],
];

const mapStateToProps = (state) => {
  return {
    query: state.metaQuery,
    tree: state.metaTree
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setQuery: (e) => {
      dispatch(setQuery('META', e.target.value));
    },
    setQueryRaw: (value) => {
      dispatch(setQuery('META', value));
    }
  };
};

function buildMetaAutoComplete(node) {
  return `${BASE_URL}/api/metas/search_type/${node.key}/`;
}

class MetaBody extends React.Component {
  createQuery() {
    let {tree, setQueryRaw} = this.props;
    let root = _.head(getRoot(tree));
    setQueryRaw(getChildQuery(tree, root, true));
  }

  render() {
    return <Query {...this.props}
                  title={<h2>Meta</h2>}
                  tree={<MetaTree valueOptions={VALUE_OPTS}
                                  autoCompleteUrl={buildMetaAutoComplete}/>}
                  createQuery={this.createQuery.bind(this)}/>;
  }
}

MetaBody.propTypes = {
  tree: PropTypes.arrayOf(PropTypes.object),
  query: PropTypes.string,
  setQuery: PropTypes.func.isRequired,
  setQueryRaw: PropTypes.func
};

const Meta = connect(mapStateToProps, mapDispatchToProps)(MetaBody);

export default Meta;
