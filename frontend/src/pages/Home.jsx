import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
        {t('homeWelcome')}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          SafePath AI
        </span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl">
        {t('homeTagline')}
      </p>
      <Link
        to="/analyze"
        id="home-start-btn"
        className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-primary/50"
      >
        {t('homeStartBtn')}
      </Link>
    </div>
  );
};

export default Home;
