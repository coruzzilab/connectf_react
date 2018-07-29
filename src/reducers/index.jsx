/**
 * Created by zacharyjuang on 11/24/16.
 */
import _ from 'lodash';

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

function getDescendants(state, id) {
  let curr = _(state).filter((o) => o.id === id);
  return curr.map('id').concat(_(state).filter((o) => o.parent === id).map((o) => {
    return getDescendants(state, o.id);
  }).flatten().value()).uniq().value();
}

function addAfter(state, id, obj) {
  let prevLoc = _.findIndex(state, ['id', id]);
  return [...state.slice(0, prevLoc + 1), obj, ...state.slice(prevLoc + 1)];
}

function moveItem(state, source, target, after = true) {
  let source_loc = _.findIndex(state, ['id', source]);
  let target_loc = _.findIndex(state, ['id', target]);

  if (source_loc === -1 || target_loc === -1) {
    return state;
  }

  if (after) {
    if (source_loc > target_loc) {
      return [
        ...state.slice(0, target_loc + 1),
        state[source_loc],
        ...state.slice(target_loc + 1, source_loc),
        ...state.slice(source_loc + 1)
      ];
    }
    return [
      ...state.slice(0, source_loc),
      ...state.slice(source_loc + 1, target_loc + 1),
      state[source_loc],
      ...state.slice(target_loc + 1)];

  } else {
    if (source_loc < target_loc) {
      return [
        ...state.slice(0, source_loc),
        ...state.slice(source_loc + 1, target_loc),
        state[source_loc],
        ...state.slice(target_loc)
      ];
    }
    return [
      ...state.slice(0, target_loc),
      state[source_loc],
      ...state.slice(target_loc, source_loc),
      ...state.slice(source_loc + 1)
    ];
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
    return _.differenceWith(state, getDescendants(state, action.id), (c, o) => c.id === o);
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

function heatmap(state = {}, action) {
  switch (action.type) {
  case 'SET_HEATMAP':
    return action.data;
  case 'CLEAR_HEATMAP':
    return {};
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

function motifEnrichment(state = {}, action) {
  switch (action.type) {
  case 'SET_MOTIF_ENRICHMENT':
    return action.data;
  case 'CLEAR_MOTIF_ENRICHMENT':
    return {};
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

function error(state = '', action) {
  switch (action.type) {
  case 'SET_ERROR':
    return action.message;
  case 'CLEAR_ERROR':
    return '';
  default:
    return state;
  }
}

const tgdbApp = {
  busy,
  query,
  queryTree,
  result,
  heatmap,
  cytoscape,
  motifEnrichment,
  requestId,
  stats,
  error
};

export default tgdbApp;
