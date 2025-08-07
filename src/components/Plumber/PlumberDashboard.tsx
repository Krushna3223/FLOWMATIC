import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Settings,
  Bell
} from 'lucide-react';
import PlumberMaintenanceRequests from './PlumberMaintenanceRequests';

const PlumberDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('maintenance-requests');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plumber Dashboard</h1>
              <p className="text-gray-600">Manage plumbing maintenance requests and work orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{currentUser?.name || 'Plumber'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {currentUser?.name?.charAt(0) || 'P'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'maintenance-requests', name: 'Maintenance Requests', icon: '🚰' },
              { id: 'work-orders', name: 'Work Orders', icon: '📋' },
              { id: 'schedule', name: 'Schedule', icon: '📅' },
              { id: 'tools', name: 'Tools & Equipment', icon: '🔧' },
              { id: 'reports', name: 'Reports', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'maintenance-requests' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Plumbing Maintenance Requests</h2>
              <p className="text-gray-600">Review and manage plumbing maintenance requests from students</p>
            </div>
            <PlumberMaintenanceRequests />
          </div>
        )}

        {activeTab === 'work-orders' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Work Orders</h2>
              <p className="text-gray-600">Manage assigned work orders and tasks</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Work Orders</h3>
                <p className="text-gray-500">Work order management coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Schedule</h2>
              <p className="text-gray-600">View and manage your work schedule</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Schedule</h3>
                <p className="text-gray-500">Schedule management coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tools & Equipment</h2>
              <p className="text-gray-600">Manage tools and equipment inventory</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tools & Equipment</h3>
                <p className="text-gray-500">Tool management coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reports</h2>
              <p className="text-gray-600">View work reports and analytics</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Reports</h3>
                <p className="text-gray-500">Reports and analytics coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlumberDashboard; 