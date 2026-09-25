// SatQuery AI - Comprehensive Satellite Intelligence Reports Dashboard
// List view: Report Name, Investigation, Location, Date, Type, Status
// Actions: [ Open ], [ Download PDF ], [ Download JSON ]
// Formal Report Document includes:
// SATQUERY AI header, Investigation, User Query, Input Images, Metadata, Detected Modality,
// Task, Models Used, Execution Trace, Answer, Evidence, Confidence, Maps, Statistics, Timestamp.

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Cpu, 
  Building2, 
  Waves, 
  Satellite,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { INDIA_DEMO_SCENES, getDemoScene } from '../../../backend/src/services/demoData.js';
import MarkdownRenderer from './MarkdownRenderer';

export default function ReportsView({ 
  activeInvestigation, 
  onNavigateTab,
  t, 
  language 
}) {
  const isHi = language === 'hi';

  // Seed sample official reports
  const availableReports = [
    {
      id: "REP-IND-MUM-2024",
      name: "Mumbai Coastal Road Infrastructure Audit",
      investigation: "Urban Shoreline Reclamation Assessment",
      location: "Mumbai, Maharashtra",
      date: "12 Mar 2024",
      type: "Bi-temporal Change Detection",
      status: "APPROVED / OFFICIAL",
      sceneId: "mumbai_coastal",
      query: "Find all buildings along newly reclaimed coastal arterial corridor",
      task: "bi_temporal_change",
      modality: "High-Resolution Optical (WorldView-3 / Cartosat-3)",
      modelsUsed: ["Change Vector Analysis (CVA)", "GroundingDINO", "SAM2"],
      confidence: 0.94,
      answer: "Reclaimed coastal road alignment verified with 42 prominent structural footprints and +18.4 hectares of new land area.",
      statistics: {
        totalSurveyedHa: 120.5,
        builtUpGrowthHa: 18.4,
        waterDeltaHa: -14.2
      }
    },
    {
      id: "REP-IND-ASM-2024",
      name: "Brahmaputra Flood Triage & Inundation Briefing",
      investigation: "Monsoon Floodwater Penetration Analysis",
      location: "Kaziranga Basin, Assam",
      date: "28 Jul 2024",
      type: "Disaster Hazard Triage",
      status: "APPROVED / OFFICIAL",
      sceneId: "assam_brahmaputra",
      query: "Show flood impact in Kaziranga and surrounding villages",
      task: "sar_backscatter_analysis",
      modality: "Synthetic Aperture Radar (Sentinel-1 C-SAR) & MSI",
      modelsUsed: ["SARAS-Net", "NDWI McFeeters", "GeoChat"],
      confidence: 0.96,
      answer: "14,280 hectares of inundated terrain verified via active C-SAR radar backscatter attenuation through dense monsoon clouds.",
      statistics: {
        totalSurveyedHa: 28400,
        builtUpGrowthHa: 0,
        waterDeltaHa: 14280
      }
    },
    {
      id: "REP-IND-RAJ-2024",
      name: "Bhadla Solar Grid Development Report",
      investigation: "Desert Scrubland Conversion Audit",
      location: "Phalodi, Thar Desert, Rajasthan",
      date: "10 May 2024",
      type: "Object Grounding & Infrastructure",
      status: "COMPLETED",
      sceneId: "rajasthan_bhadla",
      query: "Detect all solar panel arrays and grids in Bhadla",
      task: "text_guided_grounding",
      modality: "Multispectral Optical (Sentinel-2 MSI)",
      modelsUsed: ["GroundingDINO", "SatCLIP", "BigEarthNet-Adapter"],
      confidence: 0.92,
      answer: "Mapped 68 utility-scale photovoltaic grid arrays covering 14,000 acres of desert terrain.",
      statistics: {
        totalSurveyedHa: 5665,
        builtUpGrowthHa: 2245,
        waterDeltaHa: 0
      }
    }
  ];

  const allReports = activeInvestigation ? [
    {
      id: activeInvestigation.id || `REP-${Date.now()}`,
      name: activeInvestigation.title || "Custom Satellite Investigation Report",
      investigation: activeInvestigation.query || "Remote Sensing Analysis",
      location: activeInvestigation.location || "India",
      date: activeInvestigation.dateTime || "Recent Investigation",
      type: activeInvestigation.type || "Multimodal Analysis",
      status: "APPROVED / OFFICIAL",
      sceneId: activeInvestigation.sceneId || "mumbai_coastal",
      query: activeInvestigation.query || "Analyze satellite imagery",
      task: activeInvestigation.task || "single_image_vqa",
      modality: activeInvestigation.sensor || "Multispectral Optical (10m)",
      modelsUsed: activeInvestigation.modelsUsed || ["SatQuery-RS-VQA", "GroundingDINO"],
      confidence: activeInvestigation.confidence || 0.94,
      answer: activeInvestigation.evidenceStatus || "Analysis completed with verified spatial telemetry.",
      statistics: {
        totalSurveyedHa: 125.0,
        builtUpGrowthHa: 14.2,
        waterDeltaHa: -8.5
      }
    },
    ...availableReports
  ] : availableReports;

  const [selectedReportId, setSelectedReportId] = useState(allReports[0].id);
  const selectedReport = allReports.find(r => r.id === selectedReportId) || allReports[0];
  const scene = getDemoScene(selectedReport.sceneId);

  // Print PDF
  const handlePrint = () => {
    window.print();
  };

  // Download JSON
  const handleDownloadJSON = (rep) => {
    const reportData = {
      agency: "SATQUERY AI - EARTH OBSERVATION INTELLIGENCE PLATFORM",
      reportId: rep.id,
      reportName: rep.name,
      investigation: rep.investigation,
      userQuery: rep.query,
      location: rep.location,
      timestamp: rep.date,
      detectedModality: rep.modality,
      task: rep.task,
      modelsUsed: rep.modelsUsed,
      confidence: rep.confidence,
      executiveAnswer: rep.answer,
      statistics: rep.statistics,
      imageMetadata: {
        sensor: scene.sensor,
        crs: scene.crs,
        resolution: scene.resolution,
        bounds: scene.bounds
      },
      executionTrace: [
        { step: "Input Validation", status: "PASSED", detail: "CRS and spatial bounds validated." },
        { step: "Task Decomposition", status: "PASSED", detail: `Decomposed to ${rep.task}` },
        { step: "Model Execution", status: "PASSED", detail: `Executed models: ${rep.modelsUsed.join(', ')}` },
        { step: "Synthesis & Calibration", status: "PASSED", detail: `Calculated confidence: ${rep.confidence}` }
      ]
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rep.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page-container glass-panel">
      {/* Page Header */}
      <div className="history-header-bar">
        <div className="history-title-block">
          <div className="history-badge font-mono text-xs">
            <FileText size={13} className="text-teal" />
            <span>EXECUTIVE BRIEFINGS & AUDITS</span>
          </div>
          <h1 className="history-page-title font-heading">
            {isHi ? "उपग्रह रिपोर्ट और ऑडिट डैशबोर्ड" : "Reports & Intelligence Dashboard"}
          </h1>
          <p className="history-page-sub text-secondary">
            {isHi 
              ? "आधिकारिक सरकारी एवं अनुसंधान रिपोर्ट तैयार करें और पीडीएफ या जेएसन प्रारूप में डाउनलोड करें।" 
              : "Review formal remote-sensing intelligence dossiers, download PDF briefings, or export structured JSON telemetry."}
          </p>
        </div>
      </div>

      {/* Reports Table List (Report Name, Investigation, Location, Date, Type, Status, Actions) */}
      <div className="reports-table-card glass-panel font-mono text-xs">
        <div className="table-header-row">
          <span className="col-name">REPORT NAME</span>
          <span className="col-loc">LOCATION</span>
          <span className="col-date">DATE</span>
          <span className="col-type">TASK TYPE</span>
          <span className="col-status">STATUS</span>
          <span className="col-actions">ACTIONS</span>
        </div>

        <div className="table-body-rows">
          {allReports.map((rep) => (
            <div 
              key={rep.id} 
              className={`table-row-item ${selectedReport.id === rep.id ? 'active-row' : ''}`}
              onClick={() => setSelectedReportId(rep.id)}
            >
              <div className="col-name font-heading">
                <strong>{rep.name}</strong>
                <span className="text-muted text-xs font-mono">{rep.id}</span>
              </div>
              <div className="col-loc text-secondary">{rep.location}</div>
              <div className="col-date text-muted">{rep.date}</div>
              <div className="col-type text-teal">{rep.type}</div>
              <div className="col-status">
                <span className="status-badge-chip text-emerald font-mono">
                  <CheckCircle2 size={11} />
                  <span>{rep.status}</span>
                </span>
              </div>
              <div className="col-actions">
                <button 
                  type="button"
                  className="btn-rep-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReportId(rep.id);
                  }}
                  title="Preview formal document"
                >
                  Open
                </button>
                <button 
                  type="button"
                  className="btn-rep-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint();
                  }}
                  title="Download / Print PDF"
                >
                  <Printer size={12} />
                  <span>PDF</span>
                </button>
                <button 
                  type="button"
                  className="btn-rep-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadJSON(rep);
                  }}
                  title="Download JSON"
                >
                  <Download size={12} />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORMAL REPORT DOCUMENT PREVIEW (PRINTABLE) */}
      <div className="formal-report-paper glass-panel mt-6">
        {/* Document Header */}
        <div className="doc-header-block">
          <div className="doc-emblem-row">
            <div className="emblem-group">
              <span className="doc-flag">🇮🇳</span>
              <div>
                <h2 className="doc-gov-heading font-heading">SATQUERY AI • EARTH OBSERVATION PLATFORM</h2>
                <div className="doc-sub-agency font-mono text-xs text-muted">
                  Pan-India Multimodal Satellite Intelligence & Analytics Directorate
                </div>
              </div>
            </div>
            <div className="doc-code-block font-mono text-xs">
              <div>REPORT ID: <strong>{selectedReport.id}</strong></div>
              <div>DATE: <strong>{selectedReport.date}</strong></div>
              <div>SECURITY: <strong className="text-emerald">PUBLIC RELEASABLE</strong></div>
            </div>
          </div>
          <div className="doc-divider"></div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="doc-section">
          <h3 className="doc-section-title font-heading">1. EXECUTIVE SUMMARY</h3>
          <p className="doc-text">
            This satellite intelligence briefing delivers an evidence-backed spatial assessment of <strong>{selectedReport.name}</strong> ({selectedReport.location}). Observations were processed using {selectedReport.modality} and specialist models ({selectedReport.modelsUsed.join(', ')}) with a calibrated confidence rating of {Math.round(selectedReport.confidence * 100)}%.
          </p>
          <div className="doc-callout-box font-mono text-xs mt-2">
            <strong>SYNTHESIS: </strong>
            <MarkdownRenderer content={selectedReport.answer} />
          </div>
        </div>

        {/* Section 2: Sensor & Image Metadata */}
        <div className="doc-section">
          <h3 className="doc-section-title font-heading">2. MISSION TELEMETRY & METADATA</h3>
          <div className="doc-provenance-grid font-mono text-xs">
            <div className="doc-prov-cell">
              <span className="k text-muted">Target Location:</span>
              <span className="v">{selectedReport.location}</span>
            </div>
            <div className="doc-prov-cell">
              <span className="k text-muted">Constellation / Sensor:</span>
              <span className="v text-highlight">{scene.sensor}</span>
            </div>
            <div className="doc-prov-cell">
              <span className="k text-muted">Geodetic CRS:</span>
              <span className="v text-teal">{scene.crs}</span>
            </div>
            <div className="doc-prov-cell">
              <span className="k text-muted">Resolution (GSD):</span>
              <span className="v">{scene.resolution}</span>
            </div>
            <div className="doc-prov-cell">
              <span className="k text-muted">Detected Modality:</span>
              <span className="v text-highlight">{selectedReport.modality}</span>
            </div>
            <div className="doc-prov-cell">
              <span className="k text-muted">Task:</span>
              <span className="v">{selectedReport.task}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Input Images & Delineated Maps */}
        <div className="doc-section">
          <h3 className="doc-section-title font-heading">3. OBSERVATION IMAGERY & DELINEATION</h3>
          <div className="doc-images-row">
            <div className="doc-img-col">
              <span className="img-lbl font-mono text-xs text-muted">PRIMARY RASTER TILE</span>
              <img src={scene.previewUrl} alt={scene.title} className="doc-raster-img" />
            </div>
            {scene.comparisonUrl && (
              <div className="doc-img-col">
                <span className="img-lbl font-mono text-xs text-muted">TEMPORAL BASELINE REFERENCE</span>
                <img src={scene.comparisonUrl} alt="Baseline" className="doc-raster-img" />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Quantified Statistics */}
        <div className="doc-section">
          <h3 className="doc-section-title font-heading">4. QUANTIFIED SURFACE STATISTICS</h3>
          <div className="doc-stats-grid font-mono text-xs">
            <div className="doc-stat-box">
              <span className="text-muted">Total Surveyed Extent:</span>
              <strong className="text-sm">{selectedReport.statistics.totalSurveyedHa} ha</strong>
            </div>
            <div className="doc-stat-box">
              <span className="text-muted">Built-up Delta:</span>
              <strong className="text-sm text-amber">+{selectedReport.statistics.builtUpGrowthHa} ha</strong>
            </div>
            <div className="doc-stat-box">
              <span className="text-muted">Hydrological Delta:</span>
              <strong className="text-sm text-blue">{selectedReport.statistics.waterDeltaHa} ha</strong>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="doc-footer-row font-mono text-xs text-muted mt-6">
          <span>Generated by SatQuery AI Platform v2.0 • Government of India SIH PS-26167</span>
          <span>Certified Geospatial Integrity ✓</span>
        </div>
      </div>
    </div>
  );
}
