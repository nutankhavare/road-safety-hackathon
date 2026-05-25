import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

/**
 * LanguageSwitcher – A compact dropdown for switching language
 * from anywhere in the app (placed in the Navbar).
 */
const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language)
    || SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        id="lang-switcher-toggle"
        className="lang-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="lang-switcher-flag">{current.flag}</span>
        <span className="lang-switcher-label">{current.nativeLabel}</span>
        <span className={`lang-switcher-arrow ${open ? 'open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="lang-switcher-dropdown" role="listbox">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              id={`lang-option-${lang.code}`}
              className={`lang-switcher-option ${language === lang.code ? 'active-lang' : ''}`}
              onClick={() => handleSelect(lang.code)}
              role="option"
              aria-selected={language === lang.code}
              type="button"
            >
              <span className="lang-switcher-opt-flag">{lang.flag}</span>
              <span>
                <span className="lang-switcher-opt-native">{lang.nativeLabel}</span>
                {' '}
                <span className="lang-switcher-opt-en">{lang.label}</span>
              </span>
              {language === lang.code && (
                <span className="lang-switcher-opt-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
