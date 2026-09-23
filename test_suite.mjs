// SatQuery AI - Automated Verification Test Suite
console.log('🧪 Starting SatQuery AI Automated Verification Test Suite...\n');

const BASE = 'http://localhost:5000/api/v1';

async function runTests() {
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

  // 1. Health check
  await test('Health check returns HEALTHY and locked stack', async () => {
    const res = await fetch('http://localhost:5000/api/healthz');
    const data = await res.json();
    if (data.status !== 'HEALTHY') throw new Error(`Unexpected status: ${data.status}`);
    if (!data.lockedTechnicalStack.some(m => m.includes('GeoChat'))) throw new Error('GeoChat missing');
    if (!data.lockedTechnicalStack.some(m => m.includes('GroundingDINO'))) throw new Error('GroundingDINO missing');
    if (!data.lockedTechnicalStack.some(m => m.includes('SAM2'))) throw new Error('SAM2 missing');
  });

  // 2. Object detection on Mumbai scene
  await test('Image Analysis - GroundingDINO & SAM2 Building Detection', async () => {
    const res = await fetch(`${BASE}/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Find all buildings along the coast',
        language: 'en',
        demoId: 'mumbai_coastal'
      })
    });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Status not SUCCESS: ${data.status}`);
    if (!data.answer.includes('building')) throw new Error('Answer missing buildings');
    if (!data.modelsUsed.includes('GroundingDINO')) throw new Error('GroundingDINO not in modelsUsed');
    if (!data.modelsUsed.includes('SAM2 / SamGeo')) throw new Error('SAM2 not in modelsUsed');
    if (data.detections.length === 0) throw new Error('No detections returned');
    if (data.evidence.length === 0) throw new Error('No evidence returned');
  });

  // 3. Hindi query on Sundarbans mangrove
  await test('Bilingual Support - Authentic Hindi Query & Response', async () => {
    const res = await fetch(`${BASE}/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'इस image में vegetation कहाँ है?',
        language: 'hi',
        demoId: 'sundarbans_mangrove'
      })
    });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error(`Status not SUCCESS`);
    if (data.language !== 'hi') throw new Error(`Expected language hi, got ${data.language}`);
    if (!/[\u0900-\u097F]/.test(data.answer)) throw new Error('Answer not in Devanagari Hindi');
    if (!data.modelsUsed.includes('NDVI')) throw new Error('NDVI not used for vegetation query');
  });

  // 4. Disaster & flood analysis on Assam Brahmaputra
  await test('Disaster Mode - Assam Flood SARAS-Net & NDWI Analysis', async () => {
    const res = await fetch(`${BASE}/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Show flood impact and inundated areas',
        language: 'en',
        demoId: 'assam_brahmaputra'
      })
    });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error('Status not SUCCESS');
    if (!data.modelsUsed.includes('SARAS-Net')) throw new Error('SARAS-Net not routed');
    if (!data.modelsUsed.includes('NDWI')) throw new Error('NDWI not routed');
    if (!data.answer.includes('14,280')) throw new Error('Inundation area measurement missing');
  });

  // 5. India geographic query without image
  await test('Pan-India Geographic Query - Punjab Agricultural Crops', async () => {
    const res = await fetch(`${BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Identify high-density vegetation and healthy crops in Punjab',
        language: 'en'
      })
    });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error('Status not SUCCESS');
    if (!data.matchedRegion) throw new Error('Matched region missing');
    if (!data.answer.includes('Vegetation')) throw new Error('Vegetation answer missing');
  });

  // 6. Two-image bi-temporal change comparison
  await test('Comparison Mode - ChangeFormer Bi-Temporal Analysis', async () => {
    const res = await fetch(`${BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demoId: 'mumbai_coastal',
        query: 'What changed between 2019 and 2024?',
        language: 'en'
      })
    });
    const data = await res.json();
    if (data.status !== 'SUCCESS') throw new Error('Status not SUCCESS');
    if (!data.modelsUsed.includes('rschange / ChangeFormer')) throw new Error('ChangeFormer missing');
    if (!data.metrics || !data.metrics.changeCategories) throw new Error('Metrics missing');
    const builtUpCat = data.metrics.changeCategories.find(c => c.label.includes('Built-up'));
    if (!builtUpCat || builtUpCat.deltaHa !== 18.4) throw new Error('Expected +18.4 ha built-up gain');
  });

  // 7. Multi-turn conversational investigation memory
  await test('Conversational Memory - Multi-Turn Investigation Thread', async () => {
    // Turn 1
    const res1 = await fetch(`${BASE}/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Find buildings along the coast',
        sceneId: 'mumbai_coastal',
        language: 'en'
      })
    });
    const data1 = await res1.json();
    if (data1.conversationLength !== 2) throw new Error('Turn 1 length mismatch');
    const invId = data1.investigationId;

    // Turn 2
    const res2 = await fetch(`${BASE}/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investigationId: invId,
        query: 'Which structures are largest?',
        sceneId: 'mumbai_coastal',
        language: 'en'
      })
    });
    const data2 = await res2.json();
    if (data2.conversationLength !== 4) throw new Error(`Turn 2 length mismatch: ${data2.conversationLength}`);
    if (data2.conversationHistory[0].text !== 'Find buildings along the coast') throw new Error('Context not preserved');
  });

  console.log(`\n🏁 Test Results: ${passed}/${total} passed.`);
  if (passed === total) {
    console.log('🎉 ALL SATQUERY AI VERIFICATION TESTS PASSED!');
  } else {
    process.exit(1);
  }
}

runTests();
