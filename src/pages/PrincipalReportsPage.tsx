import React from 'react';
import PrincipalReports from '../components/Principal/PrincipalReports';

const PrincipalReportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Generate comprehensive reports across all departments</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Principal Dashboard</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PrincipalReports />
      </div>
    </div>
  );
};

export default PrincipalReportsPage; 