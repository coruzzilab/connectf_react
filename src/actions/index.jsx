/**
 * Created by zacharyjuang on 11/26/16.
 */
import {VALUE_NODE, GROUP_NODE} from '../reducers';
import {push} from 'react-router-redux';
import $ from 'jquery';

let _BASE_URL;

if (process.env.NODE_ENV !== "production") {
  _BASE_URL = 'http://localhost:8001';
} else {
  _BASE_URL = window.location.origin;
}

export const BASE_URL = _BASE_URL;

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
  };
};

export const updateValue = (name, id, value) => {
  return {
    type: `UPDATE_TREE_NODE_VALUE_${name}`,
    id,
    value
  };
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
  };
};

export const updateGroup = (name, id, oper) => {
  return {
    type: `UPDATE_TREE_NODE_VALUE_${name}`,
    id,
    oper
  };
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
  };
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
  };
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
  };
};

export const getCytoscape = (requestId, type = 'dbase_view1_cy') => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/cytoscape/${requestId}/${type}/`,
      contentType: false
    }).done((data) => dispatch(setCytoscape(data)));
  };
};

export const setMotifEnrichment = (data) => {
  return {
    type: 'SET_MOTIF_ENRICHMENT',
    data
  }
};

export const clearMotifEnrichment = () => {
  return {
    type: 'CLEAR_MOTIF_ENRICHMENT'
  }
};

export const getMotifEnrichment = (requestId, alpha = 0.05) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/motif_enrichment/${requestId}/?${$.param({alpha})}`,
      contentType: false
    })
      .done((data) => dispatch(setMotifEnrichment(data)))
      .catch(() => dispatch(setMotifEnrichment({})))
  }
};

export const postQuery = (data) => {
  return (dispatch) => {
    let requestId = (new Date().toISOString() + Math.floor(Math.random() * 1000)).replace(/[:.]/g, "");

    data.append('requestId', requestId);

    dispatch(setBusy(true));
    dispatch(clearResult());
    dispatch(push('/datagrid'));

    return $.ajax({
      url: `${BASE_URL}/queryapp/`,
      type: 'POST',
      cache: false,
      contentType: false,
      processData: false,
      data
    })
      .done((result) => {
        dispatch(setRequestId(requestId));
        dispatch(setResult(result));
      })
      .fail((xhr, textStatus, err) => {
        if (xhr.status >= 400 < 500) {
          dispatch(setResult([{
            data: [['No Data Matched Your Query']],
            columns: [{type: 'text'}]
          }, {}]));
        } else {
          dispatch(setResult([{
            data: [['Something went wrong with the server. Please report to the development team.']],
            columns: [{type: 'text'}]
          }, {}]));
        }

        dispatch(setError(textStatus));
      })
      .always(() => {
        dispatch(setBusy(false));
      });
  };
};
