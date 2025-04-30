import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Redux actions
import { loadUser } from './store/slices/authSlice';

// Types
import { AppDispatch, RootState } from './store/store';

// Route protection component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

// Layout component for authenticated pages
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header would go here */}
      {/* Sidebar would go here */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {children}
      </main>
      {/* Footer would go here */}
    </div>
  );
};

// Placeholder components for pages
// These would be replaced with actual components as they're implemented
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;
const SubjectsPage = () => <div>Subjects Page</div>;
const TimerPage = () => <div>Timer Page</div>;
const AnalyticsPage = () => <div>Analytics Page</div>;
const AchievementsPage = () => <div>Achievements Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // When app loads, try to load the user from token
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subjects" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <SubjectsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/timer" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <TimerPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <AnalyticsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/achievements" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <AchievementsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Not found route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;