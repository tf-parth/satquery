// SatQuery AI - Home Dashboard Component
// Exact match to reference screenshot & GIS specification:
// Center: Hero + Interactive India Satellite Map over Query Workspace
// Right: Recent Investigations + Saved Locations
// Bottom: System Ready status bar

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Search, 
  UploadCloud, 
  Compass, 
  BookOpen, 
  Lightbulb, 
  Building2, 
  Trees, 
  Droplets, 
  Scale, 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  PenTool, 
  Ruler, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  Trash2, 
  ChevronRight,
  Globe,
  Mountain,
  Target,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { INDIA_DEMO_SCENES, INDIA_ADMIN_REGIONS, getDemoScene } from '../../../backend/src/services/demoData.js';

// Comprehensive Indian States & UTs with metadata
const INDIAN_STATES_GIS = [
  { name: "Jammu & Kashmir", coords: [33.7782, 75.2500], districts: "20 Districts", latestDate: "14 Mar 2024", availableImagery: "Cartosat-3, Sentinel-2" },
  { name: "Ladakh", coords: [34.1526, 77.5771], districts: "2 Districts", latestDate: "12 Mar 2024", availableImagery: "Sentinel-1 SAR, Sentinel-2" },
  { name: "Himachal Pradesh", coords: [31.8000, 77.1734], districts: "12 Districts", latestDate: "15 Mar 2024", availableImagery: "Sentinel-2 (10m), Landsat-9" },
  { name: "Punjab", coords: [31.1471, 75.3412], districts: "23 Districts", latestDate: "20 Mar 2024", availableImagery: "Sentinel-2 MSI Level-2A", demoId: "punjab_agriculture" },
  { name: "Haryana", coords: [29.2588, 76.0856], districts: "22 Districts", latestDate: "18 Mar 2024", availableImagery: "Sentinel-2, Resourcesat-2" },
  { name: "Delhi", coords: [28.7041, 77.1025], districts: "11 Districts", latestDate: "22 Mar 2024", availableImagery: "WorldView-3 (0.3m), Sentinel-2" },
  { name: "Uttarakhand", coords: [30.0668, 79.0193], districts: "13 Districts", latestDate: "11 Mar 2024", availableImagery: "Sentinel-2, Cartosat-2" },
  { name: "Rajasthan", coords: [26.8000, 73.8000], districts: "50 Districts", latestDate: "10 May 2024", availableImagery: "Sentinel-2 MSI / Landsat-9", demoId: "rajasthan_bhadla" },
  { name: "Uttar Pradesh", coords: [26.8467, 80.9462], districts: "75 Districts", latestDate: "19 Mar 2024", availableImagery: "Sentinel-2, Cartosat-3" },
  { name: "Bihar", coords: [25.5941, 85.3131], districts: "38 Districts", latestDate: "16 Mar 2024", availableImagery: "Sentinel-1 SAR, Sentinel-2" },
  { name: "Sikkim", coords: [27.5330, 88.5122], districts: "6 Districts", latestDate: "10 Mar 2024", availableImagery: "Sentinel-2, Cartosat-1 DEM" },
  { name: "Assam", coords: [26.2006, 92.9376], districts: "35 Districts", latestDate: "28 Jul 2024", availableImagery: "Sentinel-1 C-SAR & Sentinel-2", demoId: "assam_brahmaputra" },
  { name: "Arunachal Pradesh", coords: [28.2180, 94.7278], districts: "26 Districts", latestDate: "08 Mar 2024", availableImagery: "ALOS-2 PALSAR, Sentinel-2" },
  { name: "Nagaland", coords: [26.1584, 94.5624], districts: "16 Districts", latestDate: "07 Mar 2024", availableImagery: "Sentinel-2 (10m)" },
  { name: "Manipur", coords: [24.6637, 93.9063], districts: "16 Districts", latestDate: "09 Mar 2024", availableImagery: "Sentinel-2 (10m)" },
  { name: "Mizoram", coords: [23.1645, 92.9376], districts: "11 Districts", latestDate: "06 Mar 2024", availableImagery: "Sentinel-2, Landsat-8" },
  { name: "Tripura", coords: [23.9408, 91.9882], districts: "8 Districts", latestDate: "10 Mar 2024", availableImagery: "Sentinel-2 (10m)" },
  { name: "Meghalaya", coords: [25.4670, 91.3662], districts: "12 Districts", latestDate: "12 Mar 2024", availableImagery: "Sentinel-1 SAR, Sentinel-2" },
  { name: "West Bengal", coords: [23.5000, 87.8550], districts: "23 Districts", latestDate: "14 Feb 2024", availableImagery: "Sentinel-2, Cartosat-3", demoId: "sundarbans_mangrove" },
  { name: "Jharkhand", coords: [23.6102, 85.2799], districts: "24 Districts", latestDate: "17 Mar 2024", availableImagery: "Sentinel-2 MSI (10m)" },
  { name: "Chhattisgarh", coords: [21.2787, 81.8661], districts: "33 Districts", latestDate: "15 Mar 2024", availableImagery: "Sentinel-2 MSI (10m)" },
  { name: "Madhya Pradesh", coords: [23.2500, 77.8000], districts: "55 Districts", latestDate: "18 Mar 2024", availableImagery: "Sentinel-2, Landsat-9" },
  { name: "Gujarat", coords: [22.2587, 71.1924], districts: "33 Districts", latestDate: "21 Mar 2024", availableImagery: "Sentinel-2, Cartosat-3" },
  { name: "Maharashtra", coords: [19.4500, 75.7139], districts: "36 Districts", latestDate: "12 Mar 2024", availableImagery: "WorldView-3 / Cartosat-3 High-Res", demoId: "mumbai_coastal" },
  { name: "Goa", coords: [15.2993, 74.1240], districts: "2 Districts", latestDate: "22 Mar 2024", availableImagery: "Sentinel-2, PlanetScope (3m)" },
  { name: "Odisha", coords: [20.9517, 85.0985], districts: "30 Districts", latestDate: "16 Mar 2024", availableImagery: "Sentinel-1 SAR, Sentinel-2" },
  { name: "Telangana", coords: [17.8000, 79.0193], districts: "33 Districts", latestDate: "20 Mar 2024", availableImagery: "Sentinel-2 MSI (10m)" },
  { name: "Andhra Pradesh", coords: [15.6000, 79.7400], districts: "26 Districts", latestDate: "21 Mar 2024", availableImagery: "Sentinel-2, Cartosat-3" },
  { name: "Karnataka", coords: [14.5000, 75.7139], districts: "31 Districts", latestDate: "02 Apr 2024", availableImagery: "Cartosat-3 / Sentinel-2 MSI", demoId: "bengaluru_tech" },
  { name: "Tamil Nadu", coords: [11.1271, 78.6569], districts: "38 Districts", latestDate: "23 Mar 2024", availableImagery: "Sentinel-2 MSI (10m)" },
  { name: "Kerala", coords: [10.4500, 76.4500], districts: "14 Districts", latestDate: "22 Mar 2024", availableImagery: "Sentinel-1 SAR, Sentinel-2" }
];

// Major Indian Cities
const MAJOR_CITIES_GIS = [
  { name: "Delhi", state: "Delhi NCT", coords: [28.6139, 77.2090] },
  { name: "Mumbai", state: "Maharashtra", coords: [18.9712, 72.8091], demoId: "mumbai_coastal" },
  { name: "Bengaluru", state: "Karnataka", coords: [12.9716, 77.5946], demoId: "bengaluru_tech" },
  { name: "Hyderabad", state: "Telangana", coords: [17.3850, 78.4867] },
  { name: "Chennai", state: "Tamil Nadu", coords: [13.0827, 80.2707] },
  { name: "Kolkata", state: "West Bengal", coords: [22.5726, 88.3639], demoId: "sundarbans_mangrove" },
  { name: "Ahmedabad", state: "Gujarat", coords: [23.0225, 72.5714] },
  { name: "Jaipur", state: "Rajasthan", coords: [26.9124, 75.7873], demoId: "rajasthan_bhadla" },
  { name: "Lucknow", state: "Uttar Pradesh", coords: [26.8467, 80.9462] },
  { name: "Chandigarh", state: "Punjab / Haryana", coords: [30.7333, 76.7794] },
  { name: "Pune", state: "Maharashtra", coords: [18.5204, 73.8567] },
  { name: "Patna", state: "Bihar", coords: [25.5941, 85.1376] },
  { name: "Bhopal", state: "Madhya Pradesh", coords: [23.2599, 77.4126] },
  { name: "Bhubaneswar", state: "Odisha", coords: [20.2961, 85.8245] },
  { name: "Guwahati", state: "Assam", coords: [26.1445, 91.7362], demoId: "assam_brahmaputra" },
  { name: "Srinagar", state: "Jammu & Kashmir", coords: [34.0837, 74.7973] }
];

// Representative State Boundary Polylines (GIS delineation network)
const STATE_BOUNDARY_LINES = [
  // Rajasthan - Gujarat - MP
  [[24.5, 71.0], [24.0, 72.5], [24.7, 73.5], [24.0, 74.5], [23.0, 74.0]],
  // Maharashtra - MP - Gujarat
  [[20.3, 72.9], [21.5, 73.5], [21.3, 74.5], [21.8, 76.0], [21.5, 78.5], [21.8, 80.2]],
  // UP - Bihar - MP
  [[27.3, 84.0], [25.5, 84.2], [24.8, 83.3], [24.0, 82.5]],
  // Karnataka - Maharashtra - Goa
  [[15.8, 73.8], [16.8, 74.5], [17.5, 76.0], [17.8, 77.5]],
  // Karnataka - Telangana - AP
  [[17.8, 77.5], [16.0, 77.3], [14.0, 77.5], [13.5, 78.5]],
  // Tamil Nadu - Kerala
  [[12.0, 75.3], [10.5, 76.5], [8.5, 77.2]],
  // Tamil Nadu - Andhra Pradesh
  [[13.5, 80.2], [13.2, 79.5], [13.5, 78.5]],
  // Odisha - AP - Chhattisgarh
  [[18.8, 84.5], [18.2, 83.5], [18.0, 82.0], [19.5, 82.5], [20.5, 83.5]],
  // MP - Rajasthan
  [[24.5, 74.5], [25.2, 76.5], [26.5, 77.8], [27.0, 78.0]],
  // Punjab - Haryana - Himachal
  [[30.5, 76.8], [29.8, 75.5], [29.5, 74.8]],
  // J&K - Himachal - Ladakh
  [[32.5, 75.8], [33.0, 76.5], [33.2, 77.0], [34.0, 76.0]],
  // Assam - Arunachal - Meghalaya
  [[26.5, 89.8], [26.2, 90.5], [26.8, 93.5], [27.5, 95.5]],
  // Bengal - Bihar - Jharkhand
  [[25.0, 87.5], [24.0, 86.8], [22.5, 86.5], [21.8, 87.5]]
];

export default function HomeDashboard({ 
  onSendQuery, 
  onUploadClick, 
  onCompareClick, 
  onExploreIndiaClick, 
  onTryDemoClick, 
  onSelectInvestigation, 
  onSelectSavedLocation, 
  onViewAllHistory, 
  recentInvestigations = [], 
  savedLocations = [], 
  isLoading, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const twoDLayerRef = useRef(null);
  const bordersGroupRef = useRef(null);
  const citiesGroupRef = useRef(null);
  const aoiLayerRef = useRef(null);
  const measureLayerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [activeTab, setActiveTab] = useState('ask'); // 'ask' | 'upload' | 'compare'
  const [queryText, setQueryText] = useState("");
  const [mapScope, setMapScope] = useState("India View");
  const [is2DMode, setIs2DMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  // Interactive tool states
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [layerConfig, setLayerConfig] = useState({
    borders: true,
    cities: true,
    labels: true
  });
  const [isDrawingAoi, setIsDrawingAoi] = useState(false);
  const [aoiBounds, setAoiBounds] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureDistance, setMeasureDistance] = useState(null);

  // Quick Examples matching Pan-India scope
  const quickExamples = [
    { text: "Find buildings in Varanasi", icon: Search },
    { text: "Show vegetation in Dehradun", icon: Trees },
    { text: "Detect water bodies in Kerala", icon: Droplets },
    { text: "Analyze agriculture in Punjab", icon: Scale },
    { text: "Explain satellite view of Bhopal", icon: Search }
  ];

  // Suggested queries under composer
  const suggestedQueries = [
    "Find buildings in Varanasi",
    "Show vegetation in Dehradun",
    "Detect water bodies in Kerala",
    "Analyze agriculture in Punjab",
    "Explain satellite view of Bhopal"
  ];


  // 5 Recent Investigations matching reference image
  const defaultRecentItems = [
    {
      id: "inv_1",
      title: "Urban Expansion Analysis",
      location: "Mumbai, Maharashtra",
      dateTime: "12 Nov 2024, 04:32 PM",
      status: "Completed",
      thumbnail: "/assets/demo/mumbai_coastal_2024.jpg",
      type: "Object Detection",
      sceneId: "mumbai_coastal",
      query: "Has urban expansion increased along the coast?"
    },
    {
      id: "inv_2",
      title: "Flood Impact Assessment",
      location: "Assam",
      dateTime: "11 Nov 2024, 02:18 PM",
      status: "Completed",
      thumbnail: "/assets/demo/assam_flood_2024.jpg",
      type: "Disaster Analysis",
      sceneId: "assam_brahmaputra",
      query: "Show flood impact in Kaziranga Assam"
    },
    {
      id: "inv_3",
      title: "Vegetation Change",
      location: "Rajasthan",
      dateTime: "10 Nov 2024, 11:05 AM",
      status: "Completed",
      thumbnail: "/assets/demo/rajasthan_solar_2024.jpg",
      type: "Vegetation",
      sceneId: "rajasthan_bhadla",
      query: "Show vegetation in Rajasthan"
    },
    {
      id: "inv_4",
      title: "Image Analysis",
      location: "Uploaded Image",
      dateTime: "09 Nov 2024, 06:24 PM",
      status: "Pending",
      thumbnail: "/assets/demo/mumbai_coastal_2024.jpg",
      type: "Image Analysis",
      sceneId: "mumbai_coastal",
      query: "Explain this uploaded satellite image"
    },
    {
      id: "inv_5",
      title: "Water Body Detection",
      location: "Tamil Nadu",
      dateTime: "08 Nov 2024, 01:12 PM",
      status: "Completed",
      thumbnail: "/assets/demo/sundarbans_mangrove_2024.jpg",
      type: "Water",
      sceneId: "sundarbans_mangrove",
      query: "Detect water bodies and coastal wetlands"
    }
  ];

  // 5 Saved Locations matching reference image
  const savedLocationsList = [
    { id: "loc_1", name: "India (National View)", icon: Globe, lat: 21.5, lng: 79.5, zoom: 4.8 },
    { id: "loc_2", name: "Maharashtra", icon: Building2, lat: 18.9712, lng: 72.8091, zoom: 9, sceneId: "mumbai_coastal" },
    { id: "loc_3", name: "Assam", icon: Mountain, lat: 26.5775, lng: 93.1711, zoom: 9, sceneId: "assam_brahmaputra" },
    { id: "loc_4", name: "Rajasthan", icon: Target, lat: 27.5389, lng: 71.9167, zoom: 9, sceneId: "rajasthan_bhadla" },
    { id: "loc_5", name: "Custom AOI - Project Site", icon: MapPin, lat: 21.8, lng: 88.9, zoom: 10, sceneId: "sundarbans_mangrove" }
  ];

  // Register window callbacks for popup clicks across India
  useEffect(() => {
    window.__satqueryInspectCoords = (lat, lng, regionName, demoId) => {
      const q = `Analyze satellite imagery for ${regionName} (${lat}°N, ${lng}°E)`;
      setQueryText(q);
      if (onSendQuery) {
        onSendQuery({
          query: q,
          sceneId: `${lat}, ${lng}`,
          tab: 'ask'
        });
      }
    };

    return () => {
      delete window.__satqueryInspectCoords;
    };
  }, [onSendQuery]);


  // Initialize Satellite Leaflet Map with all layers and features
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered over India [21.5, 79.5] at zoom 4.8
    const map = L.map(mapContainerRef.current, {
      center: [21.5, 79.5],
      zoom: 4.8,
      zoomSnap: 0.1,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // 1. ESRI World Imagery Base Satellite Layer (High-Resolution Satellite Orthomosaic)
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }).addTo(map);
    satelliteLayerRef.current = satLayer;

    // 2. Real GIS Reference Layer: ESRI World Boundaries & Places
    // Provides real official international borders, state lines, coastlines, and cartographic place labels
    const boundsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      opacity: 0.95
    }).addTo(map);
    bordersGroupRef.current = boundsLayer;

    // 3. 2D CartoDB Voyager Layer (for 2D Mode)
    const twoDLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    });
    twoDLayerRef.current = twoDLayer;

    // 4. Cartographic Watermark Labels Group (INDIA, Seas, Ocean)
    const cartoGroup = L.featureGroup().addTo(map);
    
    const macroLabels = [
      { text: "INDIA", coords: [21.5, 78.9], className: "map-label-country-india" },
      { text: "Arabian\nSea", coords: [15.5, 68.0], className: "map-label-sea" },
      { text: "Bay of\nBengal", coords: [15.0, 89.0], className: "map-label-sea" },
      { text: "Indian Ocean", coords: [5.5, 77.0], className: "map-label-ocean" }
    ];

    macroLabels.forEach(lbl => {
      const labelIcon = L.divIcon({
        className: `custom-map-text-label ${lbl.className}`,
        html: `<div>${lbl.text.replace('\n', '<br/>')}</div>`,
        iconSize: [120, 40],
        iconAnchor: [60, 20]
      });
      L.marker(lbl.coords, { icon: labelIcon, interactive: false }).addTo(cartoGroup);
    });

    // 5. Sleek Satellite Observation Target Markers for Key Focus Areas
    const targetGroup = L.featureGroup().addTo(map);
    citiesGroupRef.current = targetGroup;

    const observationHubs = [
      { name: "Mumbai Coastal", state: "Maharashtra", coords: [18.9712, 72.8091], demoId: "mumbai_coastal", sensor: "Cartosat-3 / WorldView-3 (0.5m)" },
      { name: "Kaziranga Brahmaputra", state: "Assam", coords: [26.6854, 93.3512], demoId: "assam_brahmaputra", sensor: "Sentinel-1 C-SAR & Sentinel-2" },
      { name: "Bhadla Solar Complex", state: "Rajasthan", coords: [27.5389, 71.9167], demoId: "rajasthan_bhadla", sensor: "Sentinel-2 MSI / Landsat-9" },
      { name: "Bengaluru Tech Corridor", state: "Karnataka", coords: [12.9298, 77.6848], demoId: "bengaluru_tech", sensor: "Cartosat-3 & Sentinel-2" },
      { name: "Sundarbans Mangrove", state: "West Bengal", coords: [21.9497, 88.9000], demoId: "sundarbans_mangrove", sensor: "Sentinel-2 MSI (10m)" }
    ];

    observationHubs.forEach(hub => {
      const targetIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div class="hub-target-marker" title="Earth Observation Hub: ${hub.name}">
            <div class="hub-pulse-ring"></div>
            <div class="hub-center-dot"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker(hub.coords, { icon: targetIcon }).addTo(targetGroup);

      const hubPopup = `
        <div class="gis-inspector-popup font-body">
          <div class="gis-popup-header">
            <span class="gis-popup-title">${hub.name}</span>
            <span class="gis-badge">Observation Hub</span>
          </div>
          <div class="gis-popup-body">
            <div><span>State:</span> <strong>${hub.state}</strong></div>
            <div><span>Sensor:</span> <strong>${hub.sensor}</strong></div>
            <div><span>Coordinates:</span> <strong>${hub.coords[0].toFixed(3)}°N, ${hub.coords[1].toFixed(3)}°E</strong></div>
          </div>
          <button 
            type="button" 
            class="gis-popup-action-btn"
            onclick="window.__satqueryInspectCoords(${hub.coords[0]}, ${hub.coords[1]}, '${hub.name}', '${hub.demoId}')"
          >
            Analyze this area →
          </button>
        </div>
      `;
      marker.bindPopup(hubPopup, { maxWidth: 260, closeButton: false });
    });

    // 6. Interactive Click-to-Inspect Anywhere on the Map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      // Only inspect if within Indian subcontinent window
      if (lat < 5 || lat > 38 || lng < 65 || lng > 98) return;

      let nearest = INDIAN_ADMIN_REGIONS[0];
      let minDist = Infinity;
      INDIAN_ADMIN_REGIONS.forEach(reg => {
        const d = Math.hypot(reg.lat - lat, reg.lng - lng);
        if (d < minDist) {
          minDist = d;
          nearest = reg;
        }
      });

      const popupHtml = `
        <div class="gis-inspector-popup font-body">
          <div class="gis-popup-header">
            <span class="gis-popup-title">${nearest.name}</span>
            <span class="gis-badge">${nearest.type || 'Region'}</span>
          </div>
          <div class="gis-popup-body">
            <div><span>Coordinates:</span> <strong>${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E</strong></div>
            <div><span>Coverage:</span> <strong>Sentinel-2 MSI (10m) · Cartosat-3</strong></div>
            <div><span>Observation:</span> <strong>Daily Revisit Earth Observation</strong></div>
          </div>
          <button 
            type="button" 
            class="gis-popup-action-btn"
            onclick="window.__satqueryInspectCoords(${lat.toFixed(4)}, ${lng.toFixed(4)}, '${nearest.name}', '${nearest.demoId || ''}')"
          >
            Analyze this area →
          </button>
        </div>
      `;

      L.popup({ maxWidth: 260, closeButton: false })
        .setLatLng([lat, lng])
        .setContent(popupHtml)
        .openOn(map);
    });

    // 7. AOI and Measure Layer Groups
    aoiLayerRef.current = L.featureGroup().addTo(map);
    measureLayerRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Zoom In / Out
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Reset Map to National View
  const handleResetMap = () => {
    mapInstanceRef.current?.flyTo([21.5, 79.5], 4.8, { duration: 1.2 });
    setMapScope("India View");
    setShowViewMenu(false);
  };

  // Fly to Geographic Region Preset
  const handleFlyToRegion = (name, lat, lng, zoom) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
    setMapScope(name);
    setShowViewMenu(false);
  };

  // Geolocation center
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 11, { duration: 1.5 });
      }, () => {
        handleResetMap();
      });
    } else {
      handleResetMap();
    }
  };

  // Toggle Satellite vs 2D Basemap
  const handleToggle2D = () => {
    if (!mapInstanceRef.current) return;
    if (!is2DMode) {
      mapInstanceRef.current.removeLayer(satelliteLayerRef.current);
      twoDLayerRef.current.addTo(mapInstanceRef.current);
      setIs2DMode(true);
    } else {
      mapInstanceRef.current.removeLayer(twoDLayerRef.current);
      satelliteLayerRef.current.addTo(mapInstanceRef.current);
      setIs2DMode(false);
    }
  };

  // Layer Configuration toggles
  const handleToggleLayer = (type) => {
    if (!mapInstanceRef.current) return;
    const next = { ...layerConfig, [type]: !layerConfig[type] };
    setLayerConfig(next);

    if (type === 'borders') {
      if (next.borders) bordersGroupRef.current.addTo(mapInstanceRef.current);
      else mapInstanceRef.current.removeLayer(bordersGroupRef.current);
    } else if (type === 'cities') {
      if (next.cities) citiesGroupRef.current.addTo(mapInstanceRef.current);
      else mapInstanceRef.current.removeLayer(citiesGroupRef.current);
    }
  };

  // Toggle Draw AOI Mode
  const handleToggleDrawAoi = () => {
    if (isDrawingAoi) {
      // Exit draw mode
      setIsDrawingAoi(false);
      aoiLayerRef.current?.clearLayers();
      setAoiBounds(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click');
      }
    } else {
      setIsDrawingAoi(true);
      setIsMeasuring(false);
      measureLayerRef.current?.clearLayers();
      setMeasureDistance(null);

      // Create a representative interactive AOI rectangle centered around the view
      if (mapInstanceRef.current) {
        const center = mapInstanceRef.current.getCenter();
        const deltaLat = 0.25;
        const deltaLng = 0.35;
        const bounds = [
          [center.lat - deltaLat, center.lng - deltaLng],
          [center.lat + deltaLat, center.lng + deltaLng]
        ];

        aoiLayerRef.current?.clearLayers();
        L.rectangle(bounds, {
          color: '#F47B20',
          weight: 2,
          dashArray: '5, 5',
          fillColor: '#F47B20',
          fillOpacity: 0.15
        }).addTo(aoiLayerRef.current);

        setAoiBounds({
          minLat: (center.lat - deltaLat).toFixed(2),
          maxLat: (center.lat + deltaLat).toFixed(2),
          minLng: (center.lng - deltaLng).toFixed(2),
          maxLng: (center.lng + deltaLng).toFixed(2),
          areaKm: "42.8"
        });
      }
    }
  };

  // Apply AOI to Query and Immediately Execute
  const handleApplyAoi = () => {
    if (aoiBounds) {
      const q = `Analyze custom AOI [${aoiBounds.minLat}°N, ${aoiBounds.minLng}°E to ${aoiBounds.maxLat}°N, ${aoiBounds.maxLng}°E] for infrastructure and vegetation`;
      setQueryText(q);
      setIsDrawingAoi(false);
      onSendQuery({
        query: q,
        tab: 'ask'
      });
    }
  };

  // Direct File Upload Triggers
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendQuery({ file });
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onSendQuery({ file });
    }
  };

  // Voice recognition with SpeechRecognition API (supports Hindi & English)
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setQueryText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Toggle Measure Tool
  const handleToggleMeasure = () => {
    if (isMeasuring) {
      setIsMeasuring(false);
      measureLayerRef.current?.clearLayers();
      setMeasureDistance(null);
    } else {
      setIsMeasuring(true);
      setIsDrawingAoi(false);
      aoiLayerRef.current?.clearLayers();
      setAoiBounds(null);

      // Measure line between two representative points on current map
      if (mapInstanceRef.current) {
        const center = mapInstanceRef.current.getCenter();
        const pt1 = [center.lat - 0.5, center.lng - 0.8];
        const pt2 = [center.lat + 0.6, center.lng + 0.9];

        measureLayerRef.current?.clearLayers();
        L.polyline([pt1, pt2], {
          color: '#F47B20',
          weight: 2.5,
          dashArray: '4, 4'
        }).addTo(measureLayerRef.current);

        L.circleMarker(pt1, { radius: 4, color: '#F47B20', fillColor: '#FFFFFF', fillOpacity: 1 }).addTo(measureLayerRef.current);
        L.circleMarker(pt2, { radius: 4, color: '#F47B20', fillColor: '#FFFFFF', fillOpacity: 1 }).addTo(measureLayerRef.current);

        setMeasureDistance("214.6 km");
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!queryText.trim()) return;
    onSendQuery({
      query: queryText.trim(),
      tab: activeTab
    });
  };

  // Instant Execution for Quick Examples & Suggested Queries across India
  const handleSuggestionClick = (text) => {
    setQueryText(text);
    const qLower = text.toLowerCase();
    let targetTab = 'image';

    if (qLower.includes('compare') || qLower.includes('vs') || qLower.includes('change')) {
      targetTab = 'compare';
    }

    onSendQuery({
      query: text,
      tab: targetTab,
      sceneId: text
    });
  };


  // Saved Location Click: Fly to location & open interactive inspector popup
  const handleSavedLocationClick = (loc) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], loc.zoom || 8, { duration: 1.2 });
      setMapScope(loc.name);

      L.popup({ maxWidth: 260, closeButton: false })
        .setLatLng([loc.lat, loc.lng])
        .setContent(`
          <div class="gis-inspector-popup font-body">
            <div class="gis-popup-header">
              <span class="gis-popup-title">${loc.name}</span>
              <span class="gis-badge">Saved AOI</span>
            </div>
            <div class="gis-popup-body">
              <div><span>Coordinates:</span> <strong>${loc.lat.toFixed(3)}°N, ${loc.lng.toFixed(3)}°E</strong></div>
              <div><span>Telemetry:</span> <strong>Sentinel-2 MSI / Cartosat-3</strong></div>
            </div>
            <button 
              type="button" 
              class="gis-popup-action-btn"
              onclick="window.__satqueryInspectCoords(${loc.lat}, ${loc.lng}, '${loc.name}', '${loc.sceneId || ''}')"
            >
              Analyze this location →
            </button>
          </div>
        `)
        .openOn(mapInstanceRef.current);
    }
  };

  return (
    <div className="home-reference-layout">
      {/* =========================================================================
          CENTER WORKSPACE (Hero + Map on Row 1, Query Workspace on Row 2)
          ========================================================================= */}
      <div className="center-workspace-column">
        {/* ROW 1: TWO-COLUMN (HERO on Left, SATELLITE MAP on Right) */}
        <div className="hero-and-map-row">
          {/* HERO CARD */}
          <div className="ref-hero-card">
            <div className="ref-hero-eyebrow font-mono">
              INDIA'S AI-POWERED SATELLITE INTELLIGENCE ASSISTANT
            </div>

            <h1 className="ref-hero-headline font-heading">
              Ask about India.<br />
              Understand what<br />
              the satellite sees.
            </h1>

            <p className="ref-hero-desc">
              Upload satellite imagery or ask a question in plain language. SatQuery analyzes, explains and shows visual evidence — in English, Hindi or Hinglish.
            </p>

            {/* 4 Action Buttons Grid (2x2) */}
            <div className="ref-hero-buttons-grid">
              <button 
                type="button" 
                className="btn-ref-upload"
                onClick={handleTriggerUpload}
              >
                <UploadCloud size={16} />
                <span>Upload Image</span>
              </button>

              <button 
                type="button" 
                className="btn-ref-ask-outline"
                onClick={() => {
                  const input = document.querySelector('.ref-query-input');
                  input?.focus();
                }}
              >
                <Search size={15} />
                <span>Ask SatQuery</span>
              </button>

              <button 
                type="button" 
                className="btn-ref-explore"
                onClick={onExploreIndiaClick}
              >
                <Compass size={16} />
                <span>Explore India</span>
              </button>

              <button 
                type="button" 
                className="btn-ref-switch-2d"
                onClick={handleToggle2D}
              >
                <BookOpen size={15} />
                <span>{is2DMode ? "Switch to Satellite Map" : "Switch to 2D Map"}</span>
              </button>
            </div>

            {/* Quick Examples */}
            <div className="ref-quick-examples-block">
              <div className="ref-quick-examples-header">
                <Lightbulb size={16} className="text-orange" />
                <span className="font-heading">QUICK EXAMPLES</span>
              </div>
              <div className="ref-quick-chips-column">
                {quickExamples.map((ex, idx) => {
                  const Icon = ex.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="ref-quick-chip-row"
                      onClick={() => handleSuggestionClick(ex.text)}
                    >
                      <Icon size={14} className="quick-chip-icon text-muted" />
                      <span>{ex.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SATELLITE MAP CARD */}
          <div className="ref-map-card">
            {/* Top-Left: [ 📖 India View ▾ ] with Dropdown */}
            <div className="ref-map-top-left-ctrl">
              <button 
                type="button"
                className="btn-india-view-pill"
                onClick={() => setShowViewMenu(!showViewMenu)}
              >
                <BookOpen size={14} className="text-forest" />
                <span>{mapScope}</span>
                <span className="arrow-down">▾</span>
              </button>

              {showViewMenu && (
                <div className="india-view-dropdown-card">
                  <button 
                    type="button" 
                    className="view-dropdown-item font-body"
                    onClick={handleResetMap}
                  >
                    <Globe size={13} className="text-forest" />
                    <span>🇮🇳 All India (National View)</span>
                  </button>
                  <button 
                    type="button" 
                    className="view-dropdown-item font-body"
                    onClick={() => handleFlyToRegion("Northern Plain", 29.5, 77.2, 6.5)}
                  >
                    <span>🏔 Northern Plain (Delhi, Punjab, UP)</span>
                  </button>
                  <button 
                    type="button" 
                    className="view-dropdown-item font-body"
                    onClick={() => handleFlyToRegion("Western India", 20.5, 73.8, 6.5)}
                  >
                    <span>🌊 Western India (Maharashtra, Gujarat)</span>
                  </button>
                  <button 
                    type="button" 
                    className="view-dropdown-item font-body"
                    onClick={() => handleFlyToRegion("Southern Peninsula", 13.5, 77.8, 6.5)}
                  >
                    <span>🌴 Southern Peninsula (Karnataka, TN, AP)</span>
                  </button>
                  <button 
                    type="button" 
                    className="view-dropdown-item font-body"
                    onClick={() => handleFlyToRegion("Eastern & Northeast", 25.5, 91.5, 6.5)}
                  >
                    <span>🌾 East & Northeast (Assam, Bengal, Bihar)</span>
                  </button>
                  <button 
                    type="button" 
                    className="view-dropdown-item font-body"
                    onClick={() => handleFlyToRegion("Thar Desert", 27.2, 72.5, 7.0)}
                  >
                    <span>☀️ Thar Desert & Solar (Rajasthan)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Top-Right: Vertical Tools Stack (+, −, locate, layers, draw AOI, measure) */}
            <div className="ref-map-vertical-tools">
              <button type="button" className="ref-vtool-btn" onClick={handleZoomIn} title="Zoom In">
                <Plus size={15} />
              </button>
              <button type="button" className="ref-vtool-btn" onClick={handleZoomOut} title="Zoom Out">
                <Minus size={15} />
              </button>
              <button type="button" className="ref-vtool-btn" onClick={handleLocateMe} title="Center Location">
                <Crosshair size={14} />
              </button>
              <button 
                type="button" 
                className={`ref-vtool-btn ${showLayerMenu ? 'active' : ''}`} 
                onClick={() => setShowLayerMenu(!showLayerMenu)} 
                title="Map Layers"
              >
                <Layers size={14} />
              </button>
              <button 
                type="button" 
                className={`ref-vtool-btn ${isDrawingAoi ? 'active text-orange' : ''}`} 
                onClick={handleToggleDrawAoi} 
                title="Draw Area of Interest (AOI)"
              >
                <PenTool size={13} />
              </button>
              <button 
                type="button" 
                className={`ref-vtool-btn ${isMeasuring ? 'active text-orange' : ''}`} 
                onClick={handleToggleMeasure} 
                title="Measure Distance"
              >
                <Ruler size={13} />
              </button>
            </div>

            {/* Layer Settings Popover */}
            {showLayerMenu && (
              <div className="map-layer-dropdown-card font-body">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  GIS Layers
                </div>
                <label className="layer-opt-row">
                  <span>Satellite Basemap</span>
                  <input 
                    type="radio" 
                    name="basemap" 
                    checked={!is2DMode} 
                    onChange={handleToggle2D} 
                  />
                </label>
                <label className="layer-opt-row">
                  <span>2D Vector Map</span>
                  <input 
                    type="radio" 
                    name="basemap" 
                    checked={is2DMode} 
                    onChange={handleToggle2D} 
                  />
                </label>
                <label className="layer-opt-row">
                  <span>State Boundaries</span>
                  <input 
                    type="checkbox" 
                    checked={layerConfig.borders} 
                    onChange={() => handleToggleLayer('borders')} 
                  />
                </label>
                <label className="layer-opt-row">
                  <span>Major Cities</span>
                  <input 
                    type="checkbox" 
                    checked={layerConfig.cities} 
                    onChange={() => handleToggleLayer('cities')} 
                  />
                </label>
              </div>
            )}

            {/* Active AOI Banner */}
            {isDrawingAoi && aoiBounds && (
              <div className="ref-aoi-active-banner font-body">
                <div className="aoi-banner-text">
                  <PenTool size={13} className="text-orange" />
                  <span>
                    AOI: <strong>{aoiBounds.minLat}°–{aoiBounds.maxLat}°N, {aoiBounds.minLng}°–{aoiBounds.maxLng}°E</strong> ({aoiBounds.areaKm} km²)
                  </span>
                </div>
                <div className="aoi-banner-actions">
                  <button type="button" className="btn-aoi-analyze" onClick={handleApplyAoi}>
                    Analyze This AOI →
                  </button>
                  <button type="button" className="btn-aoi-cancel" onClick={handleToggleDrawAoi}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Active Measure Banner */}
            {isMeasuring && measureDistance && (
              <div className="ref-measure-banner font-body">
                <Ruler size={13} className="text-orange" />
                <span>Geodesic Distance: <strong>{measureDistance}</strong></span>
                <button 
                  type="button" 
                  className="btn-aoi-cancel" 
                  style={{ marginLeft: '6px' }} 
                  onClick={handleToggleMeasure}
                >
                  Done
                </button>
              </div>
            )}

            {/* The Actual Leaflet Map Canvas */}
            <div className="ref-map-viewport" ref={mapContainerRef} />

            {/* Bottom-Left: ● India-wide coverage */}
            <div className="ref-map-bottom-left-badge font-mono">
              <span className="dot-green">●</span>
              <span>India-wide coverage</span>
            </div>

            {/* Bottom-Right: 500 km scale bar */}
            <div className="ref-map-scale-bar font-mono">
              <span className="scale-text">500 km</span>
              <div className="scale-line"></div>
            </div>
          </div>
        </div>

        {/* ROW 2: QUERY WORKSPACE CARD */}
        <div 
          className={`ref-query-workspace-card ${isDraggingFile ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hidden File Input for Image/GeoTIFF raster upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*,.tif,.tiff" 
            onChange={handleFileInputChange} 
          />

          {/* Top Tabs: [ Ask SatQuery ]  [ Upload Image ]  [ Compare Images ]  --- [ Clear ] */}
          <div className="ref-query-tabs-bar">
            <div className="ref-tabs-left">
              <button 
                type="button" 
                className={`ref-query-tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
                onClick={() => setActiveTab('ask')}
              >
                <Search size={14} />
                <span>Ask SatQuery</span>
              </button>

              <button 
                type="button" 
                className={`ref-query-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('upload');
                  handleTriggerUpload();
                }}
              >
                <UploadCloud size={14} />
                <span>Upload Image</span>
              </button>

              <button 
                type="button" 
                className={`ref-query-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('compare');
                  if (onCompareClick) onCompareClick();
                }}
              >
                <ImageIcon size={14} />
                <span>Compare Images</span>
              </button>
            </div>

            <button 
              type="button" 
              className="btn-ref-clear"
              onClick={() => setQueryText("")}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>

          {/* Large Input Box with Image, Mic, and Send Buttons */}
          <form className="ref-input-form" onSubmit={handleSubmit}>
            <div className="ref-input-box-wrapper">
              <input 
                type="text"
                className="ref-query-input font-body"
                placeholder={isListening ? (language === 'hi' ? "सुन रहे हैं... बोलिए..." : "Listening... speak now...") : "Ask anything about India's satellite imagery..."}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                disabled={isLoading}
              />

              <div className="ref-input-inline-actions">
                <button 
                  type="button" 
                  className="btn-input-icon-tool" 
                  onClick={handleTriggerUpload}
                  title="Attach satellite image (JPG, PNG, GeoTIFF)"
                >
                  <ImageIcon size={17} className="text-secondary" />
                </button>
                <button 
                  type="button" 
                  className={`btn-input-icon-tool ${isListening ? 'listening' : ''}`}
                  onClick={handleToggleVoice}
                  title={isListening ? "Listening... Click to stop" : "Voice query (Hindi/English)"}
                >
                  <Mic size={17} className={isListening ? "text-orange" : "text-secondary"} />
                </button>
                <button 
                  type="submit" 
                  className="btn-input-send-circle"
                  disabled={!queryText.trim() || isLoading}
                  title="Send query"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* Suggested queries row */}
            <div className="ref-suggested-queries-bar">
              <span className="suggested-queries-label font-body">
                Suggested queries:
              </span>
              <div className="suggested-queries-chips">
                {suggestedQueries.map((query, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ref-suggested-chip"
                    onClick={() => handleSuggestionClick(query)}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDEBAR (Recent Investigations + Saved Locations)
          ========================================================================= */}
      <aside className="right-sidebar-column">
        {/* RECENT INVESTIGATIONS CARD */}
        <div className="ref-side-card">
          <div className="ref-side-card-header">
            <h3 className="ref-side-title font-heading">Recent Investigations</h3>
            <button 
              type="button" 
              className="ref-view-all-link font-body"
              onClick={onViewAllHistory}
            >
              View All →
            </button>
          </div>

          <div className="ref-recent-items-list">
            {defaultRecentItems.map((item) => (
              <div 
                key={item.id}
                className="ref-recent-item-card"
                onClick={() => onSelectInvestigation(item)}
                role="button"
                tabIndex={0}
              >
                <div className="ref-item-thumb">
                  <img src={item.thumbnail} alt={item.title} className="thumb-img" />
                </div>
                <div className="ref-item-info">
                  <h4 className="item-title font-heading">{item.title}</h4>
                  <div className="item-loc text-secondary">{item.location}</div>
                  <div className="item-time text-muted font-mono">{item.dateTime}</div>
                </div>
                <div className="ref-item-status-col">
                  {item.status === 'Completed' ? (
                    <span className="pill-completed font-body">Completed</span>
                  ) : (
                    <ChevronRight size={16} className="text-muted" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVED LOCATIONS CARD */}
        <div className="ref-side-card">
          <div className="ref-side-card-header">
            <h3 className="ref-side-title font-heading">Saved Locations</h3>
            <button 
              type="button" 
              className="ref-view-all-link font-body"
              onClick={() => onSelectSavedLocation && onSelectSavedLocation(savedLocationsList[0])}
            >
              Manage
            </button>
          </div>

          <div className="ref-saved-locations-list">
            {savedLocationsList.map((loc) => {
              const Icon = loc.icon;
              return (
                <button
                  key={loc.id}
                  type="button"
                  className="ref-saved-loc-row"
                  onClick={() => handleSavedLocationClick(loc)}
                >
                  <Icon size={16} className="saved-loc-icon text-forest" />
                  <span className="saved-loc-name">{loc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          BOTTOM STATUS BAR
          ● System Ready   |   India-wide coverage | Multimodal AI | Explainable | Secure | v0.1.0
          ========================================================================= */}
      <footer className="ref-bottom-status-bar font-body">
        <div className="status-left">
          <span className="dot-green">●</span>
          <span className="status-text font-heading">System Ready</span>
        </div>
        <div className="status-right font-body">
          <span>India-wide coverage</span>
          <span className="pipe">|</span>
          <span>Multimodal AI</span>
          <span className="pipe">|</span>
          <span>Explainable</span>
          <span className="pipe">|</span>
          <span>Secure</span>
          <span className="pipe">|</span>
          <span className="font-mono text-muted">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
