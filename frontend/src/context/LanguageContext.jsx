import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../utils/translations';

// ─────────────────────────────────────────────
// Context Definition
// ─────────────────────────────────────────────

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'english', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hindi',   label: 'Hindi',   nativeLabel: 'हिंदी',   flag: '🇮🇳' },
  { code: 'kannada', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ',   flag: '🏳️' },
];

const STORAGE_KEY = 'safepath_language';

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(null); // null = not yet chosen

  // On mount: restore saved language if one was chosen before
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.find((l) => l.code === saved)) {
      setLanguageState(saved);
    }
    // If nothing saved → stays null → LanguageSelect will be shown
  }, []);

  const setLanguage = (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  };

  /**
   * t(key) → returns the translated string for the currently active language.
   * Falls back gracefully to English if key or language is missing.
   */
  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key; // guard: return key itself so nothing breaks
    return entry[language] ?? entry['english'] ?? key;
  };

  /**
   * Speak text using the Web Speech API in the correct BCP-47 locale.
   */
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop any in-progress speech
    const utterance = new SpeechSynthesisUtterance(text);
    switch (language) {
      case 'hindi':
        utterance.lang = 'hi-IN';
        break;
      case 'kannada':
        utterance.lang = 'kn-IN';
        break;
      default:
        utterance.lang = 'en-IN';
    }
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, speak }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ─────────────────────────────────────────────
// Custom Hook
// ─────────────────────────────────────────────

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
};

export default LanguageContext;
