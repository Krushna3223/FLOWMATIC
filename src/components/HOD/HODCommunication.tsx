import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get, set, push, onValue } from 'firebase/database';
import { 
  MessageSquare,
  Send,
  Bell,
  Users,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'faculty' | 'both';
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  readBy: string[];
}

interface Message {
  id: string;
  from: string;
  fromId: string;
  to: string;
  toId: string;
  subject: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  priority: 'normal' | 'important' | 'urgent';
}

interface CommunicationStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  totalMessages: number;
  unreadMessages: number;
  urgentAnnouncements: number;
  recentCommunications: number;
}

const HODCommunication: React.FC = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    totalMessages: 0,
    unreadMessages: 0,
    urgentAnnouncements: 0,
    recentCommunications: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState('announcements');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');

  useEffect(() => {
    fetchCommunicationData();
  }, []);

  const fetchCommunicationData = async () => {
    try {
      setLoading(true);
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return;
      }

      await Promise.all([
        fetchAnnouncements(),
        fetchMessages()
      ]);
      
      calculateStats();
    } catch (error) {
      console.error('Error fetching communication data:', error);
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const announcementsRef = ref(database, 'announcements');
      const unsubscribe = onValue(announcementsRef, (snapshot) => {
        if (snapshot.exists()) {
          const announcementsData: Announcement[] = [];
          snapshot.forEach((announcementSnapshot) => {
            const announcementData = announcementSnapshot.val();
            if (announcementData.department === currentUser?.department) {
              announcementsData.push({
                id: announcementSnapshot.key!,
                ...announcementData
              });
            }
          });
          setAnnouncements(announcementsData);
        } else {
          setAnnouncements([]);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const messagesRef = ref(database, 'messages');
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData: Message[] = [];
          snapshot.forEach((messageSnapshot) => {
            const messageData = messageSnapshot.val();
            if (messageData.fromId === currentUser?.uid || messageData.toId === currentUser?.uid) {
              messagesData.push({
                id: messageSnapshot.key!,
                ...messageData
              });
            }
          });
          setMessages(messagesData);
        } else {
          setMessages([]);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const calculateStats = () => {
    const totalAnnouncements = announcements.length;
    const activeAnnouncements = announcements.filter(a => a.isActive).length;
    const urgentAnnouncements = announcements.filter(a => a.priority === 'urgent' && a.isActive).length;
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => !m.isRead && m.toId === currentUser?.uid).length;
    const recentCommunications = announcements.filter(a => {
      const createdAt = new Date(a.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length;

    setStats({
      totalAnnouncements,
      activeAnnouncements,
      totalMessages,
      unreadMessages,
      urgentAnnouncements,
      recentCommunications
    });
  };

  const handleCreateAnnouncement = async (formData: any) => {
    try {
      const announcementsRef = ref(database, 'announcements');
      const newAnnouncementRef = push(announcementsRef);
      
      const announcementData = {
        title: formData.title,
        content: formData.content,
        author: currentUser?.name || 'HOD',
        authorId: currentUser?.uid,
        department: currentUser?.department,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        createdAt: new Date().toISOString(),
        expiresAt: formData.expiresAt || null,
        isActive: true,
        readBy: []
      };

      await set(newAnnouncementRef, announcementData);
      
      toast.success('Announcement created successfully');
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleSendMessage = async (formData: any) => {
    try {
      const messagesRef = ref(database, 'messages');
      const newMessageRef = push(messagesRef);
      
      const messageData = {
        from: currentUser?.name || 'HOD',
        fromId: currentUser?.uid,
        to: formData.recipient,
        toId: formData.recipientId,
        subject: formData.subject,
        content: formData.content,
        createdAt: new Date().toISOString(),
        isRead: false,
        priority: formData.priority
      };

      await set(newMessageRef, messageData);
      
      toast.success('Message sent successfully');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleToggleAnnouncement = async (announcementId: string, isActive: boolean) => {
    try {
      const announcementRef = ref(database, `announcements/${announcementId}`);
      await set(announcementRef, { isActive });
      
      toast.success(`Announcement ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const announcementRef = ref(database, `announcements/${announcementId}`);
      await set(announcementRef, null);
      
      toast.success('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    const matchesAudience = filterAudience === 'all' || announcement.targetAudience === filterAudience;
    
    return matchesSearch && matchesPriority && matchesAudience;
  });

  const filteredMessages = messages.filter(message => {
    return message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           message.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Communication Hub
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage department communications and announcements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                New Announcement
              </button>
              <button
                onClick={() => setShowMessageModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="h-4 w-4 inline mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAnnouncements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgentAnnouncements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('announcements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'announcements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Messages
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {activeTab === 'announcements' && (
                <>
                  <div>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={filterAudience}
                      onChange={(e) => setFilterAudience(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Audiences</option>
                      <option value="students">Students</option>
                      <option value="faculty">Faculty</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                            {getPriorityIcon(announcement.priority)}
                            <span className="ml-1">{announcement.priority}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            {announcement.targetAudience}
                          </span>
                          {!announcement.isActive && (
                            <span className="text-xs text-gray-500">(Inactive)</span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{announcement.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>By {announcement.author}</span>
                          <span>{formatTimeAgo(announcement.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedAnnouncement(announcement)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAnnouncement(announcement.id, !announcement.isActive)}
                          className={`${announcement.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {announcement.isActive ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAnnouncements.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No announcements match your current filters.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {getPriorityIcon(message.priority)}
                            <span className="ml-1">{message.priority}</span>
                          </span>
                          {!message.isRead && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Unread
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {message.subject}
                        </h3>
                        <p className="text-gray-600 mb-3">{message.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {message.fromId === currentUser?.uid ? `To: ${message.to}` : `From: ${message.from}`}
                          </span>
                          <span>{formatTimeAgo(message.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No messages match your current filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Announcement</h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateAnnouncement({
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                priority: formData.get('priority') as string,
                targetAudience: formData.get('targetAudience') as string,
                expiresAt: formData.get('expiresAt') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    rows={4}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter announcement content"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      name="targetAudience"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="faculty">Faculty</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Send Message</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSendMessage({
                recipient: formData.get('recipient') as string,
                recipientId: formData.get('recipientId') as string,
                subject: formData.get('subject') as string,
                content: formData.get('content') as string,
                priority: formData.get('priority') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                  <input
                    type="text"
                    name="recipient"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter recipient name"
                  />
                  <input
                    type="hidden"
                    name="recipientId"
                    value="recipient-id-placeholder"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="content"
                    rows={4}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter message content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Announcement Details</h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              <p><strong>Title:</strong> {selectedAnnouncement.title}</p>
              <p><strong>Content:</strong> {selectedAnnouncement.content}</p>
              <p><strong>Author:</strong> {selectedAnnouncement.author}</p>
              <p><strong>Priority:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(selectedAnnouncement.priority)}`}>
                  {selectedAnnouncement.priority}
                </span>
              </p>
              <p><strong>Target Audience:</strong> {selectedAnnouncement.targetAudience}</p>
              <p><strong>Created:</strong> {new Date(selectedAnnouncement.createdAt).toLocaleString()}</p>
              {selectedAnnouncement.expiresAt && (
                <p><strong>Expires:</strong> {new Date(selectedAnnouncement.expiresAt).toLocaleString()}</p>
              )}
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedAnnouncement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedAnnouncement.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              <p><strong>Subject:</strong> {selectedMessage.subject}</p>
              <p><strong>Content:</strong> {selectedMessage.content}</p>
              <p><strong>From:</strong> {selectedMessage.from}</p>
              <p><strong>To:</strong> {selectedMessage.to}</p>
              <p><strong>Priority:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(selectedMessage.priority)}`}>
                  {selectedMessage.priority}
                </span>
              </p>
              <p><strong>Sent:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedMessage.isRead ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {selectedMessage.isRead ? 'Read' : 'Unread'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODCommunication; 