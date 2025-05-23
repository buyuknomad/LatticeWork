// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Features from './components/Features';
import CallToAction from './components/CallToAction';
import Pricing from './components/Pricing';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupSuccessPage from './pages/SignupSuccessPage';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import History from './pages/History';
import BackgroundAnimation from './components/BackgroundAnimation';

// Create a wrapper component that can use useLocation
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Define routes where footer should be hidden
  const hideFooterRoutes = ['/dashboard', '/settings', '/history', '/login', '/signup', '/signup-success'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-[#1A1A1A] text-white overflow-hidden">
      <BackgroundAnimation />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <Header />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <main>
              <Hero />
              <Features />
              <CallToAction />
              <Pricing />
            </main>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>
        
        {/* Conditionally render Footer */}
        {!shouldHideFooter && <Footer />}
      </div>
    </div>
  );
};

// Main App component with Router
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;