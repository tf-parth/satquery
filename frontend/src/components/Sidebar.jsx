// SatQuery AI - Left Navigation Sidebar
// Preserves the exact 1:1 visual identity, icons, and layout from the official screenshot.
// Fully functional SPA routing, accessible keyboard navigation, and active states.

import React, { useRef } from 'react';
import { 
  Plus, 
  Home, 
  Layers, 
  Globe, 
  SlidersHorizontal, 
  AlertTriangle, 
  Clock, 
  History, 
  Bookmark, 
  Database, 
  Cpu, 
  FileText
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  onNewInvestigation, 
  isCollapsed, 
  setIsCollapsed, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const navRefs = useRef([]);

  // Exact 11 items in exact order matching user screenshot
  const navItems = [
    { id: 'home', label: isHi ? 'होम' : 'Home', icon: Home, path: '/home' },
    { id: 'image', label: isHi ? 'इमेज विश्लेषण' : 'Image Analysis', icon: Layers, path: '/image-analysis' },
    { id: 'map', label: isHi ? 'भारत एक्सप्लोर करें' : 'Explore India', icon: Globe, path: '/explore' },
    { id: 'compare', label: isHi ? 'परिवर्तन तुलना' : 'Change Comparison', icon: SlidersHorizontal, path: '/change-comparison' },
    { id: 'disaster', label: isHi ? 'आपदा मोड' : 'Disaster Mode', icon: AlertTriangle, path: '/disaster-mode' },
    { id: 'timemachine', label: isHi ? 'टाइम मशीन' : 'Time Machine', icon: Clock, path: '/time-machine' },
    { id: 'history', label: isHi ? 'मेरी हिस्ट्री' : 'My History', icon: History, path: '/history' },
    { id: 'saved', label: isHi ? 'सहेजे गए परिणाम' : 'Saved Results', icon: Bookmark, path: '/saved' },
    { id: 'datasets', label: isHi ? 'डेटासेट' : 'Datasets', icon: Database, path: '/datasets' },
    { id: 'tools', label: isHi ? 'टूल्स व सूचकांक' : 'Tools & Indices', icon: Cpu, path: '/tools' },
    { id: 'reports', label: isHi ? 'रिपोर्ट्स' : 'Reports', icon: FileText, path: '/reports' }
  ];

  const handleItemClick = (id) => {
    if (id === 'new-investigation') {
      if (onNewInvestigation) {
        onNewInvestigation();
      } else {
        setCurrentTab('new-investigation');
      }
    } else {
      setCurrentTab(id);
    }
    // On mobile, auto-close sidebar after selection
    if (window.innerWidth <= 1024 && setIsCollapsed) {
      setIsCollapsed(true);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(navItems[index].id);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (index + 1) % navItems.length;
      navRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (index - 1 + navItems.length) % navItems.length;
      navRefs.current[prevIdx]?.focus();
    }
  };

  return (
    <>
      {/* Mobile Backdrop for closing on click-outside */}
      {!isCollapsed && (
        <div 
          className="sidebar-mobile-backdrop" 
          onClick={() => setIsCollapsed(true)} 
          aria-hidden="true"
        />
      )}

      <aside 
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`} 
        aria-label="Main Application Navigation"
      >
        <div className="sidebar-top-section">
          {/* Top CTA: + New Investigation (exact 1:1 match) */}
          <div className="sidebar-top-action">
            <button 
              type="button"
              className="btn-new-investigation"
              onClick={() => handleItemClick('new-investigation')}
              title={isHi ? "नई जांच शुरू करें (Wizard)" : "New Satellite Investigation"}
              aria-label="Start New Investigation"
              data-tooltip={isHi ? "नई जांच" : "New Investigation"}
            >
              <Plus size={16} className="new-inv-icon" />
              <span className="new-inv-label">{isHi ? "नई जांच" : "New Investigation"}</span>
            </button>
          </div>

          {/* Navigation Menu List */}
          <nav className="sidebar-nav-menu" role="navigation" aria-label="Sidebar Navigation">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button 
                  key={item.id}
                  ref={el => navRefs.current[idx] = el}
                  type="button"
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  title={`${item.label} (${item.path})`}
                  data-tooltip={item.label}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  tabIndex={0}
                >
                  <div className="nav-icon-wrapper">
                    <Icon size={16} className="nav-link-icon" />
                  </div>
                  <span className="nav-link-text">{item.label}</span>
                  {isActive && <span className="sidebar-active-indicator" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom "India Coverage" Card (exact 1:1 match) */}
        <div className="sidebar-india-coverage-card">
          <h4 className="coverage-card-title">India Coverage</h4>
          <div className="coverage-card-content">
            <div className="india-map-silhouette">
              <svg viewBox="0 0 100 120" className="india-svg" fill="#3E8B5B" opacity="0.85">
                <path d="M 45 5 
                         C 52 2, 58 10, 52 18 
                         C 58 20, 68 25, 75 22 
                         C 82 25, 95 30, 92 38 
                         C 88 42, 78 40, 72 45 
                         C 68 48, 62 48, 60 52 
                         C 64 56, 70 60, 68 66 
                         C 62 72, 58 80, 52 95 
                         C 48 108, 44 115, 42 118 
                         C 40 115, 36 98, 32 85 
                         C 28 75, 20 70, 18 62 
                         C 12 55, 8 48, 12 40 
                         C 18 35, 25 38, 30 32 
                         C 32 26, 38 18, 40 10 Z" />
              </svg>
            </div>

            <div className="coverage-stats-list">
              <div className="stat-line">
                <span className="stat-val font-mono">28</span>
                <span className="stat-lbl">States</span>
              </div>
              <div className="stat-line">
                <span className="stat-val font-mono">8</span>
                <span className="stat-lbl">UTs</span>
              </div>
              <div className="stat-line">
                <span className="stat-val font-mono">700+</span>
                <span className="stat-lbl">Districts</span>
              </div>
              <div className="stat-line">
                <span className="stat-val font-mono">61K+</span>
                <span className="stat-lbl">Villages</span>
              </div>
            </div>
          </div>

          <div className="coverage-card-footer">
            <div className="footer-headline">Built for a Safer, Greener India</div>
            <div className="footer-subline font-mono">Powered by AI · Earth Observation</div>
          </div>
        </div>
      </aside>
    </>
  );
}
