import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.medical_chat': 'Medical AI Chat',
    'nav.appointments': 'Intelligente Termine',
    'nav.erezept': 'eRezept Automation',
    'nav.documentation': 'Auto-Dokumentation',
    'nav.settings': 'Einstellungen',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Überblick über Ihre MediLocal AI Aktivitäten',
    'dashboard.system_status': 'System Status',
    'dashboard.backend_api': 'Backend API',
    'dashboard.n8n_workflows': 'n8n Workflows',
    'dashboard.ollama_ai': 'Ollama AI',
    'dashboard.all_systems_ready': 'Alle Systeme bereit',
    'dashboard.system_starting': 'System wird gestartet',
    'dashboard.patients_today': 'Patienten heute',
    'dashboard.pending_appointments': 'Offene Termine',
    'dashboard.erezepts_generated': 'eRezepte erstellt',
    'dashboard.time_saved': 'Zeit gespart',
    'dashboard.documents_created': 'Dokumente erstellt',
    'dashboard.cost_savings': 'Kosteneinsparung',
    'dashboard.recent_activity': 'Letzte Aktivitäten',
    
    // Medical Chat
    'chat.title': 'Medical AI Chat',
    'chat.subtitle': 'KI-gestützte medizinische Beratung für deutsche Ärzte',
    'chat.context_type': 'Kontext-Typ',
    'chat.patient_history': 'Patientenvorgeschichte (optional)',
    'chat.patient_history_placeholder': 'z.B. Diabetes, Bluthochdruck',
    'chat.input_placeholder': 'Geben Sie Ihre medizinische Frage ein...',
    'chat.disclaimer_title': 'Medizinischer Haftungsausschluss',
    'chat.disclaimer_text': 'Diese KI-Unterstützung ersetzt nicht die professionelle medizinische Beratung, Diagnose oder Behandlung. Konsultieren Sie immer einen qualifizierten Arzt für medizinische Entscheidungen.',
    'chat.features_title': 'Funktionen',
    'chat.welcome': 'Hallo! Ich bin Ihr MediLocal AI Assistent. Ich kann Sie bei medizinischen Fragen unterstützen. Wie kann ich Ihnen heute helfen?',
    
    // Context types
    'context.general': 'Allgemeine Beratung',
    'context.diagnosis': 'Diagnose-Unterstützung',
    'context.treatment': 'Behandlungsempfehlung',
    'context.summary': 'Zusammenfassung',
    
    // Appointments
    'appointments.title': 'Intelligentes Terminmanagement',
    'appointments.subtitle': 'KI-gestützte Terminplanung mit Dringlichkeitsklassifizierung',
    'appointments.patient_request': 'Terminanfrage des Patienten',
    'appointments.symptoms': 'Symptome',
    'appointments.patient_history': 'Patientenvorgeschichte',
    'appointments.urgency': 'Dringlichkeit (optional)',
    'appointments.suggestions': 'Terminvorschläge',
    'appointments.form_help': 'Füllen Sie das Formular aus, um intelligente Terminvorschläge zu erhalten.',
    'appointments.how_it_works': 'Wie funktioniert das intelligente Terminssystem?',
    'appointments.ai_analysis': 'KI analysiert Patientenanfrage und Symptome automatisch',
    'appointments.classification': 'Klassifizierung nach Dringlichkeit: Notfall, Akut, Routine, Nachsorge',
    'appointments.auto_suggestions': 'Automatische Terminvorschläge basierend auf Verfügbarkeit und Priorität',
    'appointments.auto_booking': 'Routine-Termine können automatisch gebucht werden',
    'appointments.classify_request': 'Anfrage klassifizieren',
    'appointments.classifying': 'Klassifizierung läuft...',
    
    // eRezept
    'erezept.title': 'eRezept Automation',
    'erezept.subtitle': 'Automatische elektronische Rezepterstellung via Telematik-Infrastruktur',
    'erezept.patient_data': 'Patientendaten',
    'erezept.patient_id': 'Patienten-ID',
    'erezept.egk_number': 'eGK-Nummer',
    'erezept.symptoms': 'Symptome',
    'erezept.diagnosis': 'Diagnose',
    'erezept.current_medications': 'Aktuelle Medikamente',
    'erezept.allergies': 'Allergien',
    'erezept.consultation_notes': 'Konsultationsnotizen',
    'erezept.generate_erezept': 'eRezept erstellen',
    'erezept.generating': 'eRezept wird erstellt...',
    
    // Documentation
    'docs.title': 'Automatische Klinische Dokumentation',
    'docs.subtitle': 'Automatische Erstellung von SOAP-Notizen, Arztbriefen und Abrechnungscodes',
    'docs.consultation_data': 'Konsultationsdaten',
    'docs.consultation_type': 'Konsultationstyp',
    'docs.examination_findings': 'Untersuchungsbefunde',
    'docs.vital_signs': 'Vitalzeichen',
    'docs.create_documentation': 'Dokumentation erstellen',
    'docs.creating': 'Dokumentation wird erstellt...',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Konfiguration Ihres MediLocal AI Systems',
    'settings.clinic': 'Praxis',
    'settings.system': 'System',
    'settings.security': 'Sicherheit',
    'settings.notifications': 'Benachrichtigungen',
    'settings.save': 'Einstellungen speichern',
    'settings.saved': 'Einstellungen gespeichert',
    
    // Common
    'common.loading': 'Wird geladen...',
    'common.error': 'Fehler',
    'common.success': 'Erfolgreich',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.reset': 'Zurücksetzen',
    'common.system_ready': 'System bereit',
    'common.connecting': 'Verbindung wird hergestellt...',
    
    // System
    'system.title': 'MediLocal AI',
    'system.subtitle': 'Complete Clinic Suite',
    'system.starting': 'MediLocal AI wird gestartet...',
    'system.initializing': 'Bitte warten Sie, während das System initialisiert wird.',
  },
  
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.medical_chat': 'Medical AI Chat',
    'nav.appointments': 'Smart Appointments',
    'nav.erezept': 'eRezept Automation',
    'nav.documentation': 'Auto-Documentation',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your MediLocal AI activities',
    'dashboard.system_status': 'System Status',
    'dashboard.backend_api': 'Backend API',
    'dashboard.n8n_workflows': 'n8n Workflows',
    'dashboard.ollama_ai': 'Ollama AI',
    'dashboard.all_systems_ready': 'All systems ready',
    'dashboard.system_starting': 'System starting...',
    'dashboard.patients_today': 'Patients today',
    'dashboard.pending_appointments': 'Pending appointments',
    'dashboard.erezepts_generated': 'eRezepts generated',
    'dashboard.time_saved': 'Time saved',
    'dashboard.documents_created': 'Documents created',
    'dashboard.cost_savings': 'Cost savings',
    'dashboard.recent_activity': 'Recent activity',
    
    // Medical Chat
    'chat.title': 'Medical AI Chat',
    'chat.subtitle': 'AI-powered medical consultation support',
    'chat.context_type': 'Context Type',
    'chat.patient_history': 'Patient History (optional)',
    'chat.patient_history_placeholder': 'e.g. Diabetes, Hypertension',
    'chat.input_placeholder': 'Enter your medical question...',
    'chat.disclaimer_title': 'Medical Disclaimer',
    'chat.disclaimer_text': 'This AI assistance does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified physician for medical decisions.',
    'chat.features_title': 'Features',
    'chat.welcome': 'Hello! I am your MediLocal AI Assistant. I can help you with medical questions. How can I help you today?',
    
    // Context types
    'context.general': 'General Consultation',
    'context.diagnosis': 'Diagnosis Support',
    'context.treatment': 'Treatment Recommendation',
    'context.summary': 'Summary',
    
    // Appointments
    'appointments.title': 'Smart Appointment Management',
    'appointments.subtitle': 'AI-powered appointment scheduling with urgency classification',
    'appointments.patient_request': 'Patient Request',
    'appointments.symptoms': 'Symptoms',
    'appointments.patient_history': 'Patient History',
    'appointments.urgency': 'Urgency (optional)',
    'appointments.suggestions': 'Appointment Suggestions',
    'appointments.form_help': 'Fill out the form to get intelligent appointment suggestions.',
    'appointments.how_it_works': 'How does the intelligent appointment system work?',
    'appointments.ai_analysis': 'AI automatically analyzes patient request and symptoms',
    'appointments.classification': 'Classification by urgency: Emergency, Acute, Routine, Follow-up',
    'appointments.auto_suggestions': 'Automatic appointment suggestions based on availability and priority',
    'appointments.auto_booking': 'Routine appointments can be booked automatically',
    'appointments.classify_request': 'Classify Request',
    'appointments.classifying': 'Classifying...',
    
    // eRezept
    'erezept.title': 'eRezept Automation',
    'erezept.subtitle': 'Automatic electronic prescription generation via Telematic Infrastructure',
    'erezept.patient_data': 'Patient Data',
    'erezept.patient_id': 'Patient ID',
    'erezept.egk_number': 'eGK Number',
    'erezept.symptoms': 'Symptoms',
    'erezept.diagnosis': 'Diagnosis',
    'erezept.current_medications': 'Current Medications',
    'erezept.allergies': 'Allergies',
    'erezept.consultation_notes': 'Consultation Notes',
    'erezept.generate_erezept': 'Generate eRezept',
    'erezept.generating': 'Generating eRezept...',
    
    // Documentation
    'docs.title': 'Automated Clinical Documentation',
    'docs.subtitle': 'Automatic generation of SOAP notes, medical letters and billing codes',
    'docs.consultation_data': 'Consultation Data',
    'docs.consultation_type': 'Consultation Type',
    'docs.examination_findings': 'Examination Findings',
    'docs.vital_signs': 'Vital Signs',
    'docs.create_documentation': 'Create Documentation',
    'docs.creating': 'Creating documentation...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Configuration of your MediLocal AI System',
    'settings.clinic': 'Clinic',
    'settings.system': 'System',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.save': 'Save Settings',
    'settings.saved': 'Settings saved',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.reset': 'Reset',
    'common.system_ready': 'System ready',
    'common.connecting': 'Connecting...',
    
    // System
    'system.title': 'MediLocal AI',
    'system.subtitle': 'Complete Clinic Suite',
    'system.starting': 'MediLocal AI is starting...',
    'system.initializing': 'Please wait while the system initializes.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load from localStorage or default to German
    const saved = localStorage.getItem('medilocal-language');
    return (saved as Language) || 'de';
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('medilocal-language', language);
    
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
