import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { auth, database } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, Shield, GraduationCap, Users, BookOpen, Key } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'principal' | 'non_teaching_staff' | 'hod'>('admin');
  const [specialCode, setSpecialCode] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStaffRole, setSelectedStaffRole] = useState('');

  const departments = [
    'CSE',
    'AI and DS',
    'Electronics and Communication',
    'ECE',
    'Mechanical',
    'Electronics Engg (VLSI)',
    'Electrical Engg',
    'Civil'
  ];

  const staffRoles = [
    'REGISTRAR',
    'W/S INSTRU',
    'ELECTRICIAN',
    'COMP. TECH',
    'ASST. LIBRARIAN',
    'ASST. STORE',
    'TECH. LAB ASST.',
    'LAB ASST (CIVIL)',
    'CLERK',
    'SECURITY GARD',
    'FIREOPERATOR',
    'ACCOUNTS ASST.',
    'CIVIL SUPERVISOR',
    'PLUMBER',
    'Girls Hostel Rector',
    'PEON',
    'ETP OPERATOR'
  ];
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      specialCode: '',
      department: '',
      staffRole: '',
    },
  });

  const watchedRole = watch('role');

  // Special codes for each role
  const SPECIAL_CODES = {
    admin: 'GODADMIN123',
    principal: 'SPECIALPRINCIPAL123'
  };

  const handleRoleChange = (role: 'admin' | 'principal' | 'non_teaching_staff' | 'hod') => {
    setSelectedRole(role);
    setSpecialCode('');
    setSelectedDepartment('');
    setSelectedStaffRole('');
    setValue('role', role);
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setValue('department', department);
  };

  const handleStaffRoleChange = (staffRole: string) => {
    setSelectedStaffRole(staffRole);
    setValue('staffRole', staffRole);
  };

  const validateSpecialCode = (code: string, role: string) => {
    switch (role) {
      case 'admin':
        return code === 'GODADMIN123';
      case 'principal':
        return code === 'SPECIALPRINCIPAL123';
      case 'non_teaching_staff':
        return code === 'STAFFACCESS456';
      case 'hod':
        return code === 'HODDEPARTMENT789';
      default:
        return false;
    }
  };

  const onSubmit = async (data: any) => {
    // Validate special code
    if (!validateSpecialCode(data.specialCode, data.role)) {
      toast.error('Invalid special code for the selected role');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Starting registration process...');
      console.log('📝 Registration data:', data);
      console.log('🔐 Creating Firebase auth user...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      console.log('✅ Firebase auth user created with UID:', user.uid);

      // For non-teaching staff, use the staffRole as the actual role
      const actualRole = data.role === 'non_teaching_staff' ? data.staffRole?.toLowerCase().replace(/\s+/g, '_') : data.role;
      
      const userData = {
        name: data.name,
        email: data.email,
        role: actualRole,
        department: data.department,
        staffRole: data.staffRole,
        createdAt: new Date().toISOString(),
      };

      console.log('💾 Saving user data to database:', userData);
      console.log('📍 Database path: users/' + user.uid);
      console.log('🔍 Full database path:', `users/${user.uid}`);
      
      await set(ref(database, `users/${user.uid}`), userData);
      console.log('✅ User data saved successfully to database');
      
      // Verify the data was saved by reading it back
      try {
        // const verifySnapshot = await get(ref(database, `users/${user.uid}`));
        // console.log('🔍 Verification - Snapshot exists:', verifySnapshot.exists());
        // console.log('🔍 Verification - User data:', verifySnapshot.val());
      } catch (verifyError) {
        console.error('❌ Error verifying saved data:', verifyError);
      }

      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already exists. Please use a different email or login.');
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Join Our Team
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Create your College Admin Dashboard account
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      watchedRole === 'admin'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Shield className="h-6 w-6" />
                      <span className="font-medium">Admin</span>
                      <span className="text-xs text-gray-500">Manage students & fees</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('principal')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      watchedRole === 'principal'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <GraduationCap className="h-6 w-6" />
                      <span className="font-medium">Principal</span>
                      <span className="text-xs text-gray-500">Approve certificates</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('non_teaching_staff')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      watchedRole === 'non_teaching_staff'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="h-6 w-6" />
                      <span className="font-medium">Non-Teaching Staff</span>
                      <span className="text-xs text-gray-500">Manage facilities</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('hod')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      watchedRole === 'hod'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <BookOpen className="h-6 w-6" />
                      <span className="font-medium">HOD</span>
                      <span className="text-xs text-gray-500">Manage department</span>
                    </div>
                  </button>
                </div>
                <input
                  {...register('role')}
                  type="hidden"
                />
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Department Field (for HOD) */}
              {watchedRole === 'hod' && (
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('department')}
                      id="department"
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.department.message}
                    </p>
                  )}
                </div>
              )}



              {/* Staff Role Field (for non-teaching staff) */}
              {watchedRole === 'non_teaching_staff' && (
                <div>
                  <label htmlFor="staffRole" className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('staffRole')}
                      id="staffRole"
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      onChange={(e) => handleStaffRoleChange(e.target.value)}
                    >
                      <option value="">Select a staff role</option>
                      {staffRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.staffRole && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.staffRole.message}
                    </p>
                  )}
                </div>
              )}

              {/* Special Code Field */}
              {watchedRole && (
                <div>
                  <label htmlFor="specialCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('specialCode')}
                      type="password"
                      id="specialCode"
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder={`Enter special code for ${watchedRole}`}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the special authorization code for {watchedRole} role
                  </p>
                  {errors.specialCode && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.specialCode.message}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Create Account
                    </div>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Users className="h-5 w-5 mr-2" />
                Sign In Instead
              </Link>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2024 College Admin Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Join Our
              <span className="block text-green-200">Admin Team</span>
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Become part of our college administration system. 
              Help manage students, certificates, and institutional processes.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-100">Secure Access Control</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-100">Document Management</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-100">Student Records</span>
              </div>
            </div>

            {/* Special Code Info */}
            <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-xl border border-white border-opacity-20">
              <h3 className="text-lg font-semibold mb-2">Special Authorization Required</h3>
              <p className="text-green-100 text-sm">
                Each role requires a specific authorization code to ensure secure access to the system.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default RegisterPage; 