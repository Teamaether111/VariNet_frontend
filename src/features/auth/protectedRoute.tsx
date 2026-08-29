import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { UserRole } from './types';
import { authService } from './authService';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If initial session check is loading, show a clean minimal skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F27D26]/20 border-t-[#F27D26] rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#1A2B47] tracking-wider uppercase font-mono">
            Verifying Session Security...
          </span>
        </div>
      </div>
    );
  }

  // 1. Frictionless Access for Pilgrims: Bypass all authentication for pilgrim routes
  if (allowedRoles && allowedRoles.includes('pilgrim')) {
    return <>{children}</>;
  }

  // 2. Secure login gateways for operational roles (Police, Volunteer, Temple/Admin):
  // If not authenticated, redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If user tries to access a dashboard not matching their role, redirect to their assigned dashboard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const userRoleDashboard = authService.getRolePath(user.role);
    return <Navigate to={userRoleDashboard} replace />;
  }

  return <>{children}</>;
};
