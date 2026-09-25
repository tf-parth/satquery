// SatQuery AI - Conversational New Investigation Workspace
// Connected directly to Google Gemini 3.6 Flash via server-side /api/v1/query
// Preserves layout, design tokens, and components while delivering genuine AI responses.

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  ArrowUp,
  AlertTriangle,
  ShieldCheck,
  Bookmark,
  FileText
} from 'lucide-react';
import { queryIndiaApi, queryAgentApi } from '../utils/api';

export default function NewInvestigationView({ 
  onSaveInvestigation, 
  onNavigateTab, 
  language 
}) {
  const isHi = language === 'hi';

  // Input & file attachment state
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Location context state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');

  // Advanced options state (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    imageryType: 'auto',
    dataset: 'auto',
    dateRange: 'current',
    analysisMethod: 'auto',
    resolution: 'auto'
  });

  // Conversation history
  // Each item: { id, role: 'user' | 'assistant', text, attachedPreview, telemetry, error, errorCode, timestamp }
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedTurns, setSavedTurns] = useState({});

  const fileInputRef = useRef(null);
  const bottomFileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const bottomTextareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const locationPickerRef = useRef(null);
  const lastFailedQueryRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversation.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isLoading]);

  // Click outside to close location popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (locationPickerRef.current && !locationPickerRef.current.contains(e.target)) {
        setShowLocationPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick action buttons
  const quickActions = isHi ? [
    { label: "इमेज का विश्लेषण करें", action: "analyze_image", prompt: "संलग्न उपग्रह इमेज का विश्लेषण करें और प्रमुख विशेषताएं बताएं।" },
    { label: "दो तिथियों की तुलना", action: "compare_dates", prompt: "2020 और 2026 के बीच इस क्षेत्र के उपग्रह डेटा की तुलना करें।" },
    { label: "इमारतें पहचानें", action: "detect_buildings", prompt: "Help me detect buildings in the satellite imagery." },
    { label: "जल निकाय खोजें", action: "find_water", prompt: "Find and analyze water bodies in the selected area." },
    { label: "वनस्पति विश्लेषण", action: "analyze_veg", prompt: "Analyze vegetation in the selected area." },
    { label: "स्थान एक्सप्लोर करें", action: "explore_loc", prompt: null }
  ] : [
    { label: "Analyze an image", action: "analyze_image", prompt: "Help me analyze this satellite imagery." },
    { label: "Compare two dates", action: "compare_dates", prompt: "Compare satellite imagery between two dates." },
    { label: "Detect buildings", action: "detect_buildings", prompt: "Help me detect buildings in the satellite imagery." },
    { label: "Find water bodies", action: "find_water", prompt: "Find and analyze water bodies in the selected area." },
    { label: "Analyze vegetation", action: "analyze_veg", prompt: "Analyze vegetation in the selected area." },
    { label: "Explore a location", action: "explore_loc", prompt: null }
  ];

  // Indian popular regions for quick selection
  const popularLocations = [
    "Noida, Uttar Pradesh",
    "Bengaluru, Karnataka",
    "Mumbai, Maharashtra",
    "Rajasthan (Bhadla)",
    "Assam (Brahmaputra)",
    "Punjab (Ludhiana)",
    "Sundarbans, West Bengal",
    "Delhi NCR"
  ];

  // File Upload Handlers
  const handleFileSelect = (file) => {
    if (!file) return;
    const isTiff = Boolean(file.name.match(/\.tif+/i));
    const previewUrl = URL.createObjectURL(file);
    setAttachedFile(file);
    setAttachedPreview({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      isTiff,
      url: previewUrl
    });
  };

  const handleRemoveAttached = () => {
    if (attachedPreview?.url) {
      URL.revokeObjectURL(attachedPreview.url);
    }
    setAttachedFile(null);
    setAttachedPreview(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Send query to Gemini via backend
  const handleSend = async (overrideText = null) => {
    const rawText = overrideText !== null ? overrideText : inputText;
    const trimmed = (rawText || '').trim();

    if (!trimmed && !attachedFile) return;

    const currentFile = attachedFile;
    const currentFilePreview = attachedPreview ? { ...attachedPreview } : null;

    // Reset input fields
    setInputText('');
    setAttachedFile(null);
    setAttachedPreview(null);
    setShowLocationPicker(false);

    // Build the user message
    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed || (isHi ? "संलग्न उपग्रह इमेज का विश्लेषण करें" : "Analyze attached satellite image"),
      attachedPreview: currentFilePreview,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Store in history
    const nextConversation = [...conversation, userMessage];
    setConversation(nextConversation);
    setIsLoading(true);

    lastFailedQueryRef.current = {
      query: trimmed,
      file: currentFile,
      filePreview: currentFilePreview
    };

    try {
      let geminiAnswer = "";
      let telemetry = null;

      // Prepare conversation history window for multi-turn context (last 8 turns)
      const historyPayload = conversation
        .filter(t => !t.error && t.text)
        .slice(-8)
        .map(t => ({
          role: t.role,
          content: t.text
        }));

      // If user uploaded an image, prepare base64 for Gemini vision analysis
      let imagePayload = null;
      if (currentFile) {
        try {
          const fileToBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

          const dataUrl = await fileToBase64(currentFile);
          if (dataUrl && dataUrl.includes(',')) {
            const [header, base64Data] = dataUrl.split(',');
            const mimeMatch = header.match(/:(.*?);/);
            const mimeType = mimeMatch ? mimeMatch[1] : (currentFile.type || 'image/jpeg');
            imagePayload = {
              name: currentFile.name,
              mimeType,
              data: base64Data
            };
          }
        } catch (imgErr) {
          console.warn("Failed to encode image to base64:", imgErr);
        }
      }

      // Execute Gemini reasoning and agent telemetry concurrently in parallel for maximum speed
      const indiaQueryPromise = queryIndiaApi({
        query: trimmed,
        conversation: historyPayload,
        language: isHi ? 'hi' : 'en',
        image: imagePayload,
        context: {
          location: selectedLocation,
          advancedOptions
        }
      });

      let agentPromise = null;
      if (currentFile) {
        agentPromise = queryAgentApi({
          files: [currentFile],
          query: trimmed,
          language: isHi ? 'hi' : 'en'
        }).catch(rasterErr => {
          console.warn("Local raster extraction note:", rasterErr.message);
          return null;
        });
      }

      const [res, agentRes] = await Promise.all([
        indiaQueryPromise,
        agentPromise ? agentPromise : Promise.resolve(null)
      ]);

      if (!res.success && res.error) {
        throw { errorCode: res.error, message: res.message };
      }

      geminiAnswer = res.answer;

      if (agentRes) {
        telemetry = {
          task: agentRes.task,
          confidence: agentRes.confidence,
          detections: agentRes.detections || [],
          segments: agentRes.segments || [],
          change_map: agentRes.change_map || null,
          evidence: agentRes.evidence || [],
          previewUrl: currentFilePreview?.url,
          execution_trace: agentRes.execution_trace || []
        };
      }

      // If remote sensing pipeline returned spatial telemetry
      if (!telemetry && res.scene) {
        telemetry = {
          task: res.intent || "Geographic Query",
          confidence: 0.92,
          detections: res.detections || [],
          segments: res.segments || [],
          map_layers: res.map_layers || [],
          evidence: res.evidence || [],
          previewUrl: res.scene?.previewUrl,
          scene: res.scene
        };
      }

      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        text: geminiAnswer,
        telemetry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversation(prev => [...prev, assistantMessage]);

      // Automatically register into SatQuery history
      if (onSaveInvestigation) {
        const now = new Date();
        onSaveInvestigation({
          id: `inv_${Date.now()}`,
          title: trimmed ? `${trimmed.substring(0, 42)}...` : "Satellite Investigation",
          title_hi: trimmed ? `${trimmed.substring(0, 42)}...` : "उपग्रह जांच",
          location: selectedLocation || res.matchedRegion?.name || "India",
          state: res.scene?.state || "India",
          dateTime: `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: Date.now(),
          type: res.intent || "Satellite Intelligence",
          status: "COMPLETED",
          thumbnail: telemetry?.change_map || currentFilePreview?.url || res.scene?.previewUrl || "/assets/demo/mumbai_coastal_2024.jpg",
          query: trimmed,
          findings: geminiAnswer,
          evidenceStatus: "Verified Telemetry",
          modelsUsed: res.modelsUsed || ["Gemini-3.6-Flash", "SatQuery-Core"],
          isSaved: false
        });
      }
    } catch (err) {
      console.error("Query execution error:", err);
      const isConfigError = err.errorCode === 'AI_NOT_CONFIGURED';
      const errorMessage = isConfigError 
        ? "SatQuery AI is not configured. Add GEMINI_API_KEY to the backend environment."
        : "SatQuery AI is temporarily unavailable. Please try again.";

      const assistantErrorTurn = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        text: errorMessage,
        error: true,
        errorCode: err.errorCode,
        canRetry: !isConfigError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversation(prev => [...prev, assistantErrorTurn]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last failed query
  const handleRetry = () => {
    if (!lastFailedQueryRef.current) return;
    const { query, file, filePreview } = lastFailedQueryRef.current;
    if (file) {
      setAttachedFile(file);
      setAttachedPreview(filePreview);
    }
    // Remove last error message from conversation
    setConversation(prev => prev.filter((_, i) => i !== prev.length - 1));
    handleSend(query);
  };

  // Quick action click handler
  const handleQuickAction = (qa) => {
    if (qa.action === 'analyze_image') {
      fileInputRef.current?.click();
      return;
    }
    if (qa.action === 'explore_loc') {
      setShowLocationPicker(true);
      return;
    }
    if (qa.prompt) {
      handleSend(qa.prompt);
    }
  };

  // Save / Bookmark Turn
  const handleToggleSaveTurn = (turnId, text, telemetry) => {
    const next = !savedTurns[turnId];
    setSavedTurns(prev => ({ ...prev, [turnId]: next }));
    if (next && onSaveInvestigation) {
      const now = new Date();
      onSaveInvestigation({
        id: `saved_${turnId}`,
        title: text ? `${text.substring(0, 42)}...` : "Saved Finding",
        title_hi: text ? `${text.substring(0, 42)}...` : "सहेजा गया निष्कर्ष",
        location: selectedLocation || "India",
        state: "India",
        dateTime: `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        type: telemetry?.task || "Saved Query",
        status: "COMPLETED",
        thumbnail: telemetry?.change_map || telemetry?.previewUrl || "/assets/demo/mumbai_coastal_2024.jpg",
        query: text,
        findings: text,
        evidenceStatus: "Verified Telemetry",
        modelsUsed: ["Gemini-3.6-Flash"],
        isSaved: true
      });
    }
  };

  return (
    <div className="new-investigation-workspace">
      {/* Top Header Bar */}
      <div className="new-inv-header-bar">
        <div className="new-inv-header-left">
          <div className="new-inv-label-badge font-mono">
            <Sparkles size={12} />
            <span>NEW INVESTIGATION</span>
          </div>
          <h1 className="new-inv-header-title font-heading">
            {isHi ? "आप क्या जांचना चाहते हैं?" : "What would you like to investigate?"}
          </h1>
          <p className="new-inv-header-subtitle">
            {isHi 
              ? "किसी स्थान के बारे में प्रश्न पूछें, उपग्रह इमेज अपलोड करें, या बताएं कि आप क्या खोजना चाहते हैं।"
              : "Ask a question about a place, upload satellite imagery, or describe what you want to find."}
          </p>
        </div>

        {conversation.length > 0 && (
          <button 
            type="button" 
            className="btn-new-chat-reset"
            onClick={() => {
              setConversation([]);
              setInputText('');
              setAttachedFile(null);
              setAttachedPreview(null);
            }}
            title="Start new investigation"
          >
            <RotateCcw size={14} />
            <span>{isHi ? "नई जांच" : "New Investigation"}</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. INITIAL VIEW (EMPTY STATE) */}
      {/* ========================================================================= */}
      {conversation.length === 0 ? (
        <div className="new-inv-empty-state">
          {/* Centered Minimal Heading */}
          <div className="empty-state-intro">
            <h2 className="empty-state-heading font-heading">
              {isHi ? "अपनी उपग्रह जांच शुरू करें" : "Start your investigation"}
            </h2>
            <p className="empty-state-sub text-secondary">
              {isHi 
                ? "भारत की भूमि, वनस्पति, जल निकायों, शहरों या पर्यावरणीय परिवर्तनों के बारे में प्रश्न पूछें।"
                : "Ask a question about India's land, vegetation, water, cities or environmental changes."}
            </p>
          </div>

          {/* Large Centered ChatGPT-style Input Card */}
          <div 
            className={`chatgpt-input-card ${isDragOver ? 'is-drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Attached Image Preview bar */}
            {attachedPreview && (
              <div className="attached-image-bar">
                <div className="attached-left">
                  <img 
                    src={attachedPreview.url} 
                    alt="Satellite preview" 
                    className="attached-thumb-img" 
                  />
                  <div className="attached-info">
                    <span className="attached-name">{attachedPreview.name}</span>
                    <span className="attached-meta">
                      {attachedPreview.size}
                      {attachedPreview.isTiff && <span className="tiff-tag">GeoTIFF</span>}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-remove-attached"
                  onClick={handleRemoveAttached}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Multiline Text Input */}
            <textarea
              ref={textareaRef}
              className="chatgpt-textarea font-body"
              rows={2}
              placeholder={isHi ? "भारत के बारे में SatQuery से कुछ भी पूछें..." : "Ask SatQuery anything about India..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Toolbar */}
            <div className="chatgpt-toolbar">
              <div className="chatgpt-toolbar-left">
                {/* Upload Satellite Image Button */}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".png,.jpg,.jpeg,.tif,.tiff" 
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                <button 
                  type="button" 
                  className="btn-chat-action"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach satellite image (PNG, JPG, GeoTIFF)"
                >
                  <UploadCloud size={14} />
                  <span>{isHi ? "＋ उपग्रह इमेज अपलोड करें" : "＋ Upload satellite image"}</span>
                </button>

                {/* Location Button */}
                <div style={{ position: 'relative' }} ref={locationPickerRef}>
                  <button 
                    type="button" 
                    className={`btn-chat-action ${selectedLocation ? 'active' : ''}`}
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    title="Select or mention location"
                  >
                    <MapPin size={14} />
                    <span>{selectedLocation || (isHi ? "स्थान" : "Location")}</span>
                    {selectedLocation && (
                      <X 
                        size={12} 
                        style={{ marginLeft: 4 }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(null);
                        }} 
                      />
                    )}
                  </button>

                  {/* Location Popover */}
                  {showLocationPicker && (
                    <div className="location-popover-menu">
                      <div className="popover-title">SELECT INDIAN LOCATION</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <input
                          type="text"
                          className="adv-select font-body"
                          style={{ flex: 1 }}
                          placeholder="Type city or coordinates..."
                          value={customLocationInput}
                          onChange={(e) => setCustomLocationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customLocationInput.trim()) {
                              setSelectedLocation(customLocationInput.trim());
                              setShowLocationPicker(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn-loc-choice font-body"
                          style={{ width: 'auto', padding: '4px 10px' }}
                          onClick={() => {
                            if (customLocationInput.trim()) {
                              setSelectedLocation(customLocationInput.trim());
                              setShowLocationPicker(false);
                            }
                          }}
                        >
                          Set
                        </button>
                      </div>

                      <div className="location-chips-grid">
                        {popularLocations.map((loc, idx) => (
                          <button 
                            key={idx}
                            type="button" 
                            className="btn-loc-choice font-body"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setShowLocationPicker(false);
                            }}
                          >
                            <strong>{loc.split(',')[0]}</strong>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Options Toggle */}
                <button 
                  type="button" 
                  className="btn-chat-action font-mono text-xs"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  title="Toggle advanced options"
                >
                  <span>{isHi ? "उन्नत विकल्प" : "Advanced options"}</span>
                  {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {/* Send Button */}
              <button 
                type="button" 
                className="btn-chat-send"
                disabled={!inputText.trim() && !attachedFile}
                onClick={() => handleSend()}
                title="Send query"
              >
                <ArrowUp size={18} />
              </button>
            </div>

            {/* Collapsible Advanced Options Panel */}
            {showAdvanced && (
              <div className="advanced-options-drawer">
                <div className="advanced-options-grid font-mono">
                  <div className="adv-field">
                    <label className="adv-label">Imagery Type</label>
                    <select 
                      className="adv-select"
                      value={advancedOptions.imageryType}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, imageryType: e.target.value })}
                    >
                      <option value="auto">Auto Detect</option>
                      <option value="optical">Optical Multispectral</option>
                      <option value="sar">SAR Microwave Radar</option>
                      <option value="bitemporal">Bi-temporal Pair</option>
                    </select>
                  </div>

                  <div className="adv-field">
                    <label className="adv-label">Dataset</label>
                    <select 
                      className="adv-select"
                      value={advancedOptions.dataset}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, dataset: e.target.value })}
                    >
                      <option value="auto">Auto Dataset</option>
                      <option value="sentinel2">Sentinel-2 MSI</option>
                      <option value="cartosat3">Cartosat-3 High-Res</option>
                      <option value="sentinel1">Sentinel-1 C-SAR</option>
                      <option value="landsat9">Landsat-9 OLI-2</option>
                    </select>
                  </div>

                  <div className="adv-field">
                    <label className="adv-label">Date</label>
                    <select 
                      className="adv-select"
                      value={advancedOptions.dateRange}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, dateRange: e.target.value })}
                    >
                      <option value="current">Current (2024–2026)</option>
                      <option value="2020-2026">2020 → 2026</option>
                      <option value="2016-2024">2016 → 2024</option>
                    </select>
                  </div>

                  <div className="adv-field">
                    <label className="adv-label">Analysis Method</label>
                    <select 
                      className="adv-select"
                      value={advancedOptions.analysisMethod}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, analysisMethod: e.target.value })}
                    >
                      <option value="auto">Auto Routing</option>
                      <option value="urban_growth">Urban Growth</option>
                      <option value="grounding">Building Grounding</option>
                      <option value="ndwi">Water (NDWI)</option>
                      <option value="ndvi">Vegetation (NDVI)</option>
                    </select>
                  </div>

                  <div className="adv-field">
                    <label className="adv-label">Resolution</label>
                    <select 
                      className="adv-select"
                      value={advancedOptions.resolution}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, resolution: e.target.value })}
                    >
                      <option value="auto">Auto Resolution</option>
                      <option value="high_res">0.5m High Resolution</option>
                      <option value="standard">10m Standard</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="quick-actions-section">
            <div className="quick-actions-row">
              {quickActions.map((qa, idx) => (
                <button 
                  key={idx}
                  type="button" 
                  className="btn-suggestion-chip font-body"
                  onClick={() => handleQuickAction(qa)}
                >
                  <Sparkles size={12} className="text-teal" />
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. CHAT CONVERSATION STREAM (AFTER FIRST QUERY) */
        /* ========================================================================= */
        <div className="conversation-stream">
          {conversation.map((turn, idx) => (
            <div key={turn.id || idx} className={`chat-turn ${turn.role}`}>
              {/* User Message */}
              {turn.role === 'user' && (
                <div className="user-bubble-container">
                  <div className="user-bubble font-body">
                    {turn.text}
                  </div>
                  {turn.attachedPreview && (
                    <div className="user-attached-preview font-mono text-xs">
                      <ImageIcon size={14} className="text-teal" />
                      <span>{turn.attachedPreview.name}</span>
                      <span className="text-muted">({turn.attachedPreview.size})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Assistant Message */}
              {turn.role === 'assistant' && (
                <>
                  <div className="assistant-avatar-badge">
                    <Sparkles size={16} />
                  </div>

                  <div className="assistant-body">
                    {/* Error Banner if failed */}
                    {turn.error ? (
                      <div className="inv-error-banner" style={{ margin: 0 }}>
                        <AlertTriangle size={18} className="text-rose" />
                        <div className="error-body">
                          <strong>{turn.text}</strong>
                          {turn.canRetry && (
                            <div style={{ marginTop: 8 }}>
                              <button 
                                type="button" 
                                className="btn-res-action primary"
                                onClick={handleRetry}
                              >
                                <RotateCcw size={13} />
                                <span>Retry</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Real Gemini Response Text */}
                        <div className="assistant-lead-text font-body" style={{ whiteSpace: 'pre-wrap' }}>
                          {turn.text}
                        </div>

                        {/* Optional Telemetry Details & Evidence */}
                        {turn.telemetry && (
                          <div className="results-block">

                            {/* Evidence pills if available */}
                            {turn.telemetry.evidence && turn.telemetry.evidence.length > 0 && (
                              <div className="evidence-items-row font-mono text-xs">
                                {turn.telemetry.evidence.map((ev, eIdx) => (
                                  <div key={eIdx} className="evidence-pill">
                                    <ShieldCheck size={13} className="text-emerald" />
                                    <span>{ev.name}: {ev.detail || ev.indicator}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Actions: Save Result / Generate Report */}
                            <div className="results-actions-row">
                              <button 
                                type="button" 
                                className={`btn-res-action ${savedTurns[turn.id] ? 'primary' : ''}`}
                                onClick={() => handleToggleSaveTurn(turn.id, turn.text, turn.telemetry)}
                              >
                                <Bookmark size={14} />
                                <span>{savedTurns[turn.id] ? (isHi ? "सहेजा गया" : "Saved") : (isHi ? "सहेजें" : "Save Result")}</span>
                              </button>

                              <button 
                                type="button" 
                                className="btn-res-action primary"
                                onClick={() => onNavigateTab && onNavigateTab('reports')}
                              >
                                <FileText size={14} />
                                <span>{isHi ? "रिपोर्ट बनाएं" : "Generate Report"}</span>
                              </button>
                            </div>


                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Loading State: SatQuery is thinking... */}
          {isLoading && (
            <div className="chat-turn assistant">
              <div className="assistant-avatar-badge">
                <Sparkles size={16} />
              </div>
              <div className="assistant-body">
                <div className="assistant-typing-status font-mono">
                  <span className="typing-spinner">🛰️</span>
                  <span>{isHi ? "SatQuery सोच रहा है..." : "SatQuery is thinking..."}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BOTTOM FIXED INPUT BAR (ONCE IN CHAT MODE) */}
      {/* ========================================================================= */}
      {conversation.length > 0 && (
        <div className="bottom-fixed-input-bar">
          <div className="bottom-input-inner">
            <div className="chatgpt-input-card">
              {attachedPreview && (
                <div className="attached-image-bar">
                  <div className="attached-left">
                    <img 
                      src={attachedPreview.url} 
                      alt="Thumbnail" 
                      className="attached-thumb-img" 
                    />
                    <div className="attached-info">
                      <span className="attached-name">{attachedPreview.name}</span>
                      <span className="attached-meta">{attachedPreview.size}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-remove-attached"
                    onClick={handleRemoveAttached}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <textarea
                ref={bottomTextareaRef}
                className="chatgpt-textarea font-body"
                rows={1}
                placeholder={isHi ? "अनुवर्ती सवाल पूछें..." : "Ask a follow-up question..."}
                value={inputText}
                disabled={isLoading}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading) handleSend();
                  }
                }}
              />

              <div className="chatgpt-toolbar">
                <div className="chatgpt-toolbar-left">
                  <input 
                    ref={bottomFileInputRef}
                    type="file" 
                    accept=".png,.jpg,.jpeg,.tif,.tiff" 
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <button 
                    type="button" 
                    className="btn-chat-action"
                    disabled={isLoading}
                    onClick={() => bottomFileInputRef.current?.click()}
                    title="Attach satellite image"
                  >
                    <UploadCloud size={14} />
                    <span>{isHi ? "अपलोड" : "Upload"}</span>
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className={`btn-chat-action ${selectedLocation ? 'active' : ''}`}
                      disabled={isLoading}
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      title="Select location"
                    >
                      <MapPin size={14} />
                      <span>{selectedLocation || (isHi ? "स्थान" : "Location")}</span>
                    </button>

                    {showLocationPicker && (
                      <div className="location-popover-menu">
                        <div className="popover-title">SELECT INDIAN LOCATION</div>
                        <div className="location-chips-grid">
                          {popularLocations.map((loc, idx) => (
                            <button 
                              key={idx}
                              type="button" 
                              className="btn-loc-choice font-body"
                              onClick={() => {
                                setSelectedLocation(loc);
                                setShowLocationPicker(false);
                              }}
                            >
                              <strong>{loc.split(',')[0]}</strong>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-chat-send"
                  disabled={isLoading || (!inputText.trim() && !attachedFile)}
                  onClick={() => handleSend()}
                  title="Send message"
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
