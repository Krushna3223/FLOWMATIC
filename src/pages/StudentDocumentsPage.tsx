import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Clock, CheckCircle, XCircle, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'bonafide', label: 'Bonafide Certificate' },
  { value: 'tc', label: 'Transfer Certificate' },
  { value: 'noc', label: 'No Objection Certificate' },
  { value: 'character', label: 'Character Certificate' },
];

const StudentDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('request');
  const [form, setForm] = useState({ 
    type: 'bonafide', 
    purpose: '', 
    course: '', 
    year: '', 
    branch: '', 
    dob: '', 
    academicYear: '', 
    refNo: '' 
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;
  const [student, setStudent] = useState<any>(null);

  // Fetch student info (for autofill)
  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snap) => {
      setStudent(snap.val());
    });
  }, [user, db]);

  // Fetch requests
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const reqRef = ref(db, `documentRequests/${user.uid}`);
    onValue(reqRef, (snap) => {
      const val = snap.val() || {};
      setRequests(Object.entries(val).map(([id, req]: [string, any]) => ({ id, ...req })).sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
  }, [user, db]);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Submit request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.course || !form.year || !form.branch || !form.dob || !form.academicYear) {
      toast.error('Please fill all required fields.');
      return;
    }
    
    try {
      const reqRef = ref(db, `documentRequests/${user?.uid}`);
      await push(reqRef, {
        ...form,
        status: 'pending',
        createdAt: Date.now(),
        studentName: student?.name || student?.fullName || '',
        rollNo: student?.rollNo || student?.rollNumber || '',
        userId: user?.uid,
        studentId: user?.uid,
      });
      toast.success('Request submitted successfully!');
      setForm({ type: 'bonafide', purpose: '', course: '', year: '', branch: '', dob: '', academicYear: '', refNo: '' });
      setTab('myrequests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'forwarded_to_registrar':
        return 'bg-purple-100 text-purple-800';
      case 'forwarded_to_principal':
        return 'bg-indigo-100 text-indigo-800';
      case 'approved_by_registrar':
        return 'bg-blue-100 text-blue-800';
      case 'approved_by_principal':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'rejected_by_clerk':
        return 'bg-red-100 text-red-800';
      case 'rejected_by_registrar':
        return 'bg-red-100 text-red-800';
      case 'rejected_by_principal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'forwarded_to_registrar':
        return <Clock className="h-4 w-4" />;
      case 'forwarded_to_principal':
        return <CheckCircle className="h-4 w-4" />;
      case 'approved_by_registrar':
        return <CheckCircle className="h-4 w-4" />;
      case 'approved_by_principal':
        return <CheckCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'rejected_by_clerk':
        return <XCircle className="h-4 w-4" />;
      case 'rejected_by_registrar':
        return <XCircle className="h-4 w-4" />;
      case 'rejected_by_principal':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'bonafide':
        return 'Bonafide Certificate';
      case 'tc':
        return 'Transfer Certificate';
      case 'noc':
        return 'No Objection Certificate';
      case 'character':
        return 'Character Certificate';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Requests</h1>
          <p className="text-gray-600">Submit and track your document requests</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setTab('request')}
              className={`pb-2 px-4 font-medium ${
                tab === 'request'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📤 Submit New Request
            </button>
            <button
              onClick={() => setTab('myrequests')}
              className={`pb-2 px-4 font-medium ${
                tab === 'myrequests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 My Requests
            </button>
          </div>
        </div>

        {/* Submit New Request */}
        {tab === 'request' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Submit Document Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Certificate Type *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  >
                    {DOC_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Course *</label>
                  <input
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., B.Tech Computer Science"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Year *</label>
                  <input
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Branch *</label>
                  <input
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Date of Birth *</label>
                  <input
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Academic Year *</label>
                  <input
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 2024-25"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Purpose <span className="text-sm text-gray-500">(Explain why you need this certificate)</span>
                </label>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows={3}
                  placeholder="Please explain the purpose for requesting this certificate..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                📤 Submit Request
              </button>
            </form>
          </div>
        )}

        {/* My Requests */}
        {tab === 'myrequests' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">My Document Requests</h2>
            
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="forwarded_to_registrar">Forwarded to Registrar</option>
                <option value="forwarded_to_principal">Forwarded to Principal</option>
                <option value="approved_by_registrar">Approved by Registrar</option>
                <option value="approved_by_principal">Approved by Principal</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="rejected_by_clerk">Rejected by Clerk</option>
                <option value="rejected_by_registrar">Rejected by Registrar</option>
                <option value="rejected_by_principal">Rejected by Principal</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No document requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getCertificateTypeLabel(request.type)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Purpose:</strong> {request.purpose}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Course:</strong> {request.course} - {request.year} | <strong>Branch:</strong> {request.branch}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.registrarComment && (
                          <p className="text-xs text-blue-600 mt-1">
                            <strong>Registrar Comment:</strong> {request.registrarComment}
                          </p>
                        )}
                        {request.principalComment && (
                          <p className="text-xs text-green-600 mt-1">
                            <strong>Principal Comment:</strong> {request.principalComment}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {(request.status === 'approved' || request.status === 'approved_by_principal') && (
                          <button
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDocumentsPage; 