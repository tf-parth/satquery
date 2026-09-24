// SatQuery AI - Persistent Investigation History & Saved Items Storage
// Manages local state restoration, seeding, duplication, and saved items across turns.

const STORAGE_KEY = 'satquery_investigation_history_v2';
const SAVED_LOCATIONS_KEY = 'satquery_saved_locations_v2';

// Seed Indian investigations representing nationwide diverse satellite tasks
const SEED_INVESTIGATIONS = [
  {
    id: "inv_mumbai_coastal_01",
    title: "Urban Expansion Analysis",
    title_hi: "शहरी विस्तार एवं भूमि सुधार विश्लेषण",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    dateTime: "12 Nov 2024 • 04:32 PM",
    timestamp: 1731429120000,
    type: "Change Detection",
    status: "COMPLETED",
    thumbnail: "/assets/demo/mumbai_coastal_2024.jpg",
    query: "Find buildings along newly reclaimed shoreline and measure urban growth",
    sceneId: "mumbai_coastal",
    aoi: { type: "BBox", coordinates: [72.785, 18.945, 72.835, 18.995] },
    findings: "SatQuery detected 42 building-like structures and +18.4 ha of reclaimed land footprint along the coastal artery.",
    evidenceStatus: "Verified Optical & Spectral",
    modelsUsed: ["GroundingDINO", "SAM2 / SamGeo", "rschange / ChangeFormer"],
    isSaved: true
  },
  {
    id: "inv_assam_flood_02",
    title: "Flood Impact Assessment",
    title_hi: "बाढ़ प्रभाव एवं जलमग्नता मूल्यांकन",
    location: "Kaziranga Basin, Assam",
    state: "Assam",
    dateTime: "11 Nov 2024 • 02:18 PM",
    timestamp: 1731334680000,
    type: "Disaster Analysis",
    status: "COMPLETED",
    thumbnail: "/assets/demo/assam_flood_2024.jpg",
    query: "Show flood impact in Kaziranga and surrounding villages",
    sceneId: "assam_brahmaputra",
    aoi: { type: "Point", coordinates: [93.3512, 26.6854] },
    findings: "14,280 hectares of inundated terrain verified via Sentinel-1 C-SAR radar backscatter attenuation (< -18.2 dB).",
    evidenceStatus: "Confirmed by C-SAR & NDWI",
    modelsUsed: ["SARAS-Net", "NDWI", "GeoChat"],
    isSaved: true
  },
  {
    id: "inv_rajasthan_solar_03",
    title: "Solar Grid Array Detection",
    title_hi: "सौर ऊर्जा ग्रिड एवं भूमि रूपांतरण",
    location: "Bhadla, Thar Desert, Rajasthan",
    state: "Rajasthan",
    dateTime: "10 Nov 2024 • 11:05 AM",
    timestamp: 1731236700000,
    type: "Object Detection",
    status: "COMPLETED",
    thumbnail: "/assets/demo/rajasthan_solar_2024.jpg",
    query: "Detect all solar panel arrays and grids in Bhadla",
    sceneId: "rajasthan_bhadla",
    aoi: { type: "Point", coordinates: [71.9167, 27.5389] },
    findings: "Mapped 68 utility-scale photovoltaic grid array rows across 14,000 acres of arid desert scrub.",
    evidenceStatus: "High Albedo Contrast Match",
    modelsUsed: ["GroundingDINO", "SatCLIP"],
    isSaved: false
  },
  {
    id: "inv_sundarbans_mangrove_04",
    title: "Mangrove Canopy & Tidal Creeks",
    title_hi: "मैंग्रोव वन घनत्व एवं ज्वारीय धाराएँ",
    location: "Sundarbans Biosphere, West Bengal",
    state: "West Bengal",
    dateTime: "09 Nov 2024 • 03:45 PM",
    timestamp: 1731167100000,
    type: "Vegetation",
    status: "COMPLETED",
    thumbnail: "/assets/demo/sundarbans_mangrove_2024.jpg",
    query: "Where is dense mangrove vegetation and tidal channels?",
    sceneId: "sundarbans_mangrove",
    aoi: { type: "Point", coordinates: [88.8542, 21.9497] },
    findings: "High NDVI canopy density (0.78-0.84) across 57.3% of delta area, stable interior core with minor intertidal accretion.",
    evidenceStatus: "NDVI Spectral Synthesis",
    modelsUsed: ["NDVI", "NDWI", "GeoChat"],
    isSaved: true
  },
  {
    id: "inv_bengaluru_lake_05",
    title: "Urban Lake Catchment Encroachment",
    title_hi: "शहरी झील एवं बफर जोन निर्माण ऑडिट",
    location: "Bellandur Corridor, Bengaluru, Karnataka",
    state: "Karnataka",
    dateTime: "08 Nov 2024 • 01:12 PM",
    timestamp: 1731071520000,
    type: "Image Analysis",
    status: "COMPLETED",
    thumbnail: "/assets/demo/bengaluru_tech_2024.jpg",
    query: "Find all commercial buildings and check lake buffer zone",
    sceneId: "bengaluru_tech",
    aoi: { type: "Point", coordinates: [77.6848, 12.9298] },
    findings: "84 commercial and residential buildings detected; +31.2% building footprint densification near lake buffer since 2015.",
    evidenceStatus: "Verified Geometry & NDBI",
    modelsUsed: ["GroundingDINO", "SAM2 / SamGeo", "NDBI"],
    isSaved: false
  },
  {
    id: "inv_punjab_crop_06",
    title: "Crop Phenology & Canal Irrigation",
    title_hi: "गेहूं फसल स्वास्थ्य एवं नहर प्रणाली",
    location: "Ludhiana Plain, Punjab",
    state: "Punjab",
    dateTime: "07 Nov 2024 • 10:20 AM",
    timestamp: 1730974800000,
    type: "Vegetation",
    status: "COMPLETED",
    thumbnail: "/assets/demo/punjab_agri_2024.jpg",
    query: "Identify high-density vegetation and healthy crops in Punjab",
    sceneId: "punjab_agriculture",
    aoi: { type: "Point", coordinates: [75.8573, 30.9010] },
    findings: "Peak wheat crop vigor (mean NDVI 0.84) across rectangular canal-fed agricultural parcels.",
    evidenceStatus: "NDVI Spectral Index",
    modelsUsed: ["NDVI", "GeoChat"],
    isSaved: false
  }
];

// Seed Saved Locations Across India
const SEED_SAVED_LOCATIONS = [
  { id: "loc_india", name: "India — National View", name_hi: "अखिल भारतीय दृश्य", state: "All India", lat: 22.9734, lng: 78.6569, zoom: 5 },
  { id: "loc_mh", name: "Maharashtra (Mumbai Coast)", name_hi: "महाराष्ट्र (मुंबई तट)", state: "Maharashtra", lat: 18.9712, lng: 72.8091, zoom: 12, sceneId: "mumbai_coastal" },
  { id: "loc_as", name: "Assam (Brahmaputra Valley)", name_hi: "असम (ब्रह्मपुत्र घाटी)", state: "Assam", lat: 26.6854, lng: 93.3512, zoom: 11, sceneId: "assam_brahmaputra" },
  { id: "loc_rj", name: "Rajasthan (Thar Solar Basin)", name_hi: "राजस्थान (थार सौर बेसिन)", state: "Rajasthan", lat: 27.5389, lng: 71.9167, zoom: 12, sceneId: "rajasthan_bhadla" },
  { id: "loc_wb", name: "West Bengal (Sundarbans)", name_hi: "पश्चिम बंगाल (सुंदरबन)", state: "West Bengal", lat: 21.9497, lng: 88.8542, zoom: 11, sceneId: "sundarbans_mangrove" },
  { id: "loc_ka", name: "Karnataka (Bengaluru Tech Corridor)", name_hi: "कर्नाटक (बेंगलुरु टेक कॉरिडोर)", state: "Karnataka", lat: 12.9298, lng: 77.6848, zoom: 13, sceneId: "bengaluru_tech" },
  { id: "loc_pb", name: "Punjab (Agricultural Plains)", name_hi: "पंजाब (कृषि क्षेत्र)", state: "Punjab", lat: 30.9010, lng: 75.8573, zoom: 11, sceneId: "punjab_agriculture" },
  { id: "loc_custom", name: "Custom AOI — Project Site", name_hi: "कस्टम AOI — प्रोजेक्ट साइट", state: "Custom", lat: 28.5355, lng: 77.3910, zoom: 13 }
];

export function getStoredInvestigations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INVESTIGATIONS));
      return SEED_INVESTIGATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Error reading localStorage investigations:", e);
    return SEED_INVESTIGATIONS;
  }
}

export function saveInvestigation(inv) {
  try {
    const list = getStoredInvestigations();
    const existingIdx = list.findIndex(item => item.id === inv.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = { ...updated[existingIdx], ...inv, timestamp: Date.now() };
    } else {
      updated = [inv, ...list];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving investigation:", e);
    return getStoredInvestigations();
  }
}

export function deleteInvestigation(id) {
  try {
    const list = getStoredInvestigations();
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error("Error deleting investigation:", e);
    return getStoredInvestigations();
  }
}

export function duplicateInvestigation(id) {
  try {
    const list = getStoredInvestigations();
    const target = list.find(item => item.id === id);
    if (!target) return list;
    const now = new Date();
    const duplicate = {
      ...target,
      id: `inv_copy_${Date.now()}`,
      title: `${target.title} (Copy)`,
      title_hi: `${target.title_hi || target.title} (प्रतिलिपि)`,
      dateTime: `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: Date.now(),
      status: "COMPLETED"
    };
    const updated = [duplicate, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error duplicating investigation:", e);
    return getStoredInvestigations();
  }
}

export function renameInvestigation(id, newTitle) {
  try {
    const list = getStoredInvestigations();
    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, title: newTitle, title_hi: newTitle };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error renaming investigation:", e);
    return getStoredInvestigations();
  }
}

export function toggleSaveInvestigation(id) {
  try {
    const list = getStoredInvestigations();
    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, isSaved: !item.isSaved };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error toggling save status:", e);
    return getStoredInvestigations();
  }
}

export function clearAllInvestigations() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error("Error clearing investigations:", e);
    return [];
  }
}

export function getStoredSavedLocations() {
  try {
    const raw = localStorage.getItem(SAVED_LOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(SEED_SAVED_LOCATIONS));
      return SEED_SAVED_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_SAVED_LOCATIONS;
  }
}
