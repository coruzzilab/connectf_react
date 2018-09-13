import {setBusy} from "./index";
import * as api from "../utils/axios";

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
    dispatch(setBusy(true));
    return api.getTargetEnrichmentTable(requestId)
      .then((response) => {
        dispatch(setTargetEnrichment(response.data));
        dispatch(setError(false));
      })
      .catch(() => {
        dispatch(clearTargetEnrichment());
        dispatch(setError(true));
      })
      .finally(() => {
        dispatch(setBusy(false));
      });
  };
};

export const setTargetEnrichmentImage = (data) => {
  return {
    type: 'SET_TARGET_ENRICHMENT_IMAGE',
    data
  };
};

export const clearTargetEnrichmentImage = () => {
  return {
    type: 'CLEAR_TARGET_ENRICHMENT_IMAGE'
  };
};

export const getTargetEnrichmentImage = (requestId, params = {}) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getTargetEnrichmentImage(requestId, params)
      .then((response) => {
        dispatch(setError(false));
        dispatch(setTargetEnrichmentImage('data:image/svg+xml,' + encodeURIComponent(response.data.documentElement.outerHTML)));
      })
      .catch(() => {
        dispatch(setError(true));
        dispatch(clearTargetEnrichmentImage());
      })
      .finally(() => {
        dispatch(setBusy(false));
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
    dispatch(setBusy(true));
    return api.getTargetEnrichmentLegend(requestId)
      .done((response) => {
        dispatch(setTargetEnrichmentLegend(response.data));
        dispatch(setError(false));
      })
      .catch(() => {
        dispatch(clearTargetEnrichmentLegend());
        dispatch(setError(true));
      })
      .finally(() => {
        dispatch(setBusy(false));
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
