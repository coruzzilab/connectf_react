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
  ["Experiment_ID", "Experiment_ID"],
  ["Transcription_Factor_ID", "Transcription_Factor_ID"],
  ["Transcription_Factor_NAME", "Transcription_Factor_NAME"],
  ["Experiment", "Experiment"],
  ["Experiment_Type", "Experiment_Type"],
  ["Binding_Type", "Binding_Type"],
  ["Direction", "Direction"],
  ["Genotype", "Genotype"],
  ["Data_Source", "Data_Source"],
  ["Time", "Time"],
  ["Growth_Period", "Growth_Period"],
  ["Growth_Medium", "Growth_Medium"],
  ["Plasmids", "Plasmids"],
  ["Control", "Control"],
  ["Treatments", "Treatments"],
  ["Analysis_method", "Analysis_method"],
  ["TF_History", "TF_History"],
  ["Publication", "Publication"],
  ["Experimenter", "Experimenter"],
  ["Submission_date", "Submission_date"],
  ["Experiment_date", "Experiment_date"]
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
  return `${BASE_URL}/api/metas/searchType/${node.key}`;
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
