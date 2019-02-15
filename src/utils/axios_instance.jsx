/**
 * @author zacharyjuang
 * 9/13/18
 */
import qs from "qs";
import axios from "axios";

export const BASE_URL = window.location.origin;

export const instance = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: function (params) {
    return qs.stringify(params, {indices: false});
  }
});

export function getTFs(params) {
  return instance.get('/api/tfs/', {params});
}

export function getKeys(params) {
  return instance.get('/api/key/', {params});
}

export function getKeyValues(key, params) {
  return instance.get(`/api/key/${key}/`, {params});
}

export function getTargetGeneLists() {
  return instance.get('/api/lists/').then(({data}) => data);
}

export function getTargetNetworks() {
  return instance.get('/api/networks/').then(({data}) => data);
}

export function getAdditionalEdges() {
  return instance.get('/api/edges/');
}

export function getExperiments(params = {}) {
  return instance.get('/api/experiments/', {params});
}

export function submitExperiment(data, params) {
  return instance.post('/upload/', data, {params});
}

export function submitAnalysis(data) {
  return instance.post('/upload/analysis/', data);
}

export function getNetwork(requestId, edges, precision) {
  return instance.get(`/queryapp/network/${requestId}/`, {
    params: {edges, precision}
  });
}

export function postQuery(config) {
  return instance({
    url: '/queryapp/',
    method: 'POST',
    ...config
  });
}

export function getStats(requestId) {
  return instance.get(`/queryapp/stats/${requestId}/`);
}

export function getSummary(requestId) {
  return instance.get(`/queryapp/summary/${requestId}/`);
}

export function getTable(requestId) {
  return instance.get(`/queryapp/${requestId}/`);
}

export function getMotifEnrichment(requestId, params, config) {
  return instance.get(`/queryapp/motif_enrichment/${requestId}/`, {
    params,
    ...config
  });
}

export function getMotifEnrichmentImage(requestId, params, config) {
  return instance.get(`/queryapp/motif_enrichment/${requestId}/heatmap.svg`, {
    params,
    responseType: 'document',
    ...config
  });
}

export function getMotifEnrichmentLegend(requestId, config) {
  return instance.get(`/queryapp/motif_enrichment/${requestId}/heatmap_table/`, config);
}

export function getTargetEnrichmentTable(requestId, config) {
  return instance.get(`/queryapp/list_enrichment/${requestId}/`, config);
}

export function getTargetEnrichmentImage(requestId, params, config) {
  return instance.get(`/queryapp/list_enrichment/${requestId}.svg`, {
    params,
    responseType: 'document',
    ...config
  });
}

export function getTargetEnrichmentLegend(requestId, config) {
  return instance.get(`/queryapp/list_enrichment/${requestId}/legend/`, config);
}

export function getAnalysisEnrichment(requestId) {
  return instance.get(`/queryapp/analysis_enrichment/${requestId}/`);
}

export function checkAupr(requestId) {
  return instance.head(`/queryapp/aupr/${requestId}/`);
}

export default instance;
