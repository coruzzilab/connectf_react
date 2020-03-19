/**
 * Created by zacharyjuang on 11/24/16.
 */
import _ from 'lodash';
import targetEnrichment from './target_enrichment';
import {combineReducers} from 'redux';
import motifEnrichment from "./motif_enrichment";
import analysisEnrichment from "./analysis_enrichment";
import {addAfter, duplicateNode, getDescendants, moveItem} from "../utils";

const busy = (state = 0, action) => {
  // eslint-disable-next-line no-console
  console.assert(state >= 0, "busy state should be equal or greater than 0");

  switch (action.type) {
  case 'SET_BUSY':
    return action.busy ? state + 1 : Math.max(0, state - 1);
  case 'CLEAR_BUSY':
    return 0;
  default:
    return state;
  }
};

function query(state = '', action) {
  switch (action.type) {
  case 'SET_QUERY':
    return action.query;
  case 'CLEAR_QUERY':
    return '';
  default:
    return state;
  }
}

function queryTree(state = [], action) {
  switch (action.type) {
  case 'ADD_TF':
    if (action.after) {
      return addAfter(state, action.after, {
        id: action.id,
        nodeType: 'TF',
        name: action.name,
        parent: action.parent,
        oper: action.oper,
        not_: action.not_
      });
    }
    return [{
      id: action.id,
      nodeType: 'TF',
      name: action.name,
      parent: action.parent,
      oper: action.oper,
      not_: action.not_
    }, ...state];
  case 'ADD_GROUP':
    if (action.after) {
      return addAfter(state, action.after, {
        id: action.id,
        nodeType: 'GROUP',
        parent: action.parent,
        oper: action.oper,
        not_: action.not_
      });
    }
    return [{
      id: action.id,
      nodeType: 'GROUP',
      parent: action.parent,
      oper: action.oper,
      not_: action.not_
    }, ...state];
  case 'ADD_MOD':
    if (action.after) {
      return addAfter(state, action.after, {
        id: action.id,
        nodeType: 'MOD',
        key: action.key,
        value: action.value,
        parent: action.parent,
        oper: action.oper,
        innerOper: action.innerOper,
        not_: action.not_
      });
    }
    return [{
      id: action.id,
      nodeType: 'MOD',
      key: action.key,
      value: action.value,
      parent: action.parent,
      oper: action.oper,
      innerOper: action.innerOper,
      not_: action.not_
    }, ...state];
  case 'ADD_MOD_GROUP':
    if (action.after) {
      return addAfter(state, action.after, {
        id: action.id,
        nodeType: 'MOD_GROUP',
        parent: action.parent,
        oper: action.oper,
        not_: action.not_
      });
    }
    return [{
      id: action.id,
      nodeType: 'MOD_GROUP',
      parent: action.parent,
      oper: action.oper,
      not_: action.not_
    }, ...state];
  case 'SET_MOD_KEY':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          key: action.key
        });
      }
      return o;
    });
  case 'SET_MOD_VALUE':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          value: action.value
        });
      }
      return o;
    });
  case 'SET_MOD_INNER_OPER':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          innerOper: action.innerOper
        });
      }
      return o;
    });
  case 'REMOVE_NODE':
    return _.differenceWith(state, getDescendants(state, action.id), (c, o) => c.id === o.id);
  case 'SET_QUERY_NAME':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          name: action.name
        });
      }
      return o;
    });
  case 'SET_QUERY_OPER':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          oper: action.oper
        });
      }
      return o;
    });
  case 'SET_QUERY_NOT':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          not_: action.not_
        });
      }
      return o;
    });
  case 'CLEAR_QUERY_TREE':
    return [];
  case 'MOVE_ITEM':
    return moveItem(state, action.source, action.target, action.after);
  case 'SET_PARENT':
    return _.map(state, (o) => {
      if (o.id === action.id) {
        return Object.assign({}, o, {
          parent: action.parent
        });
      }
      return o;
    });
  case 'DUPLICATE_NODE':
    return addAfter(state, action.id, duplicateNode(state, action.id));
  default:
    return state;
  }
}

function requestId(state = "", action) {
  switch (action.type) {
  case 'SET_REQUEST_ID':
    return action.requestId;
  case 'CLEAR_REQUEST_ID':
    return "";
  default:
    return state;
  }
}

function result(state = {}, action) {
  switch (action.type) {
  case 'SET_RESULT':
    return action.data;
  case 'CLEAR_RESULT':
    return {};
  default:
    return state;
  }
}

function network(state = [], action) {
  switch (action.type) {
  case 'SET_NETWORK':
    return action.data;
  case 'CLEAR_NETWORK':
    return [];
  default:
    return state;
  }
}

function stats(state = {}, action) {
  switch (action.type) {
  case 'SET_STATS':
    return action.data;
  case 'CLEAR_STATS':
    return {};
  default:
    return state;
  }
}

function summary(state = {}, action) {
  switch (action.type) {
  case 'SET_SUMMARY':
    return action.data;
  case 'CLEAR_SUMMARY':
    return {};
  default:
    return state;
  }
}

function edges(state = [], action) {
  switch (action.type) {
  case 'ADD_EDGE':
    return [...state, action.name];
  case 'REMOVE_EDGE':
    return _.filter(state, (e) => {
      return e !== action.name;
    });
  case 'REMOVE_EDGES':
    return _.difference(state, action.edges);
  case 'SET_EDGES':
    return action.edges;
  case 'CLEAR_EDGE':
    return [];
  default:
    return state;
  }
}

/**
 * Available additional edge features
 * @param state
 * @param action
 * @returns {*}
 */
function edgeList(state = [], action) {
  switch (action.type) {
  case 'SET_EDGE_LIST':
    return action.edgeList;
  case 'CLEAR_EDGE_LIST':
    return [];
  default:
    return state;
  }
}

function precisionCutoff(state = 0, action) {
  switch (action.type) {
  case 'SET_PRECISION_CUTOFF':
    return action.precisionCutoff;
  default:
    return state;
  }
}

function queryHistory(state = [], action) {
  switch (action.type) {
  case 'ADD_QUERY_HISTORY':
    return [
      {query: action.query, time: new Date().toString()},
      ...state.filter((o) => o.query !== action.query)
    ].slice(0, 30);
  case 'CLEAR_QUERY_HISTORY':
    return [];
  default:
    return state;
  }
}

const INIT_QUERY_ERROR = {error: false, message: ''};

function queryError(state = INIT_QUERY_ERROR, action) {
  switch (action.type) {
  case 'SET_QUERY_ERROR':
    return Object.assign({}, state, {error: action.error, message: action.message});
  case 'CLEAR_QUERY_ERROR':
    return INIT_QUERY_ERROR;
  default:
    return state;
  }
}

function extraFields(state = [], action) {
  switch (action.type) {
  case 'ADD_EXTRA_FIELD':
    return state.filter((s) => s !== action.field).concat(action.field);
  case 'REMOVE_EXTRA_FIELD':
    return state.filter((s) => s !== action.field);
  case 'REMOVE_EXTRA_FIELDS':
    return _.difference(state, action.fields);
  case 'CLEAR_EXTRA_FIELDS':
    return [];
  default:
    return state;
  }
}

function renameKey(obj, name, newName) {
  if (newName in obj) {
    return obj;
  }
  let pairs = _.toPairs(obj);
  let item = obj[name];
  let i = _.findIndex(pairs, (o) => o[0] === name);

  return _.fromPairs([...pairs.slice(0, i), [newName, item], ...pairs.slice(i + 1)]);
}

function tempLists(state = {}, action) {
  switch (action.type) {
  case 'ADD_LIST':
    return {...state, [action.name]: action.genes};
  case 'REMOVE_LIST':
    return _.omit(state, [action.name]);
  case 'RENAME_LIST':
    return renameKey(state, action.name, action.newName);
  case 'CLEAR_LIST':
    return {};
  default:
    return state;
  }
}

function warnSubmit(state = true, action) {
  switch (action.type) {
  case 'SET_WARN_SUBMIT':
    return action.warn;
  default:
    return state;
  }
}

function analysisIds(state = [], action) {
  switch (action.type) {
  case 'SET_ANALYSIS_IDS':
    return action.ids;
  case 'CLEAR_ANALYSIS_IDS':
    return [];
  case 'SHOW_ANALYSIS_IDS':
    return [
      ...state.slice(0, action.idx),
      [state[action.idx][0], {...state[action.idx][1], show: action.show}],
      ...state.slice(action.idx + 1)
    ];
  case 'RENAME_ANALYSIS_IDS':
    return [
      ...state.slice(0, action.idx),
      [state[action.idx][0], {...state[action.idx][1], name: action.name}],
      ...state.slice(action.idx + 1)
    ];
  default:
    return state;
  }
}

const tgdbApp = {
  busy,
  query,
  queryTree,
  result,
  targetEnrichment: combineReducers(targetEnrichment),
  network,
  motifEnrichment: combineReducers(motifEnrichment),
  analysisEnrichment: combineReducers(analysisEnrichment),
  requestId,
  stats,
  summary,
  edges,
  edgeList,
  precisionCutoff,
  queryHistory,
  queryError,
  extraFields,
  tempLists,
  warnSubmit,
  analysisIds
};

export default combineReducers(tgdbApp);
