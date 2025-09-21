import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageIcon } from '@heroicons/react/24/outline';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <button
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

export default LanguageToggle;
