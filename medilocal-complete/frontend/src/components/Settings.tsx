import React, { useState } from 'react';
import {
  CogIcon,
  ServerIcon,
  ShieldCheckIcon,
  UserIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Settings {
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  doctor: {
    name: string;
    license_number: string;
    specialization: string;
  };
  system: {
    ai_model: string;
    response_language: string;
    auto_save: boolean;
    notifications: boolean;
  };
  security: {
    session_timeout: number;
    audit_logging: boolean;
    data_retention_days: number;
  };
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    clinic: {
      name: 'Praxis Dr. Mustermann',
      address: 'Musterstraße 123, 12345 Berlin',
      phone: '+49 30 12345678',
      email: 'praxis@mustermann.de'
    },
    doctor: {
      name: 'Dr. Max Mustermann',
      license_number: 'DE123456789',
      specialization: 'Allgemeinmedizin'
    },
    system: {
      ai_model: 'llama3.2:latest',
      response_language: 'de',
      auto_save: true,
      notifications: true
    },
    security: {
      session_timeout: 30,
      audit_logging: true,
      data_retention_days: 2555 // 7 years as per German law
    }
  });

  const [activeTab, setActiveTab] = useState('clinic');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'clinic', name: 'Praxis', icon: UserIcon },
    { id: 'system', name: 'System', icon: ServerIcon },
    { id: 'security', name: 'Sicherheit', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Benachrichtigungen', icon: BellIcon }
  ];

  const aiModels = [
    { value: 'llama3.2:latest', label: 'Llama 3.2 (Empfohlen)' },
    { value: 'llama3.2:1b', label: 'Llama 3.2 1B (Schnell)' },
    { value: 'phi3:mini', label: 'Phi-3 Mini (Kompakt)' }
  ];

  const languages = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' }
  ];

  const specializations = [
    'Allgemeinmedizin',
    'Innere Medizin',
    'Kardiologie',
    'Neurologie',
    'Orthopädie',
    'Dermatologie',
    'Gynäkologie',
    'Pädiatrie'
  ];

  const handleInputChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // In a real application, this would save to the backend
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const renderClinicSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Praxis-Informationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Praxisname
            </label>
            <input
              type="text"
              value={settings.clinic.name}
              onChange={(e) => handleInputChange('clinic', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="text"
              value={settings.clinic.phone}
              onChange={(e) => handleInputChange('clinic', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={settings.clinic.address}
              onChange={(e) => handleInputChange('clinic', 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              value={settings.clinic.email}
              onChange={(e) => handleInputChange('clinic', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Arzt-Informationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={settings.doctor.name}
              onChange={(e) => handleInputChange('doctor', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arztnummer
            </label>
            <input
              type="text"
              value={settings.doctor.license_number}
              onChange={(e) => handleInputChange('doctor', 'license_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fachrichtung
            </label>
            <select
              value={settings.doctor.specialization}
              onChange={(e) => handleInputChange('doctor', 'specialization', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">KI-Einstellungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KI-Modell
            </label>
            <select
              value={settings.system.ai_model}
              onChange={(e) => handleInputChange('system', 'ai_model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {aiModels.map((model) => (
                <option key={model.value} value={model.value}>{model.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antwortsprache
            </label>
            <select
              value={settings.system.response_language}
              onChange={(e) => handleInputChange('system', 'response_language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System-Verhalten</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Automatisches Speichern
              </label>
              <p className="text-xs text-gray-500">
                Speichert Änderungen automatisch während der Eingabe
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.auto_save}
              onChange={(e) => handleInputChange('system', 'auto_save', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Benachrichtigungen aktivieren
              </label>
              <p className="text-xs text-gray-500">
                Zeigt System- und Workflow-Benachrichtigungen an
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.notifications}
              onChange={(e) => handleInputChange('system', 'notifications', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sicherheitseinstellungen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session-Timeout (Minuten)
            </label>
            <input
              type="number"
              value={settings.security.session_timeout}
              onChange={(e) => handleInputChange('security', 'session_timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datenaufbewahrung (Tage)
            </label>
            <input
              type="number"
              value={settings.security.data_retention_days}
              onChange={(e) => handleInputChange('security', 'data_retention_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="365"
              max="3650"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gesetzliche Mindestaufbewahrung: 10 Jahre (3650 Tage)
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Audit-Logging aktivieren
              </label>
              <p className="text-xs text-gray-500">
                Protokolliert alle Systemzugriffe und KI-Entscheidungen
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.audit_logging}
              onChange={(e) => handleInputChange('security', 'audit_logging', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">GDPR-Compliance</p>
            <p className="text-xs">
              Alle Einstellungen entsprechen den deutschen Datenschutzbestimmungen. 
              Änderungen an der Datenaufbewahrung sollten mit Ihrem Datenschutzbeauftragten abgestimmt werden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <CogIcon className="h-8 w-8 mr-3 text-blue-600" />
          Einstellungen
        </h1>
        <p className="mt-2 text-gray-600">
          Konfiguration Ihres MediLocal AI Systems
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'clinic' && renderClinicSettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'notifications' && (
            <div className="text-center py-8 text-gray-500">
              <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Benachrichtigungseinstellungen werden in einer zukünftigen Version verfügbar sein.</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          {saved && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">Einstellungen gespeichert</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Einstellungen speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
