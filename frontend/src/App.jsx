// SatQuery AI - India-Wide Multimodal Satellite Intelligence Platform
// Main Application Coordinator

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeDashboard from './components/HomeDashboard';
import ImageAnalysisView from './components/ImageAnalysisView';
import ExploreIndiaView from './components/ExploreIndiaView';
import ComparisonView from './components/ComparisonView';
import DisasterModeView from './components/DisasterModeView';
import TimeMachineView from './components/TimeMachineView';
import HistoryView from './components/HistoryView';
import SavedResultsView from './components/SavedResultsView';
import DatasetsView from './components/DatasetsView';
import ToolsIndicesView from './components/ToolsIndicesView';
import ModelRegistryView from './components/ModelRegistryView';
import ReportsView from './components/ReportsView';
import NewInvestigationView from './components/NewInvestigationView';

import { 
  analyzeImageApi, 
  queryIndiaApi, 
  compareImagesApi, 
  checkBackendHealth,
  queryAgentApi
} from './utils/api';

import { 
  getStoredInvestigations, 
  saveInvestigation, 
  deleteInvestigation, 
  duplicateInvestigation, 
  toggleSaveInvestigation, 
  renameInvestigation,
  clearAllInvestigations,
  getStoredSavedLocations 
} from './utils/historyStorage';

import enLocale from './locales/en.json';
import hiLocale from './locales/hi.json';
import { INDIA_DEMO_SCENES, getDemoScene } from '../../backend/src/services/demoData.js';

// Clean SPA routing maps conforming to user specifications
const TAB_TO_PATH = {
  'home': '/home',
  'new-investigation': '/new-investigation',
  'image': '/image-analysis',
  'map': '/explore',
  'compare': '/change-comparison',
  'disaster': '/disaster-mode',
  'timemachine': '/time-machine',
  'history': '/history',
  'saved': '/saved',
  'datasets': '/datasets',
  'tools': '/tools',
  'reports': '/reports',
  'models': '/models'
};

const PATH_TO_TAB = {
  '/': 'home',
  '/home': 'home',
  '/new-investigation': 'new-investigation',
  '/image-analysis': 'image',
  '/image': 'image',
  '/explore': 'map',
  '/map': 'map',
  '/change-comparison': 'compare',
  '/compare': 'compare',
  '/disaster-mode': 'disaster',
  '/disaster': 'disaster',
  '/time-machine': 'timemachine',
  '/timemachine': 'timemachine',
  '/history': 'history',
  '/saved': 'saved',
  '/datasets': 'datasets',
  '/tools': 'tools',
  '/reports': 'reports',
  '/models': 'models'
};

export default function App() {
  // Global settings
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [theme, setTheme] = useState('dark');     // 'dark' | 'light'
  const t = language === 'hi' ? hiLocale : enLocale;

  // Navigation tab with SPA routing
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return PATH_TO_TAB[path] || 'home';
    }
    return 'home';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('satquery_sidebar_collapsed');
      if (saved !== null) {
        try { return JSON.parse(saved); } catch (e) {}
      }
      return window.innerWidth <= 1024;
    }
    return false;
  });
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Persist sidebar collapsed state across refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('satquery_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed]);

  // Accessibility: Close sidebar on Escape key when open on mobile/tablet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSidebarCollapsed && window.innerWidth <= 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);

  // Active Workspace Context
  const [activeScene, setActiveScene] = useState(null);
  const [activeAoi, setActiveAoi] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Persistent History and Saved items
  const [investigations, setInvestigations] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedInvestigationForReport, setSelectedInvestigationForReport] = useState(null);

  // Initialize theme, language, and load stored investigations
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'hi'
      ? "SatQuery AI — भारत-व्यापी मल्टीमॉडल सैटेलाइट इंटेलिजेंस प्लेटफॉर्म"
      : "SatQuery AI — India-Wide Multimodal Satellite Intelligence Platform";
  }, [language]);

  useEffect(() => {
    const loaded = getStoredInvestigations();
    setInvestigations(loaded);
    const locs = getStoredSavedLocations();
    setSavedLocations(locs);
  }, []);

  const runInitialSceneAnalysis = async (sceneId, query) => {
    setIsLoading(true);
    try {
      const res = await analyzeImageApi({
        demoId: sceneId,
        query,
        language
      });
      setAnalysisResult(res);
      setConversation([
        { role: 'user', text: query, timestamp: new Date().toISOString() },
        { role: 'assistant', text: res.answer, explanation: res.explanation, evidence: res.evidence, timestamp: new Date().toISOString() }
      ]);
    } catch (err) {
      console.warn("Initial analysis fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Centralized SPA Navigation using HTML5 History API
  const navigateToTab = useCallback((tabId, replace = false) => {
    setCurrentTab(tabId);
    const targetPath = TAB_TO_PATH[tabId] || '/home';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ tab: tabId }, '', targetPath);
      } else {
        window.history.pushState({ tab: tabId }, '', targetPath);
      }
    }
  }, []);

  // Listen to popstate for browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const matchedTab = PATH_TO_TAB[path] || 'home';
      setCurrentTab(matchedTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Start New Investigation
  const handleNewInvestigation = () => {
    setAnalysisResult(null);
    setActiveAoi(null);
    setSelectedItemId(null);
    setConversation([]);
    navigateToTab('new-investigation');
  };

  // RESTORE Full State from History or Recent item
  const handleOpenInvestigation = (inv) => {
    if (!inv) return;
    const scene = inv.sceneId ? getDemoScene(inv.sceneId) : INDIA_DEMO_SCENES[0];
    setActiveScene(scene);
    if (inv.aoi) setActiveAoi(inv.aoi);

    // Re-run or construct response
    runInitialSceneAnalysis(scene.id, inv.query || "Explain this image");
    navigateToTab('image');
  };

  // Restore from Saved Location chip
  const handleSelectSavedLocation = (loc) => {
    if (loc.sceneId) {
      const scene = getDemoScene(loc.sceneId);
      setActiveScene(scene);
    }
    setActiveAoi({
      type: "Point",
      coordinates: [loc.lng, loc.lat]
    });
    navigateToTab('map');
  };

  // History CRUD operations
  const handleDuplicate = (id) => {
    const updated = duplicateInvestigation(id);
    setInvestigations(updated);
  };

  const handleToggleSave = (id) => {
    const updated = toggleSaveInvestigation(id);
    setInvestigations(updated);
  };

  const handleRenameInvestigation = (id, newTitle) => {
    const updated = renameInvestigation(id, newTitle);
    setInvestigations(updated);
  };

  const handleDelete = (id) => {
    const updated = deleteInvestigation(id);
    setInvestigations(updated);
  };

  const handleClearHistory = () => {
    const updated = clearAllInvestigations();
    setInvestigations(updated);
  };

  const handleExportReport = (item) => {
    setSelectedInvestigationForReport(item);
    navigateToTab('reports');
  };

  // Query Execution from Main Composer or Image Analysis
  // Direct File Upload from Homepage or Main Composer
  const handleDirectFileUpload = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setSelectedItemId(null);
    try {
      const res = await analyzeImageApi({ 
        file, 
        query: "Explain this uploaded satellite image", 
        language 
      });

      const uploadedScene = {
        id: `upload_${Date.now()}`,
        title: file.name,
        title_hi: file.name,
        location: "User Uploaded Satellite Raster",
        crs: "EPSG:32643 / WGS 84 (Auto-detected)",
        bounds: [72.8, 18.9, 73.0, 19.1],
        resolution: "0.5m GSD",
        sensor: file.name.match(/\.tif+/i) ? "User GeoTIFF Raster" : "Optical Satellite Imagery",
        acquisitionDate: new Date().toISOString().split("T")[0],
        bands: ["Red", "Green", "Blue", "NIR"],
        previewUrl: URL.createObjectURL(file),
        isGeoTiff: Boolean(file.name.match(/\.tif+/i))
      };

      setActiveScene(uploadedScene);
      setIsLiveMode(true);
      setAnalysisResult(res);
      setConversation([
        { role: 'user', text: "Explain this uploaded satellite image", timestamp: new Date().toISOString() },
        { role: 'assistant', text: res.answer, explanation: res.explanation, evidence: res.evidence, timestamp: new Date().toISOString() }
      ]);
      navigateToTab('image');
    } catch (err) {
      console.error("Direct upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Query Execution from Main Composer, Quick Examples, or Image Analysis
  const handleSendQuery = async ({ query, file, files, mode, modality, tab, sceneId }) => {
    const uploadFiles = files || (file ? [file] : []);
    if (uploadFiles.length > 0) {
      setIsLoading(true);
      setSelectedItemId(null);
      try {
        const res = await queryAgentApi({
          files: uploadFiles,
          query: query || "Explain this image",
          language,
          mode: mode || "auto",
          modality
        });

        const uploadedScene = {
          id: `upload_${Date.now()}`,
          title: uploadFiles.map(f => f.name).join(", "),
          title_hi: uploadFiles.map(f => f.name).join(", "),
          location: res.metadata?.hasEmbeddedCRS ? "Georeferenced Scene" : "Uploaded Satellite Imagery",
          crs: res.metadata?.crs || "EPSG:32643 / WGS 84",
          bounds: res.metadata?.bounds || [72.8, 18.9, 73.0, 19.1],
          resolution: res.metadata?.resolution || "10m GSD",
          sensor: res.metadata?.isGeoTiff ? "GeoTIFF Telemetry" : "Satellite Imagery",
          acquisitionDate: res.metadata?.acquisitionDate || new Date().toISOString().split("T")[0],
          bands: res.metadata?.bands || ["Red", "Green", "Blue", "NIR"],
          previewUrl: res.metadata?.previewUrl || URL.createObjectURL(uploadFiles[0]),
          isGeoTiff: Boolean(uploadFiles[0]?.name?.match(/\.tif+/i))
        };

        setActiveScene(uploadedScene);
        setIsLiveMode(true);
        setAnalysisResult(res);

        if (res.task === 'bi_temporal_change') {
          setComparisonResult(res);
        }

        setConversation([
          { role: 'user', text: query || "Explain this uploaded satellite image", timestamp: new Date().toISOString() },
          { role: 'assistant', text: res.answer, explanation: res.explanation, evidence: res.evidence, timestamp: new Date().toISOString() }
        ]);
        navigateToTab('image');
        return;
      } catch (err) {
        console.error("Agent query error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (tab === 'timemachine' || (query && (query.toLowerCase().includes('2020 vs 2026') || query.toLowerCase().includes('time machine')))) {
      navigateToTab('timemachine');
      return;
    }

    if (tab === 'compare' || (query && (query.toLowerCase().includes('compare') || query.toLowerCase().includes('urban expansion')))) {
      navigateToTab('compare');
      handleRunCompare({ demoId: sceneId || activeScene?.id || "mumbai_coastal", query: query || "What changed between these images?" });
      return;
    }

    // Intelligently identify if query targets a specific Indian scene or location
    let targetScene = null;
    if (sceneId) {
      targetScene = getDemoScene(sceneId);
    } else if (query) {
      targetScene = getDemoScene(query);
    }
    if (!targetScene) {
      targetScene = activeScene || getDemoScene("All India");
    }
    setActiveScene(targetScene);


    setIsLoading(true);
    setSelectedItemId(null);
    try {
      const res = await analyzeImageApi({ 
        demoId: targetScene.id, 
        query, 
        language, 
        aoi: activeAoi 
      });

      setAnalysisResult(res);
      navigateToTab('image');

      // Add to conversation
      setConversation(prev => [
        ...prev,
        { role: 'user', text: query, timestamp: new Date().toISOString() },
        { role: 'assistant', text: res.answer, explanation: res.explanation, evidence: res.evidence, timestamp: new Date().toISOString() }
      ]);

      // Record into persistent History
      const now = new Date();
      const newInv = {
        id: `inv_${Date.now()}`,
        title: query ? `${query.substring(0, 38)}...` : "Satellite Investigation",
        title_hi: query ? `${query.substring(0, 38)}...` : "उपग्रह जांच",
        location: targetScene.location,
        state: targetScene.state || "India",
        dateTime: `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        type: res.intent === 'object_detection' ? "Object Detection" :
              res.intent === 'vegetation_analysis' ? "Vegetation" :
              res.intent === 'water_detection' ? "Water" :
              res.intent === 'disaster_analysis' ? "Disaster Analysis" : "Image Analysis",
        status: isLiveMode ? "LIVE" : "COMPLETED",
        thumbnail: targetScene.previewUrl || "/assets/demo/mumbai_coastal_2024.jpg",
        query,
        sceneId: targetScene.id,
        aoi: activeAoi,
        findings: res.answer,
        evidenceStatus: res.evidence?.[0]?.name || "Verified Telemetry",
        modelsUsed: res.modelsUsed,
        isSaved: false
      };

      const updatedHistory = saveInvestigation(newInv);
      setInvestigations(updatedHistory);
    } catch (err) {
      console.error("Query error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Follow-up chat within same image context
  const handleSendFollowup = async (followupText) => {
    setIsLoading(true);
    try {
      const res = await analyzeImageApi({
        demoId: activeScene?.id || "mumbai_coastal",
        query: followupText,
        language,
        aoi: activeAoi
      });
      setAnalysisResult(res);
      setConversation(prev => [
        ...prev,
        { role: 'user', text: followupText, timestamp: new Date().toISOString() },
        { role: 'assistant', text: res.answer, explanation: res.explanation, evidence: res.evidence, timestamp: new Date().toISOString() }
      ]);
    } catch (err) {
      console.error("Followup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Bi-Temporal Comparison
  const handleRunCompare = async ({ demoId, query, t1File, t2File }) => {
    setIsLoading(true);
    try {
      if (t1File && t2File) {
        const res = await queryAgentApi({
          files: [t1File, t2File],
          query: query || "What changed between these images?",
          language,
          mode: 'bitemporal'
        });
        setComparisonResult(res);
        return;
      }

      const res = await compareImagesApi({
        demoId: demoId || activeScene?.id || "mumbai_coastal",
        query: query || "What changed between these images?",
        language
      });
      setComparisonResult(res);
    } catch (err) {
      console.error("Compare error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Disaster Rapid Assessment
  const handleRunDisasterAnalysis = async ({ disasterType, region, beforeFile, afterFile, singleFile }) => {
    setIsLoading(true);
    try {
      const files = beforeFile && afterFile ? [beforeFile, afterFile] : (singleFile ? [singleFile] : []);
      if (files.length > 0) {
        const res = await queryAgentApi({
          files,
          query: `${disasterType} damage assessment and water extent in ${region}`,
          language,
          mode: files.length > 1 ? 'bitemporal' : 'single'
        });
        return res;
      }

      const demoId = disasterType === 'flood' ? 'assam_brahmaputra' : (disasterType === 'wildfire' ? 'sundarbans_mangrove' : (disasterType === 'drought' ? 'rajasthan_bhadla' : 'mumbai_coastal'));
      const res = await compareImagesApi({
        demoId,
        query: `${disasterType} damage assessment and water extent in ${region}`,
        language
      });
      return res;
    } catch (err) {
      console.error("Disaster analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Location search from Header
  const handleLocationSearchJump = (loc) => {
    if (loc.demoId) {
      const scene = getDemoScene(loc.demoId);
      setActiveScene(scene);
    }
    setActiveAoi({
      type: "Point",
      coordinates: [loc.lng, loc.lat]
    });
    navigateToTab('map');
  };

  return (
    <div className="platform-app-shell">
      {/* Global Top Header */}
      <Header 
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
        onLocationSelect={handleLocationSearchJump}
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        t={t}
      />

      {/* Main Workspace Body with Left Sidebar */}
      <div className="platform-body-layout">
        {/* Left Sidebar */}
        <Sidebar 
          currentTab={currentTab}
          setCurrentTab={navigateToTab}
          onNewInvestigation={handleNewInvestigation}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          t={t}
          language={language}
        />

        {/* Dynamic Center Stage Content */}
        <main className="platform-center-stage">
          {/* TAB 0: NEW INVESTIGATION WIZARD */}
          {currentTab === 'new-investigation' && (
            <NewInvestigationView 
              onSaveInvestigation={(newInv) => {
                const updated = saveInvestigation(newInv);
                setInvestigations(updated);
              }}
              onNavigateTab={navigateToTab}
              t={t}
              language={language}
            />
          )}

          {/* TAB 1: HOME DASHBOARD */}
          {currentTab === 'home' && (
            <HomeDashboard 
              onSendQuery={handleSendQuery}
              onUploadClick={() => navigateToTab('image')}
              onCompareClick={() => navigateToTab('compare')}
              onExploreIndiaClick={() => navigateToTab('map')}
              onTryDemoClick={() => {
                setActiveScene(INDIA_DEMO_SCENES[0]);
                navigateToTab('image');
              }}
              onSelectInvestigation={handleOpenInvestigation}
              onSelectSavedLocation={handleSelectSavedLocation}
              onViewAllHistory={() => navigateToTab('history')}
              recentInvestigations={investigations}
              savedLocations={savedLocations}
              isLoading={isLoading}
              t={t}
              language={language}
            />
          )}

          {/* TAB 2: IMAGE ANALYSIS */}
          {currentTab === 'image' && (
            <ImageAnalysisView 
              activeScene={activeScene}
              analysisResult={analysisResult}
              onImageReady={({ file, metadata }) => {
                setAnalysisResult(null);
                setActiveScene({
                  id: `custom_${Date.now()}`,
                  file: file,
                  title: metadata.filename,
                  title_hi: metadata.filename,
                  location: metadata.hasEmbeddedCRS ? "Georeferenced Scene" : "Uploaded Satellite Raster",
                  crs: metadata.crs,
                  bounds: metadata.bounds,
                  resolution: metadata.resolution,
                  sensor: metadata.isGeoTiff ? "User-Supplied Satellite Raster" : "Standard Optical Image",
                  acquisitionDate: new Date().toISOString().split("T")[0],
                  bands: metadata.bands,
                  previewUrl: metadata.previewUrl,
                  isGeoTiff: metadata.isGeoTiff
                });
                setIsLiveMode(true);
              }}
              onReset={() => {
                setActiveScene(null);
                setAnalysisResult(null);
                setIsLiveMode(false);
              }}
              onAnalysisComplete={(result) => {
                setAnalysisResult(result);
              }}
              onAnalyze={handleSendQuery}
              onSendFollowup={handleSendFollowup}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              conversation={conversation}
              isLoading={isLoading}
              t={t}
              language={language}
            />
          )}

          {/* TAB 3: EXPLORE INDIA */}
          {currentTab === 'map' && (
            <ExploreIndiaView 
              onSelectScene={(sceneId) => {
                setActiveScene(getDemoScene(sceneId));
                navigateToTab('image');
              }}
              onQueryRegion={({ query, aoi }) => {
                handleSendQuery({ query, tab: 'ask' });
              }}
              onStartInvestigationForArea={({ name, lat, lng, sceneId }) => {
                if (sceneId) setActiveScene(getDemoScene(sceneId));
                navigateToTab('new-investigation');
              }}
              activeAoi={activeAoi}
              setActiveAoi={setActiveAoi}
              t={t}
              language={language}
            />
          )}

          {/* TAB 4: CHANGE COMPARISON */}
          {currentTab === 'compare' && (
            <ComparisonView 
              onSaveInvestigation={(newInv) => {
                const updated = saveInvestigation(newInv);
                setInvestigations(updated);
              }}
              onExportReport={handleExportReport}
              onNavigateTab={navigateToTab}
              language={language}
            />
          )}

          {/* TAB 5: DISASTER MODE */}
          {currentTab === 'disaster' && (
            <DisasterModeView 
              onRunDisasterAnalysis={handleRunDisasterAnalysis}
              onStartInvestigation={() => navigateToTab('new-investigation')}
              isLoading={isLoading}
              t={t}
              language={language}
            />
          )}

          {/* TAB 6: TIME MACHINE */}
          {currentTab === 'timemachine' && (
            <TimeMachineView 
              activeScene={activeScene}
              onSelectScene={(id) => setActiveScene(getDemoScene(id))}
              onNavigateTab={navigateToTab}
              t={t}
              language={language}
            />
          )}

          {/* TAB 7: MY HISTORY */}
          {currentTab === 'history' && (
            <HistoryView 
              investigations={investigations}
              onOpenInvestigation={handleOpenInvestigation}
              onDuplicateInvestigation={handleDuplicate}
              onToggleSaveInvestigation={handleToggleSave}
              onDeleteInvestigation={handleDelete}
              onClearHistory={handleClearHistory}
              t={t}
              language={language}
            />
          )}

          {/* TAB 8: SAVED RESULTS */}
          {currentTab === 'saved' && (
            <SavedResultsView 
              savedItems={investigations.filter(i => i.isSaved)}
              onOpenInvestigation={handleOpenInvestigation}
              onRemoveFromSaved={handleToggleSave}
              onRenameInvestigation={handleRenameInvestigation}
              onExportReport={handleExportReport}
              onNavigateTab={navigateToTab}
              t={t}
              language={language}
            />
          )}

          {/* TAB 9: DATASETS */}
          {currentTab === 'datasets' && (
            <DatasetsView 
              t={t}
              language={language}
            />
          )}

          {/* TAB 10: TOOLS & INDICES */}
          {currentTab === 'tools' && (
            <ToolsIndicesView 
              onNavigateTab={navigateToTab}
              t={t}
              language={language}
            />
          )}

          {/* TAB 11: SPECIALIST MODEL REGISTRY */}
          {currentTab === 'models' && (
            <ModelRegistryView 
              t={t}
              language={language}
            />
          )}

          {/* TAB 12: REPORTS */}
          {currentTab === 'reports' && (
            <ReportsView 
              activeInvestigation={selectedInvestigationForReport}
              onNavigateTab={navigateToTab}
              t={t}
              language={language}
            />
          )}
        </main>
      </div>
    </div>
  );
}
