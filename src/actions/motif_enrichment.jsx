/**
 * @author zacharyjuang
 * 8/20/18
 */
import $ from "jquery";
import {BASE_URL} from "./index";

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
      .done((data) => {
        dispatch(setMotifEnrichment(data));
        dispatch(clearError());
      })
      .catch(() => {
        dispatch(clearMotifEnrichment());
        dispatch(setError(true));
      });
  };
};

export const setMotifEnrichmentLegend = (data) => {
  return {
    type: 'SET_MOTIF_ENRICHMENT_LEGEND',
    data
  };
};

export const clearMotifEnrichmentLegend = () => {
  return {
    type: 'CLEAR_MOTIF_ENRICHMENT_LEGEND'
  };
};

export const getMotifEnrichmentLegend = (requestId) => {
  return (dispatch) => {
    return $.ajax({
      url: `${BASE_URL}/queryapp/motif_enrichment/${requestId}/heatmap_table/`
    })
      .done((data) => {
        dispatch(setMotifEnrichmentLegend(data));
      })
      .fail(() => {
        dispatch(clearMotifEnrichmentLegend());
      });
  };
};

export const setError = (error) => {
  return {
    type: 'SET_MOTIF_ENRICHMENT_ERROR',
    error
  };
};

export const toggleError = () => {
  return {
    type: 'TOGGLE_MOTIF_ENRICHMENT_ERROR'
  };
};

export const clearError = () => {
  return {
    type: 'CLEAR_MOTIF_ENRICHMENT_ERROR'
  };
};
