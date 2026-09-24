// SatQuery AI - Top Navigation Bar
import React from 'react';
import { 
  Satellite, 
  Globe, 
  Layers, 
  SlidersHorizontal, 
  Flame, 
  HelpCircle,
  Radio,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  language, 
  setLanguage, 
  t, 
  isLiveMode, 
  setIsLiveMode,
  backendOnline
}) {
  return (
    <header className="navbar-container glass-panel">
      {/* Left: Brand & Scope */}
      <div className="brand-group" onClick={() => setCurrentTab('home')} role="button" tabIndex={0}>
        <div className="brand-logo-glow">
          <Satellite className="brand-icon" size={24} />
          <span className="pulse-radar-dot"></span>
        </div>
        <div className="brand-text">
          <div className="brand-title">
            <span>SATQUERY</span><span className="brand-accent">.AI</span>
          </div>
          <div className="brand-scope">
            <span className="scope-flag">🇮🇳</span>
            <span>INDIA REGIONAL INTELLIGENCE</span>
          </div>
        </div>
      </div>

      {/* Middle: Navigation Modes */}
      <nav className="nav-tabs" aria-label="Application modes">
        <button 
          className={`nav-tab-btn ${currentTab === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentTab('home')}
        >
          {t.nav.home}
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'image' ? 'active' : ''}`}
          onClick={() => setCurrentTab('image')}
        >
          <Layers size={16} />
          <span>{t.nav.image_analysis}</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'map' ? 'active' : ''}`}
          onClick={() => setCurrentTab('map')}
        >
          <Globe size={16} />
          <span>{t.nav.india_map}</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'compare' ? 'active' : ''}`}
          onClick={() => setCurrentTab('compare')}
        >
          <SlidersHorizontal size={16} />
          <span>{t.nav.compare}</span>
        </button>
      </nav>

      {/* Right: Mode & Language Switcher */}
      <div className="nav-controls">
        {/* Live vs Demo Mode Toggle */}
        <button 
          className={`mode-indicator-btn ${isLiveMode ? 'live' : 'demo'}`}
          onClick={() => setIsLiveMode(!isLiveMode)}
          title="Toggle between Live uploaded imagery & Curated Indian Demo datasets"
        >
          <Radio size={14} className={isLiveMode ? 'pulse-dot' : ''} />
          <span>{isLiveMode ? t.nav.live_mode : t.nav.demo_mode}</span>
        </button>

        {/* Global Language Toggle: EN | हिंदी */}
        <div className="lang-switcher" role="radiogroup" aria-label="Language selection">
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-checked={language === 'en'}
          >
            EN
          </button>
          <span className="lang-divider">|</span>
          <button 
            className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage('hi')}
            aria-checked={language === 'hi'}
          >
            हिंदी
          </button>
        </div>
      </div>
    </header>
  );
}
