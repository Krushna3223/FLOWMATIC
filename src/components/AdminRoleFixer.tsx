import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-hot-toast';

const AdminRoleFixer: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('registrar@gmail.com');
  const [newRole, setNewRole] = useState('registrar');

  const fixUserRole = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only admins can fix user roles');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔧 Admin attempting to fix role for user: ${userEmail} to: ${newRole}`);
      
      // First, let's find the user by email
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        let userUid: string | null = null;
        let userData: any = null;
        
        // Find the user by email
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data.email === userEmail) {
            userUid = childSnapshot.key;
            userData = data;
          }
        });
        
        if (userUid && userData) {
          console.log(`✅ Found user with UID: ${userUid}`);
          console.log(`📋 Current user data:`, userData);
          
          // Update the role
          const updatedUserData = {
            ...userData,
            role: newRole,
            updatedAt: new Date().toISOString()
          };
          
          // Save the updated user data
          await set(ref(database, `users/${userUid}`), updatedUserData);
          
          console.log(`✅ Successfully updated role for ${userEmail} to ${newRole}`);
          toast.success(`Role updated successfully!`);
        } else {
          console.error(`❌ User with email ${userEmail} not found`);
          toast.error(`User with email ${userEmail} not found`);
        }
      } else {
        console.error('❌ No users found in database');
        toast.error('No users found in database');
      }
    } catch (error) {
      console.error('❌ Error fixing user role:', error);
      toast.error('Failed to fix user role. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access this tool.</p>
          <p className="text-gray-600 mt-2">Current user role: {currentUser?.role || 'None'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Role Fixer</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="registrar">Registrar</option>
              <option value="admin">Admin</option>
              <option value="principal">Principal</option>
              <option value="hod">HOD</option>
              <option value="student">Student</option>
              <option value="non_teaching_staff">Non-Teaching Staff</option>
              <option value="workshop_instructor">Workshop Instructor</option>
              <option value="electrician">Electrician</option>
              <option value="computer_technician">Computer Technician</option>
              <option value="asst_librarian">Assistant Librarian</option>
              <option value="asst_store">Assistant Store</option>
              <option value="tech_lab_asst">Tech Lab Assistant</option>
              <option value="lab_asst_civil">Lab Assistant Civil</option>
              <option value="clerk">Clerk</option>
              <option value="security_guard">Security Guard</option>
              <option value="fire_operator">Fire Operator</option>
              <option value="accounts_asst">Accounts Assistant</option>
              <option value="civil_supervisor">Civil Supervisor</option>
              <option value="plumber">Plumber</option>
              <option value="girls_hostel_rector">Girls Hostel Rector</option>
              <option value="peon">Peon</option>
              <option value="etp_operator">ETP Operator</option>
            </select>
          </div>
          
          <button
            onClick={fixUserRole}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Fixing Role...' : 'Fix User Role'}
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h2>
          <p className="text-sm text-yellow-700">
            This tool allows administrators to fix user roles in the database. 
            Enter the user's email and select the correct role, then click "Fix User Role".
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleFixer; 