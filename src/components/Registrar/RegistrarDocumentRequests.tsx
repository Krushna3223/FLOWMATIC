import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, update, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import { Check, X, Clock, Search, Filter, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface CertificateRequest {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  type: string;
  purpose: string;
  status: string;
  academicYear: string;
  branch: string;
  course: string;
  rollNo: string;
  year: string;
  dob: string;
  refNo: string;
  createdAt: number;
  registrarComment?: string;
  principalComment?: string;
}

const RegistrarDocumentRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCertificates();
    
    // Set up real-time listener for document requests
    const requestsRef = ref(database, 'documentRequests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const requestsList: CertificateRequest[] = [];
        snapshot.forEach((userSnapshot) => {
          const userRequests = userSnapshot.val();
          Object.entries(userRequests).forEach(([requestId, requestData]: [string, any]) => {
            requestsList.push({
              id: requestId,
              userId: userSnapshot.key!,
              ...requestData
            });
          });
        });
        
        // Sort by creation date (newest first)
        requestsList.sort((a, b) => b.createdAt - a.createdAt);
        setCertificates(requestsList);
        console.log('✅ RegistrarDocumentRequests: Real-time update - Fetched', requestsList.length, 'requests');
      } else {
        console.log('⚠️ RegistrarDocumentRequests: Real-time update - No requests found');
        setCertificates([]);
      }
    }, (error) => {
      console.error('❌ RegistrarDocumentRequests: Real-time listener error:', error);
    });

    // Cleanup function to unsubscribe from listener
    return () => unsubscribe();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      console.log('🔍 RegistrarDocumentRequests: Fetching certificate requests...');
      const requestsRef = ref(database, 'documentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requestsList: CertificateRequest[] = [];
        snapshot.forEach((userSnapshot) => {
          const userRequests = userSnapshot.val();
          Object.entries(userRequests).forEach(([requestId, requestData]: [string, any]) => {
            requestsList.push({
              id: requestId,
              userId: userSnapshot.key!,
              ...requestData
            });
          });
        });
        
        // Sort by creation date (newest first)
        requestsList.sort((a, b) => b.createdAt - a.createdAt);
        setCertificates(requestsList);
        console.log('✅ RegistrarDocumentRequests: Fetched', requestsList.length, 'requests');
      } else {
        console.log('⚠️ RegistrarDocumentRequests: No requests found');
        setCertificates([]);
      }
    } catch (error) {
      console.error('❌ RegistrarDocumentRequests: Error fetching requests:', error);
      toast.error('Failed to load certificate requests');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, userId: string) => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${id}`);
      await update(requestRef, {
        status: 'forwarded_to_principal',
        registrarComment: 'Forwarded to Principal for final approval',
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Certificate request forwarded to Principal for final approval');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to forward request');
    }
  };

  const handleReject = async (id: string, userId: string) => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${id}`);
      await update(requestRef, {
        status: 'rejected_by_registrar',
        registrarComment: 'Rejected by registrar',
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Certificate request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
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
        return <Check className="h-4 w-4" />;
      case 'approved_by_registrar':
        return <Check className="h-4 w-4" />;
      case 'approved_by_principal':
        return <Check className="h-4 w-4" />;
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'rejected_by_registrar':
        return <X className="h-4 w-4" />;
      case 'rejected_by_principal':
        return <X className="h-4 w-4" />;
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

  const handleViewDetails = (request: CertificateRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Requests</h1>
        <p className="text-gray-600">Review and approve student document requests</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name, roll number, or certificate type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="forwarded_to_registrar">Forwarded from Clerk</option>
            <option value="forwarded_to_principal">Forwarded to Principal</option>
            <option value="approved_by_registrar">Approved by Registrar</option>
            <option value="approved_by_principal">Approved by Principal</option>
            <option value="rejected">Rejected</option>
            <option value="rejected_by_registrar">Rejected by Registrar</option>
            <option value="rejected_by_principal">Rejected by Principal</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                        <div className="text-sm text-gray-500">{request.rollNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCertificateTypeLabel(request.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(request.status === 'pending' || request.status === 'forwarded_to_registrar') && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id, request.userId)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve and Forward to Principal"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id, request.userId)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'forwarded_to_principal' && (
                          <span className="text-indigo-600">✓ Forwarded to Principal</span>
                        )}
                        {request.status === 'approved_by_registrar' && (
                          <span className="text-blue-600">✓ Approved by Registrar</span>
                        )}
                        {request.status === 'approved_by_principal' && (
                          <span className="text-green-600">✓ Approved by Principal</span>
                        )}
                        {request.status === 'approved' && (
                          <span className="text-green-600">✓ Approved</span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="text-red-600">✗ Rejected</span>
                        )}
                        {request.status === 'rejected_by_registrar' && (
                          <span className="text-red-600">✗ Rejected by Registrar</span>
                        )}
                        {request.status === 'rejected_by_principal' && (
                          <span className="text-red-600">✗ Rejected by Principal</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">No document requests found</p>
                      <p className="text-sm">No requests match your current filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800">
              Total Requests: <span className="font-semibold">{filteredCertificates.length}</span>
            </p>
            <p className="text-sm text-blue-600">
              Pending: {filteredCertificates.filter(r => r.status === 'pending').length} | 
              Approved: {filteredCertificates.filter(r => r.status === 'approved_by_registrar').length} | 
              Rejected: {filteredCertificates.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <p className="text-sm text-gray-900">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <p className="text-sm text-gray-900">{selectedRequest.rollNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certificate Type</label>
                  <p className="text-sm text-gray-900">{getCertificateTypeLabel(selectedRequest.type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <p className="text-sm text-gray-900">{selectedRequest.purpose}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <p className="text-sm text-gray-900">{selectedRequest.course} - {selectedRequest.year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <p className="text-sm text-gray-900">{selectedRequest.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <p className="text-sm text-gray-900">{selectedRequest.academicYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-sm text-gray-900">{selectedRequest.dob}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1">{selectedRequest.status.replace('_', ' ')}</span>
                  </span>
                </div>
                {selectedRequest.registrarComment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registrar Comment</label>
                    <p className="text-sm text-gray-900">{selectedRequest.registrarComment}</p>
                  </div>
                )}
                {selectedRequest.principalComment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Principal Comment</label>
                    <p className="text-sm text-gray-900">{selectedRequest.principalComment}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarDocumentRequests; 