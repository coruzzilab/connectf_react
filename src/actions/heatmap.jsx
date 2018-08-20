import $ from "jquery";
import {BASE_URL} from "./index";

/**
 * @author zacharyjuang
 * 8/20/18
 */
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

export const getHeatmapTable = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/list_enrichment/${requestId}/`,
      contentType: false
    })
      .done((data) => {
        dispatch(setHeatmap(data));
        dispatch(setError(false));
      })
      .catch(() => {
        dispatch(clearHeatmap());
        dispatch(setError(true));
      });
  };
};

export const setHeatmapLegend = (data) => {
  return {
    type: 'SET_HEATMAP_LEGEND',
    data
  };
};

export const clearHeatmapLegend = () => {
  return {
    type: 'CLEAR_HEATMAP_LEGEND'
  };
};

export const getHeatmapLegend = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/list_enrichment/${requestId}/legend/`
    })
      .done((data) => {
        dispatch(setHeatmapLegend(data));
        dispatch(setError(false));
      })
      .fail(() => {
        dispatch(clearHeatmapLegend());
        dispatch(setError(true));
      });
  };
};

export const setError = (error) => {
  return {
    type: 'SET_HEATMAP_ERROR',
    error
  };
};

export const toggleError = () => {
  return {
    type: 'TOGGLE_HEATMAP_ERROR'
  };
};

export const clearError = () => {
  return {
    type: 'CLEAR_HEATMAP_ERROR'
  };
};
