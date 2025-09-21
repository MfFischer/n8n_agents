import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { DashboardService, DashboardMetrics, RecentActivity, SystemStatus } from '../services/dataService';

interface DashboardProps {
  systemStatus: SystemStatus;
}

const Dashboard: React.FC<DashboardProps> = ({ systemStatus }) => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const allSystemsReady = systemStatus.backend && systemStatus.n8n && systemStatus.ollama;

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsData, activityData] = await Promise.all([
        DashboardService.getMetrics(),
        DashboardService.getRecentActivity()
      ]);

      setMetrics(metricsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  // Use real data if available, otherwise show demo data
  const displayMetrics = metrics || {
    patients_today: 24,
    pending_appointments: 8,
    erezepts_generated: 15,
    documents_created: 42,
    time_saved_hours: 6.5,
    cost_savings_euros: 780,
    last_updated: new Date().toISOString()
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'erezept': return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
      case 'appointment': return <CalendarIcon className="h-5 w-5 text-green-600" />;
      case 'documentation': return <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />;
      case 'medical_chat': return <ChatBubbleLeftRightIcon className="h-5 w-5 text-orange-600" />;
      default: return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'scheduled': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-2 text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* System Status */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.system_status')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${systemStatus.backend ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{t('dashboard.backend_api')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${systemStatus.n8n ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{t('dashboard.n8n_workflows')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${systemStatus.ollama ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{t('dashboard.ollama_ai')}</span>
          </div>
          <div className="flex items-center space-x-3">
            {allSystemsReady ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {allSystemsReady ? t('dashboard.all_systems_ready') : t('dashboard.system_starting')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.patients_today')}</p>
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.patients_today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.pending_appointments')}</p>
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.pending_appointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.erezepts_generated')}</p>
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.erezepts_generated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.time_saved')}</p>
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.time_saved_hours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.documents_created')}</p>
              <p className="text-2xl font-bold text-gray-900">{displayMetrics.documents_created}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">€</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.cost_savings')}</p>
              <p className="text-2xl font-bold text-gray-900">€{displayMetrics.cost_savings_euros}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.recent_activity')}</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.patient_name}</p>
                  <p className="text-xs text-gray-500">
                    {activity.type === 'erezept' && 'eRezept erstellt'}
                    {activity.type === 'appointment' && 'Termin vereinbart'}
                    {activity.type === 'documentation' && 'Dokumentation erstellt'}
                    {activity.type === 'medical_chat' && 'KI-Beratung durchgeführt'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{activity.timestamp}</p>
                <p className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status === 'completed' && 'Abgeschlossen'}
                  {activity.status === 'pending' && 'Geplant'}
                  {activity.status === 'pending' && 'Ausstehend'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
