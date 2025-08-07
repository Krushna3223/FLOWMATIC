import React, { useEffect, useState } from 'react';
import { Shield, Plus, Calendar, User, MapPin, AlertTriangle, CheckCircle, X, Upload, FileText } from 'lucide-react';

interface SafetyAudit {
  id: string;
  title: string;
  description: string;
  location: string;
  auditType: 'electrical_safety' | 'fire_safety' | 'equipment_safety' | 'compliance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  conductedBy: string;
  conductedAt: string;
  dueDate: string;
  findings: string[];
  recommendations: string[];
  complianceScore: number;
  attachments: string[];
  notes: string;
}

// Mock API
const fetchSafetyAudits = async (): Promise<SafetyAudit[]> => [
  {
    id: '1',
    title: 'Electrical Panel Safety Audit',
    description: 'Comprehensive safety audit of all electrical panels in campus buildings',
    location: 'All Campus Buildings',
    auditType: 'electrical_safety',
    priority: 'high',
    status: 'completed',
    conductedBy: 'John Electrician',
    conductedAt: '2024-06-01T10:00:00Z',
    dueDate: '2024-06-01T17:00:00Z',
    findings: [
      'All panels properly labeled and accessible',
      'No signs of overheating or damage',
      'Circuit breakers functioning correctly',
      'Ground connections secure'
    ],
    recommendations: [
      'Schedule annual thermal imaging scan',
      'Update panel documentation',
      'Install additional safety signage'
    ],
    complianceScore: 95,
    attachments: ['audit_report.pdf', 'thermal_images.zip'],
    notes: 'Excellent safety compliance. All electrical systems meet safety standards.'
  },
  {
    id: '2',
    title: 'Emergency Lighting System Check',
    description: 'Quarterly emergency lighting system functionality test',
    location: 'Campus Wide',
    auditType: 'fire_safety',
    priority: 'medium',
    status: 'in_progress',
    conductedBy: 'John Electrician',
    conductedAt: '2024-05-30T14:00:00Z',
    dueDate: '2024-06-02T17:00:00Z',
    findings: [
      '95% of emergency lights functional',
      'Battery backup systems operational',
      'Exit signs properly illuminated'
    ],
    recommendations: [
      'Replace 3 faulty emergency lights',
      'Recharge backup batteries',
      'Update maintenance schedule'
    ],
    complianceScore: 85,
    attachments: ['emergency_lighting_check.pdf'],
    notes: 'Minor issues found. Overall system is functional and safe.'
  },
  {
    id: '3',
    title: 'Generator Safety Compliance',
    description: 'Annual generator safety and compliance audit',
    location: 'Generator Room',
    auditType: 'equipment_safety',
    priority: 'critical',
    status: 'pending',
    conductedBy: 'John Electrician',
    conductedAt: '',
    dueDate: '2024-06-15T17:00:00Z',
    findings: [],
    recommendations: [],
    complianceScore: 0,
    attachments: [],
    notes: 'Scheduled for next week. Will include fuel system, electrical connections, and safety protocols.'
  },
  {
    id: '4',
    title: 'Workshop Electrical Safety',
    description: 'Monthly electrical safety inspection in workshop areas',
    location: 'Workshop Building',
    auditType: 'electrical_safety',
    priority: 'high',
    status: 'failed',
    conductedBy: 'John Electrician',
    conductedAt: '2024-05-28T09:00:00Z',
    dueDate: '2024-05-28T17:00:00Z',
    findings: [
      'Exposed wiring in machine area',
      'Overloaded power strips',
      'Missing GFCI protection'
    ],
    recommendations: [
      'Immediate repair of exposed wiring',
      'Install additional power outlets',
      'Add GFCI protection to all outlets',
      'Conduct safety training for workshop users'
    ],
    complianceScore: 60,
    attachments: ['safety_violations.pdf', 'repair_quotes.pdf'],
    notes: 'Critical safety violations found. Immediate action required.'
  }
];

const submitSafetyAudit = async (audit: Omit<SafetyAudit, 'id'>): Promise<boolean> => {
  console.log('Submitting safety audit:', audit);
  return true;
};

const ElectricianSafetyAuditLog: React.FC = () => {
  const [audits, setAudits] = useState<SafetyAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<SafetyAudit | null>(null);
  const [newAudit, setNewAudit] = useState({
    title: '',
    description: '',
    location: '',
    auditType: 'electrical_safety' as const,
    priority: 'medium' as const,
    status: 'pending' as const,
    conductedBy: 'John Electrician',
    conductedAt: '',
    dueDate: '',
    findings: '',
    recommendations: '',
    complianceScore: 0,
    attachments: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSafetyAudits();
        setAudits(data);
      } catch (error) {
        console.error('Error loading safety audits:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newAudit.title || !newAudit.description || !newAudit.location) {
      return;
    }

    try {
      await submitSafetyAudit({
        ...newAudit,
        findings: newAudit.findings ? newAudit.findings.split('\n').filter(item => item.trim()) : [],
        recommendations: newAudit.recommendations ? newAudit.recommendations.split('\n').filter(item => item.trim()) : [],
        attachments: newAudit.attachments ? newAudit.attachments.split(',').map(item => item.trim()) : []
      });
      const updatedAudits = await fetchSafetyAudits();
      setAudits(updatedAudits);
      setShowModal(false);
      setNewAudit({
        title: '',
        description: '',
        location: '',
        auditType: 'electrical_safety',
        priority: 'medium',
        status: 'pending',
        conductedBy: 'John Electrician',
        conductedAt: '',
        dueDate: '',
        findings: '',
        recommendations: '',
        complianceScore: 0,
        attachments: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting safety audit:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditTypeColor = (type: string) => {
    switch (type) {
      case 'electrical_safety':
        return 'bg-blue-100 text-blue-800';
      case 'fire_safety':
        return 'bg-red-100 text-red-800';
      case 'equipment_safety':
        return 'bg-green-100 text-green-800';
      case 'compliance':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Safety Audit Log</h1>
        <p className="text-gray-600">Manage electrical safety audits and compliance reports</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Safety Audit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Safety Audits</h2>
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-800">{audit.title}</h3>
                      {audit.status === 'failed' && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{audit.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {audit.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {audit.conductedBy}
                      </div>
                      {audit.conductedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(audit.conductedAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${getComplianceColor(audit.complianceScore)}`}>
                          {audit.complianceScore}% Compliance
                        </span>
                      </div>
                    </div>
                    {audit.findings.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Key Findings:</strong> {audit.findings.slice(0, 2).join(', ')}
                        {audit.findings.length > 2 && '...'}
                      </div>
                    )}
                    {audit.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Notes:</strong> {audit.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                      {audit.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(audit.priority)}`}>
                      {audit.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAuditTypeColor(audit.auditType)}`}>
                      {audit.auditType.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => setSelectedAudit(audit)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Audit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">New Safety Audit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audit Title
                </label>
                <input
                  type="text"
                  value={newAudit.title}
                  onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter audit title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newAudit.description}
                  onChange={(e) => setNewAudit({ ...newAudit, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the safety audit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newAudit.location}
                    onChange={(e) => setNewAudit({ ...newAudit, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audit Type
                  </label>
                  <select
                    value={newAudit.auditType}
                    onChange={(e) => setNewAudit({ ...newAudit, auditType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="electrical_safety">Electrical Safety</option>
                    <option value="fire_safety">Fire Safety</option>
                    <option value="equipment_safety">Equipment Safety</option>
                    <option value="compliance">Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newAudit.priority}
                    onChange={(e) => setNewAudit({ ...newAudit, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compliance Score (%)
                  </label>
                  <input
                    type="number"
                    value={newAudit.complianceScore}
                    onChange={(e) => setNewAudit({ ...newAudit, complianceScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conducted Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newAudit.conductedAt}
                    onChange={(e) => setNewAudit({ ...newAudit, conductedAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newAudit.dueDate}
                    onChange={(e) => setNewAudit({ ...newAudit, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Findings (one per line)
                </label>
                <textarea
                  value={newAudit.findings}
                  onChange={(e) => setNewAudit({ ...newAudit, findings: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter audit findings..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendations (one per line)
                </label>
                <textarea
                  value={newAudit.recommendations}
                  onChange={(e) => setNewAudit({ ...newAudit, recommendations: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recommendations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newAudit.notes}
                  onChange={(e) => setNewAudit({ ...newAudit, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newAudit.title || !newAudit.description || !newAudit.location}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Details Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Audit Details</h3>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">{selectedAudit.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{selectedAudit.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{selectedAudit.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Compliance:</span>
                  <p className={`${getComplianceColor(selectedAudit.complianceScore)}`}>
                    {selectedAudit.complianceScore}%
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600 capitalize">{selectedAudit.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-600 capitalize">{selectedAudit.auditType.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedAudit.findings.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Findings:</span>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1">
                    {selectedAudit.findings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAudit.recommendations.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Recommendations:</span>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1">
                    {selectedAudit.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAudit.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-600 text-sm">{selectedAudit.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricianSafetyAuditLog; 