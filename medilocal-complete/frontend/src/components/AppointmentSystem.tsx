import React, { useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface AppointmentRequest {
  patient_request: string;
  patient_history: string;
  symptoms: string;
  urgency: string;
}

interface AppointmentSlot {
  datetime: string;
  duration: number;
  confidence: string;
  reasoning: string;
}

interface AppointmentResponse {
  classification: {
    classification: string;
    reasoning: string;
    suggested_duration: number;
  };
  suggested_slots: AppointmentSlot[];
  patient_request: string;
  priority: string;
  auto_booking_eligible: boolean;
}

const AppointmentSystem: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<AppointmentRequest>({
    patient_request: '',
    patient_history: '',
    symptoms: '',
    urgency: ''
  });

  const [response, setResponse] = useState<AppointmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_N8N_URL || 'http://localhost:5678'}/webhook/smart-scheduling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_request: '',
      patient_history: '',
      symptoms: '',
      urgency: ''
    });
    setResponse(null);
    setError(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'notfall': return 'text-red-600 bg-red-50 border-red-200';
      case 'akut': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'routine': return 'text-green-600 bg-green-50 border-green-200';
      case 'nachsorge': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="h-8 w-8 mr-3 text-blue-600" />
          {t('appointments.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('appointments.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            {t('appointments.patient_request')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patientenanfrage
              </label>
              <textarea
                name="patient_request"
                value={formData.patient_request}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Ich brauche einen Termin wegen starker Rückenschmerzen seit 3 Tagen"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointments.symptoms')}
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Starke Schmerzen im unteren Rücken, Bewegungseinschränkung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointments.patient_history')}
              </label>
              <textarea
                name="patient_history"
                value={formData.patient_history}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Bandscheibenvorfall 2019, regelmäßige Physiotherapie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointments.urgency')}
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">KI soll automatisch bewerten</option>
                <option value="notfall">Notfall (sofort)</option>
                <option value="akut">Akut (innerhalb 24h)</option>
                <option value="routine">Routine (normale Sprechstunde)</option>
                <option value="nachsorge">Nachsorge (Kontrolle)</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                    Analysiere Anfrage...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Termine vorschlagen
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Zurücksetzen
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            {t('appointments.suggestions')}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">Fehler: {error}</span>
              </div>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              {/* Classification Result */}
              <div className={`p-4 rounded-md border ${getPriorityColor(response.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">KI-Klassifizierung</h3>
                  <span className="text-sm font-semibold uppercase">
                    {response.classification.classification}
                  </span>
                </div>
                <p className="text-sm">{response.classification.reasoning}</p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Empfohlene Dauer:</span> {response.classification.suggested_duration} Minuten
                </div>
              </div>

              {/* Auto-booking eligibility */}
              {response.auto_booking_eligible && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700 font-medium">Automatische Buchung möglich</span>
                  </div>
                </div>
              )}

              {/* Suggested Slots */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Verfügbare Termine</h3>
                <div className="space-y-3">
                  {response.suggested_slots.map((slot, index) => {
                    const { date, time } = formatDateTime(slot.datetime);
                    return (
                      <div key={index} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{date}</div>
                            <div className="text-sm text-gray-600">{time} Uhr ({slot.duration} Min.)</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getConfidenceColor(slot.confidence)}`}>
                              {slot.confidence === 'high' ? 'Hoch' : 
                               slot.confidence === 'medium' ? 'Mittel' : 'Niedrig'}
                            </div>
                            <div className="text-xs text-gray-500">Verfügbarkeit</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {slot.reasoning}
                        </div>
                        <button className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          Termin buchen
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!response && !error && !loading && (
            <div className="text-center text-gray-500 py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t('appointments.form_help')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">{t('appointments.how_it_works')}</p>
            <ul className="space-y-1 text-xs">
              <li>• {t('appointments.ai_analysis')}</li>
              <li>• {t('appointments.classification')}</li>
              <li>• {t('appointments.auto_suggestions')}</li>
              <li>• {t('appointments.auto_booking')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSystem;
