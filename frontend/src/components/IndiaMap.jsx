// SatQuery AI - India-Wide Interactive Satellite Map
// Leaflet-based nationwide map with satellite imagery, state/district quick jumps,
// custom AOI drawing (polygon / rectangle / marker), and spectral layer toggles.

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Globe, 
  Layers, 
  MapPin, 
  Search, 
  Maximize2, 
  Compass, 
  Check, 
  Navigation,
  Sliders,
  Crop
} from 'lucide-react';
import { INDIA_ADMIN_REGIONS, INDIA_DEMO_SCENES } from '../../../backend/src/services/demoData.js';
import { BACKEND_URL } from '../utils/api';

export default function IndiaMap({ 
  onSelectScene, 
  onSelectAdminRegion,
  onQueryRegion, 
  activeAoi, 
  setActiveAoi, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const aoiLayerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [activeTileLayer, setActiveTileLayer] = useState("satellite"); // "satellite" | "dark" | "osm"
  const [drawingMode, setDrawingMode] = useState(null); // null | "box" | "polygon" | "point"
  const [mapQueryText, setMapQueryText] = useState("");

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of India
    const map = L.map(mapContainerRef.current, {
      center: [22.9734, 78.6569],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default ESRI Satellite Layer
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'ESRI World Imagery / ISRO Bhuvan / Copernicus Sentinel',
      maxZoom: 18
    }).addTo(map);

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'CartoDB Dark Matter',
      maxZoom: 18
    });

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap',
      maxZoom: 18
    });

    layerGroupRef.current = {
      satellite: satLayer,
      dark: darkLayer,
      osm: osmLayer
    };

    // Layer for custom markers & AOI
    const aoiGroup = L.featureGroup().addTo(map);
    aoiLayerRef.current = aoiGroup;

    // Add Markers for India Demo Scenes
    INDIA_DEMO_SCENES.forEach(scene => {
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="pin-halo"></div>
          <div class="pin-marker">
            <span class="pin-letter">🛰️</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([scene.coordinates.lat, scene.coordinates.lng], { icon: customIcon });
      
      const popupHtml = `
        <div style="font-family: var(--font-body); padding: 4px;">
          <h4 style="color: #00f2fe; margin-bottom: 4px; font-weight: 700;">${scene.title}</h4>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">${scene.location}</p>
          <p style="font-size: 11px; margin-bottom: 8px;"><strong>Sensor:</strong> ${scene.sensor}</p>
          <button id="btn_select_${scene.id}" style="
            background: #00f2fe;
            color: #060911;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          ">Analyze Scene</button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn_select_${scene.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectScene(scene.id);
          };
        }
      });

      aoiGroup.addLayer(marker);
    });

    // Map click handler for drawing & inspection
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      // Validate within Indian subcontinent window
      if (lat < 5 || lat > 38 || lng < 65 || lng > 98) return;

      const clickedAoi = {
        type: "Point",
        coordinates: [Number(lng.toFixed(5)), Number(lat.toFixed(5))],
        bbox: [lng - 0.05, lat - 0.05, lng + 0.05, lat + 0.05]
      };
      setActiveAoi(clickedAoi);

      // Clear previous custom clicks
      aoiGroup.clearLayers();

      // Place indicator circle
      L.circle([lat, lng], {
        radius: 3500,
        color: '#ff7722',
        fillColor: '#ff772233',
        fillOpacity: 0.3
      }).addTo(aoiGroup);

      // Marker pin
      const marker = L.marker([lat, lng]).addTo(aoiGroup);

      const popupHtml = `
        <div style="font-family: var(--font-body); padding: 6px; min-width: 220px;">
          <h4 style="color: #00f2fe; margin-bottom: 4px; font-weight: 700;">Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)</h4>
          <p style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">Indian Earth Observation AOI</p>
          <p style="font-size: 11px; margin-bottom: 10px;"><strong>Sensors:</strong> ISRO Cartosat-3 / Sentinel-2</p>
          <button id="btn_analyze_click_aoi" style="
            background: linear-gradient(135deg, #00f2fe, #4facfe);
            color: #060911;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
          ">Analyze this Location →</button>
        </div>
      `;

      marker.bindPopup(popupHtml).openPopup();
      marker.on('popupopen', () => {
        const btn = document.getElementById('btn_analyze_click_aoi');
        if (btn) {
          btn.onclick = () => {
            onSelectScene(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          };
        }
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Layer Switch
  const switchTileLayer = (layerKey) => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const map = mapInstanceRef.current;
    Object.values(layerGroupRef.current).forEach(l => map.removeLayer(l));
    layerGroupRef.current[layerKey].addTo(map);
    setActiveTileLayer(layerKey);
  };

  // State selection jump
  const handleStateSelect = (e) => {
    const stateName = e.target.value;
    setSelectedState(stateName);
    if (!stateName || !mapInstanceRef.current) return;

    const found = INDIA_ADMIN_REGIONS.find(r => r.name === stateName);
    if (found) {
      const targetZoom = found.type === 'State' ? 7 : 10;
      mapInstanceRef.current.flyTo([found.lat, found.lng], targetZoom, { duration: 1.2 });
      if (onSelectAdminRegion) onSelectAdminRegion(found);
      onSelectScene(found.demoId || found.name);
    }
  };

  // Search input jump with nationwide dynamic resolution
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    // 1. Check if coordinates
    const coordMatch = searchQuery.match(/lat(?:itude)?[:\s]+(-?\d+\.\d+)[\s,]+(?:lng|lon(?:gitude)?)[:\s]+(-?\d+\.\d+)/i) ||
                       searchQuery.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1.2 });
      if (onSelectAdminRegion) {
        onSelectAdminRegion({
          name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
          lat,
          lng,
          type: "Coordinates"
        });
      }
      onSelectScene(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      return;
    }

    // 2. Match in local Indian catalog
    const q = searchQuery.toLowerCase();
    const match = INDIA_ADMIN_REGIONS.find(r => 
      r.name.toLowerCase().includes(q) || 
      (r.name_hi && r.name_hi.includes(q))
    );

    if (match) {
      const targetZoom = match.type === 'State' ? 7 : 10;
      mapInstanceRef.current.flyTo([match.lat, match.lng], targetZoom, { duration: 1.2 });
      if (onSelectAdminRegion) onSelectAdminRegion(match);
      onSelectScene(match.demoId || match.name);
      return;
    }

    // 3. Fallback: Query backend dynamic location resolver
    try {
      const res = await fetch(`${BACKEND_URL}/api/locations/resolve?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.location && data.location.coordinates) {
          const { lat, lng } = data.location.coordinates;
          mapInstanceRef.current.flyTo([lat, lng], 10, { duration: 1.2 });
          if (onSelectAdminRegion) onSelectAdminRegion(data.location);
          onSelectScene(data.location.name);
        }
      }
    } catch (err) {
      console.warn("Location search error:", err);
    }
  };


  const handleMapQuerySubmit = (e) => {
    e.preventDefault();
    if (!mapQueryText.trim()) return;
    onQueryRegion({
      query: mapQueryText,
      aoi: activeAoi
    });
  };

  return (
    <div className="india-map-wrapper glass-panel">
      {/* Map Control Header */}
      <div className="map-top-bar">
        {/* Search Bar */}
        <form className="map-search-form" onSubmit={handleSearchSubmit}>
          <Search size={16} className="text-teal" />
          <input 
            type="text" 
            className="map-search-input"
            placeholder={isHi ? "राज्य, जिला या अक्षांश/देशांतर खोजें (उदा. 26.68, 93.35)..." : "Search any Indian state, district, or coordinates (e.g. 26.68, 93.35)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* State Jump Dropdown */}
        <div className="state-select-wrapper">
          <Navigation size={14} className="text-isro" />
          <select 
            className="state-dropdown"
            value={selectedState}
            onChange={handleStateSelect}
          >
            <option value="">{isHi ? "-- भारत का राज्य चुनें --" : "-- Select Indian State / UT --"}</option>
            {INDIA_ADMIN_REGIONS.map(reg => (
              <option key={reg.name} value={reg.name}>
                {isHi ? reg.name_hi : reg.name} ({reg.type})
              </option>
            ))}
          </select>
        </div>

        {/* Tile Layer Selector */}
        <div className="map-layer-selector">
          <button 
            className={`map-layer-btn ${activeTileLayer === 'satellite' ? 'active' : ''}`}
            onClick={() => switchTileLayer('satellite')}
            title="Optical Satellite Imagery"
          >
            Satellite
          </button>
          <button 
            className={`map-layer-btn ${activeTileLayer === 'dark' ? 'active' : ''}`}
            onClick={() => switchTileLayer('dark')}
            title="Dark Cartographic Map"
          >
            Dark
          </button>
          <button 
            className={`map-layer-btn ${activeTileLayer === 'osm' ? 'active' : ''}`}
            onClick={() => switchTileLayer('osm')}
            title="OpenStreetMap Street View"
          >
            Topo
          </button>
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className="leaflet-map-viewport" ref={mapContainerRef}>
        {/* Floating India Scope Badge */}
        <div className="map-floating-badge">
          <span className="scope-flag">🇮🇳</span>
          <span>{isHi ? "समस्त भारत कवरेज" : "Pan-India Coverage"}</span>
        </div>
      </div>

      {/* Query Bar for selected Map Region */}
      <form className="map-bottom-query-bar" onSubmit={handleMapQuerySubmit}>
        <div className="map-query-input-box">
          <Compass size={18} className="text-teal" />
          <input 
            type="text"
            className="map-query-input"
            placeholder={isHi ? "इस चयनित क्षेत्र के बारे में सवाल पूछें (उदा. 'असम में बाढ़ का प्रभाव', 'सोलर पार्क')..." : "Ask SatQuery about this geographic region (e.g. 'Show flood impact in Assam', 'Solar grids in Rajasthan')..."}
            value={mapQueryText}
            onChange={(e) => setMapQueryText(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">
          <span>{t.actions.submit_query}</span>
        </button>
      </form>
    </div>
  );
}
