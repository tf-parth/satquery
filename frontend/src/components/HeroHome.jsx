// SatQuery AI - Main Home Experience
import React from 'react';
import { 
  UploadCloud, 
  HelpCircle, 
  Compass, 
  PlayCircle, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Waves, 
  SunMedium, 
  Building2, 
  TreePine, 
  ArrowRight
} from 'lucide-react';

export default function HeroHome({ 
  onSelectAction, 
  onSelectDemoScene, 
  t, 
  language 
}) {
  const isHi = language === 'hi';

  const demoScenes = [
    {
      id: "mumbai_coastal",
      tag: isHi ? "महाराष्ट्र" : "Maharashtra",
      title: isHi ? "मुंबई तटीय सड़क व भूमि सुधार" : "Mumbai Coastal Road Reclamation",
      desc: isHi ? "शहरी विस्तार, निर्माण कार्य और तटीय दीवार का विश्लेषण" : "Urban expansion, seawalls, and high-rise density",
      icon: Building2,
      color: "#00f2fe"
    },
    {
      id: "assam_brahmaputra",
      tag: isHi ? "असम" : "Assam",
      title: isHi ? "ब्रह्मपुत्र घाटी बाढ़ व जलमग्नता" : "Brahmaputra Flood Inundation",
      desc: isHi ? "रडार (SAR) द्वारा बादलों के पार 14,280 हेक्टेयर बाढ़ का मापन" : "Synthetic Aperture Radar penetration through 88% cloud cover",
      icon: Waves,
      color: "#ef4444"
    },
    {
      id: "rajasthan_bhadla",
      tag: isHi ? "राजस्थान" : "Rajasthan",
      title: isHi ? "भादला सोलर पार्क - थार मरुस्थल" : "Bhadla Solar Park PV Arrays",
      desc: isHi ? "विश्व के सबसे बड़े सौर ऊर्जा संयंत्र का ग्रिड-वार मानचित्रण" : "World's largest utility-scale solar grid infrastructure",
      icon: SunMedium,
      color: "#f59e0b"
    },
    {
      id: "sundarbans_mangrove",
      tag: isHi ? "पश्चिम बंगाल" : "West Bengal",
      title: isHi ? "सुंदरबन मैंग्रोव बायोस्फीयर डेल्टा" : "Sundarbans Mangrove Biosphere",
      desc: isHi ? "ज्वारीय खाड़ियों और सघन वनस्पति का NDVI विश्लेषण" : "Tidal channel dynamics and dense mangrove canopy health",
      icon: TreePine,
      color: "#10b981"
    },
    {
      id: "bengaluru_tech",
      tag: isHi ? "कर्नाटक" : "Karnataka",
      title: isHi ? "बेंगलुरु आउटर रिंग रोड व झीलें" : "Bengaluru Tech Corridor & Lakes",
      desc: isHi ? "बेल्लंदूर झील बफर जोन और आईटी पार्कों की निगरानी" : "Encroachment audit around Bellandur lake buffer zone",
      icon: Building2,
      color: "#38bdf8"
    },
    {
      id: "punjab_agriculture",
      tag: isHi ? "पंजाब" : "Punjab",
      title: isHi ? "पंजाब कृषि क्षेत्र व फसल चक्र" : "Punjab Agricultural Heartland",
      desc: isHi ? "सिंचित गेहूं की फसलों और उच्च बायोमास का स्पेक्ट्रल मापन" : "Peak wheat crop vigor (NDVI > 0.75) and canal irrigation",
      icon: TreePine,
      color: "#22c55e"
    }
  ];

  return (
    <div className="hero-home-container">
      {/* Glow orb decorations */}
      <div className="glow-orb orb-teal"></div>
      <div className="glow-orb orb-amber"></div>

      {/* Main Hero Header */}
      <section className="hero-header-section">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span>{isHi ? "भारत का पहला मल्टीमॉडल सैटेलाइट AI असिस्टेंट" : "India's Dedicated Multimodal Satellite AI Assistant"}</span>
        </div>

        <h1 className="hero-title">
          <span className="hero-title-top">SATQUERY AI</span>
          <span className="hero-title-main">
            {isHi ? "भारत के बारे में पूछें। सैटेलाइट क्या देखता है, समझें।" : "Ask about India. Understand what the satellite sees."}
          </span>
        </h1>

        <p className="hero-subtext">
          {isHi 
            ? "सैटेलाइट इमेज अपलोड करें या कोई भी प्रश्न पूछें। SatQuery दृश्य का तुरंत विश्लेषण करता है और बिना किसी तकनीकी जटिलता के परिणाम सरल भाषा में समझाता है।"
            : "Upload satellite imagery or ask a question. SatQuery analyzes what the image shows and explains the result in simple language with transparent visual evidence."}
        </p>

        {/* Primary & Secondary Call to Actions */}
        <div className="hero-actions-bar">
          <button 
            className="btn-primary hero-btn-lg"
            onClick={() => onSelectAction('upload')}
          >
            <UploadCloud size={20} />
            <span>{t.actions.upload_image}</span>
          </button>

          <button 
            className="btn-isro hero-btn-lg"
            onClick={() => onSelectAction('query')}
          >
            <HelpCircle size={20} />
            <span>{t.actions.ask_satquery}</span>
          </button>

          <button 
            className="btn-secondary hero-btn-lg"
            onClick={() => onSelectAction('map')}
          >
            <Compass size={20} />
            <span>{t.actions.explore_india}</span>
          </button>

          <button 
            className="btn-secondary hero-btn-lg"
            onClick={() => onSelectAction('demo')}
          >
            <PlayCircle size={20} />
            <span>{t.actions.try_demo}</span>
          </button>
        </div>
      </section>

      {/* Interactive Regional Launchpads Across India */}
      <section className="regional-grid-section">
        <div className="section-header-compact">
          <h2 className="section-subtitle">
            {isHi ? "भारत-व्यापी सैटेलाइट अन्वेषण" : "EXPLORE REPRESENTATIVE INDIAN SCENES"}
          </h2>
          <span className="section-meta">
            {isHi ? "वास्तविक उपग्रह डेटा एवं सत्यापित साक्ष्य" : "Actual satellite observations & non-fabricated evidence"}
          </span>
        </div>

        <div className="demo-cards-grid">
          {demoScenes.map((scene) => {
            const IconComp = scene.icon;
            return (
              <div 
                key={scene.id}
                className="demo-card glass-panel-interactive"
                onClick={() => onSelectDemoScene(scene.id)}
                role="button"
                tabIndex={0}
              >
                <div className="demo-card-top">
                  <div className="demo-icon-box" style={{ color: scene.color, borderColor: `${scene.color}40` }}>
                    <IconComp size={20} />
                  </div>
                  <span className="demo-state-tag">{scene.tag}</span>
                </div>
                <h3 className="demo-card-title">{scene.title}</h3>
                <p className="demo-card-desc">{scene.desc}</p>
                <div className="demo-card-footer">
                  <span className="demo-explore-link">
                    {isHi ? "विश्लेषण करें" : "Analyze Scene"}
                  </span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Locked Technical Stack Credibility Section */}
      <section className="stack-assurance-section glass-panel">
        <div className="assurance-header">
          <Cpu className="assurance-icon" size={24} />
          <div>
            <h3 className="assurance-title">
              {isHi ? "लॉक किया गया SatQuery AI आर्किटेक्चर" : "Locked SatQuery Geo-AI Stack"}
            </h3>
            <p className="assurance-sub">
              {isHi 
                ? "केवल आवश्यक मॉडल्स का न्यूनतम उपयोग — कोई काल्पनिक AI प्रतिशत नहीं" 
                : "Dynamic routing to minimal necessary models — scientific evidence without fabricated metrics"}
            </p>
          </div>
        </div>

        <div className="models-chips-row">
          <span className="model-chip" title="Vision-Language Assistant">GeoChat (VQA)</span>
          <span className="model-chip" title="Text-Guided BBoxes">GroundingDINO</span>
          <span className="model-chip" title="Zero-Shot Pixel Masks">SAM2 / SamGeo</span>
          <span className="model-chip" title="Bi-temporal Change Differencing">ChangeFormer</span>
          <span className="model-chip" title="SAR Radar All-Weather Penetration">SARAS-Net</span>
          <span className="model-chip" title="Satellite Foundation Embeddings">SatCLIP</span>
          <span className="model-chip" title="Normalized Difference Vegetation Index">NDVI</span>
          <span className="model-chip" title="Normalized Difference Water Index">NDWI</span>
          <span className="model-chip" title="Normalized Difference Built-up Index">NDBI</span>
        </div>
      </section>
    </div>
  );
}
