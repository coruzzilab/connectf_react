/**
 * @author zacharyjuang
 * 12/4/16
 */
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

import Query from '../../containers/querybuilder/query';
import {EdgeTree, getRoot, getChildQuery} from './tree';

import {setQuery} from '../../actions';

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
  }
};

class EdgeBody extends React.Component {
  createQuery() {
    let {tree, setQueryRaw} = this.props;
    let root = _.head(getRoot(tree));
    setQueryRaw(getChildQuery(tree, root));
  }

  render() {
    return <Query {...this.props} title={<h5>Edges</h5>} tree={<EdgeTree valueOptions={VALUE_OPTS}/>}
                  createQuery={this.createQuery.bind(this)}/>;
  }
}

EdgeBody.propTypes = {
  tree: React.PropTypes.arrayOf(React.PropTypes.object),
  query: React.PropTypes.string,
  setQuery: React.PropTypes.func.isRequired,
  setQueryRaw: React.PropTypes.func
};

const Edge = connect(mapStateToProps, mapDispatchToProps)(EdgeBody);

export default Edge;
