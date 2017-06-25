/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {setQuery, BASE_URL} from '../../actions';

import Query from '../../containers/querybuilder/query';
import {TFTree, getRoot, getChildQuery} from './tree';

const VALUE_OPTS = [['tf', 'Transcription Factors']];

const mapStateToProps = (state) => {
  return {
    query: state.tfQuery,
    tree: state.tfTree
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setQuery: (e) => {
      dispatch(setQuery('TF', e.target.value));
    },
    setQueryRaw: (value) => {
      dispatch(setQuery('TF', value));
    }
  };
};

class TFBody extends React.Component {
  createQuery() {
    let {tree, setQueryRaw} = this.props;
    let root = _.head(getRoot(tree));
    setQueryRaw(getChildQuery(tree, root));
  }

  render() {
    return <Query {...this.props}
                  title={<h2>TFs</h2>}
                  tree={
                    <TFTree addFile={true}
                            valueOptions={VALUE_OPTS}
                            autoCompleteKey="db_tf_agi"
                            autoCompleteUrl={`${BASE_URL}/api/tfs/searchName/nodename`}/>}
                  createQuery={this.createQuery.bind(this)}/>;
  }
}

TFBody.propTypes = {
  tree: PropTypes.arrayOf(PropTypes.object),
  query: PropTypes.string,
  setQuery: PropTypes.func.isRequired,
  setQueryRaw: PropTypes.func
};

const TF = connect(mapStateToProps, mapDispatchToProps)(TFBody);

export default TF;
