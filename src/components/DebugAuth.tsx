import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { fixRegistrarRole } from '../utils/fixUserRole';

const DebugAuth: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Debug Authentication</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Authentication State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Current User:</strong> {currentUser ? 'Yes' : 'No'}</p>
              {currentUser && (
                <>
                  <p><strong>UID:</strong> {currentUser.uid}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Name:</strong> {currentUser.name}</p>
                  <p><strong>Role:</strong> {currentUser.role}</p>
                  <p><strong>Department:</strong> {currentUser.department || 'N/A'}</p>
                  <p><strong>Phone:</strong> {currentUser.phone || 'N/A'}</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Routing State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Current Path:</strong> {location.pathname}</p>
              <p><strong>Pathname:</strong> {location.pathname}</p>
              <p><strong>Search:</strong> {location.search}</p>
              <p><strong>Hash:</strong> {location.hash}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">Expected Behavior</h2>
            <div className="space-y-2 text-sm">
              {currentUser?.role === 'registrar' && (
                <>
                  <p className="text-green-600">✓ Should redirect to: /registrar</p>
                  <p className="text-green-600">✓ Should show RegistrarDashboard</p>
                  <p className="text-green-600">✓ Should have registrar-specific menu items</p>
                </>
              )}
              {currentUser?.role === 'non_teaching_staff' && (
                <>
                  <p className="text-green-600">✓ Should redirect to: /staff</p>
                  <p className="text-green-600">✓ Should show StaffDashboard</p>
                  <p className="text-green-600">✓ Should have staff-specific menu items</p>
                </>
              )}
              {!currentUser?.role && (
                <p className="text-red-600">❌ No role assigned - this is the problem!</p>
              )}
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Console Logs</h2>
            <div className="space-y-2 text-sm">
              <p>Check browser console for detailed logs:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>RoleRedirect component logs</li>
                <li>ProtectedRoute component logs</li>
                <li>RegistrarDashboard/StaffDashboard logs</li>
                <li>AuthContext logs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/registrar'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to /registrar
            </button>
            <button
              onClick={() => window.location.href = '/staff'}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Go to /staff
            </button>
            {currentUser?.email === 'registrar@gmail.com' && currentUser?.role === 'non_teaching_staff' && (
              <button
                onClick={async () => {
                  const success = await fixRegistrarRole();
                  if (success) {
                    alert('Role fixed! Please refresh the page.');
                    window.location.reload();
                  } else {
                    alert('Failed to fix role. Check console for details.');
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Fix Registrar Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth; 