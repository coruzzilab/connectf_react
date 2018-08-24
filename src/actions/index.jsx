/**
 * Created by zacharyjuang on 11/26/16.
 */
import $ from 'jquery';
import {generateRequestId} from "../utils";
import uuidv4 from "uuid/v4";
import _ from 'lodash';

export const BASE_URL = window.location.origin;

export const setBusy = (busy) => {
  return {
    type: 'SET_BUSY',
    busy
  };
};

export const setQuery = (query) => {
  return {
    type: 'SET_QUERY',
    query
  };
};

export const clearQuery = () => {
  return {
    type: 'CLEAR_QUERY'
  };
};

export const addTF = (name, parent, after, oper = 'or', not_ = false) => {
  return {
    type: 'ADD_TF',
    id: uuidv4(),
    name,
    parent,
    after,
    oper,
    not_
  };
};

export const addGroup = (parent, after, oper = 'or', not_ = false) => {
  return {
    type: 'ADD_GROUP',
    id: uuidv4(),
    parent,
    after,
    oper,
    not_
  };
};

export const addMod = (key, value, parent, after, oper = 'or', not_ = false, innerOper = '=') => {
  return {
    type: 'ADD_MOD',
    id: uuidv4(),
    parent,
    key,
    value,
    after,
    oper,
    innerOper,
    not_
  };
};

export const moveItem = (source, target, after = true) => {
  return {
    type: 'MOVE_ITEM',
    source,
    target,
    after
  };
};

export const setParent = (id, parent) => {
  return {
    type: 'SET_PARENT',
    id,
    parent
  };
};

export const setModKey = (id, key) => {
  return {
    type: 'SET_MOD_KEY',
    id,
    key
  };
};

export const setModValue = (id, value) => {
  return {
    type: 'SET_MOD_VALUE',
    id,
    value
  };
};

export const setModInnerOper = (id, innerOper) => {
  return {
    type: 'SET_MOD_INNER_OPER',
    id,
    innerOper
  };
};

export const addModGroup = (parent, after, oper = 'or', not_ = false) => {
  return {
    type: 'ADD_MOD_GROUP',
    id: uuidv4(),
    parent,
    after,
    oper,
    not_
  };
};

export const removeNode = (id) => {
  return {
    type: 'REMOVE_NODE',
    id
  };
};

export const setQueryName = (id, name) => {
  return {
    type: 'SET_QUERY_NAME',
    id,
    name
  };
};

export const setQueryOper = (id, oper) => {
  return {
    type: 'SET_QUERY_OPER',
    id,
    oper
  };
};

export const setQueryNot = (id, not_) => {
  return {
    type: 'SET_QUERY_NOT',
    id,
    not_
  };
};

export const clearQueryTree = () => {
  return {
    type: 'CLEAR_QUERY_TREE'
  };
};

export const duplicateNode = (id) => {
  return {
    type: 'DUPLICATE_NODE',
    id
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

export const setCytoscape = (data) => {
  return {
    type: 'SET_CYTOSCAPE',
    data
  };
};

export const getCytoscape = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/cytoscape/${requestId}/`,
      contentType: false
    })
      .done((data) => dispatch(setCytoscape(data)))
      .catch(() => dispatch(setCytoscape([])));
  };
};

export const postQuery = (data, onSuccess, onError) => {
  return (dispatch) => {
    let requestId = generateRequestId();

    data.append('requestId', requestId);

    dispatch(setBusy(true));
    dispatch(clearResult());

    return $.ajax({
      url: `${BASE_URL}/queryapp/`,
      type: 'POST',
      cache: false,
      contentType: false,
      processData: false,
      data
    })
      .done((result, textStatus, xhr) => {
        dispatch(setRequestId(requestId));
        dispatch(setResult(result));
        dispatch(addQueryHistory(data.get('query')));
        dispatch(clearQueryError());

        if (_.isFunction(onSuccess)) {
          onSuccess(result, textStatus, xhr);
        }
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

        dispatch(clearRequestId());

        if (xhr.status === 400) {
          dispatch(setQueryError(true, 'Problem with query.'));
        } else if (xhr.status === 404) {
          dispatch(setQueryError(true, 'Empty result.'));
        } else {
          dispatch(setQueryError(true, textStatus));
        }

        if (_.isFunction(onError)) {
          onError(xhr, textStatus, err);
        }
      })
      .always(() => {
        dispatch(setBusy(false));
      });
  };
};

export const addEdge = (name) => {
  return {
    type: 'ADD_EDGE',
    name
  };
};

export const removeEdge = (name) => {
  return {
    type: 'REMOVE_EDGE',
    name
  };
};

export const removeEdges = (edges) => {
  return {
    type: 'REMOVE_EDGES',
    edges
  };
};

export const setEdges = (edges) => {
  return {
    type: 'SET_EDGES',
    edges
  };
};

export const clearEdges = () => {
  return {
    type: 'CLEAR_EDGE'
  };
};

export const setStats = (data) => {
  return {
    type: 'SET_STATS',
    data
  };
};

export const clearStats = () => {
  return {
    type: 'CLEAR_STATS'
  };
};

export const getStats = (requestId) => {
  return (dispatch) => {
    $.ajax({
      url: `${BASE_URL}/queryapp/stats/${requestId}/`,
      method: 'GET'
    }).done((data) => {
      dispatch(setStats(data));
    }).fail(() => {
      dispatch(clearStats());
    });
  };
};

export const addQueryHistory = (query) => {
  return {
    type: 'ADD_QUERY_HISTORY',
    query
  };
};

export const clearQueryHistory = () => {
  return {
    type: 'CLEAR_QUERY_HISTORY'
  };
};

export const setQueryError = (error, message = '') => {
  return {
    type: 'SET_QUERY_ERROR',
    error,
    message
  };
};

export const clearQueryError = () => {
  return {
    type: 'CLEAR_QUERY_ERROR'
  };
};
