import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Clock, FileText, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentVerification {
  id: string;
  documentType: 'admission' | 'transfer' | 'bonafide' | 'tc' | 'noc' | 'other';
  studentId: string;
  studentName: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

const RegistrarDocuments: React.FC = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<DocumentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    // Mock data for document verification
    const mockDocuments: DocumentVerification[] = [
      {
        id: 'DOC001',
        documentType: 'admission',
        studentId: 'ST001',
        studentName: 'John Doe',
        documentUrl: 'https://example.com/doc1.pdf',
        status: 'pending',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'DOC002',
        documentType: 'transfer',
        studentId: 'ST002',
        studentName: 'Jane Smith',
        documentUrl: 'https://example.com/doc2.pdf',
        status: 'verified',
        verifiedBy: 'Registrar',
        verifiedAt: '2024-01-14T15:45:00Z',
        createdAt: '2024-01-14T09:20:00Z'
      },
      {
        id: 'DOC003',
        documentType: 'bonafide',
        studentId: 'ST003',
        studentName: 'Mike Johnson',
        documentUrl: 'https://example.com/doc3.pdf',
        status: 'rejected',
        verifiedBy: 'Registrar',
        verifiedAt: '2024-01-13T11:15:00Z',
        notes: 'Incomplete information provided',
        createdAt: '2024-01-13T08:30:00Z'
      },
      {
        id: 'DOC004',
        documentType: 'tc',
        studentId: 'ST004',
        studentName: 'Sarah Wilson',
        documentUrl: 'https://example.com/doc4.pdf',
        status: 'pending',
        createdAt: '2024-01-12T14:20:00Z'
      },
      {
        id: 'DOC005',
        documentType: 'noc',
        studentId: 'ST005',
        studentName: 'David Brown',
        documentUrl: 'https://example.com/doc5.pdf',
        status: 'verified',
        verifiedBy: 'Registrar',
        verifiedAt: '2024-01-11T16:30:00Z',
        createdAt: '2024-01-11T10:45:00Z'
      }
    ];

    setDocuments(mockDocuments);
    setLoading(false);
  };

  const handleDocumentVerification = async (documentId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      // In a real application, this would update the database
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? {
              ...doc,
              status,
              verifiedBy: currentUser?.name || 'Registrar',
              verifiedAt: new Date().toISOString(),
              notes: notes || doc.notes
            }
          : doc
      ));

      toast.success(`Document ${status} successfully`);
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Verification</h1>
        <p className="text-gray-600">Review and verify student documents</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documents by student name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="admission">Admission</option>
            <option value="transfer">Transfer</option>
            <option value="bonafide">Bonafide</option>
            <option value="tc">TC</option>
            <option value="noc">NOC</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">{doc.studentName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p><span className="font-medium">Document Type:</span> {doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)}</p>
                    <p><span className="font-medium">Student ID:</span> {doc.studentId}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  {doc.verifiedBy && (
                    <div>
                      <p><span className="font-medium">Verified By:</span> {doc.verifiedBy}</p>
                      <p><span className="font-medium">Verified At:</span> {new Date(doc.verifiedAt!).toLocaleDateString()}</p>
                      {doc.notes && <p><span className="font-medium">Notes:</span> {doc.notes}</p>}
                    </div>
                  )}
                </div>

                {doc.status === 'pending' && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      placeholder="Add notes (optional)..."
                      value={documentNotes[doc.id] || ''}
                      onChange={(e) => setDocumentNotes(prev => ({ ...prev, [doc.id]: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDocumentVerification(doc.id, 'verified', documentNotes[doc.id])}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Verify
                      </button>
                      <button
                        onClick={() => handleDocumentVerification(doc.id, 'rejected', documentNotes[doc.id])}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800">
              Total Documents: <span className="font-semibold">{filteredDocuments.length}</span>
            </p>
            <p className="text-sm text-blue-600">
              Pending: {filteredDocuments.filter(d => d.status === 'pending').length} | 
              Verified: {filteredDocuments.filter(d => d.status === 'verified').length} | 
              Rejected: {filteredDocuments.filter(d => d.status === 'rejected').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarDocuments; 