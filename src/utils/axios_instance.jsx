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
  },
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken"
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
  return instance.get(`/api/network/${requestId}/`, {
    params: {edges, precision}
  });
}

export function postQuery(config) {
  return instance({
    url: '/api/',
    method: 'POST',
    ...config
  });
}

export function getStats(requestId) {
  return instance.get(`/api/stats/${requestId}/`);
}

export function getSummary(requestId) {
  return instance.get(`/api/summary/${requestId}/`);
}

export function getTable(requestId) {
  return instance.get(`/api/${requestId}/`);
}

export function getMotifEnrichment(requestId, params, config) {
  return instance.get(`/api/motif_enrichment/${requestId}/`, {
    params,
    ...config
  });
}

export function getMotifEnrichmentImage(requestId, params, config) {
  return instance.get(`/api/motif_enrichment/${requestId}/heatmap.svg`, {
    params,
    responseType: 'document',
    ...config
  });
}

export function getMotifEnrichmentLegend(requestId, config) {
  return instance.get(`/api/motif_enrichment/${requestId}/heatmap_table/`, config);
}

export function getMotifRegions() {
  return instance.get('/api/motif_enrichment/regions/');
}

export function getTargetEnrichmentTable(requestId, config) {
  return instance.get(`/api/list_enrichment/${requestId}/`, config);
}

export function getTargetEnrichmentImage(requestId, params, config) {
  return instance.get(`/api/list_enrichment/${requestId}.svg`, {
    params,
    responseType: 'document',
    ...config
  });
}

export function getTargetEnrichmentLegend(requestId, config) {
  return instance.get(`/api/list_enrichment/${requestId}/legend/`, config);
}

export function getAnalysisEnrichment(requestId) {
  return instance.get(`/api/analysis_enrichment/${requestId}/`);
}

export function checkAupr(requestId) {
  return instance.head(`/api/aupr/${requestId}/`);
}

export function getAuprImg(requestId, precision, cancelToken) {
  return instance.get(`/api/aupr/${requestId}/`, {
    params: {precision},
    responseType: 'blob',
    cancelToken
  });
}

export default instance;
