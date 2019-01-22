import {setBusy} from "./index";
import * as api from "../utils/axios_instance";

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

export const getTargetEnrichmentTable = (requestId, config) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    dispatch(clearTargetEnrichment());
    return api.getTargetEnrichmentTable(requestId, config)
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

export const getTargetEnrichmentImage = (requestId, params, config) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getTargetEnrichmentImage(requestId, params, config)
      .then((response) => {
        dispatch(setError(false));
        dispatch(setTargetEnrichmentImage('data:image/svg+xml,' + encodeURIComponent(response.data.documentElement.outerHTML)));

        return response.data;
      })
      .catch((e) => {
        dispatch(setError(true));
        dispatch(clearTargetEnrichmentImage());

        throw e;
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

export const getTargetEnrichmentLegend = (requestId, config) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getTargetEnrichmentLegend(requestId, config)
      .then(({data}) => {
        dispatch(setTargetEnrichmentLegend(data));
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
