/**
 * Created by zacharyjuang on 11/24/16.
 */
import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import _ from 'lodash';

import {OPERANDS} from '../actions';

export const VALUE_NODE = 1;
export const GROUP_NODE = 2;

const busy = (state = false, action) => {
  switch (action.type) {
  case 'SET_BUSY':
    return action.busy;
  case 'TOGGLE_BUSY':
    return !state;
  default:
    return state;
  }
};

function createQueryWithName(queryName = '') {
  return function query(state = '', action) {
    switch (action.type) {
    case `SET_QUERY_${queryName}`:
      return action.value;
    case `CLEAR_QUERY_${queryName}`:
      return '';
    default:
      return state;
    }
  }
}


function findDescendents(arr, id) {
  let l = _(_(arr).find((n) => n.id === id)).get('children', []);
  return l.concat(
    _(l)
      .map(findDescendents.bind(undefined, arr))
      .flattenDeep()
      .value()
  )
}

const treeInitial = [
  {
    id: 0,
    nodeType: GROUP_NODE,
    oper: OPERANDS[0],
    children: []
  }
];

function createTreeWithName(treeName = '') {
  return function tree(state = treeInitial, action) {
    let newNode = {
      id: action.id,
      oper: action.oper || '',
      value: action.value || '',
      key: action.key || '',
      nodeType: action.nodeType || VALUE_NODE,
      children: []
    };
    let descendants = findDescendents(state, action.id);
    switch (action.type) {
    case `ADD_TREE_NODE_${treeName}`:
      return [...state, newNode].map((n) => {
        if (n.id === action.parent && n.nodeType === GROUP_NODE) {
          return Object.assign({}, n, {
            children: [...n.children, action.id]
          })
        }
        return n;
      });
    case `UPDATE_TREE_NODE_VALUE_${treeName}`:
      return state.map((n) => {
        if (n.id === action.id) {
          if (n.nodeType === VALUE_NODE) {
            return _.merge({}, n, {
              value: action.value
            });
          } else if (n.nodeType === GROUP_NODE) {
            return _.merge({}, n, {
              oper: action.oper,
            });
          }
        }
        return n;
      });
    case `UPDATE_TREE_NODE_KEY_${treeName}`:
      return state.map((n) => {
        if (n.id === action.id) {
          if (n.nodeType === VALUE_NODE) {
            return _.merge({}, n, {
              key: action.key
            });
          }
        }
        return n;
      });
    case `REMOVE_TREE_NODE_${treeName}`:
      return state.filter((n) => {
        return n.id !== action.id && !(descendants.indexOf(n.id) > -1);
      }).map((n) => {
        return Object.assign({}, n, {
          children: n.children.filter((i) => {
            return i !== action.id;
          })
        });
      });
    case `RESET_TREE_${treeName}`:
      return treeInitial;
    default:
      return state;
    }
  }
}


const files = (state = [], action) => {
  switch (action.type) {
  case 'ADD_FILES':
    return [...state, ...action.files];
  case 'CLEAR_FILES':
    return [];
  default:
    return state;
  }
};

const tgdbApp = combineReducers({
  busy,
  tfTree: createTreeWithName('TF'),
  edgeTree: createTreeWithName('EDGE'),
  metaTree: createTreeWithName('META'),
  tfQuery: createQueryWithName('TF'),
  edgeQuery: createQueryWithName('EDGE'),
  metaQuery: createQueryWithName('META'),
  files,
  routing: routerReducer
});

export default tgdbApp;
