import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  AlertTriangle, 
  Bell, 
  Info, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock API
const fetchMessages = async () => [
  {
    id: 1,
    type: 'alert',
    title: 'Emergency Plumbing Issue',
    message: 'Critical water leak detected in Block C basement. Immediate attention required.',
    timestamp: '2024-06-01 10:30 AM',
    priority: 'high',
    read: false
  },
  {
    id: 2,
    type: 'notice',
    title: 'Maintenance Schedule Update',
    message: 'Weekly water tank inspection scheduled for tomorrow at 9:00 AM.',
    timestamp: '2024-06-01 09:15 AM',
    priority: 'medium',
    read: true
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Stock Request Pending',
    message: 'PVC pipes request awaiting approval from store. Please follow up.',
    timestamp: '2024-06-01 08:45 AM',
    priority: 'medium',
    read: false
  },
  {
    id: 4,
    type: 'info',
    title: 'System Maintenance',
    message: 'Water supply system maintenance scheduled for Sunday from 2:00 PM to 6:00 PM.',
    timestamp: '2024-05-31 05:00 PM',
    priority: 'low',
    read: true
  },
  {
    id: 5,
    type: 'alert',
    title: 'Drainage Blockage',
    message: 'Severe drainage blockage reported in Hostel Block B. Requires immediate action.',
    timestamp: '2024-05-31 03:20 PM',
    priority: 'high',
    read: false
  }
];

const PlumberCommunication: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages().then(setMessages);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'notice':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'notice':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'reminder':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'info':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'all' || message.type === filter || message.priority === filter;
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAsRead = (id: number) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const markAllAsRead = () => {
    setMessages(messages.map(msg => ({ ...msg, read: true })));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication & Alerts</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with important messages, alerts, and notifications
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mark All as Read
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Messages</option>
            <option value="alert">Alerts</option>
            <option value="notice">Notices</option>
            <option value="reminder">Reminders</option>
            <option value="info">Info</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Messages ({filteredMessages.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`p-6 hover:bg-gray-50 transition-colors ${!message.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(message.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-medium ${!message.read ? 'text-blue-900' : 'text-gray-900'}`}>
                        {message.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(message.type)}`}>
                          {message.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        {!message.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{message.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {message.timestamp}
                      </span>
                      {!message.read && (
                        <button
                          onClick={() => markAsRead(message.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-lg font-semibold text-gray-900">
                {messages.filter(m => m.type === 'alert').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Notices</p>
              <p className="text-lg font-semibold text-gray-900">
                {messages.filter(m => m.type === 'notice').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-lg font-semibold text-gray-900">
                {messages.filter(m => !m.read).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlumberCommunication; 