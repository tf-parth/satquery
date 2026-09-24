// SatQuery AI - India-Wide Curated Satellite Datasets
// Representative real Indian geographic locations with authentic coordinates, CRS, sensors, and ground-truth features.

export const INDIA_DEMO_SCENES = [
  {
    id: "mumbai_coastal",
    region: "West India",
    state: "Maharashtra",
    district: "Mumbai City",
    title: "Mumbai Coastal Road & Urban Land Reclamation",
    title_hi: "मुंबई तटीय सड़क और शहरी भूमि सुधार",
    location: "Mumbai Shoreline, Maharashtra",
    coordinates: { lat: 18.9712, lng: 72.8091 },
    crs: "EPSG:32643 (WGS 84 / UTM Zone 43N)",
    bounds: [72.785, 18.945, 72.835, 18.995],
    resolution: "0.5m (High-Resolution Optical)",
    sensor: "WorldView-3 / Cartosat-3 High-Res Optical",
    acquisitionDate: "2024-03-12",
    bands: ["Red", "Green", "Blue", "NIR", "Panchromatic"],
    previewUrl: "/assets/demo/mumbai_coastal_2024.jpg",
    comparisonUrl: "/assets/demo/mumbai_coastal_2019.jpg",
    comparisonDate: "2019-02-18",
    description: "High-density coastal infrastructure showing newly reclaimed arterial road, high-rise buildings, seawall, and Arabian Sea tidal interface.",
    description_hi: "नव-निर्मित मुख्य तटीय सड़क, गगनचुंबी इमारतों, समुद्री दीवार और अरब सागर ज्वारीय सीमा को दर्शाने वाला उच्च-घनत्व तटीय बुनियादी ढांचा।",
    defaultQueries: [
      "Find all buildings along the coast",
      "How much urban reclamation has occurred?",
      "Identify roads and seawall structures",
      "इस image में buildings और roads कहाँ हैं?"
    ],
    features: {
      buildingsCount: 42,
      roadsCount: 8,
      waterCoverPercent: 34.6,
      builtUpPercent: 54.2,
      vegetationPercent: 11.2,
      changeStatus: "Significant land reclamation (+18.4 ha newly built area compared to 2019)",
      changeStatus_hi: "महत्वपूर्ण भूमि सुधार (2019 की तुलना में +18.4 हेक्टेयर नव-निर्मित क्षेत्र)"
    }
  },
  {
    id: "assam_brahmaputra",
    region: "Northeast India",
    state: "Assam",
    district: "Golaghat / Nagaon",
    title: "Brahmaputra Valley Flood Inundation & River Braiding",
    title_hi: "ब्रह्मपुत्र घाटी बाढ़ जलमग्नता और नदी विन्यास",
    location: "Kaziranga / Brahmaputra Basin, Assam",
    coordinates: { lat: 26.6854, lng: 93.3512 },
    crs: "EPSG:32646 (WGS 84 / UTM Zone 46N)",
    bounds: [93.28, 26.62, 93.42, 26.75],
    resolution: "10m (Multispectral & Synthetic Aperture Radar)",
    sensor: "Sentinel-1 C-SAR (VV/VH) & Sentinel-2 MSI",
    acquisitionDate: "2024-07-28",
    bands: ["SAR-VV", "SAR-VH", "B02-Blue", "B03-Green", "B04-Red", "B08-NIR", "B11-SWIR1"],
    previewUrl: "/assets/demo/assam_flood_2024.jpg",
    comparisonUrl: "/assets/demo/assam_preflood_2024.jpg",
    comparisonDate: "2024-04-15",
    description: "Severe seasonal monsoon inundation along the Brahmaputra floodplains. Optical cloud cover bypassed via Sentinel-1 SAR radar backscatter.",
    description_hi: "ब्रह्मपुत्र के बाढ़ के मैदानों में गंभीर मानसूनी जलभराव। सेंटिनल-1 एसएआर रडार द्वारा बादलों के पार जल विस्तार का सटीक मापन।",
    defaultQueries: [
      "Show flood impact and inundated areas",
      "Which settlements appear affected?",
      "Compare before and after monsoon flood",
      "बाढ़ का कितना प्रभाव और जल विस्तार हुआ है?"
    ],
    disasterInfo: {
      type: "Monsoon Flood Inundation",
      disasterStatus: "ACTIVE_OBSERVATION",
      inundationHectares: 14280,
      confidence: "CONFIRMED_BY_SAR_AND_NDWI",
      affectedHabitationsCount: 16,
      sarPenetration: "Cloud cover 88%; penetrated successfully via 5.405 GHz C-band radar"
    },
    features: {
      buildingsCount: 19,
      roadsCount: 5,
      waterCoverPercent: 62.4,
      builtUpPercent: 8.1,
      vegetationPercent: 29.5,
      changeStatus: "Water surface expanded by +38.6% relative to pre-monsoon baseline",
      changeStatus_hi: "मानसून पूर्व की तुलना में जल सतह में +38.6% का विस्तार देखा गया"
    }
  },
  {
    id: "rajasthan_bhadla",
    region: "Northwest India",
    state: "Rajasthan",
    district: "Phalodi",
    title: "Bhadla Solar Park & Thar Desert Renewable Infrastructure",
    title_hi: "भादला सोलर पार्क और थार रेगिस्तान सौर अवसंरचना",
    location: "Bhadla, Thar Desert, Rajasthan",
    coordinates: { lat: 27.5389, lng: 71.9167 },
    crs: "EPSG:32643 (WGS 84 / UTM Zone 43N)",
    bounds: [71.85, 27.48, 71.98, 27.59],
    resolution: "10m (Sentinel-2 MSI) / 3m (PlanetScope)",
    sensor: "Sentinel-2 MSI / Landsat-9 OLI-2",
    acquisitionDate: "2024-05-10",
    bands: ["B02-Blue", "B03-Green", "B04-Red", "B08-NIR", "B11-SWIR1", "B12-SWIR2"],
    previewUrl: "/assets/demo/rajasthan_solar_2024.jpg",
    comparisonUrl: "/assets/demo/rajasthan_solar_2016.jpg",
    comparisonDate: "2016-11-20",
    description: "World's largest photovoltaic installation spread over 14,000 acres of arid desert, with deep low-albedo photovoltaic signatures.",
    description_hi: "14,000 एकड़ शुष्क रेगिस्तान में फैला विश्व का विशालतम सौर पार्क, जिसमें सौर पैनलों की विशिष्ट परावर्तकता दिखाई देती है।",
    defaultQueries: [
      "Detect all solar panel arrays and grids",
      "How much barren land was converted?",
      "Are there access roads visible?",
      "यहाँ सोलर पैनल और ग्रिड कहाँ स्थित हैं?"
    ],
    features: {
      buildingsCount: 68,
      roadsCount: 22,
      waterCoverPercent: 0.8,
      builtUpPercent: 67.4,
      vegetationPercent: 2.1,
      changeStatus: "Arid scrub converted to 2,245 MW utility-scale solar grid infrastructure",
      changeStatus_hi: "शुष्क बंजर भूमि 2,245 मेगावाट के सौर ऊर्जा बुनियादी ढांचे में रूपांतरित"
    }
  },
  {
    id: "sundarbans_mangrove",
    region: "East India",
    state: "West Bengal",
    district: "South 24 Parganas",
    title: "Sundarbans Biosphere Reserve & Mangrove Tidal Estuaries",
    title_hi: "सुंदरबन बायोस्फीयर रिजर्व और मैंग्रोव ज्वारीय डेल्टा",
    location: "Sundarbans Delta, West Bengal",
    coordinates: { lat: 21.9497, lng: 88.8542 },
    crs: "EPSG:32645 (WGS 84 / UTM Zone 45N)",
    bounds: [88.78, 21.88, 88.94, 22.02],
    resolution: "10m (Sentinel-2 MultiSpectral)",
    sensor: "Sentinel-2 MSI Level-2A BOA",
    acquisitionDate: "2024-02-24",
    bands: ["B02-Blue", "B03-Green", "B04-Red", "B05-RedEdge1", "B08-NIR", "B11-SWIR"],
    previewUrl: "/assets/demo/sundarbans_mangrove_2024.jpg",
    comparisonUrl: "/assets/demo/sundarbans_mangrove_2020.jpg",
    comparisonDate: "2020-05-30",
    description: "Pristine halophytic mangrove forest crisscrossed by dynamic brackish tidal creeks and intertidal mudflats.",
    description_hi: "नमकीन ज्वारीय खाड़ियों और कीचड़ के मैदानों से घिरा प्राकृतिक मैंग्रोव वन, उच्च एनडीवीआई जैव-संकेतक के साथ।",
    defaultQueries: [
      "Where is dense mangrove vegetation?",
      "Identify tidal water channels",
      "Is there coastal erosion visible?",
      "मैंग्रोव वन और जल धाराओं का विश्लेषण करें"
    ],
    features: {
      buildingsCount: 0,
      roadsCount: 1,
      waterCoverPercent: 41.5,
      builtUpPercent: 1.2,
      vegetationPercent: 57.3,
      changeStatus: "Minor intertidal accretion on outer sandbars, stable interior canopy",
      changeStatus_hi: "बाहरी रेत के टीलों पर हल्का विस्तार, आंतरिक वन क्षेत्र स्थिर"
    }
  },
  {
    id: "bengaluru_tech",
    region: "South India",
    state: "Karnataka",
    district: "Bengaluru Urban",
    title: "Bengaluru Outer Ring Road & Bellandur Lake Catchment",
    title_hi: "बेंगलुरु आउटर रिंग रोड और बेल्लंदूर झील क्षेत्र",
    location: "Bellandur / Sarjapur Corridor, Bengaluru, Karnataka",
    coordinates: { lat: 12.9298, lng: 77.6848 },
    crs: "EPSG:32643 (WGS 84 / UTM Zone 43N)",
    bounds: [77.65, 12.90, 77.72, 12.96],
    resolution: "0.8m (Cartosat-2/3 & Sentinel-2 Blend)",
    sensor: "Cartosat-3 / Sentinel-2 MSI",
    acquisitionDate: "2024-04-02",
    bands: ["Red", "Green", "Blue", "NIR"],
    previewUrl: "/assets/demo/bengaluru_tech_2024.jpg",
    comparisonUrl: "/assets/demo/bengaluru_tech_2015.jpg",
    comparisonDate: "2015-03-14",
    description: "Rapidly expanding IT corridor with tech campuses, multi-lane ring roads, high-density residential towers, and urban wetlands.",
    description_hi: "आईटी पार्क, बहु-लेन रिंग रोड, आवासीय टावरों और बेल्लंदूर झील के साथ तेजी से विकसित शहरी गलियारा।",
    defaultQueries: [
      "Find all commercial and residential buildings",
      "What is the condition of the lake and buffer zone?",
      "Trace major arterial roads",
      "यहाँ झील के आसपास कितना निर्माण हुआ है?"
    ],
    features: {
      buildingsCount: 84,
      roadsCount: 14,
      waterCoverPercent: 12.3,
      builtUpPercent: 68.7,
      vegetationPercent: 19.0,
      changeStatus: "Significant built-up densification (+31.2% building footprint since 2015)",
      changeStatus_hi: "शहरीकरण में भारी वृद्धि (2015 से निर्मित क्षेत्र में +31.2% की वृद्धि)"
    }
  },
  {
    id: "punjab_agriculture",
    region: "North India",
    state: "Punjab",
    district: "Ludhiana",
    title: "Punjab Agricultural Heartland & Crop Phenology",
    title_hi: "पंजाब कृषि क्षेत्र और फसल चक्र",
    location: "Ludhiana Plain, Punjab",
    coordinates: { lat: 30.9010, lng: 75.8573 },
    crs: "EPSG:32643 (WGS 84 / UTM Zone 43N)",
    bounds: [75.80, 30.85, 75.92, 30.96],
    resolution: "10m (Sentinel-2 MSI)",
    sensor: "Sentinel-2 MSI Level-2A",
    acquisitionDate: "2024-03-20",
    bands: ["B02-Blue", "B03-Green", "B04-Red", "B08-NIR", "B11-SWIR1"],
    previewUrl: "/assets/demo/punjab_agri_2024.jpg",
    comparisonUrl: "/assets/demo/punjab_agri_postharvest.jpg",
    comparisonDate: "2023-10-25",
    description: "Rectangular irrigated farm parcels during peak wheat maturity, showcasing strong near-infrared canopy reflection and canal irrigation network.",
    description_hi: "गेहूं की फसल की परिपक्वता के दौरान आयताकार सिंचित खेत, उच्च एनडीवीआई परावर्तन और नहर प्रणाली के साथ।",
    defaultQueries: [
      "Identify high-density vegetation and healthy crops",
      "Where are irrigation canals?",
      "Calculate vegetation index (NDVI)",
      "स्वस्थ फसलें और सिंचित क्षेत्र कहाँ हैं?"
    ],
    features: {
      buildingsCount: 12,
      roadsCount: 9,
      waterCoverPercent: 3.4,
      builtUpPercent: 7.2,
      vegetationPercent: 89.4,
      changeStatus: "Peak crop vigor (NDVI > 0.72) contrasted with post-harvest stubble period",
      changeStatus_hi: "चरम फसल स्वास्थ्य (NDVI > 0.72), कटाई के बाद के मौसम से स्पष्ट अंतर"
    }
  }
];

import { 
  ALL_INDIAN_STATES_UTS, 
  PROMINENT_INDIAN_LOCATIONS, 
  getSatelliteSnapshotUrl, 
  getUtmCrsForLng 
} from './indiaGeocodingService.js';

/**
 * Builds a dynamic, fully-featured satellite scene object for any Indian location or coordinate.
 */
export function buildDynamicScene(loc) {
  const lat = loc.lat;
  const lng = loc.lng;
  const delta = 0.045;
  const bounds = [
    Number((lng - delta).toFixed(5)),
    Number((lat - delta * 0.75).toFixed(5)),
    Number((lng + delta).toFixed(5)),
    Number((lat + delta * 0.75).toFixed(5))
  ];

  const crs = getUtmCrsForLng(lng);
  const previewUrl = loc.previewUrl || getSatelliteSnapshotUrl(lat, lng, delta);

  const isCoast = (loc.terrain || '').toLowerCase().includes("coast") || (loc.terrain || '').toLowerCase().includes("port") || (loc.terrain || '').toLowerCase().includes("delta");
  const isForest = (loc.terrain || '').toLowerCase().includes("forest") || (loc.terrain || '').toLowerCase().includes("canopy") || (loc.terrain || '').toLowerCase().includes("ghat");
  const isDesert = (loc.terrain || '').toLowerCase().includes("desert") || (loc.terrain || '').toLowerCase().includes("arid");

  let waterPercent = isCoast ? 36.4 : (isForest ? 12.5 : 8.2);
  let vegPercent = isForest ? 62.4 : (isDesert ? 4.8 : 34.6);
  let builtUpPercent = (loc.type || '').toLowerCase().includes("capital") || (loc.type || '').toLowerCase().includes("metro") || (loc.type || '').toLowerCase().includes("city") ? 46.2 : 18.5;
  let barrenPercent = isDesert ? 72.4 : Math.max(2, Number((100 - waterPercent - vegPercent - builtUpPercent).toFixed(1)));

  return {
    id: `loc_${(loc.name || 'custom').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    region: loc.zone ? `${loc.zone} India` : "India",
    state: loc.state || loc.name,
    district: loc.district || loc.name,
    title: `${loc.name} Satellite Observation`,
    title_hi: `${loc.name_hi || loc.name} उपग्रह अवलोकन`,
    location: `${loc.name}, ${loc.state || 'India'}`,
    type: loc.type || "Territory",
    terrain: loc.terrain || "Pan-India Earth Observation Landscape",
    coordinates: { lat, lng },
    bounds,
    crs,
    resolution: "10m (Sentinel-2 MSI Level-2A) / 0.5m (Cartosat-3 Optical)",
    sensor: loc.primarySensors ? loc.primarySensors.join(" / ") : "ISRO Cartosat-3 / Sentinel-2 MSI",
    acquisitionDate: new Date().toISOString().split("T")[0],
    bands: ["Red", "Green", "Blue", "NIR", "SWIR1", "SAR-C"],
    previewUrl,
    comparisonUrl: previewUrl,
    comparisonDate: "2020-01-15",
    description: `High-resolution multispectral earth observation scene over ${loc.name}, ${loc.state || 'India'}. Terrain context: ${loc.terrain || 'Indian terrestrial landscape'}.`,
    description_hi: `${loc.name_hi || loc.name}, ${loc.state || 'भारत'} का उच्च-रिज़ॉल्यूशन उपग्रह दृश्य। स्थलाकृति: ${loc.terrain || 'भारतीय भू-भाग'}।`,
    defaultQueries: [
      `Analyze infrastructure and land cover in ${loc.name}`,
      `Detect water bodies and vegetation in ${loc.name}`,
      `Calculate vegetation index (NDVI) for ${loc.name}`,
      `${loc.name_hi || loc.name} में निर्माण और जल निकायों की पहचान करें`
    ],
    features: {
      buildingsCount: Math.round(builtUpPercent * 0.8),
      roadsCount: Math.round(builtUpPercent * 0.25),
      waterCoverPercent: Number(waterPercent.toFixed(1)),
      builtUpPercent: Number(builtUpPercent.toFixed(1)),
      vegetationPercent: Number(vegPercent.toFixed(1)),
      barrenPercent,
      changeStatus: `Active monitoring scene for ${loc.name}`,
      changeStatus_hi: `${loc.name_hi || loc.name} के लिए सक्रिय उपग्रह निगरानी दृश्य`
    }
  };
}

// Helper to look up or dynamically construct scene by id, name, or coordinates
export function getDemoScene(idOrName) {
  if (!idOrName) {
    return INDIA_DEMO_SCENES[0];
  }

  // 1. Direct match in curated demo scenes
  const exactDemo = INDIA_DEMO_SCENES.find(s => s.id === idOrName);
  if (exactDemo) return exactDemo;

  const str = String(idOrName).trim();
  const lower = str.toLowerCase();

  // 2. Partial match in curated demo scenes
  const partialDemo = INDIA_DEMO_SCENES.find(s => 
    s.location.toLowerCase().includes(lower) ||
    s.state.toLowerCase().includes(lower) ||
    s.district.toLowerCase().includes(lower) ||
    lower.includes(s.id) ||
    lower.includes(s.state.toLowerCase())
  );
  if (partialDemo) return partialDemo;

  // 3. Match in Prominent Indian Cities & Districts
  for (const loc of PROMINENT_INDIAN_LOCATIONS) {
    const locId = `loc_${loc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if (lower === locId || lower === loc.name.toLowerCase() || (loc.name_hi && str.includes(loc.name_hi)) || lower.includes(loc.name.toLowerCase())) {
      return buildDynamicScene(loc);
    }
  }

  // 4. Match in All 28 States & 8 UTs
  for (const st of ALL_INDIAN_STATES_UTS) {
    const stId = `loc_${st.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if (lower === stId || lower === st.name.toLowerCase() || (st.name_hi && str.includes(st.name_hi)) || lower.includes(st.name.toLowerCase())) {
      return buildDynamicScene(st);
    }
  }

  // 5. Check if coordinate string
  const coordMatch = str.match(/lat(?:itude)?[:\s]+(-?\d+\.\d+)[\s,]+(?:lng|lon(?:gitude)?)[:\s]+(-?\d+\.\d+)/i) ||
                     str.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);

    return buildDynamicScene({
      name: `Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
      name_hi: `निर्देशांक (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
      lat,
      lng,
      type: "Coordinates",
      state: "India",
      terrain: "Custom Geographic Point"
    });
  }

  // 6. National View centroid (All India) instead of hardcoding to Mumbai
  return buildDynamicScene({
    name: "National View — All India",
    name_hi: "अखिल भारतीय दृष्टिकोण",
    lat: 22.9734,
    lng: 78.6569,
    type: "National Domain",
    state: "India",
    terrain: "Pan-India Earth Observation Mosaic"
  });
}

// Indian states, UTs, key districts, and major cities with centroids for nationwide search and zoom
export const INDIA_ADMIN_REGIONS = [
  // All 28 States & 8 Union Territories
  ...ALL_INDIAN_STATES_UTS.map(st => ({
    name: st.name,
    name_hi: st.name_hi,
    lat: st.lat,
    lng: st.lng,
    type: st.type,
    zone: st.zone,
    terrain: st.terrain,
    demoId: `loc_${st.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  })),

  // Prominent Cities & Districts
  ...PROMINENT_INDIAN_LOCATIONS.map(loc => ({
    name: loc.name,
    name_hi: loc.name_hi,
    state: loc.state,
    lat: loc.lat,
    lng: loc.lng,
    type: loc.type,
    terrain: loc.terrain,
    demoId: `loc_${loc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  }))
];

