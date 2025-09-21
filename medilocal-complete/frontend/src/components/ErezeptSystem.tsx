import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  UserIcon, 
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ErezeptRequest {
  patient_id: string;
  egk_number: string;
  symptoms: string;
  diagnosis: string;
  current_medications: string;
  allergies: string;
  doctor_id: string;
  consultation_notes: string;
}

interface ErezeptResponse {
  status: string;
  transmission_result?: {
    transmission_id: string;
    erezept_id: string;
    status: string;
    ti_response: {
      success: boolean;
      prescription_code: string;
      pharmacy_network: string;
      patient_notification: string;
    };
    patient_notification: {
      method: string;
      message: string;
      pharmacy_finder: string;
      estimated_ready_time: string;
    };
    insurance_billing: {
      egk_processed: boolean;
      coverage_confirmed: boolean;
      copay_amount: string;
      billing_status: string;
    };
  };
  automation_metrics?: {
    time_saved: string;
    accuracy_improvement: string;
    patient_satisfaction: string;
  };
  patient_next_steps?: string[];
}

const ErezeptSystem: React.FC = () => {
  const [formData, setFormData] = useState<ErezeptRequest>({
    patient_id: '',
    egk_number: '',
    symptoms: '',
    diagnosis: '',
    current_medications: '',
    allergies: '',
    doctor_id: 'DR001',
    consultation_notes: ''
  });

  const [response, setResponse] = useState<ErezeptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch(`${(import.meta as any).env?.VITE_N8N_URL || 'http://localhost:5678'}/webhook/erezept-automation`, {
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
      egk_number: '',
      symptoms: '',
      diagnosis: '',
      current_medications: '',
      allergies: '',
      doctor_id: 'DR001',
      consultation_notes: ''
    });
    setResponse(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-600" />
          German eRezept Automation
        </h1>
        <p className="mt-2 text-gray-600">
          Automatische Erstellung und Übertragung von elektronischen Rezepten über die Telematik-Infrastruktur
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Patientendaten & Verschreibung
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
                  eGK-Nummer
                </label>
                <input
                  type="text"
                  name="egk_number"
                  value={formData.egk_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 80276001234567890"
                  required
                />
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
                placeholder="z.B. Kopfschmerzen, Fieber seit 2 Tagen"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnose
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Akute Bronchitis (J20.9)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aktuelle Medikamente
              </label>
              <textarea
                name="current_medications"
                value={formData.current_medications}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Metformin 500mg 2x täglich"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergien
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Penicillin, Nüsse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konsultationsnotizen
              </label>
              <textarea
                name="consultation_notes"
                value={formData.consultation_notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Zusätzliche Notizen zur Konsultation..."
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
                    eRezept wird erstellt...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    eRezept erstellen
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
            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
            eRezept Ergebnis
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
              {response.status === 'erezept_transmitted' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700 font-medium">eRezept erfolgreich übertragen!</span>
                  </div>
                </div>
              )}

              {/* Transmission Details */}
              {response.transmission_result && (
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Übertragungsdetails</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">eRezept-ID:</span>
                      <span className="ml-2 font-mono">{response.transmission_result.erezept_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rezeptcode:</span>
                      <span className="ml-2 font-mono">{response.transmission_result.ti_response.prescription_code}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Zuzahlung:</span>
                      <span className="ml-2">€{response.transmission_result.insurance_billing.copay_amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Abrechnung:</span>
                      <span className="ml-2">{response.transmission_result.insurance_billing.billing_status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Instructions */}
              {response.patient_next_steps && (
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Patienteninformationen</h3>
                  <ul className="space-y-1 text-sm">
                    {response.patient_next_steps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Automation Metrics */}
              {response.automation_metrics && (
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Automatisierungsmetriken</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {response.automation_metrics.time_saved}
                      </div>
                      <div className="text-gray-600">Zeit gespart</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {response.automation_metrics.accuracy_improvement}
                      </div>
                      <div className="text-gray-600">Genauigkeit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {response.automation_metrics.patient_satisfaction}
                      </div>
                      <div className="text-gray-600">Zufriedenheit</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!response && !error && !loading && (
            <div className="text-center text-gray-500 py-8">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Füllen Sie das Formular aus und klicken Sie auf "eRezept erstellen", um zu beginnen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErezeptSystem;
