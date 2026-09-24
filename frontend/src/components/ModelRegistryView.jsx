// SatQuery AI - Specialist Model Registry Dashboard
// Adheres strictly to Section 17 of official SIH Problem Statement 26167.

import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Activity, 
  ShieldCheck,
  Zap,
  Radio,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { fetchModelRegistry, checkBackendHealth } from '../utils/api';

export default function ModelRegistryView({ t, language }) {
  const isHi = language === "hi";
  const [models, setModels] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reg, h] = await Promise.all([
        fetchModelRegistry(),
        checkBackendHealth()
      ]);
      setModels(reg);
      setHealth(h);
    } catch (e) {
      console.error("Error loading model registry:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="model-registry-page glass-panel">
      {/* Header */}
      <div className="history-header-bar">
        <div className="history-title-block">
          <div className="history-badge font-mono text-xs">
            <Cpu size={13} className="text-teal" />
            <span>SIH 26167 SPECIALIST MODEL REGISTRY</span>
          </div>
          <h1 className="history-page-title font-heading">
            {isHi ? "स्पेशलिस्ट मॉडल और टूल रजिस्ट्री" : "Specialist Model & Tool Registry"}
          </h1>
          <p className="history-page-sub text-secondary">
            {isHi 
              ? "सैटक्वेरी एआई के एजेंटिक कंट्रोलर द्वारा ऑर्केस्ट्रेट किए जाने वाले सभी स्पेशलिस्ट रिमोट सेंसिंग मॉडल और उनके निष्पादन विनिर्देश।" 
              : "Registered remote sensing models, foundation vision-language architectures, and spectral processing tools."}
          </p>
        </div>

        <button className="btn-action-outline font-mono text-xs" onClick={loadData} disabled={loading}>
          <RefreshCw size={13} className={loading ? "spin" : ""} />
          <span>{loading ? "Refreshing..." : "Refresh Status"}</span>
        </button>
      </div>

      {/* System Health Status Banner */}
      <div className="registry-health-banner font-mono text-xs">
        <div className="health-stat-chip">
          <span className="text-muted">AI Microservice:</span>
          <span className={health?.status === 'HEALTHY' ? "text-emerald font-bold" : "text-amber font-bold"}>
            {health?.status === 'HEALTHY' ? "ONLINE (:8000)" : "LOCAL / STANDBY"}
          </span>
        </div>

        <div className="health-stat-chip">
          <span className="text-muted">Python Version:</span>
          <span className="text-teal">{health?.aiService?.python_version || "3.14"}</span>
        </div>

        <div className="health-stat-chip">
          <span className="text-muted">Rasterio Core:</span>
          <span className="text-teal">{health?.aiService?.rasterio || "1.5.1"}</span>
        </div>

        <div className="health-stat-chip">
          <span className="text-muted">Execution Mode:</span>
          <span className="text-emerald font-bold">
            {health?.aiService?.execution_mode || "LIVE_INFERENCE"}
          </span>
        </div>
      </div>

      {/* Models Grid */}
      <div className="models-catalog-grid">
        {models.map((m) => (
          <div key={m.id} className="model-registry-card">
            <div className="model-card-top">
              <div className="model-title-group">
                <h3 className="model-name font-heading">{m.name}</h3>
                <span className="model-task-tag font-mono text-xs text-muted">
                  Task: {m.task}
                </span>
              </div>
              <div className="model-status-badge font-mono text-xs">
                <span className="status-dot-green">●</span>
                <span className="text-emerald font-bold">{m.status || "READY"}</span>
              </div>
            </div>

            <p className="model-desc text-secondary text-xs">
              {m.description}
            </p>

            <div className="model-io-table font-mono text-xs">
              <div className="io-row">
                <span className="io-key text-muted">Accepted Input:</span>
                <span className="io-val text-teal">
                  {Array.isArray(m.input) ? m.input.join(" + ") : m.input}
                </span>
              </div>
              <div className="io-row">
                <span className="io-key text-muted">Generated Output:</span>
                <span className="io-val text-highlight">
                  {Array.isArray(m.output) ? m.output.join(", ") : m.output}
                </span>
              </div>
              <div className="io-row">
                <span className="io-key text-muted">Execution:</span>
                <span className="io-val text-emerald font-bold">
                  {m.execution || "LIVE"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
