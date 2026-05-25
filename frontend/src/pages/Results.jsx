import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Results = () => {
  const location = useLocation();
  const resultData = location.state?.data;
  const { t, speak } = useLanguage();

  // If no data was passed (user directly visited /results), redirect to /analyze
  if (!resultData) {
    return <Navigate to="/analyze" />;
  }

  const { imageUrl, analysis } = resultData;
  const { detectedIssues, roadHealthScore, safetyScore, maintenancePriority, alerts, roadKnowledge } = analysis;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'high':     return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'medium':   return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      default:         return 'text-green-500 border-green-500/50 bg-green-500/10';
    }
  };

  const handleVoiceAlert = () => {
    const p = maintenancePriority?.toLowerCase();
    let key = 'voiceAlertSafe';
    if (p === 'critical') key = 'voiceAlertCritical';
    else if (p === 'high') key = 'voiceAlertHigh';
    else if (p === 'medium') key = 'voiceAlertModerate';
    speak(t(key));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('resultsTitle')}</h1>
        <div className="flex items-center gap-4">
          <Link to="/analyze" className="text-sm text-gray-400 hover:text-white transition-colors">
            {t('resultsNewAnalysis')}
          </Link>
          {/* Voice alert button */}
          <button
            id="voice-alert-btn"
            onClick={handleVoiceAlert}
            title="Read aloud in selected language"
            className="px-3 py-2 bg-dark-800 border border-dark-700 hover:border-primary/50 text-gray-300 hover:text-white rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            🔊 {t('navResults')}
          </button>
          <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
            {t('resultsComplete')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Uploaded Image Preview */}
        <div className="md:col-span-3 bg-dark-800 border border-dark-700 rounded-xl p-4 flex justify-center">
          <img
            src={imageUrl}
            alt="Analyzed Road"
            className="max-h-[400px] object-contain rounded-lg border border-dark-600 shadow-lg"
          />
        </div>

        {/* Safety Score Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-colors">
          <h2 className="text-xl font-semibold text-gray-300">{t('resultsSafetyScore')}</h2>
          <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <span className="text-4xl font-bold text-white">{safetyScore}</span>
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-bold border ${getPriorityColor(maintenancePriority)}`}>
            {t('resultsPriority')}: {maintenancePriority}
          </div>
        </div>

        {/* Road Health Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex flex-col space-y-4 hover:border-secondary/50 transition-colors">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-300">{t('resultsRoadHealth')}</h2>
            <span className="text-2xl font-bold text-white">{roadHealthScore}/100</span>
          </div>
          <ul className="space-y-3 mt-4 overflow-y-auto custom-scrollbar flex-grow">
            {detectedIssues?.length > 0 ? detectedIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 border-b border-dark-700 pb-2">
                <span className="text-secondary mt-0.5">•</span>
                <span className="text-gray-300 text-sm">{issue}</span>
              </li>
            )) : (
              <li className="text-gray-500 italic text-sm">{t('resultsNoIssues')}</li>
            )}
          </ul>
        </div>

        {/* Alerts Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex flex-col space-y-4 hover:border-red-500/50 transition-colors">
          <h2 className="text-xl font-semibold text-gray-300">{t('resultsSafetyAlerts')}</h2>
          <div className="space-y-3 mt-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
            {alerts?.length > 0 ? alerts.map((alert, idx) => (
              <div key={idx} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                {alert}
              </div>
            )) : (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm flex items-start gap-2">
                <span className="mt-0.5">✅</span>
                {t('resultsNoAlerts')}
              </div>
            )}
          </div>
        </div>

        {/* Road Knowledge & Guidance */}
        <div className="md:col-span-3 bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            <span>💡</span> {t('resultsGuidance')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadKnowledge?.length > 0 ? roadKnowledge.map((tip, idx) => (
              <div key={idx} className="bg-dark-700/50 border border-dark-600 p-4 rounded-lg text-sm text-gray-300">
                {tip}
              </div>
            )) : (
              <div className="text-gray-500 italic text-sm">{t('resultsNoGuidance')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
