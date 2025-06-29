// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupSuccessPage from './pages/SignupSuccessPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import History from './pages/History';
import BackgroundAnimation from './components/BackgroundAnimation';
import FAQ from './pages/FAQ';
import CheckoutSuccess from './pages/CheckoutSuccess';
import ConfirmEmail from './pages/ConfirmEmail';
import ScrollToTop from './components/ScrollToTop';
import MentalModels from './pages/MentalModels';
import CognitiveBiases from './pages/CognitiveBiases';

// Import new pages
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refunds from './pages/Refunds';
import Contact from './pages/Contact';
import About from './pages/About';
import HomePage from './pages/HomePage';

// Import Examples pages
import Examples from './pages/Examples';
import ExampleDetail from './pages/ExampleDetail';

// Import Archive pages
import ArchivePage from './pages/ArchivePage';
import ArchiveQuestionPage from './pages/ArchiveQuestionPage';

// Create a wrapper component that can use useLocation
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Define routes where footer should be hidden
  const hideFooterRoutes = [
    '/dashboard', 
    '/dashboard/results',
    '/settings', 
    '/history', 
    '/archive',
    '/login', 
    '/signup', 
    '/signup-success',
    '/forgot-password',
    '/reset-password'
  ];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname) || 
                          location.pathname.startsWith('/archive/');

  return (
    <div className="relative min-h-screen bg-[#1A1A1A] text-white overflow-hidden">
      <BackgroundAnimation />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <Header />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/mental-models" element={<MentalModels />} />
          <Route path="/cognitive-biases" element={<CognitiveBiases />} />
          
          {/* Examples routes */}
          <Route path="/examples" element={<Examples />} />
          <Route path="/examples/:slug" element={<ExampleDetail />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/auth/confirm" element={<ConfirmEmail />} />
          
          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Legal/Policy pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/FAQ" element={<FAQ />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/results" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
            
            {/* Archive routes - Premium feature */}
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/archive/:id" element={<ArchiveQuestionPage />} />
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
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <AppContent />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;