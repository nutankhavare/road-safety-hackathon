import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LanguageSelect from './pages/LanguageSelect';

/**
 * Inner shell — has access to LanguageContext.
 * If no language is set yet (language === null), shows the full-screen LanguageSelect.
 * Once a language is chosen, shows the normal app layout.
 */
const AppShell = () => {
  const { language } = useLanguage();

  if (language === null) {
    return <LanguageSelect />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-900 text-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppShell />
      </Router>
    </LanguageProvider>
  );
}

export default App;
