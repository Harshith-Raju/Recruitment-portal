import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from './Skeleton';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center p-12 bg-brand-brown-dark">
        <div className="max-w-md w-full flex flex-col gap-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
