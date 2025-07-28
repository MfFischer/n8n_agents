import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';

const NetworkGraph = ({ contacts, leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [strengthFilter, setStrengthFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStrength = strengthFilter === 'all' || contact.connection_strength === strengthFilter;
    
    return matchesSearch && matchesStrength;
  });

  // Group contacts by company
  const contactsByCompany = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.company]) {
      acc[contact.company] = [];
    }
    acc[contact.company].push(contact);
    return acc;
  }, {});

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStrengthBadge = (strength) => {
    const colors = {
      strong: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      weak: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[strength]}`}>
        {strength} connection
      </span>
    );
  };

  const getRelationshipIcon = (type) => {
    switch (type) {
      case 'former_colleague':
        return <UserCheck className="h-4 w-4" />;
      case 'university_friend':
        return <Star className="h-4 w-4" />;
      case 'industry_contact':
        return <Building className="h-4 w-4" />;
      case 'mutual_connection':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Check if contact's company has any leads
  const getCompanyLeads = (company) => {
    return leads.filter(lead => lead.company.toLowerCase() === company.toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Graph</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize your professional network and connection opportunities
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* Connection Strength Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={strengthFilter}
              onChange={(e) => setStrengthFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Connections</option>
              <option value="strong">Strong</option>
              <option value="medium">Medium</option>
              <option value="weak">Weak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{contacts.length}</div>
          <div className="text-sm text-gray-500">Total Contacts</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {contacts.filter(c => c.connection_strength === 'strong').length}
          </div>
          <div className="text-sm text-gray-500">Strong Connections</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">
            {Object.keys(contactsByCompany).length}
          </div>
          <div className="text-sm text-gray-500">Companies</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warm-600">
            {leads.filter(l => l.status === 'warm_intro_possible').length}
          </div>
          <div className="text-sm text-gray-500">Warm Opportunities</div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Network by Company</h3>
            
            <div className="space-y-4">
              {Object.entries(contactsByCompany).map(([company, companyContacts]) => {
                const companyLeads = getCompanyLeads(company);
                const hasWarmOpportunity = companyLeads.some(lead => lead.status === 'warm_intro_possible');
                
                return (
                  <div key={company} className={`border rounded-lg p-4 ${hasWarmOpportunity ? 'border-warm-300 bg-warm-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <h4 className="font-medium text-gray-900">{company}</h4>
                        {hasWarmOpportunity && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warm-200 text-warm-800">
                            Warm Opportunity
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {companyContacts.map((contact) => (
                        <div 
                          key={contact.id}
                          onClick={() => setSelectedContact(contact)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer transition-all"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                            <p className="text-xs text-gray-500 truncate">{contact.title}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStrengthColor(contact.connection_strength)}`} />
                        </div>
                      ))}
                    </div>
                    
                    {companyLeads.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Active leads at this company:</p>
                        <div className="flex flex-wrap gap-2">
                          {companyLeads.map((lead) => (
                            <span key={lead.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              {lead.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Details Sidebar */}
        <div>
          <div className="card sticky top-6">
            {selectedContact ? (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-500">{selectedContact.title}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContact.company}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{selectedContact.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Relationship</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getRelationshipIcon(selectedContact.relationship_type)}
                      <p className="text-sm text-gray-900 capitalize">
                        {selectedContact.relationship_type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Connection Strength</label>
                    <div className="mt-1">
                      {getStrengthBadge(selectedContact.connection_strength)}
                    </div>
                  </div>
                  
                  {selectedContact.notes && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedContact.notes}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full btn-primary text-sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">Select a Contact</h3>
                <p className="text-sm text-gray-500">
                  Click on any contact to view their details and relationship information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
