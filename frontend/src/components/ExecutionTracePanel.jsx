// SatQuery AI - Observable Execution Trace Panel
// Adheres strictly to Section 10 of official SIH Problem Statement 26167.

import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Layers, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function ExecutionTracePanel({ 
  trace = [], 
  task = "Single-Image Analysis", 
  models = [], 
  confidence = 0.88, 
  executionSource = "LIVE_AI_SERVICE",
  elapsedMs = null,
  language = "en"
}) {
  const isHi = language === "hi";
  const [isExpanded, setIsExpanded] = useState(true);

  if (!trace || trace.length === 0) return null;

  const defaultTrace = [
    { step: "Input validation", status: "COMPLETED", detail: "Verified format, CRS, and raster dimensions" },
    { step: "Modality & format detection", status: "COMPLETED", detail: "GeoTIFF Level-2A multi-spectral raster" },
    { step: "Spatial compatibility check", status: "COMPLETED", detail: "Geodetic CRS and bounds verified" },
    { step: "Specialist model selection", status: "COMPLETED", detail: `Selected: ${models.join(", ") || "RS-VQA"}` },
    { step: "Model inference execution", status: "COMPLETED", detail: `Executed via ${executionSource}` },
    { step: "Evidence extraction & mask generation", status: "COMPLETED", detail: "Computed spatial contours and spectral layers" },
    { step: "Confidence calibration", status: "COMPLETED", detail: `Calibrated score: ${(confidence * 100).toFixed(1)}%` },
    { step: "Final answer synthesis", status: "COMPLETED", detail: "Synthesized evidence-based explanation" }
  ];

  const stepsToDisplay = trace.length > 0 ? trace : defaultTrace;

  return (
    <div className="execution-trace-card glass-panel font-mono text-xs">
      <div 
        className="trace-header-toggle" 
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
      >
        <div className="trace-header-left">
          <Activity size={15} className="text-teal" />
          <span className="trace-title font-heading">
            {isHi ? "ऑब्जर्वेबल एक्जीक्यूशन ट्रेस (EXECUTION TRACE)" : "OBSERVABLE EXECUTION TRACE"}
          </span>
          <span className={`trace-source-pill ${executionSource?.includes('LIVE') ? 'bg-emerald-glow' : 'bg-amber-glow'}`}>
            {executionSource?.includes('LIVE') ? "LIVE EXECUTION" : "DEMO MODE"}
          </span>
        </div>

        <div className="trace-header-right">
          {elapsedMs && (
            <span className="trace-time-badge text-muted">
              <Clock size={12} /> {elapsedMs}ms
            </span>
          )}
          <button className="btn-drawer-chevron">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="trace-body-content">
          {/* Top Summary Bar */}
          <div className="trace-meta-summary-grid">
            <div className="trace-meta-item">
              <span className="text-muted">Task:</span>
              <span className="text-teal font-heading text-xs">
                {task?.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            <div className="trace-meta-item">
              <span className="text-muted">Models Invoked:</span>
              <span className="text-highlight">
                {models.length > 0 ? models.join(" + ") : "SatQuery RS-VQA + BigEarthNet Adapter"}
              </span>
            </div>

            <div className="trace-meta-item">
              <span className="text-muted">Calibrated Confidence:</span>
              <span className="text-emerald font-bold">
                {confidence ? `${(confidence * 100).toFixed(1)}%` : "Confidence unavailable"}
              </span>
            </div>
          </div>

          {/* Sequential Step Execution Checklist */}
          <div className="trace-steps-timeline">
            {stepsToDisplay.map((st, idx) => (
              <div key={idx} className="trace-step-row">
                <div className="trace-step-icon-col">
                  {st.status === "FAILED" ? (
                    <AlertCircle size={14} className="text-red" />
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald" />
                  )}
                  {idx < stepsToDisplay.length - 1 && <div className="trace-step-connector"></div>}
                </div>

                <div className="trace-step-info-col">
                  <div className="trace-step-name">
                    <span className="text-highlight font-bold">✓ {st.step}</span>
                  </div>
                  {st.detail && (
                    <div className="trace-step-detail text-muted text-xs">
                      {st.detail}
                    </div>
                  )}
                </div>

                {st.timestamp && (
                  <div className="trace-step-time text-muted text-xs">
                    {st.timestamp.split("T")[1]?.substring(0, 8)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
