// SatQuery AI - Dedicated Single-Image Analysis Workspace
// Initial View: Clean, spacious single-upload screen
// After Upload: 2-Column layout: Left = Image Preview (with visual evidence when analyzed); Right = Conversational ChatGPT-style Query & AI Response

import React, { useState, useRef, useEffect } from 'react';
import GroundingCanvas from './GroundingCanvas';
import { 
  Layers, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  UploadCloud, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { INDIA_DEMO_SCENES, getDemoScene } from '../../../backend/src/services/demoData.js';
import { analyzeImageApi } from '../utils/api.js';
import { inspectLocalImageFile } from '../utils/geotiffClient.js';

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageAnalysisView({ 
  activeScene, 
  analysisResult: externalAnalysisResult, 
  onImageReady, 
  onReset,
  onAnalysisComplete,
  selectedItemId, 
  setSelectedItemId, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const fileInputRef = useRef(null);

  // Core Module State - Starts completely EMPTY
  const [selectedImage, setSelectedImage] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(null); // URL / ObjectURL
  const [fileInfo, setFileInfo] = useState(null); // { name, size, formattedSize, isGeoTiff, type }
  const [analysisResult, setAnalysisResult] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null); // Demo scene if chosen from advanced options
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1); // 1: Uploading/Preparing -> 2: Analyzing -> 3: Generating SatQuery response
  const [isError, setIsError] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Sync if an external image/scene was intentionally passed (e.g. restored from history)
  useEffect(() => {
    if (activeScene && activeScene.previewUrl) {
      const isDemo = Boolean(activeScene.id && !activeScene.file && !activeScene.isUpload);
      setSelectedScene(isDemo ? activeScene : null);
      setImagePreview(activeScene.previewUrl);
      if (activeScene.file && !selectedImage) {
        setSelectedImage(activeScene.file);
      }
      setFileInfo({
        name: activeScene.title || activeScene.filename || "Satellite Image",
        formattedSize: activeScene.isUpload ? "Uploaded Raster" : (activeScene.resolution || "Calibrated Dataset"),
        isGeoTiff: Boolean(activeScene.isGeoTiff)
      });
      setMetadata(activeScene.metadata || {
        isGeoTiff: Boolean(activeScene.isGeoTiff),
        fileType: activeScene.sensor || "Optical Satellite Raster",
        filename: activeScene.title,
        crs: activeScene.crs || "EPSG:32643 / WGS 84",
        resolution: activeScene.resolution || "10m GSD",
        bands: activeScene.bands || ["Red", "Green", "Blue", "NIR"],
        acquisitionDate: activeScene.acquisitionDate || new Date().toISOString().split("T")[0]
      });
      // Only populate external result for demo scenes or explicit restoration, not for fresh local file upload
      if (externalAnalysisResult && isDemo) {
        setAnalysisResult(externalAnalysisResult);
        setConversationHistory([
          {
            id: `turn_ext_${Date.now()}`,
            question: externalAnalysisResult.query || "Explain this image",
            answer: externalAnalysisResult.answer,
            explanation: externalAnalysisResult.explanation,
            confidence: externalAnalysisResult.confidence,
            detections: externalAnalysisResult.detections || [],
            segments: externalAnalysisResult.segments || [],
            evidence: externalAnalysisResult.evidence || [],
            modelsUsed: externalAnalysisResult.modelsUsed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } else if (!activeScene && !selectedImage) {
      setSelectedScene(null);
      setImagePreview(null);
      setFileInfo(null);
      setAnalysisResult(null);
      setConversationHistory([]);
      setMetadata(null);
    }
  }, [activeScene, externalAnalysisResult]);

  // Small Suggestion Chips as specified:
  // [ Describe image ] [ Find buildings ] [ Find water ] [ Analyze vegetation ] [ Detect objects ]
  const suggestionChips = [
    { label: isHi ? "छवि का विवरण दें" : "Describe image", query: "Describe this satellite image" },
    { label: isHi ? "इमारतें खोजें" : "Find buildings", query: "Find buildings" },
    { label: isHi ? "जल खोजें" : "Find water", query: "Is there water in this image?" },
    { label: isHi ? "वनस्पति विश्लेषण" : "Analyze vegetation", query: "Analyze vegetation" },
    { label: isHi ? "ऑब्जेक्ट्स का पता लगाएं" : "Detect objects", query: "Detect objects" },
  ];

  // Process uploaded file
  const processFile = async (file) => {
    if (!file) return;

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    let inspected = null;
    try {
      inspected = await inspectLocalImageFile(file);
    } catch (err) {
      console.warn("Client image inspection fallback:", err);
    }

    const preview = inspected?.previewUrl || URL.createObjectURL(file);
    const isTiff = Boolean(file.name.match(/\.tif+/i)) || Boolean(inspected?.isGeoTiff);

    setSelectedImage(file);
    setSelectedScene(null);
    setImagePreview(preview);
    setAnalysisResult(null); // Clear analysis results from previous image
    setConversationHistory([]);
    setIsError(false);
    setSelectedItemId(null);

    const info = {
      name: file.name,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      isGeoTiff: isTiff,
      type: file.type || (isTiff ? "image/tiff" : "image/jpeg")
    };
    setFileInfo(info);

    const initialMeta = {
      isGeoTiff: isTiff,
      fileType: isTiff ? "GeoTIFF Satellite Raster" : "Optical Satellite Imagery",
      filename: file.name,
      dimensions: inspected?.dimensions || null,
      crs: inspected?.crs || (isTiff ? "EPSG:32643 / WGS 84" : "Local Optical Coordinates"),
      bounds: inspected?.bounds || null,
      resolution: inspected?.resolution || (isTiff ? "10m GSD" : "0.5m GSD"),
      bands: inspected?.bands || ["Red", "Green", "Blue", "NIR"],
      acquisitionDate: new Date().toISOString().split("T")[0],
      hasEmbeddedCRS: Boolean(inspected?.hasEmbeddedCRS)
    };
    setMetadata(initialMeta);

    if (onImageReady) {
      onImageReady({
        file,
        metadata: {
          ...initialMeta,
          previewUrl: preview
        }
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Remove image handler - resets workspace cleanly
  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setFileInfo(null);
    setAnalysisResult(null);
    setConversationHistory([]);
    setIsError(false);
    setMetadata(null);
    setSelectedScene(null);
    setUserQuery("");
    setShowTechDetails(false);
    setSelectedItemId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onReset) {
      onReset();
    }
  };

  // Select demo scene from advanced drawer (if user chooses)
  const handleSelectDemoScene = (sceneId) => {
    if (!sceneId) {
      handleRemoveImage();
      return;
    }
    const s = getDemoScene(sceneId);
    if (!s) return;

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setSelectedScene(s);
    setImagePreview(s.previewUrl);
    setFileInfo({
      name: s.title,
      formattedSize: "Sample Dataset",
      isGeoTiff: Boolean(s.isGeoTiff)
    });
    setMetadata(s.metadata || {
      isGeoTiff: s.isGeoTiff !== false,
      fileType: s.sensor || "Optical Satellite Raster",
      filename: s.title,
      dimensions: { width: 800, height: 600 },
      crs: s.crs || "EPSG:32643 / WGS 84",
      resolution: s.resolution || "10m GSD",
      bands: s.bands || ["Red", "Green", "Blue", "NIR"],
      acquisitionDate: s.acquisitionDate || "2024-03-12"
    });
    setAnalysisResult(null);
    setConversationHistory([]);
    setIsError(false);
    setSelectedItemId(null);
  };

  // Run image analysis - sends BOTH actual uploaded File + user question to backend
  const runAnalysis = async (queryText) => {
    const q = (queryText || userQuery || "").trim() || "Describe this satellite image in detail";
    const fileToSend = selectedImage || activeScene?.file;

    if (!fileToSend && !selectedScene) return;

    setIsAnalyzing(true);
    setIsError(false);
    setLoadingStep(1); // 1: Uploading / Preparing image...

    // Step progression animation
    const stepTimer1 = setTimeout(() => {
      setLoadingStep(2); // 2: Analyzing satellite image...
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(3); // 3: Generating SatQuery response...
    }, 1300);

    try {
      let res;
      if (fileToSend) {
        // Send ACTUAL uploaded image file + query to existing backend pipeline
        res = await analyzeImageApi({
          file: fileToSend,
          query: q,
          language
        });
      } else if (selectedScene) {
        res = await analyzeImageApi({
          demoId: selectedScene.id,
          query: q,
          language
        });
      }

      if (res && res.status !== "ERROR") {
        setAnalysisResult(res);
        if (onAnalysisComplete) {
          onAnalysisComplete(res);
        }
        if (res.metadata) {
          setMetadata(prev => ({
            ...prev,
            ...res.metadata
          }));
        }

        // Add to conversation history so user can ask multiple questions!
        setConversationHistory(prev => [
          ...prev,
          {
            id: `turn_${Date.now()}`,
            question: q,
            answer: res.answer,
            explanation: res.explanation,
            confidence: res.confidence,
            detections: res.detections || [],
            segments: res.segments || [],
            evidence: res.evidence || [],
            modelsUsed: res.modelsUsed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        setUserQuery(""); // Clear input, ready for the next question!
      } else {
        setIsError(true);
      }
    } catch (err) {
      console.error("Image analysis error:", err);
      setIsError(true);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
      setLoadingStep(1);
    }
  };

  const handleChipClick = (chip) => {
    setUserQuery(chip.query);
    runAnalysis(chip.query);
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (!userQuery.trim() || isAnalyzing) return;
    runAnalysis(userQuery.trim());
  };

  const hasImage = Boolean(imagePreview);
  const hasAnalysisResults = Boolean(analysisResult && analysisResult.task !== 'analysis_error' && !isError);

  return (
    <div className="image-analysis-page">
      {/* Hidden File Input supporting GeoTIFF, TIFF, PNG, JPG, JPEG, WEBP */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg,.webp" 
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* ========================================================= */}
      {/* 1. INITIAL EMPTY SCREEN (Before Upload) */}
      {/* ========================================================= */}
      {!hasImage ? (
        <div className="ia-initial-hero">
          <div className="ia-header text-center">
            <div className="ia-badge font-mono text-xs">
              <Layers size={13} className="text-teal" />
              <span>IMAGE ANALYSIS</span>
            </div>
            <h1 className="ia-title font-heading">
              {isHi ? "शुरू करने के लिए एक उपग्रह छवि अपलोड करें।" : "Upload a satellite image to start."}
            </h1>
            <p className="ia-subtitle text-muted font-body">
              {isHi 
                ? "इमारतों, जल, वनस्पति, भूमि उपयोग और अन्य दृश्यमान विशेषताओं की पहचान करने के लिए SatQuery से पूछें।" 
                : "Ask SatQuery to identify buildings, water, vegetation, land use and other visible features."}
            </p>
          </div>

          {/* ONE Large Upload Card */}
          <div 
            className={`ia-upload-hero glass-panel ${isDraggingOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="ia-upload-icon-circle">
              <UploadCloud size={40} className="text-teal" />
            </div>
            <button 
              type="button" 
              className="btn-primary ia-upload-btn font-mono text-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <UploadCloud size={16} />
              <span>{isHi ? "उपग्रह छवि अपलोड करें" : "Upload Satellite Image"}</span>
            </button>
            <div className="ia-drop-text text-muted font-body text-sm">
              {isHi ? "या यहाँ एक छवि खींचें और छोड़ें" : "or drag and drop an image here"}
            </div>
            <div className="ia-supported-formats font-mono text-xs">
              <span className="text-muted">Supported:</span>
              <span className="text-highlight">PNG · JPG · JPEG · WEBP · TIFF · GeoTIFF</span>
            </div>
          </div>

          {/* Optional Collapsed Advanced Options for Demo Scenes (Never auto-selected) */}
          <div className="ia-advanced-bar">
            <button 
              type="button" 
              className="ia-advanced-toggle font-mono text-xs text-muted"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>{isHi ? "उन्नत विकल्प" : "Advanced options"}</span>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showAdvanced && (
              <div className="ia-advanced-content glass-panel">
                <span className="text-xs text-muted font-mono mr-2">Sample scene:</span>
                <select 
                  value={selectedScene?.id || ""} 
                  onChange={(e) => handleSelectDemoScene(e.target.value)}
                  className="ia-scene-select font-mono text-xs"
                >
                  <option value="">Select a sample scene</option>
                  {INDIA_DEMO_SCENES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.state})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. WORKSPACE VIEW (After Image Upload) */
        /* ========================================================= */
        <div className="ia-workspace-layout">
          {/* LEFT COLUMN: Clean Image Preview (Constrained & Reasonably Sized) */}
          <div className="ia-preview-panel glass-panel">
            <div className="ia-panel-topbar flex-between font-mono text-xs text-muted mb-2">
              <span className="flex-row items-center gap-1">
                <ImageIcon size={13} className="text-teal" />
                <strong className="text-teal">IMAGE PREVIEW</strong>
              </span>
              <button 
                type="button" 
                className="btn-text-danger font-mono text-xs flex-row items-center gap-1"
                onClick={handleRemoveImage}
                title="Remove Image"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>

            {/* Viewport: Renders GroundingCanvas with pan/zoom & visual grounding overlays when analyzed */}
            <div className="ia-canvas-container">
              <GroundingCanvas 
                imageUrl={imagePreview}
                detections={analysisResult?.detections || []}
                segments={analysisResult?.segments || []}
                layers={analysisResult?.map_layers || []}
                selectedItemId={selectedItemId}
                onSelectItem={(id) => setSelectedItemId(id)}
                hasAnalyzed={hasAnalysisResults}
                t={t}
                language={language}
              />
            </div>

            {/* Image Meta Bar & Remove Button */}
            <div className="ia-preview-meta-row flex-between font-mono text-xs mt-3 pt-2 border-t border-subtle">
              <div className="ia-file-meta-text">
                <strong className="text-truncate block max-w-[240px]" title={fileInfo?.name}>
                  {fileInfo?.name}
                </strong>
                <span className="text-muted">{fileInfo?.formattedSize}</span>
                {fileInfo?.isGeoTiff && (
                  <span className="sensor-tag ml-2 font-mono text-[10px]">GeoTIFF</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Conversational ChatGPT-style Query & AI Responses */}
          <div className="ia-query-panel flex-col gap-3">
            {/* ChatGPT-style Input Container */}
            <div className="ia-chatgpt-card glass-panel">
              <div className="ia-query-heading font-heading text-sm font-semibold mb-2 text-primary">
                {isHi ? "आप इस छवि के बारे में क्या जानना चाहते हैं?" : "What would you like to know about this image?"}
              </div>

              <form onSubmit={handleQuerySubmit} className="ia-chatgpt-form flex-col gap-2.5">
                {/* ChatGPT-style Textarea */}
                <div className="ia-chatgpt-box">
                  <textarea
                    className="ia-chatgpt-textarea font-body text-sm"
                    rows={2}
                    placeholder={isHi ? "इस उपग्रह छवि के बारे में पूछें..." : "Ask about this satellite image..."}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isAnalyzing) {
                          runAnalysis(userQuery.trim());
                        }
                      }
                    }}
                    disabled={isAnalyzing}
                  />
                </div>
                
                {/* Small Suggestion Chips Below Input */}
                <div className="ia-chips-row flex-row flex-wrap gap-1.5 pt-1">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ia-chip-btn font-mono text-xs"
                      onClick={() => handleChipClick(chip)}
                      disabled={isAnalyzing}
                    >
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>

                {/* ONE Clear Primary Action Button */}
                <div className="ia-input-action-bar flex-between items-center mt-2 pt-2 border-t border-subtle">
                  <span className="text-muted font-mono text-xs">
                    {isHi ? "Enter दबाएं या Analyze दबाएं" : "Press Enter ↵ or click to inspect"}
                  </span>
                  <button 
                    type="submit" 
                    className="btn-primary ia-analyze-primary-btn font-mono text-xs"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={13} className="spinning" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        <span>Analyze Image</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* PROGRESSIVE ANALYSIS FLOW INDICATOR */}
            {isAnalyzing && (
              <div className="ia-loading-flow-card glass-panel p-4">
                <div className="ia-loading-flow-title flex-row items-center gap-2 font-mono text-xs text-teal mb-3">
                  <RefreshCw size={15} className="spinning shrink-0" />
                  <span className="font-bold tracking-wide">
                    {isHi ? "उपग्रह विश्लेषण प्रगति पर है..." : "ANALYZING SATELLITE IMAGERY"}
                  </span>
                </div>

                {/* Vertical 3-step sequence matching user prompt */}
                <div className="ia-steps-vertical flex-col gap-1.5 pl-1">
                  <div className={`ia-step-item flex-row items-center gap-2.5 font-mono text-xs ${loadingStep >= 1 ? 'active' : ''}`}>
                    <span className="ia-step-dot"></span>
                    <span className="ia-step-text">Uploading / Preparing image...</span>
                  </div>
                  <div className="ia-step-connector pl-2 font-mono text-xs text-muted">↓</div>
                  <div className={`ia-step-item flex-row items-center gap-2.5 font-mono text-xs ${loadingStep >= 2 ? 'active' : ''}`}>
                    <span className="ia-step-dot"></span>
                    <span className="ia-step-text">Analyzing satellite image...</span>
                  </div>
                  <div className="ia-step-connector pl-2 font-mono text-xs text-muted">↓</div>
                  <div className={`ia-step-item flex-row items-center gap-2.5 font-mono text-xs ${loadingStep >= 3 ? 'active' : ''}`}>
                    <span className="ia-step-dot"></span>
                    <span className="ia-step-text">Generating SatQuery response...</span>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {isError && !isAnalyzing && (
              <div className="ia-error-card glass-panel p-4">
                <div className="flex-row items-center gap-2 text-danger">
                  <AlertCircle size={18} />
                  <strong className="text-sm">
                    {isHi ? "इस छवि का विश्लेषण करने में असमर्थ।" : "Unable to analyze this image."}
                  </strong>
                </div>
                <p className="text-xs text-muted mt-1 font-body">
                  {isHi 
                    ? "कृपया पुनः प्रयास करें।" 
                    : "Please check your network connection or try a different image."}
                </p>
                <button 
                  type="button" 
                  className="btn-secondary btn-sm font-mono text-xs mt-3"
                  onClick={() => runAnalysis(userQuery || "Describe this satellite image")}
                >
                  {isHi ? "पुनः प्रयास करें" : "Try Again"}
                </button>
              </div>
            )}

            {/* READY PROMPT (Before first analysis) */}
            {!isAnalyzing && conversationHistory.length === 0 && !isError && (
              <div className="ia-ready-prompt glass-panel p-3 text-center">
                <p className="text-xs text-muted font-body m-0">
                  {isHi 
                    ? "ऊपर दिए गए बॉक्स में प्रश्न टाइप करें या सुझाव चिप पर क्लिक करें, फिर विश्लेषण शुरू करने के लिए 'Analyze Image' दबाएँ।" 
                    : "Type a question above or select a suggestion chip, then click Analyze Image to inspect features."}
                </p>
              </div>
            )}

            {/* CONVERSATION HISTORY & RESPONSES (Multi-Turn questions about the same image!) */}
            {conversationHistory.length > 0 && !isAnalyzing && (
              <div className="ia-conversation-container flex-col gap-3">
                {conversationHistory.map((turn, tIdx) => (
                  <div key={turn.id || tIdx} className="ia-turn-card glass-panel p-4">
                    {/* User Question */}
                    <div className="ia-user-question-row font-mono text-xs mb-2 flex-between">
                      <span className="flex-row items-center gap-1.5 font-semibold text-primary">
                        <span>👤 You:</span>
                        <span>"{turn.question}"</span>
                      </span>
                      <span className="text-muted text-[11px]">{turn.timestamp}</span>
                    </div>

                    {/* SATQUERY AI Header */}
                    <div className="ia-result-header flex-between font-mono text-xs pb-2 border-b border-subtle">
                      <div className="flex-row items-center gap-2">
                        <Sparkles size={14} className="text-teal" />
                        <span className="ia-satquery-badge font-bold text-teal">SATQUERY</span>
                      </div>
                      {turn.confidence && (
                        <span className="confidence-pill text-emerald font-semibold">
                          {Math.round(turn.confidence * 100)}% Confidence
                        </span>
                      )}
                    </div>

                    {/* AI Answer */}
                    <div className="ia-result-answer text-sm font-body mt-2.5 leading-relaxed">
                      {turn.answer}
                    </div>

                    {turn.explanation && (
                      <div className="ia-result-explanation text-xs text-secondary font-body mt-2 leading-normal">
                        {turn.explanation}
                      </div>
                    )}

                    {/* Visual Evidence Section (Rendered ONLY when actual evidence data exists) */}
                    {(turn.detections?.length > 0 || turn.segments?.length > 0 || turn.evidence?.length > 0) && (
                      <div className="ia-evidence-section mt-3 pt-3 border-t border-subtle">
                        <div className="ia-evidence-title font-mono text-xs text-muted mb-2">
                          VISUAL EVIDENCE & GROUNDING
                        </div>
                        
                        {/* Feature count chips */}
                        <div className="ia-evidence-stats flex-row flex-wrap gap-2 mb-2.5 font-mono text-xs">
                          {turn.detections?.length > 0 && (
                            <span className="ia-stat-chip">
                              🎯 <strong>{turn.detections.length}</strong> Objects Grounded
                            </span>
                          )}
                          {turn.segments?.length > 0 && (
                            <span className="ia-stat-chip">
                              📐 <strong>{turn.segments.length}</strong> SAM2 Masks
                            </span>
                          )}
                          {turn.modelsUsed && (
                            <span className="ia-stat-chip text-muted">
                              🤖 {Array.isArray(turn.modelsUsed) ? turn.modelsUsed.join(', ') : turn.modelsUsed}
                            </span>
                          )}
                        </div>

                        {/* Interactive Detections List */}
                        {turn.detections?.length > 0 && (
                          <div className="ia-detections-list flex-col gap-1.5 mb-2.5">
                            <div className="font-mono text-[11px] text-muted mb-0.5">
                              DETECTED OBJECTS ({turn.detections.length}):
                            </div>
                            <div className="ia-detections-scrollable flex-col gap-1 max-h-[160px] overflow-y-auto">
                              {turn.detections.slice(0, 15).map((det) => (
                                <button
                                  key={det.id}
                                  type="button"
                                  className={`ia-detection-row ${selectedItemId === det.id ? 'selected' : ''}`}
                                  onClick={() => setSelectedItemId(selectedItemId === det.id ? null : det.id)}
                                  title="Click to highlight on image preview"
                                >
                                  <span className="detection-label font-mono text-xs text-truncate">
                                    {det.label}
                                  </span>
                                  <div className="flex-row items-center gap-1.5 shrink-0">
                                    {det.confidence && (
                                      <span className="font-mono text-[10px] text-teal">
                                        {Math.round(det.confidence * 100)}%
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted">
                                      {selectedItemId === det.id ? "● Highlighted" : "Inspect"}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verified evidence badges */}
                        {turn.evidence?.map((ev, idx) => (
                          <div key={idx} className="evidence-badge-chip font-mono text-xs mb-1.5 flex-row items-center gap-1.5">
                            <ShieldCheck size={12} className="text-emerald shrink-0" />
                            <span><strong>{ev.name}:</strong> {ev.detail || ev.indicator}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Optional Collapsed Technical Details */}
                <div className="ia-tech-details-drawer pt-1">
                  <button 
                    type="button" 
                    className="ia-tech-toggle font-mono text-xs text-muted flex-row items-center gap-1"
                    onClick={() => setShowTechDetails(!showTechDetails)}
                  >
                    <span>Technical raster metadata</span>
                    {showTechDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {showTechDetails && (
                    <div className="ia-tech-specs font-mono text-xs mt-2 p-2 rounded bg-surface flex-col gap-1">
                      {metadata?.crs && (
                        <div className="spec-row flex-between">
                          <span className="text-muted">CRS:</span>
                          <span className="text-teal">{metadata.crs}</span>
                        </div>
                      )}
                      {metadata?.resolution && (
                        <div className="spec-row flex-between">
                          <span className="text-muted">Resolution:</span>
                          <span className="text-highlight">{metadata.resolution}</span>
                        </div>
                      )}
                      {metadata?.dimensions && (
                        <div className="spec-row flex-between">
                          <span className="text-muted">Dimensions:</span>
                          <span>{metadata.dimensions.width}×{metadata.dimensions.height} px</span>
                        </div>
                      )}
                      {metadata?.bands && (
                        <div className="spec-row flex-between">
                          <span className="text-muted">Bands:</span>
                          <span className="text-secondary">{metadata.bands.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
