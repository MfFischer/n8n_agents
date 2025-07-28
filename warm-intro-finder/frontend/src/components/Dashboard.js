import React from 'react';
import { 
  Flame, 
  Snowflake, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = ({ leads, contacts }) => {
  const warmLeads = leads.filter(lead => lead.status === 'warm_intro_possible');
  const coldLeads = leads.filter(lead => lead.status === 'cold_outreach');
  const processingLeads = leads.filter(lead => lead.status === 'processing');
  
  const warmRate = leads.length > 0 ? (warmLeads.length / leads.length * 100).toFixed(1) : 0;
  
  const recentLeads = leads.slice(0, 5);

  const stats = [
    {
      name: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      name: 'Warm Intros',
      value: warmLeads.length,
      icon: Flame,
      color: 'text-warm-600',
      bgColor: 'bg-warm-50'
    },
    {
      name: 'Cold Outreach',
      value: coldLeads.length,
      icon: Snowflake,
      color: 'text-cold-600',
      bgColor: 'bg-cold-50'
    },
    {
      name: 'Warm Rate',
      value: `${warmRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'warm_intro_possible':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warm-100 text-warm-800">
            <Flame className="h-3 w-3 mr-1" />
            Warm
          </span>
        );
      case 'cold_outreach':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cold-100 text-cold-800">
            <Snowflake className="h-3 w-3 mr-1" />
            Cold
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your warm intro finder performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Leads</h3>
            <span className="text-sm text-gray-500">{leads.length} total</span>
          </div>
          
          <div className="space-y-3">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.company} • {lead.title}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(lead.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No leads yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Network Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Network Overview</h3>
            <span className="text-sm text-gray-500">{contacts.length} contacts</span>
          </div>
          
          <div className="space-y-4">
            {/* Connection Strength Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Connection Strength</h4>
              <div className="space-y-2">
                {['strong', 'medium', 'weak'].map((strength) => {
                  const count = contacts.filter(c => c.connection_strength === strength).length;
                  const percentage = contacts.length > 0 ? (count / contacts.length * 100) : 0;
                  
                  return (
                    <div key={strength} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          strength === 'strong' ? 'bg-green-500' :
                          strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-gray-600 capitalize">{strength}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Companies */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Companies</h4>
              <div className="space-y-1">
                {contacts.slice(0, 4).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{contact.company}</span>
                    <span className="text-gray-900 font-medium">{contact.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Add New Lead</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <CheckCircle className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Review Warm Intros</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Update Network</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
