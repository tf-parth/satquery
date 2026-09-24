// SatQuery AI - Global Top Header
// Supports location search (states, districts, cities, coordinates),
// subtle AI Engine live status indicator, mobile drawer toggle, and global Ask SatQuery launcher.

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  ChevronDown, 
  MapPin, 
  Sparkles, 
  Menu, 
  Radio, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { INDIA_ADMIN_REGIONS } from '../../../backend/src/services/demoData.js';
import { checkBackendHealth } from '../utils/api';

export default function Header({ 
  language, 
  setLanguage, 
  theme, 
  setTheme, 
  isLiveMode, 
  setIsLiveMode, 
  onLocationSelect, 
  currentTab = 'home',
  setCurrentTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  t 
}) {
  const isHi = language === 'hi';
  const [searchVal, setSearchVal] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [aiEngineStatus, setAiEngineStatus] = useState({ isOnline: true, statusText: "Ready" });
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Check live model registry / AI engine status
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await checkBackendHealth();
        if (isMounted) {
          if (res?.status === 'HEALTHY' || res?.aiService?.status === 'HEALTHY') {
            setAiEngineStatus({ isOnline: true, statusText: "Ready" });
          } else {
            setAiEngineStatus({ isOnline: false, statusText: "Degraded" });
          }
        }
      } catch (e) {
        if (isMounted) {
          setAiEngineStatus({ isOnline: false, statusText: "Offline" });
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30s poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowDropdown(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Indian states, districts, and cities
  const filteredRegions = searchVal.trim().length > 0
    ? INDIA_ADMIN_REGIONS.filter(r => 
        r.name.toLowerCase().includes(searchVal.toLowerCase()) || 
        (r.name_hi && r.name_hi.includes(searchVal)) ||
        (r.state && r.state.toLowerCase().includes(searchVal.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleSelectRegion = (reg) => {
    setSearchVal(reg.name);
    setShowDropdown(false);
    if (onLocationSelect) {
      onLocationSelect({
        name: reg.name,
        name_hi: reg.name_hi,
        lat: reg.lat,
        lng: reg.lng,
        type: reg.type,
        state: reg.state,
        demoId: reg.demoId || null
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    // Check if user input is coordinate format: "lat, lng" or "lat,lng"
    const coordMatch = searchVal.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (onLocationSelect) {
        onLocationSelect({
          name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
          lat,
          lng,
          type: "Coordinates"
        });
      }
      setShowDropdown(false);
      return;
    }

    const found = INDIA_ADMIN_REGIONS.find(r => 
      r.name.toLowerCase().includes(searchVal.toLowerCase())
    );
    if (found) {
      handleSelectRegion(found);
    }
  };

  return (
    <header className="global-header">
      {/* Mobile Drawer Hamburger Button */}
      <button 
        type="button"
        className="mobile-sidebar-toggle-btn"
        onClick={() => setIsSidebarCollapsed && setIsSidebarCollapsed(!isSidebarCollapsed)}
        aria-label="Toggle Navigation Sidebar"
        title="Toggle Menu"
      >
        <Menu size={20} />
      </button>

      {/* LEFT: [ SQ ] Logo + SATQUERY AI + EARTH OBSERVATION INTELLIGENCE */}
      <div 
        className="header-brand-container" 
        onClick={() => setCurrentTab && setCurrentTab('home')} 
        style={{ cursor: 'pointer' }}
        title="SatQuery AI - Return to Home"
      >
        <div className="sq-logo-badge" title="SatQuery AI">
          <span className="sq-badge-text">SQ</span>
        </div>
        <div className="header-brand-copy">
          <div className="header-brand-title">
            <span>SATQUERY AI</span>
            <span className="brand-sparkle-dot">✦</span>
          </div>
          <div className="header-brand-sub font-mono">
            EARTH OBSERVATION INTELLIGENCE
          </div>
        </div>
      </div>

      {/* CENTER: Wide Search Bar with Ctrl K shortcut badge */}
      <div className="header-search-wrapper" ref={searchRef}>
        <form className="header-search-box" onSubmit={handleSearchSubmit}>
          <Search size={15} className="search-lead-icon" />
          <input 
            ref={searchInputRef}
            type="text"
            className="header-search-input font-body"
            placeholder="Search location in India — state, district, city or coordinates..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            aria-label="Search location in India"
          />
          <span className="search-kbd-badge font-mono">Ctrl K</span>
        </form>

        {/* Search suggestions dropdown */}
        {showDropdown && filteredRegions.length > 0 && (
          <div className="search-dropdown-menu">
            <div className="dropdown-label font-mono">
              MATCHING INDIAN LOCATIONS
            </div>
            {filteredRegions.map((reg) => (
              <div 
                key={`${reg.name}_${reg.lat}`}
                className="dropdown-item"
                onClick={() => handleSelectRegion(reg)}
                role="button"
                tabIndex={0}
              >
                <MapPin size={14} className="dropdown-item-pin text-teal" />
                <div className="dropdown-item-text">
                  <span className="item-name">{isHi ? (reg.name_hi || reg.name) : reg.name}</span>
                  <span className="item-type font-mono">
                    {reg.type} {reg.state ? `• ${reg.state}` : ''} • {reg.lat.toFixed(2)}°N, {reg.lng.toFixed(2)}°E
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Live Model Status Indicator + Lang + Theme + Profile */}
      <div className="header-actions-group">
        {/* Subtle Model Status Indicator */}
        <button 
          type="button"
          className="header-model-status-pill"
          onClick={() => setCurrentTab && setCurrentTab('models')}
          title="Click to view Specialist Model Registry & Live Telemetry"
          aria-label="AI Engine Status"
        >
          <span className="model-status-label font-mono text-xs">AI ENGINE</span>
          <span className={`model-status-dot ${aiEngineStatus.isOnline ? 'online' : 'offline'}`} />
          <span className="model-status-text font-mono text-xs">
            {aiEngineStatus.statusText}
          </span>
        </button>

        {/* Global "Ask SatQuery" Button */}
        <button 
          type="button"
          className="btn-header-ask-satquery"
          onClick={() => setCurrentTab && setCurrentTab('new-investigation')}
          title="Launch universal multimodal query assistant"
        >
          <Sparkles size={14} className="ask-sparkle-icon" />
          <span className="ask-label">Ask SatQuery</span>
        </button>

        {/* Language Selector: [ EN ] | हिंदी */}
        <div className="language-switch-pill" role="radiogroup" aria-label="Language selection">
          <button 
            type="button"
            className={`lang-option-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-checked={language === 'en'}
          >
            EN
          </button>
          <button 
            type="button"
            className={`lang-option-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage('hi')}
            aria-checked={language === 'hi'}
          >
            हिंदी
          </button>
        </div>

        {/* Theme Sun Icon Button */}
        <button 
          type="button" 
          className="theme-sun-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle light / dark mode"
          aria-label="Toggle theme"
        >
          <Sun size={17} />
        </button>

        {/* User Profile Avatar: [ PK ▾ ] */}
        <div className="user-profile-widget">
          <button 
            type="button"
            className="profile-pill-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-expanded={showProfileMenu}
            aria-label="User profile and settings"
          >
            <div className="profile-circle-avatar">
              <span>PK</span>
            </div>
            <ChevronDown size={13} className="profile-chevron" />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-card">
              <div className="profile-card-header">
                <div className="user-title">Mission Analyst (P. Kumar)</div>
                <div className="user-org font-mono text-xs">Earth Observation Operations Desk</div>
              </div>
              <div className="profile-specs font-mono text-xs">
                <div>Active Sensor: <strong>Sentinel-2 · Cartosat-3</strong></div>
                <div>Geodetic CRS: <strong>EPSG:4326 / UTM 43N</strong></div>
                <div>Telemetry: <span className="text-emerald">OPERATIONAL</span></div>
              </div>
              <div className="profile-divider"></div>
              <button 
                type="button"
                className="profile-card-action text-xs"
                onClick={() => {
                  setIsLiveMode(!isLiveMode);
                  setShowProfileMenu(false);
                }}
              >
                Switch to {isLiveMode ? "Demo Mode" : "Live Upload Mode"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
