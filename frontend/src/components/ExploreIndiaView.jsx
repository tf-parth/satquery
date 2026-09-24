// SatQuery AI - Full Interactive Explore India Workspace
// Comprehensive Leaflet Map with layer toggles (ESRI Satellite, Dark Matter, OSM),
// interactive states & scene markers, full State Overview telemetry sidebar,
// and [ Analyze this area ] action button.

import React, { useState } from 'react';
import IndiaMap from './IndiaMap';
import { 
  Globe, 
  MapPin, 
  Satellite, 
  Layers, 
  SlidersHorizontal, 
  ArrowRight, 
  Search,
  Sparkles,
  Droplets,
  Trees,
  Building2,
  Database,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { INDIA_ADMIN_REGIONS, INDIA_DEMO_SCENES, getDemoScene } from '../../../backend/src/services/demoData.js';

export default function ExploreIndiaView({ 
  onSelectScene, 
  onQueryRegion, 
  onStartInvestigationForArea,
  activeAoi, 
  setActiveAoi, 
  t, 
  language 
}) {
  const isHi = language === 'hi';

  // Current selected location state
  const [selectedLocation, setSelectedLocation] = useState({
    name: "Maharashtra",
    name_hi: "महाराष्ट्र",
    type: "State",
    lat: 19.7515,
    lng: 75.7139,
    districts: "36 Districts",
    sensors: ["Sentinel-2 MSI", "WorldView-3 (0.3m)", "Sentinel-1 SAR"],
    recentDate: "12 Mar 2024",
    landCover: {
      builtUp: "38.4%",
      vegetation: "44.2%",
      water: "11.6%",
      barren: "5.8%"
    },
    waterInfo: "Coastal interface + Godavari basin reservoirs (Mean NDWI: -0.12)",
    vegetationInfo: "Western Ghats tropical wet evergreen canopy (Mean NDVI: 0.68)",
    infraInfo: "Major metropolitan corridors, port facilities, Mumbai Coastal Expressway",
    previewUrl: "/assets/demo/mumbai_coastal_2024.jpg",
    sceneId: "mumbai_coastal"
  });

  const handleSceneSelectFromMap = (sceneId) => {
    const scene = getDemoScene(sceneId);
    setSelectedLocation({
      name: scene.state || scene.location,
      name_hi: scene.title_hi || scene.title,
      type: "Surveyed Area",
      lat: scene.coordinates.lat,
      lng: scene.coordinates.lng,
      districts: scene.district || "Metropolitan Region",
      sensors: [scene.sensor],
      recentDate: scene.acquisitionDate || "2024-03-12",
      landCover: {
        builtUp: `${scene.features?.builtUpPercent || 42}%`,
        vegetation: `${scene.features?.vegetationPercent || 35}%`,
        water: `${scene.features?.waterCoverPercent || 18}%`,
        barren: "5%"
      },
      waterInfo: `Water coverage ${scene.features?.waterCoverPercent || 18}% with confirmed shoreline telemetry`,
      vegetationInfo: `Canopy coverage ${scene.features?.vegetationPercent || 35}% with calibrated NDVI response`,
      infraInfo: `${scene.features?.buildingsCount || 24} major structural clusters, arterial roads`,
      previewUrl: scene.previewUrl,
      sceneId: scene.id
    });
    if (onSelectScene) onSelectScene(sceneId);
  };

  const handleAdminRegionSelect = (reg) => {
    // Dynamically look up or construct genuine satellite scene for this Indian location
    const scene = getDemoScene(reg.demoId || reg.name);
    setSelectedLocation({
      name: reg.name,
      name_hi: reg.name_hi || reg.name,
      type: reg.type || "Territory",
      lat: reg.lat,
      lng: reg.lng,
      districts: reg.type === 'State' ? "State Administrative Territory" : `${reg.state || 'India'} Region`,
      sensors: scene.sensor ? scene.sensor.split(" / ") : ["ISRO Cartosat-3", "Sentinel-2 MSI Level-2A"],
      recentDate: scene.acquisitionDate || new Date().toISOString().split("T")[0],
      landCover: {
        builtUp: `${scene.features?.builtUpPercent || 28.5}%`,
        vegetation: `${scene.features?.vegetationPercent || 48.2}%`,
        water: `${scene.features?.waterCoverPercent || 14.3}%`,
        barren: `${scene.features?.barrenPercent || 9.0}%`
      },
      waterInfo: `${scene.name} water resources, riverine networks, and surface reservoirs`,
      vegetationInfo: `${scene.terrain || 'Canopy cover, agriculture, and vegetation parcels'}`,
      infraInfo: `Settlements, transit corridors, and structural footprints in ${scene.name}`,
      previewUrl: scene.previewUrl,
      sceneId: scene.id
    });
  };

  const handleAnalyzeThisArea = () => {
    if (onSelectScene && selectedLocation.sceneId) {
      onSelectScene(selectedLocation.sceneId);
    } else if (onStartInvestigationForArea) {
      onStartInvestigationForArea({
        name: selectedLocation.name,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        sceneId: selectedLocation.sceneId
      });
    }
  };


  return (
    <div className="explore-india-view-layout">
      {/* Main Interactive Leaflet Map */}
      <div className="explore-map-container">
        <IndiaMap 
          onSelectScene={handleSceneSelectFromMap}
          onSelectAdminRegion={handleAdminRegionSelect}
          onQueryRegion={onQueryRegion}
          activeAoi={activeAoi}
          setActiveAoi={setActiveAoi}
          t={t}
          language={language}
        />
      </div>

      {/* Regional State Overview Sidebar */}
      <aside className="explore-side-panel glass-panel" aria-label="State & Location Overview">
        {/* Panel Header */}
        <div className="explore-panel-header">
          <div className="explore-badge font-mono text-xs">
            <Globe size={13} className="text-teal" />
            <span>STATE & REGIONAL OVERVIEW</span>
          </div>
          <h2 className="explore-panel-title font-heading">
            {isHi ? (selectedLocation.name_hi || selectedLocation.name) : selectedLocation.name}
          </h2>
          <div className="explore-coords font-mono text-xs text-teal">
            <MapPin size={12} />
            <span>{selectedLocation.lat.toFixed(4)}° N, {selectedLocation.lng.toFixed(4)}° E</span>
            <span className="location-type-chip">{selectedLocation.type}</span>
          </div>
        </div>

        {/* Satellite Imagery Thumbnail */}
        <div className="state-imagery-card">
          <div className="state-thumb-header font-mono text-xs text-muted">
            <Satellite size={12} className="text-teal" />
            <span>SATELLITE OBSERVATION TILE</span>
          </div>
          <div className="state-img-wrapper">
            <img 
              src={selectedLocation.previewUrl || "/assets/demo/mumbai_coastal_2024.jpg"} 
              alt={selectedLocation.name} 
              className="state-preview-img"
            />
            <span className="state-date-badge font-mono text-xs">
              <Calendar size={11} />
              <span>{selectedLocation.recentDate}</span>
            </span>
          </div>
        </div>

        {/* Available Datasets */}
        <div className="state-section-card">
          <div className="state-sec-title font-mono text-xs text-muted">
            <Database size={12} className="text-teal" />
            <span>AVAILABLE SENSORS & DATASETS:</span>
          </div>
          <div className="sensor-tags-list font-mono text-xs">
            {selectedLocation.sensors.map((s, idx) => (
              <span key={idx} className="sensor-tag-item">{s}</span>
            ))}
          </div>
        </div>

        {/* Land-Cover Distribution Breakdown */}
        <div className="state-section-card">
          <div className="state-sec-title font-mono text-xs text-muted">
            <Layers size={12} className="text-teal" />
            <span>LAND-COVER INFORMATION:</span>
          </div>
          <div className="landcover-bars-grid font-mono text-xs">
            <div className="lc-item">
              <div className="lc-top">
                <span className="lc-label flex-row items-center gap-1">
                  <Building2 size={11} className="text-amber" /> Built-up
                </span>
                <span className="lc-val">{selectedLocation.landCover.builtUp}</span>
              </div>
              <div className="lc-progress-track">
                <div className="lc-progress-fill amber" style={{ width: selectedLocation.landCover.builtUp }} />
              </div>
            </div>

            <div className="lc-item">
              <div className="lc-top">
                <span className="lc-label flex-row items-center gap-1">
                  <Trees size={11} className="text-emerald" /> Vegetation
                </span>
                <span className="lc-val">{selectedLocation.landCover.vegetation}</span>
              </div>
              <div className="lc-progress-track">
                <div className="lc-progress-fill emerald" style={{ width: selectedLocation.landCover.vegetation }} />
              </div>
            </div>

            <div className="lc-item">
              <div className="lc-top">
                <span className="lc-label flex-row items-center gap-1">
                  <Droplets size={11} className="text-blue" /> Water
                </span>
                <span className="lc-val">{selectedLocation.landCover.water}</span>
              </div>
              <div className="lc-progress-track">
                <div className="lc-progress-fill blue" style={{ width: selectedLocation.landCover.water }} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Environmental Telemetry */}
        <div className="state-details-list font-mono text-xs">
          <div className="state-detail-row">
            <span className="k text-muted">Water:</span>
            <span className="v text-secondary">{selectedLocation.waterInfo}</span>
          </div>
          <div className="state-detail-row">
            <span className="k text-muted">Vegetation:</span>
            <span className="v text-secondary">{selectedLocation.vegetationInfo}</span>
          </div>
          <div className="state-detail-row">
            <span className="k text-muted">Infrastructure:</span>
            <span className="v text-secondary">{selectedLocation.infraInfo}</span>
          </div>
        </div>

        {/* Prominent Action: [ Analyze this area ] */}
        <div className="state-action-footer">
          <button 
            type="button"
            className="btn-analyze-this-area"
            onClick={handleAnalyzeThisArea}
            title={`Start a new investigation focused on ${selectedLocation.name}`}
          >
            <Sparkles size={16} />
            <span>Analyze this area</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
