import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  HeartIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ChartBarIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

// Import components
import Dashboard from './components/Dashboard';
import MedicalChat from './components/MedicalChat';
import AppointmentSystem from './components/AppointmentSystem';
import ErezeptSystem from './components/ErezeptSystem';
import DocumentationSystem from './components/DocumentationSystem';
import Settings from './components/Settings';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Language Toggle Component
const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
      title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
    >
      <LanguageIcon className="h-4 w-4" />
      <span className="font-medium">
        {language === 'de' ? 'DE' : 'EN'}
      </span>
      <span className="text-xs text-gray-400">
        {language === 'de' ? '→ EN' : '→ DE'}
      </span>
    </button>
  );
};

// Main App Content Component
const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [systemStatus] = useState({
    backend: true,
    n8n: true,
    ollama: true,
    workflows: {
      medical_chat: true,
      appointments: true,
      erezept: true,
      documentation: true
    },
    last_updated: new Date().toISOString()
  });

  useEffect(() => {
    // Simulate system startup
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('system.starting')}</h2>
          <p className="mt-2 text-gray-600">{t('system.initializing')}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">{t('system.title')}</h1>
                <span className="ml-2 text-sm text-gray-500">{t('system.subtitle')}</span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Language Toggle */}
                <LanguageToggle />

                {/* System Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">{t('common.system_ready')}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white shadow-sm h-screen sticky top-0">
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-3" />
                    {t('nav.dashboard')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/medical-chat"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <HeartIcon className="h-5 w-5 mr-3" />
                    {t('nav.medical_chat')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/appointments"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    {t('nav.appointments')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/erezept"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-3" />
                    {t('nav.erezept')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/documentation"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                    {t('nav.documentation')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <CogIcon className="h-5 w-5 mr-3" />
                    {t('nav.settings')}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard systemStatus={systemStatus} />} />
              <Route path="/medical-chat" element={<MedicalChat />} />
              <Route path="/appointments" element={<AppointmentSystem />} />
              <Route path="/erezept" element={<ErezeptSystem />} />
              <Route path="/documentation" element={<DocumentationSystem />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

// Main App Component with Language Provider
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
