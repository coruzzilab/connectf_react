import $ from "jquery";
import {BASE_URL} from "./index";

/**
 * @author zacharyjuang
 * 8/20/18
 */
export const setTargetEnrichment = (data) => {
  return {
    type: 'SET_TARGET_ENRICHMENT',
    data
  };
};

export const clearTargetEnrichment = () => {
  return {
    type: 'CLEAR_TARGET_ENRICHMENT'
  };
};

export const getTargetEnrichmentTable = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/list_enrichment/${requestId}/`,
      contentType: false
    })
      .done((data) => {
        dispatch(setTargetEnrichment(data));
        dispatch(setError(false));
      })
      .catch(() => {
        dispatch(clearTargetEnrichment());
        dispatch(setError(true));
      });
  };
};

export const setTargetEnrichmentLegend = (data) => {
  return {
    type: 'SET_TARGET_ENRICHMENT_LEGEND',
    data
  };
};

export const clearTargetEnrichmentLegend = () => {
  return {
    type: 'CLEAR_TARGET_ENRICHMENT_LEGEND'
  };
};

export const getTargetEnrichmentLegend = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/list_enrichment/${requestId}/legend/`
    })
      .done((data) => {
        dispatch(setTargetEnrichmentLegend(data));
        dispatch(setError(false));
      })
      .fail(() => {
        dispatch(clearTargetEnrichmentLegend());
        dispatch(setError(true));
      });
  };
};

export const setError = (error) => {
  return {
    type: 'SET_TARGET_ENRICHMENT_ERROR',
    error
  };
};

export const toggleError = () => {
  return {
    type: 'TOGGLE_TARGET_ENRICHMENT_ERROR'
  };
};

export const clearError = () => {
  return {
    type: 'CLEAR_TARGET_ENRICHMENT_ERROR'
  };
};
