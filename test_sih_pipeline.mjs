// SatQuery AI - Full SIH 26167 Automated Pipeline Verification
import fs from 'fs';

console.log('🛰️ Starting SIH Problem Statement 26167 End-to-End Verification...\n');

const BASE = 'http://127.0.0.1:5000/api';
let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ [FAIL] ${name}:`, e.message);
  }
}

async function run() {
  const opt1Buffer = fs.readFileSync('test_optical_t1.tif');
  const opt2Buffer = fs.readFileSync('test_optical_t2.tif');
  const sarBuffer = fs.readFileSync('test_sar.tif');
  const invalidBuffer = fs.readFileSync('test_invalid.txt');

  // 1. Health check & Live AI Engine
  await test('1. Health Check & Live Python Microservice', async () => {
    const res = await fetch(`${BASE}/health`);
    const data = await res.json();
    if (data.status !== 'HEALTHY') throw new Error(`Expected HEALTHY, got ${data.status}`);
    if (data.aiService?.status !== 'HEALTHY') throw new Error('AI microservice is not healthy');
    if (data.aiService?.execution_mode !== 'LIVE_INFERENCE') throw new Error('Execution mode is not LIVE_INFERENCE');
  });

  // 2. Model Registry Explorer (10 registered specialized models)
  await test('2. Model Registry Explorer - 10 Live Specialist Models', async () => {
    const res = await fetch(`${BASE}/models`);
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error('Models endpoint failed');
    if (data.count < 10) throw new Error(`Expected at least 10 models, got ${data.count}`);
    const required = ['remote_sensing_vqa', 'grounding', 'change_detection', 'optical_sar_fusion', 'bigearthnet_adaptation'];
    for (const r of required) {
      const found = data.models.find(m => m.id === r);
      if (!found) throw new Error(`Model ${r} missing from registry`);
      if (found.status !== 'LIVE') throw new Error(`Model ${r} is not marked LIVE`);
    }
  });

  // 3. Upload & Inspect GeoTIFF Metadata (CRS, Bounds, Bands)
  await test('3. GeoTIFF Metadata Extraction & Spatial Bounds Validation', async () => {
    const form = new FormData();
    form.append('file', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Upload failed: ${data.message}`);
    const meta = data.metadata;
    if (!meta.fileType.includes('TIFF')) throw new Error(`Expected TIFF fileType, got ${meta.fileType}`);
    if (meta.dimensions?.width !== 128 || meta.dimensions?.height !== 128) {
      throw new Error(`Unexpected dimensions: ${meta.dimensions?.width}x${meta.dimensions?.height}`);
    }
    if (meta.bandCount !== 4) throw new Error(`Expected 4 bands, got ${meta.bandCount}`);
    if (!meta.crs?.includes('4326')) throw new Error(`Expected EPSG:4326 CRS, got ${meta.crs}`);
  });

  // 4. Input Validation Layer - Rejection of Invalid File Type
  await test('4. Input Validation Layer - Rejects Invalid Non-Raster Format', async () => {
    const form = new FormData();
    form.append('files', new Blob([invalidBuffer], { type: 'text/plain' }), 'test_invalid.txt');
    form.append('query', 'Analyze this file');
    const res = await fetch(`${BASE}/agent/query`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'VALIDATION_ERROR') throw new Error(`Expected VALIDATION_ERROR, got ${data.status}`);
    if (!data.error) throw new Error('Expected validation error message');
    if (!data.suggestion) throw new Error('Expected corrective user guidance');
  });

  // 5. Single Image Analysis (POST /api/analyze/single)
  await test('5. Single Image Analysis - Caption, NDVI, Land Cover', async () => {
    const form = new FormData();
    form.append('image', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    form.append('query', 'Describe this multispectral satellite scene');
    const res = await fetch(`${BASE}/analyze/single`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Single image analysis failed: ${data.message}`);
    if (!data.answer) throw new Error('No answer generated');
    if (typeof data.confidence !== 'number' || data.confidence <= 0) throw new Error(`Invalid confidence: ${data.confidence}`);
    if (!data.execution_trace || data.execution_trace.length === 0) throw new Error('Missing execution trace');
  });

  // 6. Natural Language VQA (POST /api/analyze/vqa)
  await test('6. Remote Sensing VQA - Multispectral Question Answering', async () => {
    const form = new FormData();
    form.append('image', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    form.append('query', 'Where is the water body in this image?');
    const res = await fetch(`${BASE}/analyze/vqa`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`VQA failed: ${data.message}`);
    if (!data.answer.toLowerCase().includes('water') && !data.evidence?.some(e => e.type === 'spectral')) {
      throw new Error('VQA answer or evidence did not identify water');
    }
  });

  // 7. Text-Guided Grounding (POST /api/analyze/grounding)
  await test('7. Text-Guided Grounding - Spatial Bounding Boxes & Masks', async () => {
    const form = new FormData();
    form.append('image', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    form.append('prompt', 'Highlight all buildings and built-up areas');
    const res = await fetch(`${BASE}/analyze/grounding`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Grounding failed: ${data.message}`);
    if (!Array.isArray(data.detections) || data.detections.length === 0) {
      throw new Error('No bounding box detections returned');
    }
    const det = data.detections[0];
    if (!det.box || typeof det.box.xmin !== 'number') throw new Error('Invalid box coordinates');
    if (typeof det.confidence !== 'number') throw new Error('Missing detection confidence');
  });

  // 8. Bi-Temporal Change Detection (POST /api/analyze/change)
  await test('8. Bi-Temporal Change Detection - Change Vector Analysis & Change Map', async () => {
    const form = new FormData();
    form.append('image1', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    form.append('image2', new Blob([opt2Buffer], { type: 'image/tiff' }), 'test_optical_t2.tif');
    form.append('query', 'What changed between T1 and T2?');
    const res = await fetch(`${BASE}/analyze/change`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Change detection failed: ${data.message}`);
    if (!data.change_map || !data.change_map.startsWith('data:image/png;base64,')) {
      throw new Error('Missing valid base64 change_map');
    }
    if (!Array.isArray(data.changes) || data.changes.length === 0) {
      throw new Error('Missing changes array');
    }
    if (!data.metrics) {
      throw new Error('Missing metrics');
    }
  });

  // 9. Cross-Modal Optical + SAR Analysis (POST /api/analyze/cross-modal)
  await test('9. Cross-Modal Optical + SAR Fusion Reasoning', async () => {
    const form = new FormData();
    form.append('optical', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    form.append('sar', new Blob([sarBuffer], { type: 'image/tiff' }), 'test_sar.tif');
    form.append('query', 'Cross-examine optical reflectance and SAR radar backscatter for water and structures');
    const res = await fetch(`${BASE}/analyze/cross-modal`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Cross-modal analysis failed: ${data.message}`);
    if (!data.optical_evidence || !data.sar_evidence) {
      throw new Error('Missing optical_evidence or sar_evidence in response');
    }
    if (!data.models.includes('optical_sar_fusion')) {
      throw new Error('Cross-modal model missing from models');
    }
    if (!data.water_regions && !data.built_up_regions) {
      throw new Error('Expected water_regions or built_up_regions in cross-modal response');
    }
  });

  // 10. Agentic Query Orchestrator with Execution Trace (POST /api/agent/query)
  await test('10. Agentic Query Orchestrator - Dynamic Task Decomposition & Trace', async () => {
    const form = new FormData();
    form.append('files', new Blob([opt1Buffer], { type: 'image/tiff' }), 'test_optical_t1.tif');
    form.append('query', 'Detect buildings and evaluate NDVI vegetation density in this scene');
    form.append('mode', 'auto');
    const res = await fetch(`${BASE}/agent/query`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Agent query failed: ${data.message}`);
    if (!Array.isArray(data.execution_trace) || data.execution_trace.length < 4) {
      throw new Error('Execution trace is incomplete');
    }
    const traceSteps = data.execution_trace.map(t => t.step);
    if (!traceSteps.some(s => s.includes('Validation'))) throw new Error('Trace missing Validation step');
    if (!traceSteps.some(s => s.includes('Determined primary') || s.includes('Task'))) throw new Error('Trace missing Task Planner step');
    if (!traceSteps.some(s => s.includes('Dispatching') || s.includes('Specialist model'))) throw new Error('Trace missing Specialist Model Execution step');
  });

  console.log(`\n========================================`);
  console.log(`🏁 SIH Pipeline Results: ${passed}/${total} passed.`);
  if (passed === total) {
    console.log('🎉 ALL SIH PROBLEM STATEMENT 26167 TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(`⚠️ ${total - passed} tests failed.`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
