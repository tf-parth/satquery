// SatQuery AI - Dedicated Investigation History Page
// Card format: Query, Date, Location, Input Type, Task, Status, Findings
// Filters: [ All ], [ VQA ], [ Grounding ], [ Change ], [ Disaster ], [ Optical + SAR ]
// Search & Sort (Newest, Oldest, Location, Task)
// Actions: [ Open ], [ Delete ] with modal confirmation

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Bookmark,
  Sparkles,
  Layers
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function HistoryView({ 
  investigations = [], 
  onOpenInvestigation, 
  onDuplicateInvestigation, 
  onToggleSaveInvestigation, 
  onDeleteInvestigation, 
  onClearHistory, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "location" | "task"

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Exact filters requested by user
  const filterCategories = [
    { id: "All", label: "All" },
    { id: "VQA", label: "VQA" },
    { id: "Grounding", label: "Grounding" },
    { id: "Change", label: "Change" },
    { id: "Disaster", label: "Disaster" },
    { id: "Optical + SAR", label: "Optical + SAR" }
  ];

  // Filtering
  const filtered = investigations.filter(inv => {
    const qText = (inv.query || inv.title || "").toLowerCase();
    const locText = (inv.location || "").toLowerCase();
    const taskText = (inv.type || "").toLowerCase();
    const matchesSearch = qText.includes(searchTerm.toLowerCase()) || 
                          locText.includes(searchTerm.toLowerCase()) || 
                          taskText.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "All") return true;
    if (activeFilter === "VQA") {
      return taskText.includes("vqa") || taskText.includes("image analysis") || qText.includes("what") || qText.includes("explain");
    }
    if (activeFilter === "Grounding") {
      return taskText.includes("grounding") || taskText.includes("object") || qText.includes("find") || qText.includes("highlight");
    }
    if (activeFilter === "Change") {
      return taskText.includes("change") || taskText.includes("temporal") || qText.includes("change") || qText.includes("compare");
    }
    if (activeFilter === "Disaster") {
      return taskText.includes("disaster") || taskText.includes("flood") || qText.includes("flood");
    }
    if (activeFilter === "Optical + SAR") {
      return taskText.includes("sar") || taskText.includes("optical + sar") || qText.includes("sar");
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return (b.timestamp || 0) - (a.timestamp || 0);
    if (sortBy === "oldest") return (a.timestamp || 0) - (b.timestamp || 0);
    if (sortBy === "location") return (a.location || "").localeCompare(b.location || "");
    if (sortBy === "task") return (a.type || "").localeCompare(b.type || "");
    return 0;
  });

  const confirmDelete = () => {
    if (itemToDelete && onDeleteInvestigation) {
      onDeleteInvestigation(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div className="history-page-container glass-panel">
      {/* Page Header */}
      <div className="history-header-bar">
        <div className="history-title-block">
          <div className="history-badge font-mono text-xs">
            <History size={13} className="text-teal" />
            <span>INVESTIGATION ARCHIVE</span>
          </div>
          <h1 className="history-page-title font-heading">
            {isHi ? "मेरी उपग्रह जांच हिस्ट्री" : "My Investigation History"}
          </h1>
          <p className="history-page-sub text-secondary">
            {isHi 
              ? "पूर्व में निष्पादित सभी रिमोट सेंसिंग जांचों, मॉडल परिणामों व साक्ष्यों का पूरा रिकॉर्ड।" 
              : "Complete session record of all visual question answering, grounding, and change detection queries."}
          </p>
        </div>

        {/* Clear All Button */}
        {investigations.length > 0 && (
          <button 
            type="button"
            className="btn-clear-history font-mono text-xs"
            onClick={() => setShowClearModal(true)}
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="history-controls-bar">
        {/* Search Field */}
        <div className="history-search-box">
          <Search size={15} className="text-muted" />
          <input 
            type="text"
            className="history-search-input font-body text-xs"
            placeholder="Search history by query, location, or task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort Dropdown: Newest, Oldest, Location, Task */}
        <div className="history-sort-box font-mono text-xs">
          <ArrowUpDown size={13} className="text-muted" />
          <span className="text-muted">SORT:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select-dropdown"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="location">Location</option>
            <option value="task">Task</option>
          </select>
        </div>
      </div>

      {/* Filter Chips: [ All ] [ VQA ] [ Grounding ] [ Change ] [ Disaster ] [ Optical + SAR ] */}
      <div className="history-filter-chips-row font-mono text-xs">
        {filterCategories.map(cat => (
          <button 
            key={cat.id}
            type="button"
            className={`history-filter-chip ${activeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Cards List or Empty State */}
      {sorted.length === 0 ? (
        <div className="history-empty-state">
          <History size={36} className="text-muted empty-icon" />
          <h3 className="empty-title font-heading">No Investigations Found</h3>
          <p className="empty-desc text-secondary text-xs">
            No queries match your current filter. Run a new investigation from the sidebar or click below.
          </p>
        </div>
      ) : (
        <div className="history-cards-grid">
          {sorted.map((inv) => (
            <div key={inv.id} className="history-card glass-panel">
              {/* Card Thumbnail / Input Type Badge */}
              <div className="history-card-thumb-col">
                <img 
                  src={inv.thumbnail || "/assets/demo/mumbai_coastal_2024.jpg"} 
                  alt={inv.title} 
                  className="history-thumb-img"
                />
                <span className="history-input-type-badge font-mono text-xs">
                  {inv.type || "Optical"}
                </span>
              </div>

              {/* Card Details Body */}
              <div className="history-card-body">
                <div className="history-card-header-row font-mono text-xs">
                  <span className="history-status-pill text-emerald">
                    <CheckCircle2 size={12} />
                    <span>{inv.status || "Completed"}</span>
                  </span>
                  <span className="history-timestamp text-muted">
                    {inv.dateTime || "Recent"}
                  </span>
                </div>

                <h3 className="history-card-query font-heading">
                  {inv.query || inv.title}
                </h3>

                <div className="history-meta-row font-mono text-xs">
                  <span className="meta-item">
                    <MapPin size={12} className="text-teal" />
                    <span>{inv.location || "India"}</span>
                  </span>
                  <span className="meta-sep">•</span>
                  <span className="meta-item text-highlight">
                    Task: {inv.type || "Analysis"}
                  </span>
                </div>

                {inv.findings && (
                  <div className="history-card-findings text-secondary text-xs">
                    <MarkdownRenderer content={inv.findings} />
                  </div>
                )}
              </div>

              {/* Card Actions: [ Open ] [ Delete ] */}
              <div className="history-card-actions">
                <button 
                  type="button"
                  className="btn-history-open font-mono text-xs"
                  onClick={() => onOpenInvestigation && onOpenInvestigation(inv)}
                  title="Open investigation in workspace"
                >
                  <ExternalLink size={14} />
                  <span>Open</span>
                </button>

                <button 
                  type="button"
                  className="btn-history-delete font-mono text-xs"
                  onClick={() => setItemToDelete(inv)}
                  title="Delete investigation from archive"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-backdrop-overlay">
          <div className="delete-confirm-modal glass-panel">
            <AlertTriangle size={28} className="text-rose modal-icon" />
            <h3 className="modal-title font-heading">Delete Investigation?</h3>
            <p className="modal-desc text-secondary text-xs">
              Are you sure you want to remove "<strong>{itemToDelete.query || itemToDelete.title}</strong>" from your history archive? This action cannot be undone.
            </p>
            <div className="modal-actions-row font-mono text-xs">
              <button 
                type="button" 
                className="btn-modal-cancel"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-danger"
                onClick={confirmDelete}
              >
                Delete Investigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="modal-backdrop-overlay">
          <div className="delete-confirm-modal glass-panel">
            <Trash2 size={28} className="text-rose modal-icon" />
            <h3 className="modal-title font-heading">Clear Complete History?</h3>
            <p className="modal-desc text-secondary text-xs">
              This will permanently delete all saved queries and investigations from your local archive.
            </p>
            <div className="modal-actions-row font-mono text-xs">
              <button 
                type="button" 
                className="btn-modal-cancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-danger"
                onClick={() => {
                  if (onClearHistory) onClearHistory();
                  setShowClearModal(false);
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
