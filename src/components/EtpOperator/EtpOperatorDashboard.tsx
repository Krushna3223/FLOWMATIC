import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const EtpOperatorDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ETP Operator Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">ETP Management</h2>
        <p className="text-gray-600">
          This dashboard is under development. ETP Operator functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default EtpOperatorDashboard; 