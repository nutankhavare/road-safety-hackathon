import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useLanguage();

  return (
    <nav className="bg-dark-800 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SafePath AI
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-baseline space-x-2">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('navHome')}</Link>
              <Link to="/analyze" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('navAnalyze')}</Link>
              <Link to="/results" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('navResults')}</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('navDashboard')}</Link>
              <Link to="/reports" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('navReports')}</Link>
            </div>
            <LanguageSwitcher />
          </div>
          {/* Mobile: show switcher always */}
          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
