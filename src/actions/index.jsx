/**
 * Created by zacharyjuang on 11/26/16.
 */
import {VALUE_NODE, GROUP_NODE} from '../reducers';

export const OPERANDS = ['And', 'Or', 'AndNot'];

export const setBusy = (busy) => {
  return {
    type: 'SET_BUSY',
    busy
  };
};

export const toggleBusy = () => {
  return {
    type: 'TOGGLE_BUSY'
  };
};

export const setQuery = (name, value) => {
  return {
    type: `SET_QUERY_${name}`,
    value
  };
};

export const clearQuery = (name) => {
  return {
    type: `CLEAR_QUERY_${name}`
  };
};

let id = 1;

export const addValue = (name, value, parent) => {
  return {
    type: `ADD_TREE_NODE_${name}`,
    id: id++,
    nodeType: VALUE_NODE,
    value,
    parent
  }
};

export const updateValue = (name, id, value) => {
  return {
    type: `UPDATE_TREE_NODE_VALUE_${name}`,
    id,
    value
  }
};

export const updateKey = (name, id, key) => {
  return {
    type: `UPDATE_TREE_NODE_KEY_${name}`,
    id,
    key
  };
};

export const removeNode = (name, id) => {
  return {
    type: `REMOVE_TREE_NODE_${name}`,
    id
  };
};

export const addGroup = (name, oper, parent) => {
  return {
    type: `ADD_TREE_NODE_${name}`,
    id: id++,
    nodeType: GROUP_NODE,
    oper,
    parent
  }
};

export const updateGroup = (name, id, oper) => {
  return {
    type: `UPDATE_TREE_NODE_VALUE_${name}`,
    id,
    oper
  }
};

export const resetTree = (name) => {
  return {
    type: `RESET_TREE_${name}`
  };
};

export const addFiles = (files) => {
  return {
    type: 'ADD_FILES',
    files
  }
};

export const clearFiles = () => {
  return {
    type: 'CLEAR_FILES'
  };
};
