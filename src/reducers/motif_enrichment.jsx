/**
 * @author zacharyjuang
 * 8/20/18
 */
function table(state = {}, action) {
  switch (action.type) {
  case 'SET_MOTIF_ENRICHMENT':
    return action.data;
  case 'CLEAR_MOTIF_ENRICHMENT':
    return {};
  default:
    return state;
  }
}

function image(state = null, action) {
  switch (action.type) {
  case 'SET_MOTIF_ENRICHMENT_IMAGE':
    return action.data;
  case 'CLEAR_MOTIF_ENRICHMENT_IMAGE':
    return null;
  default:
    return state;
  }
}

function legend(state = [], action) {
  switch (action.type) {
  case 'SET_MOTIF_ENRICHMENT_LEGEND':
    return action.data;
  case 'CLEAR_MOTIF_ENRICHMENT_LEGEND':
    return [];
  default:
    return state;
  }
}

function error(state = false, action) {
  switch (action.type) {
  case 'SET_MOTIF_ENRICHMENT_ERROR':
    return action.error;
  case 'TOGGLE_MOTIF_ENRICHMENT_ERROR':
    return !state;
  case 'CLEAR_MOTIF_ENRICHMENT_ERROR':
    return false;
  default:
    return state;
  }
}

export default {
  table,
  image,
  legend,
  error
}
