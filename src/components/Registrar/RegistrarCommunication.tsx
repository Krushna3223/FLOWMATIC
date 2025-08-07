import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Send, Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Communication {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

const RegistrarCommunication: React.FC = () => {
  const { currentUser } = useAuth();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  
  // Communication form state
  const [communicationForm, setCommunicationForm] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    // Mock data for communications
    const mockCommunications: Communication[] = [
      {
        id: 'COMM001',
        recipient: 'All Students',
        subject: 'Important Notice: Semester Exam Schedule',
        message: 'Dear students, please note that the semester examinations will begin from next week. Please check your individual schedules.',
        status: 'sent',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'COMM002',
        recipient: 'Computer Science Department',
        subject: 'Faculty Meeting Reminder',
        message: 'There will be a faculty meeting tomorrow at 2 PM in the conference room. All faculty members are requested to attend.',
        status: 'delivered',
        createdAt: '2024-01-14T15:45:00Z'
      },
      {
        id: 'COMM003',
        recipient: 'Parents/Guardians',
        subject: 'Parent-Teacher Meeting',
        message: 'We are organizing a parent-teacher meeting on the upcoming weekend. Please check your emails for detailed information.',
        status: 'read',
        createdAt: '2024-01-13T11:15:00Z'
      },
      {
        id: 'COMM004',
        recipient: 'Administrative Staff',
        subject: 'Document Verification Update',
        message: 'Please ensure all pending document verifications are completed by the end of this week.',
        status: 'sent',
        createdAt: '2024-01-12T14:20:00Z'
      },
      {
        id: 'COMM005',
        recipient: 'All Faculty',
        subject: 'Academic Calendar Update',
        message: 'The academic calendar has been updated. Please review the new schedule and update your records accordingly.',
        status: 'delivered',
        createdAt: '2024-01-11T16:30:00Z'
      }
    ];

    setCommunications(mockCommunications);
    setLoading(false);
  };

  const handleSendCommunication = async () => {
    try {
      if (!communicationForm.recipient || !communicationForm.subject || !communicationForm.message) {
        toast.error('Please fill in all fields');
        return;
      }

      const newCommunication: Communication = {
        id: `COMM${Date.now()}`,
        recipient: communicationForm.recipient,
        subject: communicationForm.subject,
        message: communicationForm.message,
        status: 'sent',
        createdAt: new Date().toISOString()
      };

      setCommunications(prev => [newCommunication, ...prev]);
      setCommunicationForm({ recipient: '', subject: '', message: '' });
      setShowForm(false);
      toast.success('Communication sent successfully');
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error('Failed to send communication');
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-yellow-600 bg-yellow-100';
      case 'read': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send size={16} />;
      case 'delivered': return <Clock size={16} />;
      case 'read': return <CheckCircle size={16} />;
      default: return <Send size={16} />;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Communication</h1>
        <p className="text-gray-600">Send messages and announcements to students, faculty, and staff</p>
      </div>

      {/* New Communication Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <MessageSquare size={16} />
          {showForm ? 'Cancel' : 'New Communication'}
        </button>
      </div>

      {/* Communication Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send New Communication</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient
              </label>
              <select
                value={communicationForm.recipient}
                onChange={(e) => setCommunicationForm(prev => ({ ...prev, recipient: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Recipient</option>
                <option value="All Students">All Students</option>
                <option value="All Faculty">All Faculty</option>
                <option value="Administrative Staff">Administrative Staff</option>
                <option value="Parents/Guardians">Parents/Guardians</option>
                <option value="Computer Science Department">Computer Science Department</option>
                <option value="Electrical Engineering Department">Electrical Engineering Department</option>
                <option value="Mechanical Engineering Department">Mechanical Engineering Department</option>
                <option value="Civil Engineering Department">Civil Engineering Department</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={communicationForm.subject}
                onChange={(e) => setCommunicationForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={communicationForm.message}
                onChange={(e) => setCommunicationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSendCommunication}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Send size={16} />
                Send Message
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search communications..."
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
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredCommunications.map((comm) => (
          <div key={comm.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">{comm.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(comm.status)}`}>
                    {getStatusIcon(comm.status)}
                    {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <p><span className="font-medium">To:</span> {comm.recipient}</p>
                    <p><span className="font-medium">Sent:</span> {new Date(comm.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{comm.message}</p>
                </div>
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
              Total Communications: <span className="font-semibold">{filteredCommunications.length}</span>
            </p>
            <p className="text-sm text-blue-600">
              Sent: {filteredCommunications.filter(c => c.status === 'sent').length} | 
              Delivered: {filteredCommunications.filter(c => c.status === 'delivered').length} | 
              Read: {filteredCommunications.filter(c => c.status === 'read').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarCommunication; 