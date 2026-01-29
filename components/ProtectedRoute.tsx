import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'parent' | 'tutor';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/',
}) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { user, role } = await getCurrentUser();
      
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (requiredRole && role !== requiredRole) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
