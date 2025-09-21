import React, { useState } from 'react';
import { 
  HeartIcon, 
  PaperAirplaneIcon, 
  UserIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context_type?: string;
}

interface ChatRequest {
  message: string;
  context_type: string;
  patient_history?: string;
}

const MedicalChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hallo! Ich bin Ihr MediLocal AI Assistent. Ich kann Sie bei medizinischen Fragen unterstützen. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date(),
      context_type: 'general'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [contextType, setContextType] = useState('general');
  const [patientHistory, setPatientHistory] = useState('');
  const [loading, setLoading] = useState(false);

  const contextTypes = [
    { value: 'general', label: 'Allgemeine Beratung' },
    { value: 'diagnosis', label: 'Diagnose-Unterstützung' },
    { value: 'treatment', label: 'Behandlungsempfehlung' },
    { value: 'summary', label: 'Zusammenfassung' }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      context_type: contextType
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const requestData: ChatRequest = {
        message: inputMessage,
        context_type: contextType,
        patient_history: patientHistory || undefined
      };

      const response = await fetch(`${(import.meta as any).env?.VITE_N8N_URL || 'http://localhost:5678'}/webhook/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
        context_type: contextType
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.',
        timestamp: new Date(),
        context_type: 'general'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <HeartIcon className="h-8 w-8 mr-3 text-blue-600" />
          Medical AI Chat
        </h1>
        <p className="mt-2 text-gray-600">
          KI-gestützte medizinische Beratung für deutsche Ärzte
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontext-Typ
            </label>
            <select
              value={contextType}
              onChange={(e) => setContextType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {contextTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patientenvorgeschichte (optional)
            </label>
            <input
              type="text"
              value={patientHistory}
              onChange={(e) => setPatientHistory(e.target.value)}
              placeholder="z.B. Diabetes, Bluthochdruck"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ maxHeight: '500px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <ComputerDesktopIcon className="h-4 w-4 mt-1 text-blue-600" />
                  )}
                  {message.type === 'user' && (
                    <UserIcon className="h-4 w-4 mt-1 text-white" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ComputerDesktopIcon className="h-4 w-4 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Geben Sie Ihre medizinische Frage ein..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Medizinischer Haftungsausschluss</p>
            <p className="text-xs">
              Diese KI-Unterstützung ersetzt nicht die professionelle medizinische Beratung, Diagnose oder Behandlung. 
              Konsultieren Sie immer einen qualifizierten Arzt für medizinische Entscheidungen.
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Funktionen</p>
            <ul className="text-xs space-y-1">
              <li>• Allgemeine medizinische Beratung auf Deutsch</li>
              <li>• Diagnose-Unterstützung mit Differentialdiagnosen</li>
              <li>• Behandlungsempfehlungen basierend auf Leitlinien</li>
              <li>• Zusammenfassungen von Konsultationen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalChat;
