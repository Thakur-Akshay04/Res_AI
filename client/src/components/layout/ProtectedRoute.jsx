import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import useAuthStore from '@/stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neu-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neu-primary/30 border-t-neu-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-neu-bg flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-neu-primary/30 border-t-neu-primary rounded-full animate-spin" />
        <span className="text-xs text-neu-text-muted font-medium tracking-wide animate-pulse">Syncing session...</span>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
