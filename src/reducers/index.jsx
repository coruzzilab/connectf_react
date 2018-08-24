/**
 * Created by zacharyjuang on 11/24/16.
 */
import _ from 'lodash';
import heatmap from './heatmap';
import {combineReducers} from 'redux';
import motifEnrichment from "./motif_enrichment";
import {addAfter, duplicateNode, moveItem, getDescendants} from "../utils";

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

function result(state = [], action) {
  switch (action.type) {
  case 'SET_RESULT':
    return action.data;
  case 'CLEAR_RESULT':
    return [];
  default:
    return state;
  }
}

function cytoscape(state = [], action) {
  switch (action.type) {
  case 'SET_CYTOSCAPE':
    return action.data;
  case 'CLEAR_CYTOSCAPE':
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

const tgdbApp = {
  busy,
  query,
  queryTree,
  result,
  heatmap: combineReducers(heatmap),
  cytoscape,
  motifEnrichment: combineReducers(motifEnrichment),
  requestId,
  stats,
  edges,
  queryHistory,
  queryError
};

export default combineReducers(tgdbApp);
