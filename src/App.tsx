/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/authContext';
import { ProtectedRoute } from './features/auth/protectedRoute';
import { Login } from './features/auth/pages/Login';
import { OperationsProvider, useOperations } from './context/OperationsContext';
import { LanguageProvider } from './context/LanguageContext';
import { MainLayout } from './layouts/MainLayout';
import { PoliceDashboard } from './features/police/PoliceDashboard';
import { VolunteerDashboard } from './features/volunteer/VolunteerDashboard';
import { PilgrimApp } from './features/pilgrim/PilgrimApp';
import { TempleDashboard } from './features/temple/TempleDashboard';
import { authService } from './features/auth/authService';

// Automatic Root Redirection
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#F27D26]/20 border-t-[#F27D26] rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#1A2B47] tracking-wider uppercase font-mono">
            Loading VARI-Net Security...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={authService.getRolePath(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

// Synchronizes the operations engine's current role with the authenticated user
const RoleSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { setCurrentRole } = useOperations();

  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user?.role, setCurrentRole]);

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <OperationsProvider>
            <RoleSync>
              <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<Login />} />

                {/* Root redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* 1. Police Command Route (Role-Protected: police only) */}
                <Route
                  path="/police"
                  element={
                    <ProtectedRoute allowedRoles={['police']}>
                      <MainLayout>
                        <PoliceDashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 2. Volunteer Field Ops Route (Role-Protected: volunteer only) */}
                <Route
                  path="/volunteer"
                  element={
                    <ProtectedRoute allowedRoles={['volunteer']}>
                      <MainLayout>
                        <VolunteerDashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 3. Pilgrim Companion App Route (Frictionless / Direct Access for all Pilgrims) */}
                <Route
                  path="/pilgrim"
                  element={
                    <MainLayout>
                      <PilgrimApp />
                    </MainLayout>
                  }
                />

                {/* 4. Temple Authority Route (Role-Protected: temple-authority only) */}
                <Route
                  path="/temple-authority"
                  element={
                    <ProtectedRoute allowedRoles={['temple-authority']}>
                      <MainLayout>
                        <TempleDashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Legacy alias /temple redirect */}
                <Route
                  path="/temple"
                  element={<Navigate to="/temple-authority" replace />}
                />

                {/* Catch-all Wildcard Route */}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </RoleSync>
          </OperationsProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
