import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Analyze = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError(t('analyzeInvalidFile'));
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('media', selectedFile);
    // Send selected language so Gemini responds in the right language
    formData.append('language', language || 'english');

    try {
      const response = await api.post('/analyze-road', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        navigate('/results', { state: { data: response.data } });
      } else {
        throw new Error(response.data.error || t('analyzeError'));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || t('analyzeError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center md:text-left">{t('analyzeTitle')}</h1>
      <p className="text-gray-400 text-center md:text-left">{t('analyzeSubtitle')}</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div
        onClick={!isLoading ? handleBoxClick : undefined}
        className={`border-2 border-dashed border-dark-700 bg-dark-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer group'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="w-16 h-16 border-4 border-dark-600 border-t-primary rounded-full animate-spin mb-2"></div>
        ) : (
          <div className="w-16 h-16 bg-dark-700 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-2 transition-colors">
            <span className="text-2xl">📸</span>
          </div>
        )}

        <p className="text-lg font-medium text-gray-200 transition-colors">
          {isLoading
            ? t('analyzeLoading')
            : selectedFile
              ? selectedFile.name
              : t('analyzeDragText')}
        </p>
        <p className="text-sm text-gray-500">
          {isLoading
            ? t('analyzeLoadingSubtext')
            : selectedFile
              ? t('analyzeClickChange')
              : t('analyzeSupports')}
        </p>
      </div>

      <div className="flex justify-center md:justify-end">
        <button
          id="analyze-now-btn"
          onClick={handleAnalyze}
          className={`px-6 py-3 rounded-lg font-medium transition-colors w-full md:w-auto ${
            selectedFile && !isLoading
              ? 'bg-secondary hover:bg-violet-600 text-white'
              : 'bg-dark-700 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? t('analyzingBtn') : t('analyzeBtn')}
        </button>
      </div>
    </div>
  );
};

export default Analyze;
