/**
 * @author zacharyjuang
 * 9/13/18
 */
import qs from "qs";
import axios from "axios";

export const BASE_URL = window.location.origin;

const instance = axios.create({
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
  return instance.get('/api/lists/');
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

export function getCytoscape(requestId) {
  return instance.get(`/queryapp/cytoscape/${requestId}/`);
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

export function getTable(requestId) {
  return instance.get(`/queryapp/${requestId}/`);
}

export function getMotifEnrichment(requestId, params) {
  return instance.get(`/queryapp/motif_enrichment/${requestId}/`, {
    params
  });
}

export function getMotifEnrichmentImage(requestId, params) {
  return instance.get(`/queryapp/motif_enrichment/${requestId}/heatmap.svg`, {
    params,
    responseType: 'document'
  });
}

export function getMotifEnrichmentLegend(requestId) {
  return instance.get(`/queryapp/motif_enrichment/${requestId}/heatmap_table/`);
}

export function getTargetEnrichmentTable(requestId) {
  return instance.get(`/queryapp/list_enrichment/${requestId}/`);
}

export function getTargetEnrichmentImage(requestId, params) {
  return instance.get(`/queryapp/list_enrichment/${requestId}.svg`, {
    params,
    responseType: 'document'
  });
}

export function getTargetEnrichmentLegend(requestId) {
  return instance.get(`/queryapp/list_enrichment/${requestId}/legend/`);
}

export default instance;
