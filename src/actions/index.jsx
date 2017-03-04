/**
 * Created by zacharyjuang on 11/26/16.
 */
import {VALUE_NODE, GROUP_NODE} from '../reducers';
import {push} from 'react-router-redux';
import $ from 'jquery';

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

export const addValue = (name, value, parent, key = '') => {
  return {
    type: `ADD_TREE_NODE_${name}`,
    id: id++,
    nodeType: VALUE_NODE,
    value,
    parent,
    key
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

export const setRequestId = (requestId) => {
  return {
    type: 'SET_REQUEST_ID',
    requestId
  };
};

export const clearRequestId = () => {
  return {
    type: 'CLEAR_REQUEST_ID'
  };
};

export const clearResult = () => {
  return {
    type: 'CLEAR_RESULT'
  }
};

export const setResult = (data) => {
  return {
    type: 'SET_RESULT',
    data
  };
};

export const setError = (message) => {
  return {
    type: 'SET_ERROR',
    message
  }
};

export const clearError = () => {
  return {
    type: 'CLEAR_ERROR'
  };
};

export const setCytoscape = (data) => {
  return {
    type: 'SET_CYTOSCAPE',
    data
  }
};

export const getCytoscape = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `http://coruzzilab-macpro.bio.nyu.edu/static/queryBuilder/${requestId}_cy.json`,
      contentType: false
    }).done((data) => dispatch(setCytoscape(data)));
  };
};

export const postQuery = (data) => {
  return (dispatch) => {
    let requestId = (new Date().toISOString() + Math.floor(Math.random() * 1000)).replace(/:|\./g, "");

    data.append('requestId', requestId);

    return $.ajax({
      url: 'http://coruzzilab-macpro.bio.nyu.edu/queryapp/',
      type: 'POST',
      cache: false,
      contentType: false,
      processData: false,
      data
    })
      .done((result) => {
        dispatch(setRequestId(requestId));
        dispatch(setResult(result));
        dispatch(push('/datagrid'));
      })
      .fail(() => {
        dispatch(setError("An error has occurred!"));
      });
  };
};
