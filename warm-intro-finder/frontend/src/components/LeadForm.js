import React, { useState } from 'react';
import { UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const LeadForm = ({ onAddLead, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    title: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onAddLead(formData);
    
    // Reset form
    setFormData({
      name: '',
      company: '',
      email: '',
      title: ''
    });
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sampleLeads = [
    {
      name: "Alex Johnson",
      company: "Acme Corp",
      email: "alex.johnson@acmecorp.com",
      title: "Sales Director"
    },
    {
      name: "Maria Garcia",
      company: "TechStart Inc", 
      email: "maria.garcia@techstart.com",
      title: "VP of Marketing"
    },
    {
      name: "James Wilson",
      company: "DataFlow Systems",
      email: "james.wilson@dataflow.com",
      title: "Head of Product"
    }
  ];

  const fillSampleData = (sample) => {
    setFormData(sample);
    setErrors({});
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new lead to check for warm introduction opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="John Smith"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`input-field ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="VP of Sales"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`input-field ${errors.company ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Acme Corp"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.company}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="john.smith@acmecorp.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  * Required fields
                </p>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Add Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Success Message */}
            {showSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm font-medium text-green-800">
                    Lead added successfully! Processing warm intro opportunities...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Fill */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Fill</h3>
            <p className="text-sm text-gray-500 mb-4">
              Use sample data to test the workflow
            </p>
            
            <div className="space-y-3">
              {sampleLeads.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => fillSampleData(sample)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{sample.name}</div>
                  <div className="text-xs text-gray-500">{sample.company} • {sample.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* How it Works */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How it Works</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <p>Lead information is sent to n8n workflow</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <p>System checks your network for connections at the company</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <p>Warm intro opportunities are identified and notifications sent</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <p>CRM is updated with relationship status and next steps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
