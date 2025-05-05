
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You could render a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-betting-dark to-black">
        <div className="animate-pulse text-betting-secondaryPurple text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page if not logged in
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to home if admin access is required but user is not an admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated (and is admin if required)
  return <>{children}</>;
};

export default RequireAuth;
