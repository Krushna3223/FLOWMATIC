import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, set, get, remove, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Search,
  Send,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Bell,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Mail,
  FileText
} from 'lucide-react';

interface Communication {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'notice' | 'alert' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  createdByName: string;
}

interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  readAt?: string;
}

const AsstLibrarianCommunications: React.FC = () => {
  const { currentUser } = useAuth();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCommunication, setShowNewCommunication] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('communications');

  const [communicationForm, setCommunicationForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'medium',
    targetAudience: [] as string[],
    scheduledFor: ''
  });

  const [messageForm, setMessageForm] = useState({
    to: '',
    toName: '',
    subject: '',
    message: ''
  });

  const communicationTypes = [
    { value: 'announcement', label: 'Announcement', icon: Bell },
    { value: 'notice', label: 'Notice', icon: FileText },
    { value: 'alert', label: 'Alert', icon: AlertTriangle },
    { value: 'reminder', label: 'Reminder', icon: Calendar }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const targetAudiences = [
    'All Students',
    'All Staff',
    'Faculty Only',
    'Students Only',
    'Library Staff',
    'Department Heads'
  ];

  useEffect(() => {
    fetchCommunications();
    fetchMessages();
  }, []);

  const fetchCommunications = async () => {
    try {
      const db = getDatabase();
      const communicationsRef = ref(db, 'communications');
      const snapshot = await get(communicationsRef);
      
      if (snapshot.exists()) {
        const communicationsData = snapshot.val();
        const communicationsArray = Object.keys(communicationsData).map(key => ({
          id: key,
          ...communicationsData[key]
        }));
        setCommunications(communicationsArray);
      } else {
        setCommunications([]);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('Failed to fetch communications');
    }
  };

  const fetchMessages = async () => {
    try {
      const db = getDatabase();
      const messagesRef = ref(db, 'messages');
      const snapshot = await get(messagesRef);
      
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key]
        }));
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!communicationForm.title || !communicationForm.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const communicationsRef = ref(db, 'communications');
      const newCommunicationRef = push(communicationsRef);
      
      const communicationData = {
        ...communicationForm,
        status: communicationForm.scheduledFor ? 'scheduled' : 'sent',
        createdAt: new Date().toISOString(),
        sentAt: communicationForm.scheduledFor ? undefined : new Date().toISOString(),
        createdBy: currentUser?.uid || '',
        createdByName: currentUser?.name || 'Assistant Librarian'
      };

      await set(newCommunicationRef, communicationData);
      toast.success('Communication sent successfully');
      setShowNewCommunication(false);
      setCommunicationForm({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'medium',
        targetAudience: [],
        scheduledFor: ''
      });
      fetchCommunications();
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error('Failed to send communication');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageForm.to || !messageForm.subject || !messageForm.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const messagesRef = ref(db, 'messages');
      const newMessageRef = push(messagesRef);
      
      const messageData = {
        ...messageForm,
        from: currentUser?.uid || '',
        fromName: currentUser?.name || 'Assistant Librarian',
        status: 'unread',
        createdAt: new Date().toISOString()
      };

      await set(newMessageRef, messageData);
      toast.success('Message sent successfully');
      setShowNewMessage(false);
      setMessageForm({
        to: '',
        toName: '',
        subject: '',
        message: ''
      });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteCommunication = async (communicationId: string) => {
    if (window.confirm('Are you sure you want to delete this communication?')) {
      try {
        const db = getDatabase();
        const communicationRef = ref(db, `communications/${communicationId}`);
        await remove(communicationRef);
        toast.success('Communication deleted successfully');
        fetchCommunications();
      } catch (error) {
        console.error('Error deleting communication:', error);
        toast.error('Failed to delete communication');
      }
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const db = getDatabase();
      const messageRef = ref(db, `messages/${messageId}`);
      await update(messageRef, {
        status: 'read',
        readAt: new Date().toISOString()
      });
      toast.success('Message marked as read');
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const filteredCommunications = communications.filter(communication => {
    const matchesSearch = communication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         communication.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || communication.type === filterType;
    return matchesSearch && matchesType;
  });

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const typeObj = communicationTypes.find(t => t.value === type);
    return typeObj?.icon || MessageSquare;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Communications</h1>
              <p className="text-gray-600">Manage announcements, notices, and messages</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewMessage(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button
                onClick={() => setShowNewCommunication(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Communication
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
            {[
              { id: 'communications', name: 'Communications', icon: MessageSquare },
              { id: 'messages', name: 'Messages', icon: Mail },
              { id: 'drafts', name: 'Drafts', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {communicationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              {filteredCommunications.map((communication) => {
                const TypeIcon = getTypeIcon(communication.type);
                return (
                  <div key={communication.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{communication.title}</h3>
                          <p className="text-gray-600 mb-3">{communication.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By: {communication.createdByName}</span>
                            <span>•</span>
                            <span>{new Date(communication.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Target: {communication.targetAudience.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(communication.priority)}`}>
                          {communication.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          communication.status === 'sent' ? 'bg-green-100 text-green-800' :
                          communication.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {communication.status}
                        </span>
                        <button
                          onClick={() => handleDeleteCommunication(communication.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{message.fromName}</div>
                        <div className="text-sm text-gray-500">{message.from}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{message.toName}</div>
                        <div className="text-sm text-gray-500">{message.to}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{message.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          message.status === 'read' ? 'bg-green-100 text-green-800' :
                          message.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {message.status === 'unread' && (
                          <button
                            onClick={() => handleMarkAsRead(message.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Mark Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Drafts Tab */}
          {activeTab === 'drafts' && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Drafts</h3>
              <p className="text-gray-500">You don't have any saved drafts yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Communication Modal */}
      {showNewCommunication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Communication</h3>
              <button
                onClick={() => setShowNewCommunication(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendCommunication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={communicationForm.title}
                  onChange={(e) => setCommunicationForm({...communicationForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={communicationForm.message}
                  onChange={(e) => setCommunicationForm({...communicationForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={communicationForm.type}
                    onChange={(e) => setCommunicationForm({...communicationForm, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {communicationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={communicationForm.priority}
                    onChange={(e) => setCommunicationForm({...communicationForm, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {targetAudiences.map(audience => (
                    <label key={audience} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={communicationForm.targetAudience.includes(audience)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCommunicationForm({
                              ...communicationForm,
                              targetAudience: [...communicationForm.targetAudience, audience]
                            });
                          } else {
                            setCommunicationForm({
                              ...communicationForm,
                              targetAudience: communicationForm.targetAudience.filter(a => a !== audience)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For (Optional)</label>
                <input
                  type="datetime-local"
                  value={communicationForm.scheduledFor}
                  onChange={(e) => setCommunicationForm({...communicationForm, scheduledFor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Send Communication
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCommunication(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Message</h3>
              <button
                onClick={() => setShowNewMessage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To (Email) *</label>
                <input
                  type="email"
                  value={messageForm.to}
                  onChange={(e) => setMessageForm({...messageForm, to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To (Name)</label>
                <input
                  type="text"
                  value={messageForm.toName}
                  onChange={(e) => setMessageForm({...messageForm, toName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewMessage(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsstLibrarianCommunications; 