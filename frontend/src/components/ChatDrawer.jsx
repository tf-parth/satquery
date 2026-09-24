// SatQuery AI - Conversational Memory & Follow-up Thread Drawer
// Preserves context (active scene, AOI, previous findings, layers, dates, language)
// and supports multi-turn inquiry in English, Hindi, or Hinglish.

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  ShieldCheck, 
  CornerDownRight,
  RefreshCw,
  ChevronDown,
  Layers
} from 'lucide-react';

export default function ChatDrawer({ 
  conversation = [], 
  onSendFollowup, 
  isLoading, 
  activeScene, 
  t, 
  language 
}) {
  const isHi = language === 'hi';
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendFollowup(inputText.trim());
    setInputText("");
  };

  const quickFollowups = isHi ? [
    "सबसे बड़ी इमारतें कौन सी हैं?",
    "केवल वनस्पति हानि वाले क्षेत्र दिखाएं।",
    "क्या यहाँ जल निकासी के मार्ग हैं?",
    "दूसरी तारीख से तुलना करें।"
  ] : [
    "Which structures are largest?",
    "Show only the areas with vegetation loss.",
    "Are there any drainage canals nearby?",
    "Compare with previous acquisition."
  ];

  return (
    <div className="chat-drawer-container glass-panel">
      {/* Thread Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <MessageSquare size={16} className="text-teal" />
          <span className="font-heading">
            {isHi ? "अनुवर्ती बातचीत एवं संदर्भ स्मृति" : "Conversational Memory & Follow-Up"}
          </span>
        </div>
        <div className="active-context-tag font-mono text-xs">
          <span>Active: {activeScene?.location || "India Scene"}</span>
        </div>
      </div>

      {/* Messages Thread Scroll Area */}
      <div className="chat-messages-area">
        {conversation.length === 0 ? (
          <div className="chat-empty-state">
            <Sparkles size={24} className="text-isro pulse-dot" />
            <p className="chat-empty-hint">
              {isHi 
                ? "इमेज विश्लेषण के बाद यहाँ अनुवर्ती प्रश्न पूछें (उदा. 'इनमें से सबसे बड़ा कौन सा है?')" 
                : "Ask follow-up questions about the active image or AOI. Context and findings are preserved across turns."}
            </p>
          </div>
        ) : (
          conversation.map((msg, idx) => (
            <div 
              key={idx} 
              className={`chat-bubble-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}
            >
              <div className="bubble-avatar">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="bubble-content glass-panel">
                <p className="bubble-text">{msg.text}</p>
                {msg.evidence && (
                  <div className="bubble-evidence-pills">
                    {msg.evidence.map((ev, eIdx) => (
                      <span key={eIdx} className="bubble-evidence-tag">
                        ✓ {typeof ev === 'string' ? ev : ev.name}
                      </span>
                    ))}
                  </div>
                )}
                {msg.timestamp && (
                  <span className="bubble-time font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Follow-up Suggestions */}
      <div className="quick-followups-bar">
        <span className="quick-label">
          {isHi ? "सुझाए गए अनुवर्ती:" : "Suggested Follow-ups:"}
        </span>
        <div className="quick-chips-scroll">
          {quickFollowups.map((qf, idx) => (
            <button 
              key={idx}
              type="button"
              className="quick-chip-btn"
              onClick={() => {
                setInputText(qf);
              }}
            >
              {qf}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input 
          type="text"
          className="chat-input-field"
          placeholder={t?.actions?.followup_placeholder || (isHi ? "यहाँ अनुवर्ती प्रश्न पूछें..." : "Ask follow-up question...")}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={!inputText.trim() || isLoading}
          title="Send follow-up"
        >
          {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
