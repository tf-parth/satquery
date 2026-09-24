// SatQuery AI - API Client
// Supports both SIH 26167 Official Endpoints (/api/...) and legacy endpoints (/api/v1/...)

const API_BASE = '/api/v1';
const SIH_BASE = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${SIH_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    try {
      const fallbackRes = await fetch('/api/healthz');
      if (fallbackRes.ok) return await fallbackRes.json();
    } catch (e) {
      // Ignore
    }
    return { status: "OFFLINE", error: err.message };
  }
}

export async function fetchModelRegistry() {
  try {
    const res = await fetch(`${SIH_BASE}/models`);
    if (!res.ok) throw new Error("Failed to fetch model registry");
    const data = await res.json();
    return data.models || [];
  } catch (err) {
    console.error("Error fetching model registry:", err);
    return [];
  }
}

export async function queryAgentApi({ files = [], query = "", language = "en", mode = "auto", modality = null, demoId = null }) {
  const formData = new FormData();
  if (files && files.length > 0) {
    files.forEach((f) => formData.append('files', f));
  }
  formData.append('query', query || '');
  formData.append('language', language);
  formData.append('mode', mode);
  if (modality) formData.append('modality', modality);
  if (demoId) formData.append('demoId', demoId);

  const res = await fetch(`${SIH_BASE}/agent/query`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || errJson.error || `Agent query failed with status ${res.status}`);
  }
  return await res.json();
}

export async function analyzeSingleImageApi({ file, query, language = "en" }) {
  const formData = new FormData();
  if (file) formData.append('image', file);
  formData.append('query', query || '');
  formData.append('language', language);

  const res = await fetch(`${SIH_BASE}/analyze/single`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Analysis failed: ${res.status}`);
  }
  return await res.json();
}

export async function analyzeChangeApi({ image1, image2, query, language = "en" }) {
  const formData = new FormData();
  if (image1) formData.append('image1', image1);
  if (image2) formData.append('image2', image2);
  formData.append('query', query || '');
  formData.append('language', language);

  const res = await fetch(`${SIH_BASE}/analyze/change`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Change analysis failed: ${res.status}`);
  }
  return await res.json();
}

export async function analyzeCrossModalApi({ optical, sar, query, language = "en" }) {
  const formData = new FormData();
  if (optical) formData.append('optical', optical);
  if (sar) formData.append('sar', sar);
  formData.append('query', query || '');
  formData.append('language', language);

  const res = await fetch(`${SIH_BASE}/analyze/cross-modal`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Cross-modal analysis failed: ${res.status}`);
  }
  return await res.json();
}

export async function uploadRasterApi(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${SIH_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Upload failed: ${res.status}`);
  }
  return await res.json();
}

export async function fetchDemoScenes() {
  try {
    const res = await fetch(`${API_BASE}/scenes`);
    if (!res.ok) throw new Error("Failed to fetch scenes");
    const data = await res.json();
    return data.scenes || [];
  } catch (err) {
    console.error("Error fetching demo scenes:", err);
    return [];
  }
}

export async function fetchAdminRegions() {
  try {
    const res = await fetch(`${API_BASE}/regions`);
    if (!res.ok) throw new Error("Failed to fetch regions");
    const data = await res.json();
    return data.regions || [];
  } catch (err) {
    console.error("Error fetching admin regions:", err);
    return [];
  }
}

export async function analyzeImageApi({ file, query, language = "en", demoId = null, aoi = null }) {
  if (file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('query', query || '');
    formData.append('language', language);
    if (aoi) formData.append('aoi', JSON.stringify(aoi));

    const res = await fetch(`${API_BASE}/analyze-image`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Analysis failed with status ${res.status}`);
    }
    return await res.json();
  } else {
    const res = await fetch(`${API_BASE}/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, demoId, aoi })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Analysis failed with status ${res.status}`);
    }
    return await res.json();
  }
}

export async function queryIndiaApi({ query, conversation = [], aoi = null, language = "en", context = {}, image = null }) {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, conversation, aoi, language, context, image })
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const err = new Error(errJson.message || `Query failed with status ${res.status}`);
    err.errorCode = errJson.error;
    throw err;
  }
  return await res.json();
}

export async function fetchChangeDatasets() {
  try {
    const res = await fetch(`${API_BASE}/change-comparison/datasets`);
    if (!res.ok) throw new Error("Failed to fetch change comparison datasets");
    const data = await res.json();
    return data.datasets || [];
  } catch (err) {
    console.error("Error fetching change datasets:", err);
    return [];
  }
}

export async function runChangeComparisonApi({ 
  beforeImageId, 
  afterImageId, 
  location, 
  beforeFile, 
  afterFile, 
  beforeDate,
  afterDate,
  query, 
  language = "en" 
}) {
  if (beforeFile && afterFile) {
    const formData = new FormData();
    formData.append('beforeImage', beforeFile);
    formData.append('afterImage', afterFile);
    if (location) formData.append('location', location);
    if (beforeDate) formData.append('beforeDate', beforeDate);
    if (afterDate) formData.append('afterDate', afterDate);
    formData.append('query', query || '');
    formData.append('language', language);

    const res = await fetch(`${API_BASE}/change-comparison`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Change comparison failed: ${res.status}`);
    }
    return await res.json();
  }

  const res = await fetch(`${API_BASE}/change-comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ beforeImageId, afterImageId, location, query, language })
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Change comparison failed with status ${res.status}`);
  }
  return await res.json();
}

export async function compareImagesApi({ demoId = "mumbai_coastal", query = "What changed?", language = "en", image1 = null, image2 = null }) {
  if (image1 && image2) {
    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);
    formData.append('query', query || '');
    formData.append('language', language);

    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Comparison failed: ${res.status}`);
    }
    return await res.json();
  }

  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoId, query, language })
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Comparison failed with status ${res.status}`);
  }
  return await res.json();
}

export async function postInvestigationTurn({ investigationId, query, sceneId, aoi, language = "en" }) {
  const res = await fetch(`${API_BASE}/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ investigationId, query, sceneId, aoi, language })
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Investigation turn failed: ${res.status}`);
  }
  return await res.json();
}
