// SatQuery AI - Dedicated Saved Results Library
// Card layout: Title, Query, Location, Date, Thumbnail, Task
// Actions: [ Open ], [ Rename ], [ Download JSON ], [ Remove ]
// Search, Filter, Sort, Empty state with [ Start an Investigation ] CTA

import React, { useState } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  Download, 
  Trash2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  FileText,
  Search,
  ArrowUpDown,
  Edit2,
  Sparkles,
  Layers
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function SavedResultsView({ 
  savedItems = [], 
  onOpenInvestigation, 
  onRemoveFromSaved, 
  onRenameInvestigation,
  onExportReport, 
  onNavigateTab,
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "title"
  const [renameItem, setRenameItem] = useState(null);
  const [newTitleVal, setNewTitleVal] = useState("");

  const filterOptions = ["All", "Change Detection", "Disaster Analysis", "Object Detection", "Vegetation", "Image Analysis"];

  // Filtering
  const filtered = savedItems.filter(item => {
    const qText = (item.title || item.query || "").toLowerCase();
    const locText = (item.location || "").toLowerCase();
    const taskText = (item.type || "").toLowerCase();
    const matchesSearch = qText.includes(searchTerm.toLowerCase()) || 
                          locText.includes(searchTerm.toLowerCase()) ||
                          taskText.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "All") return true;
    return item.type === activeFilter;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return (b.timestamp || 0) - (a.timestamp || 0);
    if (sortBy === "oldest") return (a.timestamp || 0) - (b.timestamp || 0);
    if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
    return 0;
  });

  // Download single investigation as JSON
  const handleDownloadJson = (item) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery_${item.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartRename = (item) => {
    setRenameItem(item);
    setNewTitleVal(item.title);
  };

  const handleConfirmRename = () => {
    if (renameItem && newTitleVal.trim() && onRenameInvestigation) {
      onRenameInvestigation(renameItem.id, newTitleVal.trim());
    }
    setRenameItem(null);
  };

  return (
    <div className="saved-results-page-container glass-panel">
      {/* Page Header */}
      <div className="history-header-bar">
        <div className="history-title-block">
          <div className="history-badge font-mono text-xs">
            <Bookmark size={13} className="text-isro" />
            <span>BOOKMARKED INTELLIGENCE</span>
          </div>
          <h1 className="history-page-title font-heading">
            {isHi ? "सहेजे गए उपग्रह परिणाम" : "Saved Analysis Results"}
          </h1>
          <p className="history-page-sub text-secondary">
            {isHi 
              ? "भविष्य के संदर्भ, नीति-निर्धारण एवं मिशन रिपोर्टिंग के लिए बुकमार्क किए गए परिणाम।" 
              : "Curated collection of saved satellite observations bookmarked for briefing, mission reports, and policy verification."}
          </p>
        </div>
      </div>

      {/* Search, Filter, Sort Controls */}
      <div className="saved-controls-bar">
        <div className="history-search-box">
          <Search size={15} className="text-muted" />
          <input 
            type="text"
            className="history-search-input font-body text-xs"
            placeholder="Search saved results by title, location, or task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="saved-filter-row font-mono text-xs">
          <select 
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="filter-select-dropdown"
          >
            {filterOptions.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <div className="flex-row items-center gap-1 text-muted">
            <ArrowUpDown size={13} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select-dropdown"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sorted.length === 0 ? (
        <div className="saved-empty-container">
          <Bookmark size={40} className="text-muted empty-icon" />
          <h3 className="empty-heading font-heading">No saved analyses yet.</h3>
          <p className="empty-body text-secondary text-xs">
            Bookmark interesting findings during any investigation to build your reference collection.
          </p>
          <button 
            type="button"
            className="btn-start-inv-cta"
            onClick={() => onNavigateTab && onNavigateTab('new-investigation')}
          >
            <Sparkles size={14} />
            <span>Start an Investigation</span>
          </button>
        </div>
      ) : (
        <div className="saved-cards-grid">
          {sorted.map((item) => (
            <div key={item.id} className="saved-result-card glass-panel">
              {/* Thumbnail and Task Pill */}
              <div className="saved-card-thumb-wrapper">
                <img src={item.thumbnail} alt={item.title} className="saved-thumb-img" />
                <span className="saved-type-pill font-mono text-xs">{item.type}</span>
              </div>

              {/* Card Body */}
              <div className="saved-card-body">
                <div className="saved-title-row">
                  <h3 className="saved-card-title font-heading">
                    {isHi ? (item.title_hi || item.title) : item.title}
                  </h3>
                  <button 
                    type="button"
                    className="btn-rename-icon"
                    onClick={() => handleStartRename(item)}
                    title="Rename this saved item"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>

                <div className="saved-meta-row font-mono text-xs">
                  <span className="meta-loc">
                    <MapPin size={12} className="text-teal" />
                    <span>{item.location}</span>
                  </span>
                  <span className="meta-dot">•</span>
                  <span className="text-muted">{item.dateTime}</span>
                </div>

                <div className="saved-query-snippet text-xs">
                  <strong className="text-muted font-mono">Query: </strong>
                  <span className="text-secondary">{item.query}</span>
                </div>

                {item.findings && (
                  <div className="saved-finding-box text-xs">
                    <strong className="text-teal font-mono">Findings: </strong>
                    <div className="text-secondary mt-1">
                      <MarkdownRenderer content={item.findings} />
                    </div>
                  </div>
                )}

                <div className="saved-evidence-status font-mono text-xs">
                  <ShieldCheck size={13} className="text-emerald" />
                  <span>{item.evidenceStatus || "Verified Observation"}</span>
                </div>
              </div>

              {/* Card Actions: [ Open ] [ Rename ] [ Download ] [ Remove ] */}
              <div className="saved-card-actions">
                <button 
                  type="button"
                  className="btn-saved-action btn-open font-mono text-xs"
                  onClick={() => onOpenInvestigation && onOpenInvestigation(item)}
                  title="Open investigation in workspace"
                >
                  <ExternalLink size={13} />
                  <span>Open</span>
                </button>

                <button 
                  type="button"
                  className="btn-saved-action btn-rename font-mono text-xs"
                  onClick={() => handleStartRename(item)}
                  title="Rename title"
                >
                  <Edit2 size={13} />
                  <span>Rename</span>
                </button>

                <button 
                  type="button"
                  className="btn-saved-action btn-download font-mono text-xs"
                  onClick={() => handleDownloadJson(item)}
                  title="Download telemetry JSON"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>

                <button 
                  type="button"
                  className="btn-saved-action btn-remove font-mono text-xs"
                  onClick={() => onRemoveFromSaved && onRemoveFromSaved(item.id)}
                  title="Remove from saved library"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {renameItem && (
        <div className="modal-backdrop-overlay">
          <div className="rename-modal glass-panel">
            <h3 className="modal-title font-heading">Rename Saved Result</h3>
            <p className="modal-desc text-secondary text-xs">
              Update the display title for this saved investigation.
            </p>
            <input 
              type="text"
              className="rename-input font-body text-sm"
              value={newTitleVal}
              onChange={(e) => setNewTitleVal(e.target.value)}
              autoFocus
            />
            <div className="modal-actions-row font-mono text-xs">
              <button 
                type="button"
                className="btn-modal-cancel"
                onClick={() => setRenameItem(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-modal-primary"
                onClick={handleConfirmRename}
                disabled={!newTitleVal.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
