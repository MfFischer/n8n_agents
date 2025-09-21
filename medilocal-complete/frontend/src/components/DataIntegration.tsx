import React, { useState } from 'react';
import {
  ServerIcon,
  CircleStackIcon as DatabaseIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { ComputerDataService } from '../services/dataService';

interface ConnectionStatus {
  database: boolean;
  pvs: boolean;
  appointments: boolean;
  files: boolean;
}

const DataIntegration: React.FC = () => {
  const { } = useLanguage();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    database: false,
    pvs: false,
    appointments: false,
    files: false
  });

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Database Connection
  const [dbConfig, setDbConfig] = useState({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    database: '',
    username: '',
    password: ''
  });

  // PVS Connection
  const [pvsConfig, setPvsConfig] = useState({
    type: 'medistar',
    server: '',
    username: '',
    password: '',
    database: ''
  });

  // File Import
  const [fileConfig, setFileConfig] = useState({
    type: 'csv',
    path: '',
    mapping: {
      patient_id: '',
      name: '',
      birthdate: '',
      insurance: ''
    }
  });

  const handleDatabaseConnect = async () => {
    setLoading('database');
    setError(null);
    
    try {
      const connectionString = `${dbConfig.type}://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
      const success = await ComputerDataService.connectToLocalDatabase(connectionString);
      
      if (success) {
        setConnectionStatus(prev => ({ ...prev, database: true }));
        setSuccess('Database connection successful!');
      } else {
        setError('Database connection failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Database connection error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  const handlePVSConnect = async () => {
    setLoading('pvs');
    setError(null);
    
    try {
      const success = await ComputerDataService.connectToPVS(pvsConfig.type, pvsConfig);
      
      if (success) {
        setConnectionStatus(prev => ({ ...prev, pvs: true }));
        setSuccess('PVS connection successful!');
      } else {
        setError('PVS connection failed. Please check your settings.');
      }
    } catch (err) {
      setError('PVS connection error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  const handleFileImport = async () => {
    setLoading('files');
    setError(null);
    
    try {
      const result = await ComputerDataService.importPatientData(fileConfig.type as 'csv' | 'excel', {
        file_path: fileConfig.path,
        field_mapping: fileConfig.mapping
      });
      
      setConnectionStatus(prev => ({ ...prev, files: true }));
      setSuccess(`File import successful! Imported ${result.imported_count} records.`);
    } catch (err) {
      setError('File import error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  const pvsTypes = [
    { value: 'medistar', label: 'MediStar' },
    { value: 'turbomed', label: 'TurboMed' },
    { value: 'duria', label: 'Duria' },
    { value: 'quincy', label: 'Quincy' },
    { value: 'albis', label: 'Albis' }
  ];

  const dbTypes = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mssql', label: 'SQL Server' },
    { value: 'sqlite', label: 'SQLite' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <LinkIcon className="h-8 w-8 mr-3 text-blue-600" />
          Data Integration
        </h1>
        <p className="mt-2 text-gray-600">
          Connect your existing computer data to MediLocal AI
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Database Connection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DatabaseIcon className="h-5 w-5 mr-2" />
            Database Connection
            {connectionStatus.database && (
              <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Type
              </label>
              <select
                value={dbConfig.type}
                onChange={(e) => setDbConfig(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dbTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host
                </label>
                <input
                  type="text"
                  value={dbConfig.host}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port
                </label>
                <input
                  type="text"
                  value={dbConfig.port}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3306"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Name
              </label>
              <input
                type="text"
                value={dbConfig.database}
                onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="clinic_db"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={dbConfig.username}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={dbConfig.password}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleDatabaseConnect}
              disabled={loading === 'database'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading === 'database' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <DatabaseIcon className="h-4 w-4 mr-2" />
                  Connect Database
                </>
              )}
            </button>
          </div>
        </div>

        {/* PVS Connection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ServerIcon className="h-5 w-5 mr-2" />
            Practice Management Software (PVS)
            {connectionStatus.pvs && (
              <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PVS Type
              </label>
              <select
                value={pvsConfig.type}
                onChange={(e) => setPvsConfig(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pvsTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Address
              </label>
              <input
                type="text"
                value={pvsConfig.server}
                onChange={(e) => setPvsConfig(prev => ({ ...prev, server: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="192.168.1.100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={pvsConfig.username}
                  onChange={(e) => setPvsConfig(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={pvsConfig.password}
                  onChange={(e) => setPvsConfig(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handlePVSConnect}
              disabled={loading === 'pvs'}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading === 'pvs' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <ServerIcon className="h-4 w-4 mr-2" />
                  Connect PVS
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Import */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
            File Import
            {connectionStatus.files && (
              <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Type
              </label>
              <select
                value={fileConfig.type}
                onChange={(e) => setFileConfig(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV File</option>
                <option value="excel">Excel File</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Path
              </label>
              <input
                type="text"
                value={fileConfig.path}
                onChange={(e) => setFileConfig(prev => ({ ...prev, path: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="C:\data\patients.csv"
              />
            </div>

            <button
              onClick={handleFileImport}
              disabled={loading === 'files'}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading === 'files' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Import File
                </>
              )}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Connection Status
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Database</span>
              <div className={`h-3 w-3 rounded-full ${connectionStatus.database ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">PVS System</span>
              <div className={`h-3 w-3 rounded-full ${connectionStatus.pvs ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">File Import</span>
              <div className={`h-3 w-3 rounded-full ${connectionStatus.files ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Data Integration Options</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Database:</strong> Connect to existing MySQL, PostgreSQL, or SQL Server databases</li>
              <li>• <strong>PVS Systems:</strong> Integrate with German practice management software</li>
              <li>• <strong>File Import:</strong> Import patient data from CSV or Excel files</li>
              <li>• <strong>Real-time Sync:</strong> Automatic synchronization with connected systems</li>
              <li>• <strong>GDPR Compliant:</strong> All data remains on your local network</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIntegration;
