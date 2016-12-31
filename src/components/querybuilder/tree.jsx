/**
 * Created by zacharyjuang on 11/26/16.
 */
import {connect} from 'react-redux';
import _ from 'lodash';

import TreeBody from '../../containers/querybuilder/tree';

import {OPERANDS, addValue, updateValue, addGroup, updateGroup, removeNode, updateKey} from '../../actions';
import {VALUE_NODE, GROUP_NODE} from '../../reducers';

export const getRoot = (tree) => {
  let _tree = _(tree);
  return _tree.intersectionWith(
    _tree.map('id')
      .difference(_tree.map('children').flatten().value())
      .value(),
    (a, o) => a.id === o
  ).value()
};

export const getChildQuery = (tree, node, includeKeys = false) => {
  let _tree = _(tree);
  return "[" + _tree
      .intersectionWith(
        node.children,
        (s, o) => s.id === o
      )
      .sortBy(['nodeType'])
      .map((n) => {
        if (n.nodeType === VALUE_NODE) {
          if (includeKeys) {
            return `${n.key}=${n.value}`;
          } else {
            return n.value;
          }
        } else if (n.nodeType === GROUP_NODE) {
          return getChildQuery(tree, n);
        }
      }).join(` ${node.oper} `) + "]";
};

function mapStateToPropsFactory(name) {
  return function mapStateToProps(state) {
    return {
      tree: state[name],
      root: getRoot(state[name])
    };
  }
}

function mapDispatchToPropsFactory(name) {
  return function mapDispatchToProps(dispatch) {
    return {
      operChange: (id, e) => {
        dispatch(updateGroup(name, id, e.target.value));
      },
      addValue: (parent) => {
        dispatch(addValue(name, '', parent));
      },
      updateValue: (id, e) => {
        dispatch(updateValue(name, id, e.target.value));
      },
      updateValueRaw: (id, value) => {
        dispatch(updateValue(name, id, value));
      },
      updateKey: (id, e) => {
        dispatch(updateKey(name, id, e.target.value));
      },
      updateKeyRaw: (id, key) => {
        dispatch(updateKey(name, id, key));
      },
      addGroup: (parent) => {
        dispatch(addGroup(name, OPERANDS[0], parent));
      },
      removeNode: (id) => {
        dispatch(removeNode(name, id));
      }
    }
  }
}

export const TFTree = connect(mapStateToPropsFactory('tfTree'), mapDispatchToPropsFactory('TF'))(TreeBody);
export const EdgeTree = connect(mapStateToPropsFactory('edgeTree'), mapDispatchToPropsFactory('EDGE'))(TreeBody);
export const MetaTree = connect(mapStateToPropsFactory('metaTree'), mapDispatchToPropsFactory('META'))(TreeBody);
