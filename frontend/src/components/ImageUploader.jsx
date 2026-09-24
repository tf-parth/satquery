// SatQuery AI - Multi-Mode Image Uploader with GeoTIFF Metadata Inspector & Modality Badges
// Adheres strictly to Section 12 & 13 of official SIH Problem Statement 26167.

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Layers, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Compass, 
  Search,
  X,
  FileSpreadsheet,
  Radio,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { inspectLocalImageFile } from '../utils/geotiffClient';

export default function ImageUploader({ 
  onImageReady, 
  onAnalyze, 
  isLoading, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  // Upload mode: 'single' | 'bitemporal' | 'crossmodal' | 'auto'
  const [uploadMode, setUploadMode] = useState('auto');
  const [selectedFile1, setSelectedFile1] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null);
  const [metadataFile1, setMetadataFile1] = useState(null);
  const [metadataFile2, setMetadataFile2] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [dragActive1, setDragActive1] = useState(false);
  const [dragActive2, setDragActive2] = useState(false);

  const processFile1 = async (file) => {
    setSelectedFile1(file);
    setValidationError(null);
    try {
      const inspected = await inspectLocalImageFile(file);
      setMetadataFile1(inspected);
      if (onImageReady) {
        onImageReady({ file, metadata: inspected });
      }
    } catch (err) {
      console.error("Error inspecting file 1:", err);
    }
  };

  const processFile2 = async (file) => {
    setSelectedFile2(file);
    setValidationError(null);
    try {
      const inspected = await inspectLocalImageFile(file);
      setMetadataFile2(inspected);
    } catch (err) {
      console.error("Error inspecting file 2:", err);
    }
  };

  const handleClearAll = () => {
    setSelectedFile1(null);
    setSelectedFile2(null);
    setMetadataFile1(null);
    setMetadataFile2(null);
    setQueryText("");
    setValidationError(null);
    if (fileInputRef1.current) fileInputRef1.current.value = "";
    if (fileInputRef2.current) fileInputRef2.current.value = "";
  };

  const handleSuggestionClick = (suggestion) => {
    setQueryText(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const files = [selectedFile1, selectedFile2].filter(Boolean);

    if (files.length === 0 && !metadataFile1) {
      setValidationError({
        error: isHi ? "कृपया कम से कम एक इमेज या GeoTIFF फ़ाइल चुनें।" : "Please upload at least one image or GeoTIFF file.",
        suggestion: isHi ? "फ़ाइल चयन क्षेत्र पर क्लिक करें या ड्रैग-एंड-ड्रॉप करें।" : "Click the drop zone or drag and drop files."
      });
      return;
    }

    if (uploadMode === 'bitemporal' && files.length < 2) {
      setValidationError({
        error: isHi ? "द्वि-कालिक (Bi-temporal) विश्लेषण के लिए दो छवियों (T1 और T2) की आवश्यकता है।" : "Bi-temporal analysis requires two images (T1 baseline and T2 observation).",
        suggestion: isHi ? "कृपया दूसरी छवि (T2) भी अपलोड करें।" : "Please upload the second image (T2) to compare."
      });
      return;
    }

    if (uploadMode === 'crossmodal' && files.length < 2) {
      setValidationError({
        error: isHi ? "क्रॉस-मॉडल विश्लेषण के लिए ऑप्टिकल और SAR दोनों छवियों की आवश्यकता है।" : "Cross-modal analysis requires both an Optical image and a SAR image.",
        suggestion: isHi ? "कृपया सह-पंजीकृत ऑप्टिकल और SAR दोनों फ़ाइलें अपलोड करें।" : "Please upload both co-registered Optical and SAR images."
      });
      return;
    }

    setValidationError(null);
    const finalQuery = queryText.trim() || (
      uploadMode === 'bitemporal' ? "What changed between these two images?" :
      uploadMode === 'crossmodal' ? "Use the optical and SAR images to identify water and built-up regions" :
      (isHi ? "इस इमेज का विश्लेषण करें" : "Explain this image and identify all key features")
    );

    onAnalyze({
      file: selectedFile1,
      files,
      metadata: metadataFile1,
      mode: uploadMode,
      query: finalQuery
    });
  };

  return (
    <div className="image-uploader-card glass-panel">
      {/* SIH Query Modes Switcher */}
      <div className="uploader-mode-selector-bar">
        <span className="mode-selector-title font-mono text-xs text-muted">
          {isHi ? "मोड चुनें:" : "QUERY MODE:"}
        </span>
        <div className="mode-buttons-group">
          <button 
            type="button"
            className={`uploader-mode-tab ${uploadMode === 'auto' ? 'active' : ''}`}
            onClick={() => setUploadMode('auto')}
          >
            <span>MODE 4: AUTO</span>
          </button>
          <button 
            type="button"
            className={`uploader-mode-tab ${uploadMode === 'single' ? 'active' : ''}`}
            onClick={() => setUploadMode('single')}
          >
            <span>MODE 1: SINGLE IMAGE</span>
          </button>
          <button 
            type="button"
            className={`uploader-mode-tab ${uploadMode === 'bitemporal' ? 'active' : ''}`}
            onClick={() => setUploadMode('bitemporal')}
          >
            <span>MODE 2: BI-TEMPORAL (T1 + T2)</span>
          </button>
          <button 
            type="button"
            className={`uploader-mode-tab ${uploadMode === 'crossmodal' ? 'active' : ''}`}
            onClick={() => setUploadMode('crossmodal')}
          >
            <span>MODE 3: OPTICAL + SAR</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="validation-error-banner font-mono text-xs">
          <div className="validation-err-title">
            <AlertCircle size={15} className="text-red" />
            <strong className="text-red">{validationError.error}</strong>
          </div>
          {validationError.suggestion && (
            <div className="validation-suggestion text-muted">
              💡 {validationError.suggestion}
            </div>
          )}
        </div>
      )}

      {/* Drop Zones Container (1 or 2 slots based on mode) */}
      <div className={`multi-dropzone-grid ${uploadMode === 'bitemporal' || uploadMode === 'crossmodal' ? 'pair-grid' : 'single-grid'}`}>
        {/* Slot 1: Primary Image / T1 / Optical */}
        <div className="dropzone-slot-card">
          <div className="slot-badge-row font-mono text-xs">
            <span className="slot-role-tag">
              {uploadMode === 'bitemporal' ? "IMAGE T1 (BASELINE)" :
               uploadMode === 'crossmodal' ? "OPTICAL / MULTISPECTRAL" : "PRIMARY IMAGE"}
            </span>
            {metadataFile1?.isGeoTiff ? (
              <span className="modality-badge badge-geotiff font-mono">GEOTIFF</span>
            ) : selectedFile1 ? (
              <span className="modality-badge badge-optical font-mono">OPTICAL</span>
            ) : null}
          </div>

          {!selectedFile1 ? (
            <div 
              className={`drop-zone slot-zone ${dragActive1 ? 'drag-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive1(true); }}
              onDragLeave={() => setDragActive1(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragActive1(false);
                if (e.dataTransfer.files?.[0]) await processFile1(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef1.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input 
                ref={fileInputRef1}
                type="file"
                accept=".png,.jpg,.jpeg,.tif,.tiff,.geotiff"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  if (e.target.files?.[0]) await processFile1(e.target.files[0]);
                }}
              />
              <UploadCloud size={32} className="upload-icon-pulse text-teal" />
              <p className="drop-title text-xs font-heading">
                {uploadMode === 'crossmodal' ? "Upload Optical GeoTIFF/Image" :
                 uploadMode === 'bitemporal' ? "Upload Baseline Image T1" : t.upload.drop_zone_title}
              </p>
              <span className="text-muted text-xs">GeoTIFF, TIFF, PNG, JPG</span>
            </div>
          ) : (
            <div className="uploaded-preview-mini">
              <div className="mini-preview-top">
                <CheckCircle2 size={14} className="text-emerald" />
                <span className="font-mono text-xs truncate">{selectedFile1.name}</span>
                <button 
                  type="button" 
                  className="btn-icon-clear" 
                  onClick={() => { setSelectedFile1(null); setMetadataFile1(null); }}
                >
                  <X size={14} />
                </button>
              </div>
              {metadataFile1?.previewUrl && (
                <img src={metadataFile1.previewUrl} alt="Slot 1 Preview" className="mini-thumb-img" />
              )}
              <div className="mini-meta-summary font-mono text-xs text-muted">
                {metadataFile1?.dimensions ? `${metadataFile1.dimensions.width}×${metadataFile1.dimensions.height}px` : ""} | {metadataFile1?.crs || "Optical"}
              </div>
            </div>
          )}
        </div>

        {/* Slot 2: Secondary Image / T2 / SAR (Active in Bi-temporal, Cross-modal, or Auto when 1st file chosen) */}
        {(uploadMode === 'bitemporal' || uploadMode === 'crossmodal' || selectedFile1) && (
          <div className="dropzone-slot-card">
            <div className="slot-badge-row font-mono text-xs">
              <span className="slot-role-tag">
                {uploadMode === 'bitemporal' ? "IMAGE T2 (OBSERVATION)" :
                 uploadMode === 'crossmodal' ? "SAR (RADAR BACKSCATTER)" : "SECONDARY / COMPARISON IMAGE"}
              </span>
              {metadataFile2?.isGeoTiff ? (
                <span className="modality-badge badge-geotiff font-mono">GEOTIFF</span>
              ) : selectedFile2 ? (
                <span className="modality-badge badge-sar font-mono">
                  {uploadMode === 'crossmodal' ? "SAR" : "OPTICAL"}
                </span>
              ) : null}
            </div>

            {!selectedFile2 ? (
              <div 
                className={`drop-zone slot-zone ${dragActive2 ? 'drag-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive2(true); }}
                onDragLeave={() => setDragActive2(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragActive2(false);
                  if (e.dataTransfer.files?.[0]) await processFile2(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef2.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input 
                  ref={fileInputRef2}
                  type="file"
                  accept=".png,.jpg,.jpeg,.tif,.tiff,.geotiff"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    if (e.target.files?.[0]) await processFile2(e.target.files[0]);
                  }}
                />
                <Plus size={32} className="text-orange" />
                <p className="drop-title text-xs font-heading">
                  {uploadMode === 'crossmodal' ? "Upload SAR GeoTIFF/Image" :
                   uploadMode === 'bitemporal' ? "Upload Observation Image T2" : "Add 2nd Image for Comparison"}
                </p>
                <span className="text-muted text-xs">Optional in Single/Auto mode</span>
              </div>
            ) : (
              <div className="uploaded-preview-mini">
                <div className="mini-preview-top">
                  <CheckCircle2 size={14} className="text-emerald" />
                  <span className="font-mono text-xs truncate">{selectedFile2.name}</span>
                  <button 
                    type="button" 
                    className="btn-icon-clear" 
                    onClick={() => { setSelectedFile2(null); setMetadataFile2(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>
                {metadataFile2?.previewUrl && (
                  <img src={metadataFile2.previewUrl} alt="Slot 2 Preview" className="mini-thumb-img" />
                )}
                <div className="mini-meta-summary font-mono text-xs text-muted">
                  {metadataFile2?.dimensions ? `${metadataFile2.dimensions.width}×${metadataFile2.dimensions.height}px` : ""} | {metadataFile2?.crs || "SAR / Optical"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Query Bar */}
      <form className="image-query-form" onSubmit={handleSubmit}>
        <div className="query-input-header">
          <Sparkles size={16} className="text-isro" />
          <label htmlFor="image-query-input" className="query-label font-mono text-xs">
            {uploadMode === 'bitemporal' ? "WHAT TEMPORAL CHANGE WOULD YOU LIKE TO DETECT?" :
             uploadMode === 'crossmodal' ? "WHAT MULTIMODAL FEATURES WOULD YOU LIKE TO ANALYZE?" :
             (isHi ? "आप इस इमेज के बारे में क्या जानना चाहते हैं?" : "WHAT WOULD YOU LIKE TO KNOW?")}
          </label>
        </div>

        <div className="input-with-action-row">
          <input 
            id="image-query-input"
            type="text"
            className="query-input-field font-body"
            placeholder={
              uploadMode === 'bitemporal' 
                ? (isHi ? "उदा. 'क्या निर्मित क्षेत्र में वृद्धि हुई है?' या 'वनस्पति में क्या बदलाव हुआ?'" : "e.g. 'Has the built-up area increased?', 'Where did vegetation decrease?'") :
              uploadMode === 'crossmodal'
                ? (isHi ? "उदा. 'ऑप्टिकल और SAR दोनों छवियों का उपयोग करके पानी और इमारतों की पहचान करें'" : "e.g. 'Use optical and SAR images to identify water and built-up regions'") :
              (isHi ? "उदा. 'सभी इमारतें खोजें' या 'इस छवि में क्या दिख रहा है?'" : "Ask something about this image (e.g. 'Highlight all buildings', 'What land cover dominates?')...")
            }
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-primary analyze-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-dots"></span>
                <span>{isHi ? "विश्लेषण जारी..." : "Orchestrating..."}</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>{t.actions.analyze_image}</span>
              </>
            )}
          </button>
        </div>

        {/* Suggestions Chips */}
        <div className="query-suggestions-container">
          <span className="suggestions-badge font-mono text-xs">{t.query_suggestions_title}:</span>
          <div className="suggestions-scroll">
            {(uploadMode === 'bitemporal' ? [
              "What changed between these two images?",
              "Has the built-up area increased?",
              "Where did vegetation decrease?",
              "Quantify the hectare shift"
            ] : uploadMode === 'crossmodal' ? [
              "Use optical and SAR images to identify water and built-up regions",
              "Verify water boundaries under cloud cover",
              "Identify infrastructure using microwave backscatter"
            ] : t.suggestions).map((sug, idx) => (
              <button 
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(sug)}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
