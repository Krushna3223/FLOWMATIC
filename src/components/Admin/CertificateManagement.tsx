import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X, Clock, FileText, Download } from 'lucide-react';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { toast } from 'react-hot-toast';

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
  adminComment?: string;
  principalComment?: string;
}

const CertificateManagement: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        console.log('🔍 CertificateManagement: Fetching certificate requests...');
        const requestsRef = ref(database, 'documentRequests');
        const snapshot = await get(requestsRef);
        
        console.log('📊 CertificateManagement: Raw data from Firebase:', snapshot.val());
        
        if (snapshot.exists()) {
          const requests: CertificateRequest[] = [];
          
          snapshot.forEach((userSnapshot) => {
            console.log(`📋 CertificateManagement: Processing user ${userSnapshot.key}:`, userSnapshot.val());
            
            // Each user has multiple requests, so we need to iterate through them
            userSnapshot.forEach((requestSnapshot) => {
              console.log(`📋 CertificateManagement: Processing request:`, requestSnapshot.key, requestSnapshot.val());
              
              const request = {
                id: requestSnapshot.key!,
                userId: userSnapshot.key!,
                ...requestSnapshot.val()
              };
              requests.push(request);
            });
          });
          
          console.log('📋 CertificateManagement: All requests:', requests);
          setCertificates(requests);
        } else {
          console.log('❌ CertificateManagement: No certificate requests found in database');
          setCertificates([]);
        }
      } catch (error) {
        console.error('❌ CertificateManagement: Error fetching requests:', error);
        toast.error('Failed to load certificate requests');
        setCertificates([]);
      }
    };

    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string, userId: string) => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${id}`);
      await update(requestRef, {
        status: 'approved_by_admin',
        adminComment: 'Approved by admin',
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setCertificates(certificates.map(cert => 
        cert.id === id 
          ? { ...cert, status: 'approved_by_admin' }
          : cert
      ));
      
      toast.success('Certificate request approved and forwarded to Principal');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id: string, userId: string) => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${id}`);
      await update(requestRef, {
        status: 'rejected',
        adminComment: 'Rejected by admin',
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setCertificates(certificates.map(cert => 
        cert.id === id 
          ? { ...cert, status: 'rejected' }
          : cert
      ));
      
      toast.success('Certificate request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_approved':
        return 'bg-blue-100 text-blue-800';
      case 'principal_approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'admin_approved':
        return <Check className="h-4 w-4" />;
      case 'principal_approved':
        return <Check className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'rejected':
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
        return 'Other Certificate';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Requests</h1>
        <p className="text-gray-600">Manage and approve certificate requests from students</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="admin_approved">Admin Approved</option>
              <option value="principal_approved">Principal Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredCertificates.length} requests found
            </span>
          </div>
        </div>
      </div>

      {/* Certificates table */}
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
                  Reason
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
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cert.studentName}</div>
                      <div className="text-sm text-gray-500">{cert.rollNo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {getCertificateTypeLabel(cert.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {cert.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                      {getStatusIcon(cert.status)}
                      <span className="ml-1 capitalize">
                        {cert.status.replace('_', ' ')}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCertificate(cert);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {cert.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(cert.id, cert.userId)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(cert.id, cert.userId)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Certificate Modal */}
      {isViewModalOpen && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Certificate Request Details</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedCertificate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCertificate.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCertificate.rollNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certificate Type</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getCertificateTypeLabel(selectedCertificate.type)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedCertificate.status)}`}>
                    {getStatusIcon(selectedCertificate.status)}
                    <span className="ml-1 capitalize">
                      {selectedCertificate.status.replace('_', ' ')}
                    </span>
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCertificate.purpose}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedCertificate.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {selectedCertificate.adminComment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Comment</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCertificate.adminComment}</p>
                </div>
              )}
              
              {selectedCertificate.principalComment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Principal Comment</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCertificate.principalComment}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedCertificate(null);
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement; 