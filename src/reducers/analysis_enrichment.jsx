/**
 * @author zacharyjuang
 * 9/13/18
 */
function data(state = {}, action) {
  switch (action.type) {
  case 'SET_ANALYSIS_ENRICHMENT':
    return action.data;
  case 'CLEAR_ANALYSIS_ENRICHMENT':
    return {};
  default:
    return state;
  }
}

function error(state = false, action) {
  switch (action.type) {
  case 'SET_ANALYSIS_ENRICHMENT_ERROR':
    return action.error;
  case 'TOGGLE_ANALYSIS_ENRICHMENT_ERROR':
    return !state;
  case 'CLEAR_ANALYSIS_ENRICHMENT_ERROR':
    return false;
  default:
    return state;
  }
}

function hidden(state = [], action) {
  switch (action.type) {
  case 'ANALYSIS_ENRICHMENT_ADD_HIDDEN':
    return [...state, action.index];
  case 'ANALYSIS_ENRICHMENT_REMOVE_HIDDEN':
    return state.filter((i) => action.index !== i);
  case 'ANALYSIS_ENRICHMENT_SET_HIDDEN':
    return action.hidden;
  case 'ANALYSIS_ENRICHMENT_CLEAR_HIDDEN':
    return [];
  default:
    return state;
  }
}

export default {
  data,
  error,
  hidden
};
