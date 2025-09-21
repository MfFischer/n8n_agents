import React, { useState } from 'react';
import { 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface DocumentationRequest {
  patient_id: string;
  consultation_notes: string;
  vital_signs: {
    blood_pressure?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
    height?: string;
  };
  symptoms: string;
  examination_findings: string;
  doctor_id: string;
  consultation_type: string;
}

interface DocumentationResponse {
  success: boolean;
  documentation: {
    soap_note: string;
    medical_letter: string;
    billing_codes: string;
    follow_up: string;
  };
  automation_results: boolean;
  time_saved: string;
  cost_savings: string;
  session_id: string;
}

const DocumentationSystem: React.FC = () => {
  const [formData, setFormData] = useState<DocumentationRequest>({
    patient_id: '',
    consultation_notes: '',
    vital_signs: {},
    symptoms: '',
    examination_findings: '',
    doctor_id: 'DR001',
    consultation_type: 'routine'
  });

  const [response, setResponse] = useState<DocumentationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultationTypes = [
    { value: 'routine', label: 'Routine-Konsultation' },
    { value: 'follow_up', label: 'Nachsorge' },
    { value: 'emergency', label: 'Notfall' },
    { value: 'specialist', label: 'Facharzt-Konsultation' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vital_signs.')) {
      const vitalSign = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vital_signs: {
          ...prev.vital_signs,
          [vitalSign]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_N8N_URL || 'http://localhost:5678'}/webhook/auto-documentation`, {
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
      patient_id: '',
      consultation_notes: '',
      vital_signs: {},
      symptoms: '',
      examination_findings: '',
      doctor_id: 'DR001',
      consultation_type: 'routine'
    });
    setResponse(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ClipboardDocumentListIcon className="h-8 w-8 mr-3 text-blue-600" />
          Automated Clinical Documentation
        </h1>
        <p className="mt-2 text-gray-600">
          Automatische Erstellung von SOAP-Notizen, Arztbriefen und Abrechnungscodes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Konsultationsdaten
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patienten-ID
                </label>
                <input
                  type="text"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. PAT001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konsultationstyp
                </label>
                <select
                  name="consultation_type"
                  value={formData.consultation_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {consultationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptome
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Kopfschmerzen, Übelkeit seit 2 Tagen"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Untersuchungsbefunde
              </label>
              <textarea
                name="examination_findings"
                value={formData.examination_findings}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Auskultation unauffällig, Abdomen weich"
              />
            </div>

            {/* Vital Signs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vitalzeichen
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="vital_signs.blood_pressure"
                  value={formData.vital_signs.blood_pressure || ''}
                  onChange={handleInputChange}
                  placeholder="RR (z.B. 120/80)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="vital_signs.pulse"
                  value={formData.vital_signs.pulse || ''}
                  onChange={handleInputChange}
                  placeholder="Puls (z.B. 72)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="vital_signs.temperature"
                  value={formData.vital_signs.temperature || ''}
                  onChange={handleInputChange}
                  placeholder="Temp (z.B. 36.5)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konsultationsnotizen
              </label>
              <textarea
                name="consultation_notes"
                value={formData.consultation_notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detaillierte Notizen zur Konsultation..."
                required
              />
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
                    Dokumentation wird erstellt...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Dokumentation erstellen
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
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Generierte Dokumentation
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
              {/* Success Status */}
              {response.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700 font-medium">Dokumentation erfolgreich erstellt!</span>
                  </div>
                </div>
              )}

              {/* Automation Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="text-lg font-semibold text-blue-600">{response.time_saved}</div>
                  <div className="text-sm text-gray-600">Zeit gespart</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="text-lg font-semibold text-green-600">{response.cost_savings}</div>
                  <div className="text-sm text-gray-600">Kosteneinsparung</div>
                </div>
              </div>

              {/* Generated Documents */}
              {response.documentation && (
                <div className="space-y-3">
                  {response.documentation.soap_note && (
                    <div className="border border-gray-200 rounded-md p-3">
                      <h4 className="font-medium text-gray-900 mb-2">SOAP-Note</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {response.documentation.soap_note.substring(0, 200)}...
                      </p>
                    </div>
                  )}

                  {response.documentation.medical_letter && (
                    <div className="border border-gray-200 rounded-md p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Arztbrief-Entwurf</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {response.documentation.medical_letter.substring(0, 200)}...
                      </p>
                    </div>
                  )}

                  {response.documentation.billing_codes && (
                    <div className="border border-gray-200 rounded-md p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Abrechnungscodes</h4>
                      <p className="text-sm text-gray-700">
                        {response.documentation.billing_codes.substring(0, 150)}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!response && !error && !loading && (
            <div className="text-center text-gray-500 py-8">
              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Füllen Sie das Formular aus und klicken Sie auf "Dokumentation erstellen", um zu beginnen.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Automatisierte Dokumentation</p>
            <ul className="space-y-1 text-xs">
              <li>• Automatische SOAP-Notizen Generierung</li>
              <li>• Arztbrief-Entwürfe für Überweisungen</li>
              <li>• GOÄ/EBM Abrechnungscodes Vorschläge</li>
              <li>• Follow-up Empfehlungen</li>
              <li>• 83% Zeitersparnis bei der Dokumentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationSystem;
