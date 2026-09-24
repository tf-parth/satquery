// SatQuery AI - Query Workspace Multi-Tab Composer
// Earth Observation & GIS Workstation Visual System
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Paperclip, 
  ArrowRight, 
  UploadCloud, 
  SlidersHorizontal, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function MainComposer({ 
  onSendQuery, 
  onUploadClick, 
  onCompareClick, 
  initialQuery = "",
  isLoading, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState('ask'); // 'ask' | 'upload' | 'compare'
  const [queryText, setQueryText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setQueryText(initialQuery);
    }
  }, [initialQuery]);

  const sampleSuggestions = isHi ? [
    "क्या शहरी विस्तार में वृद्धि हुई है?",
    "इस इमेज में इमारतें खोजें",
    "राजस्थान में वनस्पति दिखाएं",
    "जल निकायों और झीलों का पता लगाएं",
    "2020 बनाम 2026 की तुलना करें",
    "इस उपग्रह दृश्य की व्याख्या करें"
  ] : [
    "Has urban expansion increased?",
    "Find buildings in this image",
    "Show vegetation in Rajasthan",
    "Detect water bodies",
    "Compare 2020 vs 2026",
    "Explain this satellite scene"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim() && !attachedFile) return;
    onSendQuery({
      query: queryText.trim(),
      file: attachedFile,
      tab: activeTab
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  return (
    <div className="query-workspace-container" id="query-workspace">
      {/* Tab Switcher: ASK SATQUERY | UPLOAD IMAGE | COMPARE IMAGES */}
      <div className="workspace-tab-bar">
        <button 
          type="button"
          className={`workspace-tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
          onClick={() => setActiveTab('ask')}
        >
          <Search size={14} />
          <span>{isHi ? "सैटक्वेरी से पूछें" : "ASK SATQUERY"}</span>
        </button>

        <button 
          type="button"
          className={`workspace-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('upload');
            if (onUploadClick) onUploadClick();
          }}
        >
          <UploadCloud size={14} />
          <span>{isHi ? "इमेज अपलोड करें" : "UPLOAD IMAGE"}</span>
        </button>

        <button 
          type="button"
          className={`workspace-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('compare');
            if (onCompareClick) onCompareClick();
          }}
        >
          <SlidersHorizontal size={14} />
          <span>{isHi ? "इमेजरी तुलना" : "COMPARE IMAGES"}</span>
        </button>
      </div>

      {/* Main Input Form */}
      <form className="workspace-composer-form" onSubmit={handleSubmit}>
        <div className="workspace-input-row">
          <input 
            type="text"
            className="workspace-text-input font-body"
            placeholder={
              activeTab === 'upload' 
                ? (isHi ? "उपग्रह इमेज का विश्लेषण करने के लिए प्रश्न टाइप करें..." : "Upload an image and ask a question in plain language...")
                : (isHi ? "भारत के उपग्रह डेटा के बारे में कुछ भी पूछें..." : "Ask anything about India's satellite imagery...")
            }
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={isLoading}
          />

          {/* Hidden File Input */}
          <input 
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff,.geotiff"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Attachment Tool */}
          <button 
            type="button"
            className={`btn-workspace-tool ${attachedFile ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title={isHi ? "इमेज या GeoTIFF संलग्न करें" : "Attach Image / GeoTIFF"}
          >
            <Paperclip size={16} />
          </button>

          {/* Send Button: [ → ] */}
          <button 
            type="submit"
            className="btn-workspace-send"
            disabled={(!queryText.trim() && !attachedFile) || isLoading}
            title={isHi ? "जांच शुरू करें" : "Run Investigation"}
          >
            {isLoading ? (
              <span className="spinner-dots"></span>
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </div>

        {/* Attached File Pill */}
        {attachedFile && (
          <div className="attached-file-pill font-mono text-xs">
            <FileSpreadsheet size={13} className="text-forest" />
            <span className="attached-filename">{attachedFile.name}</span>
            <span className="attached-size text-muted">({(attachedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            <button 
              type="button" 
              className="btn-remove-attachment"
              onClick={() => setAttachedFile(null)}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Suggested Queries Below */}
        <div className="workspace-suggestions-bar">
          <span className="suggestions-label font-mono text-xs">
            {isHi ? "सुझाए गए प्रश्न:" : "SUGGESTIONS:"}
          </span>
          <div className="suggestions-list-row">
            {sampleSuggestions.map((sug, idx) => (
              <button 
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => setQueryText(sug)}
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
