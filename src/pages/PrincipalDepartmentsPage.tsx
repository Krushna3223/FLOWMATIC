import React, { useState } from 'react';
import DepartmentSelector from '../components/Principal/DepartmentSelector';
import DepartmentDashboard from '../components/Principal/DepartmentDashboard';

const PrincipalDepartmentsPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
              <p className="text-gray-600">Select and manage individual departments</p>
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
        {selectedDepartment ? (
          <DepartmentDashboard 
            department={selectedDepartment}
            onBackToDepartments={() => setSelectedDepartment(null)}
          />
        ) : (
          <DepartmentSelector
            onDepartmentSelect={setSelectedDepartment}
            onBackToOverview={() => {}}
            selectedDepartment={selectedDepartment}
          />
        )}
      </div>
    </div>
  );
};

export default PrincipalDepartmentsPage; 