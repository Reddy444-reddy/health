import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import { SearchHistoryProvider } from './contexts/SearchHistoryContext';
import Auth from './pages/Auth';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Diet from './pages/Diet';
import Prevention from './pages/Prevention';
import Nearby from './pages/Nearby';
import Analysis from './pages/Analysis';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <SearchHistoryProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Home />} />
                <Route path="chat" element={<Chat />} />
                <Route path="diet" element={<Diet />} />
                <Route path="prevention" element={<Prevention />} />
                <Route path="nearby" element={<Nearby />} />
                <Route path="analysis" element={<Analysis />} />
              </Route>
            </Routes>
          </Router>
        </SearchHistoryProvider>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;
