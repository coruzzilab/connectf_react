/**
 * @author zacharyjuang
 * 8/20/18
 */
function table(state = {}, action) {
  switch (action.type) {
  case 'SET_HEATMAP':
    return action.data;
  case 'CLEAR_HEATMAP':
    return {};
  default:
    return state;
  }
}

function legend(state = [], action) {
  switch (action.type) {
  case 'SET_HEATMAP_LEGEND':
    return action.data;
  case 'CLEAR_HEATMAP_LEGEND':
    return [];
  default:
    return state;
  }
}

function error(state = false, action) {
  switch (action.type) {
  case 'SET_HEATMAP_ERROR':
    return action.error;
  case 'TOGGLE_HEATMAP_ERROR':
    return !state;
  case 'CLEAR_HEATMAP_ERROR':
    return false;
  default:
    return state;
  }
}


export default {
  table,
  legend,
  error
};
