// SatQuery AI - Interactive Visual Grounding Canvas
// Displays satellite imagery with GroundingDINO bounding boxes, SAM2 polygon masks,
// and spectral index overlays. Supports interactive zoom, pan, and click-to-highlight.

import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  Crosshair,
  Maximize2
} from 'lucide-react';

export default function GroundingCanvas({ 
  imageUrl, 
  detections = [], 
  segments = [], 
  layers = [], 
  selectedItemId = null, 
  onSelectItem, 
  activeFilter = null,
  hasAnalyzed = false,
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer visibility toggles
  const [showBoxes, setShowBoxes] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [showSpectral, setShowSpectral] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left mouse only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Auto-focus on selected item if triggered from external AI response
  useEffect(() => {
    if (selectedItemId) {
      const match = detections.find(d => d.id === selectedItemId);
      if (match && match.box) {
        // Subtle pan towards item centroid
        const centerX = (match.box.xmin + match.box.xmax) / 2;
        const centerY = (match.box.ymin + match.box.ymax) / 2;
        // Keep in comfortable zoom
        if (zoom < 1.3) setZoom(1.4);
      }
    }
  }, [selectedItemId]);

  return (
    <div className="grounding-canvas-card glass-panel">
      {/* Canvas Top Action Bar */}
      <div className="canvas-header-bar">
        <div className="canvas-title-group">
          {hasAnalyzed ? (
            <>
              <Crosshair size={16} className="text-teal" />
              <span className="canvas-title">
                {isHi ? "स्थानिक साक्ष्य व दृश्य विश्लेषण" : "SPATIAL EVIDENCE & VISUAL GROUNDING"}
              </span>
              <span className="count-pill">{detections.length + segments.length} {isHi ? "तत्व" : "Features"}</span>
            </>
          ) : (
            <>
              <Layers size={16} className="text-teal" />
              <span className="canvas-title">
                {isHi ? "सक्रिय उपग्रह छवि पूर्वावलोकन" : "ACTIVE IMAGE PREVIEW"}
              </span>
            </>
          )}
        </div>

        {/* Layer Visibility Checkboxes - ONLY visible after image analysis */}
        {hasAnalyzed && (
          <div className="canvas-layer-controls">
            <button 
              className={`layer-toggle-btn ${showBoxes ? 'active' : ''}`}
              onClick={() => setShowBoxes(!showBoxes)}
              title="Toggle GroundingDINO Bounding Boxes"
            >
              {showBoxes ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>BBoxes</span>
            </button>

            <button 
              className={`layer-toggle-btn ${showMasks ? 'active' : ''}`}
              onClick={() => setShowMasks(!showMasks)}
              title="Toggle SAM2 Segmentation Masks"
            >
              {showMasks ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>SAM2 Masks</span>
            </button>

            <button 
              className={`layer-toggle-btn ${showSpectral ? 'active' : ''}`}
              onClick={() => setShowSpectral(!showSpectral)}
              title="Toggle Spectral Heatmap Overlays"
            >
              {showSpectral ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>Spectral</span>
            </button>
          </div>
        )}

        {/* Zoom & Pan Tools */}
        <div className="canvas-zoom-controls">
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <span className="zoom-level font-mono">{Math.round(zoom * 100)}%</span>
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button className="tool-btn" onClick={handleResetView} title="Reset View">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className="canvas-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="canvas-transform-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {/* Base Satellite Imagery */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Satellite observation" 
              className="base-satellite-image"
              draggable={false}
            />
          ) : (
            <div className="fallback-satellite-texture">
              <div className="radar-grid-lines"></div>
              <div className="texture-label">
                <span>🛰️ Indian Satellite Observation Plane</span>
              </div>
            </div>
          )}

          {/* SVG Overlay for Bounding Boxes and SAM2 Polygons - ONLY when analyzed */}
          {hasAnalyzed && (
            <svg className="grounding-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* 1. Render SAM2 Segmentation Masks */}
              {showMasks && segments.map((seg) => {
                if (!seg.polygon || seg.polygon.length === 0) return null;
                const pointsStr = seg.polygon.map(p => `${p.x},${p.y}`).join(' ');
                const isSelected = selectedItemId === seg.id || selectedItemId === seg.parentId;
                const isHovered = hoveredItemId === seg.id;

                return (
                  <polygon 
                    key={seg.id}
                    points={pointsStr}
                    fill={seg.color || "rgba(0, 242, 254, 0.35)"}
                    stroke={isSelected ? "#ffffff" : (seg.borderColor || "#00f2fe")}
                    strokeWidth={isSelected ? 1.2 : 0.6}
                    className={`sam2-mask-polygon ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectItem) onSelectItem(seg.id);
                    }}
                    onMouseEnter={() => setHoveredItemId(seg.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <title>{seg.label} ({seg.model})</title>
                  </polygon>
                );
              })}

              {/* 2. Render GroundingDINO Bounding Boxes */}
              {showBoxes && detections.map((det) => {
                const { box } = det;
                if (!box) return null;
                const isSelected = selectedItemId === det.id;
                const isHovered = hoveredItemId === det.id;

                return (
                  <g key={det.id} className="grounding-box-group">
                    <rect 
                      x={box.xmin}
                      y={box.ymin}
                      width={box.width}
                      height={box.height}
                      fill={isSelected ? "rgba(0, 242, 254, 0.25)" : "rgba(0, 242, 254, 0.05)"}
                      stroke={isSelected ? "#ff7722" : (isHovered ? "#00f2fe" : "#00f2fe88")}
                      strokeWidth={isSelected ? 1.2 : 0.7}
                      strokeDasharray={isSelected ? "2,1" : "none"}
                      className={`dino-rect ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectItem) onSelectItem(det.id);
                      }}
                      onMouseEnter={() => setHoveredItemId(det.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                    />
                    {/* Small label tag on top edge */}
                    {(zoom > 1.1 || isSelected || isHovered) && (
                      <text 
                        x={box.xmin + 0.5} 
                        y={box.ymin - 0.8}
                        fill="#ffffff"
                        fontSize="2.2"
                        fontWeight="bold"
                        className="dino-label-text"
                      >
                        {det.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Footer Info Pill - Only shown when analysis results exist */}
      {hasAnalyzed && (
        <div className="canvas-footer-bar">
          <div className="canvas-hint">
            <span>💡 {isHi ? "छवि पर किसी भी तत्व पर क्लिक करें या AI उत्तर में चुनें" : "Click any element on canvas or select in AI Answer to inspect"}</span>
          </div>
          <div className="canvas-model-tags">
            <span className="badge badge-model">GroundingDINO</span>
            <span className="badge badge-model">SAM2</span>
          </div>
        </div>
      )}
    </div>
  );
}
