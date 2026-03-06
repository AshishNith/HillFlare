import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { apiService } from './services/api';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProfileSetupPage from './pages/ProfileSetupPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import DiscoverPage from './pages/DiscoverPage.tsx';
import MatchesPage from './pages/MatchesPage.tsx';
import CrushesPage from './pages/CrushesPage.tsx';
import ChatsPage from './pages/ChatsPage.tsx';
import ChatThreadPage from './pages/ChatThreadPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';

const ProfileCheck: React.FC<{ children: React.ReactNode; checkingProfile: boolean }> = ({ children, checkingProfile }) => {
  const profileComplete = useAuthStore((state) => state.profileComplete);

  if (checkingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hf-bg">
        <p className="text-hf-muted">Loading...</p>
      </div>
    );
  }

  return profileComplete ? <>{children}</> : <Navigate to="/app/setup" />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profileComplete = useAuthStore((state) => state.profileComplete);
  const setProfileComplete = useAuthStore((state) => state.setProfileComplete);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // On app load, check if profile exists and is complete (including photo)
  useEffect(() => {
    if (isAuthenticated && !profileComplete) {
      setCheckingProfile(true);
      apiService.getMe().then((user) => {
        if (user && user.name && user.department && user.year && user.avatarUrl) {
          setProfileComplete(true);
        }
      }).catch(() => {
        // Profile doesn't exist yet
      }).finally(() => {
        setCheckingProfile(false);
      });
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? (profileComplete ? <Navigate to="/app" /> : (checkingProfile ? <div className="flex min-h-screen items-center justify-center bg-hf-bg"><p className="text-hf-muted">Loading...</p></div> : <Navigate to="/app/setup" />)) : <LoginPage />}
      />
      <Route
        path="/app/setup"
        element={
          <ProtectedRoute>
            {profileComplete ? <Navigate to="/app" /> : <ProfileSetupPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <DashboardPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/discover"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <DiscoverPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/matches"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <MatchesPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/crushes"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <CrushesPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/chats"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <ChatsPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/chats/:chatId"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <ChatThreadPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/notifications"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <NotificationsPage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/users/:userId"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <UserProfilePage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <ProtectedRoute>
            <ProfileCheck checkingProfile={checkingProfile}>
              <ProfilePage />
            </ProfileCheck>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
