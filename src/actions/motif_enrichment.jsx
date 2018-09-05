/**
 * @author zacharyjuang
 * 8/20/18
 */
import $ from "jquery";
import {BASE_URL, setBusy} from "./index";

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
    dispatch(setBusy(true));
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
      .fail(() => {
        dispatch(clearMotifEnrichment());
        dispatch(setError(true));
      })
      .always(() => {
        dispatch(setBusy(false));
      });
  };
};

export const setMotifEnrichmentImage = (data) => {
  return {
    type: 'SET_MOTIF_ENRICHMENT_IMAGE',
    data
  };
};

export const clearMotifEnrichmentImage = () => {
  return {
    type: 'CLEAR_MOTIF_ENRICHMENT_IMAGE'
  };
};

export const getMotifEnrichmentImage = (requestId, params = {}) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return $.ajax({
      url: `${BASE_URL}/queryapp/motif_enrichment/${requestId}/heatmap.svg?` + $.param(params)
    })
      .done((data) => {
        dispatch(setError(false));
        dispatch(setMotifEnrichmentImage('data:image/svg+xml,' + encodeURIComponent(data.documentElement.outerHTML)));
      })
      .fail(() => {
        dispatch(setError(true));
        dispatch(clearMotifEnrichmentImage());
      })
      .always(() => {
        dispatch(setBusy(false));
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
    dispatch(setBusy(true));
    return $.ajax({
      url: `${BASE_URL}/queryapp/motif_enrichment/${requestId}/heatmap_table/`
    })
      .done((data) => {
        dispatch(setMotifEnrichmentLegend(data));
      })
      .fail(() => {
        dispatch(clearMotifEnrichmentLegend());
      })
      .always(() => {
        dispatch(setBusy(false));
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
