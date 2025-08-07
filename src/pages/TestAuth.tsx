import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { testDatabaseConnection, testUserData } from '../utils/databaseTest';

const TestAuth: React.FC = () => {
  const { currentUser, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleTestLogin = async () => {
    try {
      addTestResult('Attempting login...');
      await login(testEmail, testPassword);
      addTestResult('✅ Login successful');
    } catch (error: any) {
      addTestResult(`❌ Login failed: ${error.message}`);
    }
  };

  const handleTestLogout = async () => {
    try {
      addTestResult('Attempting logout...');
      await logout();
      addTestResult('✅ Logout successful');
    } catch (error: any) {
      addTestResult(`❌ Logout failed: ${error.message}`);
    }
  };

  const handleTestDatabase = async () => {
    try {
      addTestResult('Testing database connection...');
      const result = await testDatabaseConnection();
      if (result) {
        addTestResult('✅ Database connection successful');
      } else {
        addTestResult('❌ Database connection failed');
      }
    } catch (error: any) {
      addTestResult(`❌ Database test error: ${error.message}`);
    }
  };

  const handleTestUserData = async () => {
    if (!currentUser) {
      addTestResult('❌ No current user to test');
      return;
    }
    try {
      addTestResult(`Testing user data for: ${currentUser.uid}`);
      const userData = await testUserData(currentUser.uid);
      if (userData) {
        addTestResult(`✅ User data found: ${JSON.stringify(userData)}`);
      } else {
        addTestResult('❌ No user data found');
      }
    } catch (error: any) {
      addTestResult(`❌ User data test error: ${error.message}`);
    }
  };

  const handleManualRedirect = (path: string) => {
    addTestResult(`Manual redirect to: ${path}`);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Current User:</strong> {currentUser ? 'Yes' : 'No'}</p>
            {currentUser && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p><strong>Name:</strong> {currentUser.name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Role:</strong> {currentUser.role}</p>
                <p><strong>UID:</strong> {currentUser.uid}</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          {/* Login Test */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Test Login</h3>
            <div className="flex space-x-2 mb-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Password"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleTestLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Test Login
              </button>
            </div>
          </div>

          {/* Other Tests */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTestLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Test Logout
            </button>
            <button
              onClick={handleTestDatabase}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Test Database
            </button>
            <button
              onClick={handleTestUserData}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Test User Data
            </button>
          </div>
        </div>

        {/* Manual Redirects */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Manual Redirects</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleManualRedirect('/login')}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Go to Login
            </button>
            <button
              onClick={() => handleManualRedirect('/admin')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Go to Admin
            </button>
            <button
              onClick={() => handleManualRedirect('/principal')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Go to Principal
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Run some tests above.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setTestResults([])}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAuth; 