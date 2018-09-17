/**
 * @author zacharyjuang
 * 9/13/18
 */
import * as api from "../utils/axios";
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
