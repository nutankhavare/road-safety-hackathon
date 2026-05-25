import React, { useState } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import translations from '../utils/translations';

/* ──────────────────────────────────────────────
   LanguageSelect – Full-screen entry splash
   Shows only when no language has been chosen yet.
   The user picks a language and clicks Continue;
   this saves to localStorage via setLanguage().
────────────────────────────────────────────── */

const LanguageSelect = () => {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setAnimating(true);
    // Short delay so the button animation can play before the page changes
    setTimeout(() => {
      setLanguage(selected);
    }, 480);
  };

  const preview = (key) => {
    if (!selected) return translations[key]?.['english'] ?? key;
    return translations[key]?.[selected] ?? translations[key]?.['english'] ?? key;
  };

  return (
    <div className="lang-select-page">
      {/* Animated Background Blobs */}
      <div className="lang-blob lang-blob-1" />
      <div className="lang-blob lang-blob-2" />
      <div className="lang-blob lang-blob-3" />

      {/* Grid noise overlay */}
      <div className="lang-grid-overlay" />

      {/* Card */}
      <div className={`lang-card ${animating ? 'lang-card-exit' : ''}`}>

        {/* Logo */}
        <div className="lang-logo">
          <span className="lang-logo-icon">🛣️</span>
          <span className="lang-logo-text">SafePath <span className="lang-logo-ai">AI</span></span>
        </div>

        {/* Heading */}
        <h1 className="lang-title">{preview('langSelectTitle')}</h1>
        <p className="lang-subtitle">{preview('langSelectSubtitle')}</p>

        {/* Language Tiles */}
        <div className="lang-grid">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              className={`lang-tile ${selected === lang.code ? 'lang-tile-active' : ''}`}
              onClick={() => setSelected(lang.code)}
              type="button"
              aria-pressed={selected === lang.code}
            >
              <span className="lang-tile-flag" role="img" aria-label={lang.label}>
                {lang.flag}
              </span>
              <span className="lang-tile-native">{lang.nativeLabel}</span>
              <span className="lang-tile-english">{lang.label}</span>
              {selected === lang.code && (
                <span className="lang-tile-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          id="lang-continue-btn"
          className={`lang-continue-btn ${selected ? 'lang-continue-active' : ''} ${animating ? 'lang-continue-animating' : ''}`}
          onClick={handleContinue}
          disabled={!selected}
          type="button"
        >
          {animating ? (
            <span className="lang-continue-spinner" />
          ) : (
            <span>{preview('langContinue')} →</span>
          )}
        </button>

        {/* Footer strip */}
        <p className="lang-footer-note">
          🇮🇳 Made for India's roads
        </p>
      </div>
    </div>
  );
};

export default LanguageSelect;
