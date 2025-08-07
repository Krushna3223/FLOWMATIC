import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
  onMenuToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getDashboardTitle = () => {
    switch (currentUser?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'principal':
        return 'Principal Dashboard';
      case 'non_teaching_staff':
        return 'Staff Dashboard';
      case 'hod':
        return 'HOD Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title - hidden on mobile */}
      <h1 className="text-lg font-semibold text-gray-800 hidden lg:block">
        {getDashboardTitle()}
      </h1>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 rounded-md hover:bg-gray-100 relative" onClick={() => setShowNotifications(true)}>
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Notifications Popup */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNotifications(false)}
              >
                ×
              </button>
              <h2 className="text-lg font-semibold mb-2">Notifications</h2>
              <div className="text-gray-700 text-sm">
                <p>No new notifications.</p>
              </div>
            </div>
          </div>
        )}

        {/* User profile */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar; 