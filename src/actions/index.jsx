/**
 * Created by zacharyjuang on 11/26/16.
 */
import * as motifEnrichment from "./motif_enrichment";
import * as targetEnrichment from "./target_enrichment";
import * as analysisEnrichment from "./analysis_enrichment";
import {v4 as uuidv4} from 'uuid';
import * as api from "../utils/axios_instance";

export const setBusy = (busy = true) => {
  return {
    type: 'SET_BUSY',
    busy
  };
};

export const clearBusy = () => {
  return {
    type: 'CLEAR_BUSY'
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

export const setNetwork = (data) => {
  return {
    type: 'SET_NETWORK',
    data
  };
};

export const clearNetwork = () => {
  return {
    type: 'CLEAR_NETWORK'
  };
};

export const getNetwork = (requestId, edges, precision) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getNetwork(requestId, edges, precision)
      .then((response) => {
        dispatch(setNetwork(response.data));
      })
      .catch(() => {
        dispatch(clearNetwork());
      })
      .finally(() => {
        dispatch(setBusy(false));
      });
  };
};

export const setPrecisionCutoff = (precisionCutoff) => {
  return {
    type: 'SET_PRECISION_CUTOFF',
    precisionCutoff
  };
};

export const postQuery = (config) => {
  return (dispatch) => {

    dispatch(setBusy(true));
    dispatch(clearResult());

    return api.postQuery(config)
      .then((response) => {
        dispatch(setRequestId(response.data['request_id']));
        dispatch(setResult(response.data));
        dispatch(addQueryHistory(config.data.get('query')));
        dispatch(clearAllErrors());
        dispatch(setPrecisionCutoff(0));
      })
      .catch((err) => {
        let {response} = err;

        if (response) {
          if (response.status === 400) {
            dispatch(setQueryError(true, response.data || 'Problem with query.'));
          } else if (response.status === 404) {
            dispatch(setQueryError(true, response.data));
          } else {
            dispatch(setQueryError(true, response.statusText));
          }
        }

        dispatch(clearRequestId());

        throw err;
      })
      .finally(() => {
        dispatch(setBusy(false));
      });
  };
};

export const getResult = (requestId) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getTable(requestId)
      .then((resp) => {
        dispatch(setResult(resp.data));
      })
      .catch(() => {
        dispatch(clearRequestId());
      })
      .finally(() => {
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

export const setEdgeList = (edgeList) => {
  return {
    type: 'SET_EDGE_LIST',
    edgeList
  };
};

export const clearEdgeList = () => {
  return {
    type: 'CLEAR_EDGE_LIST'
  };
};

export const getEdgeList = () => {
  return (dispatch) => {
    dispatch(setBusy());
    return api.getAdditionalEdges()
      .then(({data}) => {
        dispatch(setEdgeList(data));
      })
      .catch(() => {
        dispatch(clearEdgeList());
      })
      .finally(() => {
        dispatch(setBusy(false));
      });
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
    dispatch(setBusy(true));
    api.getStats(requestId)
      .then(({data}) => {
        dispatch(setStats(data));
      })
      .catch(() => {
        dispatch(clearStats());
      })
      .finally(() => {
        dispatch(setBusy(false));
      });
  };
};

export const setSummary = (data) => {
  return {
    type: 'SET_SUMMARY',
    data
  };
};

export const clearSummary = () => {
  return {
    type: 'CLEAR_SUMMARY'
  };
};

export const getSummary = (requestId) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getSummary(requestId)
      .then(({data}) => {
        dispatch(setSummary(data));
      })
      .catch(() => {
        dispatch(clearSummary());
      })
      .finally(() => {
        dispatch(setBusy(false));
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

export const clearAllErrors = () => {
  return (dispatch) => {
    dispatch(clearQueryError());
    dispatch(motifEnrichment.clearError());
    dispatch(targetEnrichment.clearError());
    dispatch(analysisEnrichment.clearError());
  };
};

export const addExtraField = (field) => {
  return {
    type: 'ADD_EXTRA_FIELD',
    field
  };
};

export const removeExtraField = (field) => {
  return {
    type: 'REMOVE_EXTRA_FIELD',
    field
  };
};

export const removeExtraFields = (fields) => {
  return {
    type: 'REMOVE_EXTRA_FIELDS',
    fields
  };
};

export const clearExtraFields = () => {
  return {
    type: 'CLEAR_EXTRA_FIELDS'
  };
};

export const addList = (name, genes) => {
  return {
    type: 'ADD_LIST',
    name,
    genes
  };
};

export const removeList = (name) => {
  return {
    type: 'REMOVE_LIST',
    name
  };
};

export const renameList = (name, newName) => {
  return {
    type: 'RENAME_LIST',
    name,
    newName
  };
};

export const clearList = () => {
  return {
    type: 'CLEAR_LIST'
  };
};

export const setWarnSubmit = (warn) => {
  return {
    type: 'SET_WARN_SUBMIT',
    warn
  };
};

// Show/hide analyses
export const setAnalysisIds = (ids) => {
  return {
    type: 'SET_ANALYSIS_IDS',
    ids
  };
};

export const clearAnalysisIds = () => {
  return {
    type: 'CLEAR_ANASYSIS_IDS'
  };
};

export const getAnalysisIds = (requestId) => {
  return (dispatch) => {
    return api.updateAnalysisIds(requestId)
      .then((resp) => {
        dispatch(setAnalysisIds(resp.data));
      });
  };
};

export const updateAnalysisIds = (requestId, ids) => {
  return (dispatch) => {
    return api.updateAnalysisIds(requestId, ids)
      .then((resp) => {
        dispatch(setAnalysisIds(resp.data));
        dispatch(getResult(requestId));
      })
      .catch((e) => {
        let {response} = e;

        if (response) {
          if (response.status === 404) {
            dispatch(clearAnalysisIds());
            dispatch(clearRequestId());
            dispatch(clearResult());
          }
        }

        throw e;
      });
  };
};

export const showAnalysisIds = (idx, show) => {
  return {
    type: 'SHOW_ANALYSIS_IDS',
    idx,
    show
  };
};

export const renameAnalysisIds = (idx, name) => {
  return {
    type: 'RENAME_ANALYSIS_IDS',
    idx,
    name
  };
};

export const addUpload = (key, name, content, fileName = '') => {
  return {
    type: 'ADD_UPLOAD',
    key,
    name,
    content,
    fileName
  };
};

export const removeUpload = (key) => {
  return {
    type: 'REMOVE_UPLOAD',
    key
  };
};

export const clearUpload = () => {
  return {
    type: 'CLEAR_UPLOAD'
  };
};

export const setExtraFieldNames = (fields) => {
  return {
    type: 'SET_EXTRA_FIELD_NAMES',
    fields
  };
};

export const clearExtraFieldNames = () => {
  return {
    type: 'CLEAR_EXTRA_FIELD_NAMES'
  };
};

export const getExtraFieldNames = () => {
  return (dispatch) => {
    return api.getExtraFieldNames()
      .then(({data}) => {
        dispatch(setExtraFieldNames(data));
      })
      .catch(() => {
        dispatch(clearExtraFieldNames());
      });
  };
};

export const resetQuery = () => (dispatch) => {
  dispatch(clearEdges());
  dispatch(clearQuery());
  dispatch(clearUpload());
  dispatch(clearQueryTree());
  dispatch(clearRequestId());
  dispatch(clearQueryError());
};
