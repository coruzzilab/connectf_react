/**
 * @author zacharyjuang
 * 8/20/18
 */
import {setBusy} from "./index";
import * as api from "../utils/axios_instance";

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

export const getMotifEnrichment = (requestId, alpha = 0.05, regions = [], useLabel = false, config) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    dispatch(clearMotifEnrichment());
    return api.getMotifEnrichment(requestId, {
      alpha,
      regions,
      label: useLabel ? '1' : undefined
    }, config)
      .then((response) => {
        dispatch(setMotifEnrichment(response.data));
        dispatch(clearError());
      })
      .catch((e) => {
        dispatch(clearMotifEnrichment());
        dispatch(setError(true));
        throw e;
      })
      .finally(() => {
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

export const getMotifEnrichmentImage = (requestId, params, config) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getMotifEnrichmentImage(requestId, params, config)
      .then((response) => {
        dispatch(setError(false));
        dispatch(setMotifEnrichmentImage('data:image/svg+xml,' + encodeURIComponent(response.data.documentElement.outerHTML)));
        return response.data;
      })
      .catch((e) => {
        dispatch(setError(true));
        dispatch(clearMotifEnrichmentImage());

        throw e;
      })
      .finally(() => {
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

export const getMotifEnrichmentLegend = (requestId, config) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    return api.getMotifEnrichmentLegend(requestId, config)
      .then((response) => {
        dispatch(setMotifEnrichmentLegend(response.data));
      })
      .catch((e) => {
        dispatch(clearMotifEnrichmentLegend());
        throw e;
      })
      .finally(() => {
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
