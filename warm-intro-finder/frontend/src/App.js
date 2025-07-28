import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Flame, 
  Snowflake, 
  Activity, 
  Settings,
  Plus,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import LeadForm from './components/LeadForm';
import LeadsList from './components/LeadsList';
import NetworkGraph from './components/NetworkGraph';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for demo
  useEffect(() => {
    // Load sample leads
    const sampleLeads = [
      {
        id: 1,
        name: "John Smith",
        company: "Acme Corp",
        email: "john.smith@acmecorp.com",
        title: "VP of Sales",
        status: "warm_intro_possible",
        connection_details: "Alice Thompson (former_colleague)",
        connection_strength: "strong",
        added_date: "2024-01-15"
      },
      {
        id: 2,
        name: "Sarah Johnson", 
        company: "TechStart Inc",
        email: "sarah.j@techstart.com",
        title: "CEO",
        status: "warm_intro_possible",
        connection_details: "Bob Wilson (university_friend)",
        connection_strength: "medium",
        added_date: "2024-01-16"
      },
      {
        id: 3,
        name: "Mike Chen",
        company: "DataFlow Systems", 
        email: "m.chen@dataflow.com",
        title: "CTO",
        status: "warm_intro_possible",
        connection_details: "Carol Davis (industry_contact)",
        connection_strength: "medium",
        added_date: "2024-01-17"
      },
      {
        id: 4,
        name: "Lisa Rodriguez",
        company: "CloudVision Ltd",
        email: "lisa.r@cloudvision.com",
        title: "Head of Marketing",
        status: "warm_intro_possible",
        connection_details: "Emma Foster (mutual_connection)",
        connection_strength: "weak",
        added_date: "2024-01-18"
      },
      {
        id: 5,
        name: "David Park",
        company: "NewTech Solutions",
        email: "david.park@newtech.com",
        title: "Product Manager",
        status: "cold_outreach",
        connection_details: "No warm connections found",
        connection_strength: null,
        added_date: "2024-01-19"
      }
    ];

    // Load sample contacts
    const sampleContacts = [
      {
        id: 1,
        name: "Alice Thompson",
        company: "Acme Corp",
        email: "alice.thompson@acmecorp.com",
        title: "Director of Engineering",
        relationship_type: "former_colleague",
        connection_strength: "strong"
      },
      {
        id: 2,
        name: "Bob Wilson",
        company: "TechStart Inc", 
        email: "bob.wilson@techstart.com",
        title: "Senior Developer",
        relationship_type: "university_friend",
        connection_strength: "medium"
      },
      {
        id: 3,
        name: "Carol Davis",
        company: "DataFlow Systems",
        email: "carol.davis@dataflow.com", 
        title: "VP of Operations",
        relationship_type: "industry_contact",
        connection_strength: "medium"
      },
      {
        id: 4,
        name: "Emma Foster",
        company: "CloudVision Ltd",
        email: "emma.foster@cloudvision.com",
        title: "Senior Manager", 
        relationship_type: "mutual_connection",
        connection_strength: "weak"
      }
    ];

    setLeads(sampleLeads);
    setContacts(sampleContacts);
  }, []);

  const handleAddLead = (newLead) => {
    setIsLoading(true);
    
    // Simulate API call to n8n webhook
    setTimeout(() => {
      const leadWithId = {
        ...newLead,
        id: leads.length + 1,
        status: 'processing',
        added_date: new Date().toISOString().split('T')[0]
      };
      
      setLeads(prev => [leadWithId, ...prev]);
      
      // Simulate processing result after 3 seconds
      setTimeout(() => {
        setLeads(prev => prev.map(lead => 
          lead.id === leadWithId.id 
            ? {
                ...lead,
                status: Math.random() > 0.3 ? 'warm_intro_possible' : 'cold_outreach',
                connection_details: Math.random() > 0.3 ? 'Sample Connection (colleague)' : 'No warm connections found',
                connection_strength: Math.random() > 0.3 ? 'medium' : null
              }
            : lead
        ));
      }, 3000);
      
      setIsLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'network', name: 'Network', icon: UserPlus },
    { id: 'add-lead', name: 'Add Lead', icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-8 w-8 text-warm-500" />
                <h1 className="text-xl font-bold text-gradient">Warm Intro Finder</h1>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Powered by</span>
                <span className="font-medium text-primary-600">n8n</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="http://localhost:5678/home/workflows"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>n8n Workflows</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard leads={leads} contacts={contacts} />
        )}
        
        {activeTab === 'leads' && (
          <LeadsList leads={leads} />
        )}
        
        {activeTab === 'network' && (
          <NetworkGraph contacts={contacts} leads={leads} />
        )}
        
        {activeTab === 'add-lead' && (
          <LeadForm onAddLead={handleAddLead} isLoading={isLoading} />
        )}
      </main>
    </div>
  );
}

export default App;
