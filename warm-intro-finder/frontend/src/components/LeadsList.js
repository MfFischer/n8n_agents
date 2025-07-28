import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  Snowflake, 
  Clock, 
  Mail, 
  Building, 
  User,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

const LeadsList = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filter and sort leads
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.added_date) - new Date(a.added_date);
      }
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'warm_intro_possible':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warm-100 text-warm-800">
            <Flame className="h-3 w-3 mr-1" />
            Warm Intro Available
          </span>
        );
      case 'cold_outreach':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cold-100 text-cold-800">
            <Snowflake className="h-3 w-3 mr-1" />
            Cold Outreach
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </span>
        );
      default:
        return null;
    }
  };

  const getConnectionStrengthColor = (strength) => {
    switch (strength) {
      case 'strong':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'weak':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track your leads and their warm intro opportunities
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Status</option>
                <option value="warm_intro_possible">Warm Intro</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-warm-500 rounded-full"></div>
            <span className="text-gray-600">
              {leads.filter(l => l.status === 'warm_intro_possible').length} Warm
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-cold-500 rounded-full"></div>
            <span className="text-gray-600">
              {leads.filter(l => l.status === 'cold_outreach').length} Cold
            </span>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>

                    {/* Lead Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{lead.name}</h3>
                        {getStatusBadge(lead.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{lead.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{lead.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Added {new Date(lead.added_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Connection Details */}
                      {lead.status === 'warm_intro_possible' && lead.connection_details && (
                        <div className="bg-warm-50 border border-warm-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-warm-800">Warm Connection Available</h4>
                            {lead.connection_strength && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectionStrengthColor(lead.connection_strength)}`}>
                                {lead.connection_strength} connection
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-warm-700">{lead.connection_details}</p>
                        </div>
                      )}

                      {lead.status === 'cold_outreach' && (
                        <div className="bg-cold-50 border border-cold-200 rounded-lg p-3 mb-3">
                          <h4 className="text-sm font-medium text-cold-800 mb-1">Cold Outreach Required</h4>
                          <p className="text-sm text-cold-700">No warm connections found in your network</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {lead.status === 'warm_intro_possible' && (
                    <button className="btn-primary text-sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Make Intro
                    </button>
                  )}
                  
                  <button className="btn-secondary text-sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first lead'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button className="btn-primary">
                <User className="h-4 w-4 mr-2" />
                Add First Lead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsList;
