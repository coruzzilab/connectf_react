/**
 * Created by zacharyjuang on 11/26/16.
 */
import $ from 'jquery';
import {generateRequestId} from "../utils";
import uuidv4 from "uuid/v4";

let _BASE_URL;

if (process.env.NODE_ENV !== "production") {
  _BASE_URL = 'http://localhost:8001';
} else {
  _BASE_URL = window.location.origin;
}

export const BASE_URL = _BASE_URL;

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

export const setHeatmap = (data) => {
  return {
    type: 'SET_HEATMAP',
    data
  };
};

export const clearHeatmap = () => {
  return {
    type: 'CLEAR_HEATMAP'
  };
};

export const getHeatmap = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/heatmap/${requestId}/`,
      contentType: false
    })
      .done((data) => dispatch(setHeatmap(data)))
      .catch(() => {
        dispatch(setHeatmap({
          'error': true
        }));
      });
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

export const setMotifEnrichment = (data) => {
  return {
    type: 'SET_MOTIF_ENRICHMENT',
    data
  };
};

export const clearMotifEnrichment = () => {
  return {
    type: 'CLEAR_MOTIF_ENRICHMENT'
  };
};

export const getMotifEnrichment = (requestId, alpha = 0.05, body = false) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/motif_enrichment/${requestId}/?${$.param({
        alpha,
        body: body ? 1 : 0
      })}`,
      contentType: false
    })
      .done((data) => dispatch(setMotifEnrichment(data)))
      .catch(() => dispatch(setMotifEnrichment({})));
  };
};

export const postQuery = (data) => {
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

        dispatch(clearRequestId());
        dispatch(setError(textStatus));
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
  }
};

export const removeEdge = (name) => {
  return {
    type: 'REMOVE_EDGE',
    name
  }
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
  }
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
