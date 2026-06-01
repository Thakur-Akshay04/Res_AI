import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Builder from '@/pages/Builder';
import PublicResume from '@/pages/PublicResume';
import Profile from '@/pages/Profile';
import AccountDeleted from '@/pages/AccountDeleted';

import useThemeStore from '@/stores/themeStore';
import useAuthStore from '@/stores/authStore';

import Analyze from '@/pages/Analyze';
import AnalysisReportPage from '@/pages/AnalysisReportPage';

function App() {
  const { theme } = useThemeStore();
  const { login, logout } = useAuthStore();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      logout();
      return;
    }

    const syncWithBackend = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/auth/clerk-sync`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            login(data.user, token);
          }
        } else {
          console.error('Clerk sync failed:', await res.text());
        }
      } catch (err) {
        console.error('Clerk sync error:', err);
      }
    };

    syncWithBackend();
  }, [isLoaded, isSignedIn, clerkUser]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <Analyze />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <AnalysisReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/r/:slug" element={<PublicResume />} />
        <Route path="/account-deleted" element={<AccountDeleted />} />
      </Routes>
    </>
  );
}

export default App;
