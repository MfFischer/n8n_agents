// Real Data Integration Service
// Connects frontend to actual backend APIs and n8n workflows

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
const N8N_BASE_URL = import.meta.env?.VITE_N8N_URL || 'http://localhost:5679';
const OLLAMA_BASE_URL = import.meta.env?.VITE_OLLAMA_URL || 'http://localhost:11434';

// Types for real data
export interface SystemStatus {
  backend: boolean;
  n8n: boolean;
  ollama: boolean;
  workflows: {
    medical_chat: boolean;
    appointments: boolean;
    erezept: boolean;
    documentation: boolean;
  };
  last_updated: string;
}

export interface DashboardMetrics {
  patients_today: number;
  pending_appointments: number;
  erezepts_generated: number;
  documents_created: number;
  time_saved_hours: number;
  cost_savings_euros: number;
  last_updated: string;
}

export interface RecentActivity {
  id: string;
  type: 'medical_chat' | 'appointment' | 'erezept' | 'documentation';
  patient_name: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details: string;
}

// System Status Service
export class SystemStatusService {
  static async checkSystemHealth(): Promise<SystemStatus> {
    try {
      const [backendHealth, n8nHealth, ollamaHealth, workflowStatus] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/health`),
        fetch(`${N8N_BASE_URL}/healthz`),
        fetch(`${OLLAMA_BASE_URL}/api/tags`),
        fetch(`${API_BASE_URL}/system/workflows/status`)
      ]);

      const workflows = {
        medical_chat: false,
        appointments: false,
        erezept: false,
        documentation: false
      };

      // Parse workflow status if available
      if (workflowStatus.status === 'fulfilled' && workflowStatus.value.ok) {
        try {
          const workflowData = await workflowStatus.value.json();
          Object.assign(workflows, workflowData);
        } catch (error) {
          console.warn('Could not parse workflow status:', error);
        }
      }

      return {
        backend: backendHealth.status === 'fulfilled' && backendHealth.value.ok,
        n8n: n8nHealth.status === 'fulfilled' && n8nHealth.value.ok,
        ollama: ollamaHealth.status === 'fulfilled' && ollamaHealth.value.ok,
        workflows,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('System health check failed:', error);
      return {
        backend: false,
        n8n: false,
        ollama: false,
        workflows: {
          medical_chat: false,
          appointments: false,
          erezept: false,
          documentation: false
        },
        last_updated: new Date().toISOString()
      };
    }
  }
}

// Dashboard Data Service
export class DashboardService {
  static async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    }

    // Fallback to real-time calculation if API not available
    return this.calculateRealTimeMetrics();
  }

  static async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/activity?limit=10`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }

    // Return empty array if API not available
    return [];
  }

  private static async calculateRealTimeMetrics(): Promise<DashboardMetrics> {
    // Calculate metrics from available data sources
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [patientsResponse, appointmentsResponse, erezeptsResponse, docsResponse] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/patients?date=${today}`),
        fetch(`${API_BASE_URL}/appointments?status=pending`),
        fetch(`${API_BASE_URL}/erezepts?date=${today}`),
        fetch(`${API_BASE_URL}/documents?date=${today}`)
      ]);

      let patients_today = 0;
      let pending_appointments = 0;
      let erezepts_generated = 0;
      let documents_created = 0;

      if (patientsResponse.status === 'fulfilled' && patientsResponse.value.ok) {
        const data = await patientsResponse.value.json();
        patients_today = data.count || 0;
      }

      if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value.ok) {
        const data = await appointmentsResponse.value.json();
        pending_appointments = data.count || 0;
      }

      if (erezeptsResponse.status === 'fulfilled' && erezeptsResponse.value.ok) {
        const data = await erezeptsResponse.value.json();
        erezepts_generated = data.count || 0;
      }

      if (docsResponse.status === 'fulfilled' && docsResponse.value.ok) {
        const data = await docsResponse.value.json();
        documents_created = data.count || 0;
      }

      // Calculate time and cost savings based on actual usage
      const time_saved_hours = (documents_created * 0.33) + (erezepts_generated * 0.08) + (patients_today * 0.15);
      const cost_savings_euros = Math.round(time_saved_hours * 120); // €120/hour doctor time

      return {
        patients_today,
        pending_appointments,
        erezepts_generated,
        documents_created,
        time_saved_hours: Math.round(time_saved_hours * 10) / 10,
        cost_savings_euros,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to calculate real-time metrics:', error);
      return {
        patients_today: 0,
        pending_appointments: 0,
        erezepts_generated: 0,
        documents_created: 0,
        time_saved_hours: 0,
        cost_savings_euros: 0,
        last_updated: new Date().toISOString()
      };
    }
  }
}

// Medical Chat Service
export class MedicalChatService {
  static async sendMessage(message: string, contextType: string, patientHistory?: string): Promise<any> {
    try {
      const response = await fetch(`${N8N_BASE_URL}/webhook/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context_type: contextType,
          patient_history: patientHistory,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Medical chat request failed:', error);
      throw error;
    }
  }
}

// Appointment Service
export class AppointmentService {
  static async classifyRequest(patientRequest: string, symptoms: string, patientHistory?: string): Promise<any> {
    try {
      const response = await fetch(`${N8N_BASE_URL}/webhook/smart-scheduling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_request: patientRequest,
          symptoms,
          patient_history: patientHistory,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Appointment classification failed:', error);
      throw error;
    }
  }
}

// eRezept Service
export class ErezeptService {
  static async generateErezept(patientData: any): Promise<any> {
    try {
      const response = await fetch(`${N8N_BASE_URL}/webhook/erezept-automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...patientData,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('eRezept generation failed:', error);
      throw error;
    }
  }
}

// Documentation Service
export class DocumentationService {
  static async generateDocumentation(consultationData: any): Promise<any> {
    try {
      const response = await fetch(`${N8N_BASE_URL}/webhook/auto-documentation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...consultationData,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Documentation generation failed:', error);
      throw error;
    }
  }
}

// Computer Data Integration Service
export class ComputerDataService {
  // Connect to local computer data sources
  static async connectToLocalDatabase(connectionString: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/database/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_string: connectionString,
          type: 'local_database'
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Import patient data from existing systems
  static async importPatientData(source: 'csv' | 'excel' | 'database', config: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/import/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          config,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Patient data import failed:', error);
      throw error;
    }
  }

  // Connect to Practice Management Software (PVS)
  static async connectToPVS(pvsType: string, credentials: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/pvs/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pvs_type: pvsType,
          credentials,
          timestamp: new Date().toISOString()
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('PVS connection failed:', error);
      return false;
    }
  }

  // Sync with existing appointment systems
  static async syncAppointments(systemType: string, apiKey: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/appointments/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_type: systemType,
          api_key: apiKey,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Appointment sync failed:', error);
      throw error;
    }
  }
}
