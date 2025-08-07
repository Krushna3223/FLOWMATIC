import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'medium' | 'high';
}

const WorkshopInstructorCommunication: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // Mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          sender: 'Workshop Instructor',
          recipient: 'Store Keeper',
          subject: 'Tool Request Status',
          content: 'Please provide an update on the safety helmets request submitted last week.',
          timestamp: '2024-01-20T10:30:00',
          status: 'read',
          priority: 'high'
        },
        {
          id: '2',
          sender: 'Safety Officer',
          recipient: 'Workshop Instructor',
          subject: 'Safety Protocol Update',
          content: 'New safety protocols have been implemented. Please review and acknowledge.',
          timestamp: '2024-01-19T14:15:00',
          status: 'delivered',
          priority: 'high'
        },
        {
          id: '3',
          sender: 'Workshop Instructor',
          recipient: 'Principal',
          subject: 'Equipment Maintenance Report',
          content: 'Monthly equipment maintenance report is ready for review.',
          timestamp: '2024-01-18T09:45:00',
          status: 'sent',
          priority: 'medium'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      const newMessageItem: Message = {
        id: Date.now().toString(),
        sender: currentUser?.name || 'Workshop Instructor',
        recipient: newMessage.recipient,
        subject: newMessage.subject,
        content: newMessage.content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        priority: newMessage.priority
      };
      
      setMessages(prev => [newMessageItem, ...prev]);
      setNewMessage({
        recipient: '',
        subject: '',
        content: '',
        priority: 'medium'
      });
      setShowCompose(false);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-gray-400" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'read': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Communication Center</h1>
        <p className="text-gray-600">Manage communications with staff and administrators</p>
      </div>

      {/* Compose Message Button */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button
            onClick={() => setShowCompose(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose Message
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                    {message.priority}
                  </span>
                  {getStatusIcon(message.status)}
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>From: {message.sender}</span>
                    <span>To: {message.recipient}</span>
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-gray-700">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Compose Message</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="text"
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Recipient name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Message subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage({...newMessage, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                  <button type="button" onClick={() => setShowCompose(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopInstructorCommunication; 