import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/login';
    if (currentUser.role === 'admin') {
      redirectPath = '/admin';
    } else if (currentUser.role === 'principal') {
      redirectPath = '/principal';
    } else if (currentUser.role === 'student') {
      redirectPath = '/student';
    } else if (currentUser.role === 'teacher') {
      redirectPath = '/teacher';
    } else if (currentUser.role === 'registrar') {
      redirectPath = '/registrar';
    } else if (currentUser.role === 'workshop_instructor') {
      redirectPath = '/workshop-instructor';
    } else if (currentUser.role === 'electrician') {
      redirectPath = '/electrician';
    } else if (currentUser.role === 'computer_technician') {
      redirectPath = '/computer-technician';
    } else if (currentUser.role === 'asst_librarian') {
      redirectPath = '/asst-librarian';
    } else if (currentUser.role === 'asst_store') {
      redirectPath = '/asst-store';
    } else if (currentUser.role === 'tech_lab_asst') {
      redirectPath = '/tech-lab-asst';
    } else if (currentUser.role === 'lab_asst_civil') {
      redirectPath = '/lab-asst-civil';
    } else if (currentUser.role === 'clerk') {
      redirectPath = '/clerk';
    } else if (currentUser.role === 'security_guard') {
      redirectPath = '/security-guard';
    } else if (currentUser.role === 'fire_operator') {
      redirectPath = '/fire-operator';
    } else if (currentUser.role === 'accounts_asst') {
      redirectPath = '/accounts-asst';
    } else if (currentUser.role === 'civil_supervisor') {
      redirectPath = '/civil-supervisor';
    } else if (currentUser.role === 'plumber') {
      redirectPath = '/plumber';
    } else if (currentUser.role === 'girls_hostel_rector') {
      redirectPath = '/girls-hostel-rector';
    } else if (currentUser.role === 'peon') {
      redirectPath = '/peon';
    } else if (currentUser.role === 'etp_operator') {
      redirectPath = '/etp-operator';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 