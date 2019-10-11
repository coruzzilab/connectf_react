/**
 * @author zacharyjuang
 * 9/13/18
 */
import * as api from "../utils/axios_instance";
import {setBusy} from "./index";

export const setAnalysisEnrichment = (data) => {
  return {
    type: 'SET_ANALYSIS_ENRICHMENT',
    data
  };
};

export const clearAnalysisEnrichment = () => {
  return {
    type: 'CLEAR_ANALYSIS_ENRICHMENT'
  };
};

export const getAnalysisEnrichment = (requestId) => {
  return (dispatch) => {
    dispatch(setBusy(true));
    dispatch(clearAnalysisEnrichment());
    return api.getAnalysisEnrichment(requestId)
      .then(({data}) => {
        dispatch(setAnalysisEnrichment(data));
        dispatch(clearError());
      })
      .catch(() => {
        dispatch(clearAnalysisEnrichment());
        dispatch(setError(true));
      })
      .finally(() => {
        dispatch(setBusy(false));
      });
  };
};

export const addHidden = (index) => {
  return {
    type: 'ANALYSIS_ENRICHMENT_ADD_HIDDEN',
    index
  };
};

export const removeHidden = (index) => {
  return {
    type: 'ANALYSIS_ENRICHMENT_REMOVE_HIDDEN',
    index
  };
};

export const setHidden = (hidden) => {
  return {
    type: 'ANALYSIS_ENRICHMENT_SET_HIDDEN',
    hidden
  };
};

export const clearHidden = () => {
  return {
    type: 'ANALYSIS_ENRICHMENT_CLEAR_HIDDEN'
  };
};

export const setError = (error) => {
  return {
    type: 'SET_ANALYSIS_ENRICHMENT_ERROR',
    error
  };
};

export const toggleError = () => {
  return {
    type: 'TOGGLE_ANALYSIS_ENRICHMENT_ERROR'
  };
};

export const clearError = () => {
  return {
    type: 'CLEAR_ANALYSIS_ENRICHMENT_ERROR'
  };
};
