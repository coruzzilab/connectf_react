/**
 * @author zacharyjuang
 * 12/4/16
 */
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

import Query from '../../containers/querybuilder/query';
import {EdgeTree, getRoot, getChildQuery} from './tree';

import {setQuery, BASE_URL} from '../../actions';

const VALUE_OPTS = [
  ['EdgeName', 'EdgeName']
];

const mapStateToProps = (state) => {
  return {
    query: state.edgeQuery,
    tree: state.edgeTree
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setQuery: (e) => {
      dispatch(setQuery('EDGE', e.target.value));
    },
    setQueryRaw: (value) => {
      dispatch(setQuery('EDGE', value));
    }
  };
};

function buildEdgeAutoComplete(node) {
  return `${BASE_URL}/api/edges/searchName/${node.key}`;
}

class EdgeBody extends React.Component {
  createQuery() {
    let {tree, setQueryRaw} = this.props;
    let root = _.head(getRoot(tree));
    setQueryRaw(getChildQuery(tree, root));
  }

  render() {
    return <Query {...this.props}
                  title={<h2>Edges</h2>}
                  tree={<EdgeTree valueOptions={VALUE_OPTS}
                                  autoCompleteKey="edge_name"
                                  autoCompleteUrl={buildEdgeAutoComplete}/>}
                  createQuery={this.createQuery.bind(this)}/>;
  }
}

EdgeBody.propTypes = {
  tree: PropTypes.arrayOf(PropTypes.object),
  query: PropTypes.string,
  setQuery: PropTypes.func.isRequired,
  setQueryRaw: PropTypes.func
};

const Edge = connect(mapStateToProps, mapDispatchToProps)(EdgeBody);

export default Edge;
