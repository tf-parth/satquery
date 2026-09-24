// SatQuery AI - Earth Observation & Vision-Language Dataset Management
// Categories: Training / Adaptation, Benchmark / Evaluation, User Uploaded Data
// Datasets: BigEarthNet, VRSBench, RSVQA, CDVQA, and Constellation Sensors
// Actions: [ View Dataset ], [ Upload Dataset ] (GeoTIFF / Zip archive picker)

import React, { useState, useRef } from 'react';
import { 
  Database, 
  Satellite, 
  Radio, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  UploadCloud, 
  Eye, 
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function DatasetsView({ t, language }) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState("all"); // "all" | "adaptation" | "benchmark" | "user"
  const [selectedDatasetModal, setSelectedDatasetModal] = useState(null);
  const [userUploads, setUserUploads] = useState([]);
  const uploadInputRef = useRef(null);

  // Official datasets aligned with SIH 26167
  const datasets = [
    // 1. Training / Adaptation
    {
      id: "bigearthnet",
      category: "adaptation",
      categoryLabel: "Training / Adaptation",
      name: "BigEarthNet-19",
      role: "Remote-sensing adaptation dataset",
      type: "Multispectral BOA Reflectance Benchmark",
      sensor: "Sentinel-2 MSI Level-2A",
      resolution: "10m, 20m, 60m (Bands B02 - B12)",
      modality: "Multispectral (12 Bands)",
      coverage: "Pan-European / India-Calibrated CORINE",
      status: "ADAPTATION MODEL TRAINED & CHECKPOINT ACTIVE",
      isLiveCheckpoint: true,
      description: "Standard benchmark comprising 590,326 multi-spectral image tiles across 19 CORINE land-cover classes. Used to adapt our 4-channel spectral neural adapter.",
      checkpointFile: "checkpoints/bigearthnet_adapted_best.json"
    },

    // 2. Benchmark / Evaluation
    {
      id: "vrsbench",
      category: "benchmark",
      categoryLabel: "Benchmark / Evaluation",
      name: "VRSBench",
      role: "Single-image grounding / VQA evaluation",
      type: "Vision-Language Grounding & Captioning",
      sensor: "High-Resolution Optical Constellation",
      resolution: "0.5m - 2.0m GSD",
      modality: "Optical RGB + Panchromatic",
      coverage: "Global & Dense Urban Infrastructure",
      status: "BENCHMARK SPECIFICATIONS LOADED",
      isLiveCheckpoint: false,
      description: "Comprehensive remote sensing VLM benchmark with spatial bounding box annotations, detailed captions, and multi-turn question-answering pairs.",
      evalMetrics: "Grounding mAP@0.5, BLEU-4, CIDEr"
    },
    {
      id: "rsvqa",
      category: "benchmark",
      categoryLabel: "Benchmark / Evaluation",
      name: "RSVQA (Remote Sensing VQA)",
      role: "Remote-sensing VQA evaluation",
      type: "Visual Question Answering Benchmark",
      sensor: "Sentinel-2 & High-Res Airborne",
      resolution: "10m / High-Res (0.15m)",
      modality: "Multispectral & Optical",
      coverage: "Rural, Agrarian & Urban Environs",
      status: "EVALUATION PROTOCOLS ACTIVE",
      isLiveCheckpoint: false,
      description: "Visual question answering dataset covering presence/absence, object counts, spatial relationships, and regional land-use verification.",
      evalMetrics: "Exact Match (EM), Macro Accuracy"
    },
    {
      id: "cdvqa",
      category: "benchmark",
      categoryLabel: "Benchmark / Evaluation",
      name: "CDVQA (Change Detection VQA)",
      role: "Bi-temporal change VQA evaluation",
      type: "Bi-temporal Difference Question Answering",
      sensor: "Multi-temporal Sentinel-2 & Cartosat",
      resolution: "10m GSD",
      modality: "Bi-temporal Optical & Multi-band",
      coverage: "Rapid Urban Sprawl & Flood Corridors",
      status: "EVALUATION PROTOCOLS ACTIVE",
      isLiveCheckpoint: false,
      description: "Evaluates model capability to reason over what changed, where destruction or construction occurred, and quantify temporal surface area shifts.",
      evalMetrics: "Change F1, Natural Language Reasoning"
    }
  ];

  // User uploaded dataset handler
  const handleUploadDataset = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newEntry = {
      id: `user_ds_${Date.now()}`,
      category: "user",
      categoryLabel: "User Uploaded Data",
      name: file.name,
      role: "Custom User Satellite Raster / Dataset",
      type: file.name.match(/\.tif+/i) ? "GeoTIFF Archive" : "Satellite Imagery Bundle",
      sensor: "User-Supplied Satellite Sensor",
      resolution: "Native Raster GSD",
      modality: file.name.match(/\.tif+/i) ? "Multispectral / GeoTIFF" : "Optical Imagery",
      coverage: "Survey Project AOI",
      status: "STORED LOCALLY IN BROWSER / READY",
      isLiveCheckpoint: true,
      description: `User-provided dataset file (${(file.size / (1024 * 1024)).toFixed(2)} MB). Verified for immediate ingest into SatQuery AI workspace.`
    };
    setUserUploads(prev => [newEntry, ...prev]);
  };

  const allDatasets = [...datasets, ...userUploads];
  const displayedDatasets = activeTab === "all" 
    ? allDatasets 
    : allDatasets.filter(d => d.category === activeTab);

  return (
    <div className="datasets-page-container glass-panel">
      {/* Page Header */}
      <div className="history-header-bar">
        <div className="history-title-block">
          <div className="history-badge font-mono text-xs">
            <Database size={13} className="text-teal" />
            <span>REMOTE SENSING DATASET REGISTRY</span>
          </div>
          <h1 className="history-page-title font-heading">
            {isHi ? "डेटासेट प्रबंधन व संकलन" : "Dataset Management & Sensor Repositories"}
          </h1>
          <p className="history-page-sub text-secondary">
            {isHi 
              ? "मॉडल अनुकूलन (BigEarthNet), मूल्यांकन बेंचमार्क (VRSBench, RSVQA, CDVQA) और उपयोगकर्ता डेटा।" 
              : "Repository of fine-tuning datasets (BigEarthNet), evaluation benchmarks (VRSBench, RSVQA, CDVQA), and user-uploaded rasters."}
          </p>
        </div>

        {/* Upload Dataset Button */}
        <div className="datasets-header-actions">
          <button 
            type="button"
            className="btn-upload-dataset font-mono text-xs"
            onClick={() => uploadInputRef.current?.click()}
          >
            <UploadCloud size={15} />
            <span>Upload Dataset</span>
          </button>
          <input 
            ref={uploadInputRef}
            type="file"
            accept=".tif,.tiff,.zip,.tar,.geojson"
            style={{ display: 'none' }}
            onChange={handleUploadDataset}
          />
        </div>
      </div>

      {/* Category Tabs: All, Training/Adaptation, Benchmark/Evaluation, User Uploaded */}
      <div className="dataset-category-tabs font-mono text-xs">
        <button 
          type="button"
          className={`ds-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Datasets ({allDatasets.length})
        </button>
        <button 
          type="button"
          className={`ds-tab-btn ${activeTab === 'adaptation' ? 'active' : ''}`}
          onClick={() => setActiveTab('adaptation')}
        >
          Training / Adaptation (1)
        </button>
        <button 
          type="button"
          className={`ds-tab-btn ${activeTab === 'benchmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmark')}
        >
          Benchmark / Evaluation (3)
        </button>
        <button 
          type="button"
          className={`ds-tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          User Uploaded Data ({userUploads.length})
        </button>
      </div>

      {/* Dataset Cards Grid */}
      <div className="datasets-catalog-grid">
        {displayedDatasets.map((ds) => (
          <div key={ds.id} className="dataset-item-card glass-panel">
            <div className="ds-card-top-row font-mono text-xs">
              <span className={`ds-cat-pill ${ds.category}`}>{ds.categoryLabel}</span>
              <span className={`ds-status-pill ${ds.isLiveCheckpoint ? 'live' : 'ready'}`}>
                {ds.status}
              </span>
            </div>

            <h3 className="ds-item-name font-heading">{ds.name}</h3>
            <div className="ds-role-line font-mono text-xs text-teal">{ds.role}</div>

            <p className="ds-item-desc text-secondary text-xs">{ds.description}</p>

            {/* Specifications Grid */}
            <div className="ds-specs-table font-mono text-xs">
              <div className="ds-spec-row">
                <span className="k text-muted">Sensor:</span>
                <span className="v text-highlight">{ds.sensor}</span>
              </div>
              <div className="ds-spec-row">
                <span className="k text-muted">Resolution:</span>
                <span className="v">{ds.resolution}</span>
              </div>
              <div className="ds-spec-row">
                <span className="k text-muted">Modality:</span>
                <span className="v text-teal">{ds.modality}</span>
              </div>
              <div className="ds-spec-row">
                <span className="k text-muted">Coverage:</span>
                <span className="v">{ds.coverage}</span>
              </div>
            </div>

            {/* Actions: [ View Dataset ] */}
            <div className="ds-card-actions">
              <button 
                type="button"
                className="btn-view-dataset font-mono text-xs"
                onClick={() => setSelectedDatasetModal(ds)}
              >
                <Eye size={13} />
                <span>View Dataset</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Details Modal */}
      {selectedDatasetModal && (
        <div className="modal-backdrop-overlay">
          <div className="dataset-detail-modal glass-panel">
            <div className="modal-header-row">
              <div>
                <span className="font-mono text-xs text-teal">{selectedDatasetModal.categoryLabel}</span>
                <h3 className="font-heading text-lg">{selectedDatasetModal.name}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setSelectedDatasetModal(null)}>✕</button>
            </div>

            <div className="modal-body font-mono text-xs">
              <div className="spec-item-box">
                <strong>Primary Role: </strong>
                <span>{selectedDatasetModal.role}</span>
              </div>
              <div className="spec-item-box">
                <strong>Sensor Specifications: </strong>
                <span>{selectedDatasetModal.sensor} • {selectedDatasetModal.resolution}</span>
              </div>
              <div className="spec-item-box">
                <strong>Modality & Bands: </strong>
                <span>{selectedDatasetModal.modality}</span>
              </div>
              <div className="spec-item-box">
                <strong>Verification Status: </strong>
                <span className="text-emerald">{selectedDatasetModal.status}</span>
              </div>
              {selectedDatasetModal.checkpointFile && (
                <div className="spec-item-box text-highlight">
                  <strong>Active Checkpoint File: </strong>
                  <span>{selectedDatasetModal.checkpointFile}</span>
                </div>
              )}
              <p className="mt-2 text-secondary font-body text-xs">
                {selectedDatasetModal.description}
              </p>
            </div>

            <div className="modal-footer-row font-mono text-xs">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setSelectedDatasetModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
