// src/App.tsx
import React, { useEffect } from 'react';
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
import MentalModels from './pages/MentalModels/index';
import MentalModelDetail from './pages/MentalModels/MentalModelDetail';
import MentalModelsGuidePage from './pages/MentalModelsGuidePage';
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

// Import Analytics
import { analytics } from './services/analytics';

function AppContent() {
  const location = useLocation();
  
  // Initialize Google Analytics once when app loads
  useEffect(() => {
    analytics.initialize();
  }, []);
  
  // Hide header and footer on specific pages
  const hideHeaderFooter = ['/login', '/signup', '/signup-success', '/forgot-password', '/reset-password', '/confirm-email'].includes(location.pathname);

  return (
    <>
      {/* Background Animation is now outside the flex container for global coverage */}
      <BackgroundAnimation />
      
      {/* Main app container with proper flex layout */}
      <div className="min-h-screen bg-transparent text-white flex flex-col relative z-10">
        {/* Header - conditional rendering */}
        {!hideHeaderFooter && <Header />}
        
        {/* Main content area - flex-grow ensures it expands to push footer down */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup-success" element={<SignupSuccessPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            
            {/* Mental Models Routes */}
            <Route path="/mental-models-guide" element={<MentalModelsGuidePage />} />
            <Route path="/mental-models" element={<MentalModels />} />
            <Route path="/mental-models/:slug" element={<MentalModelDetail />} />
            
            {/* Other Public Routes */}
            <Route path="/cognitive-biases" element={<CognitiveBiases />} />
            <Route path="/examples" element={<Examples />} />
            <Route path="/examples/:slug" element={<ExampleDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/results" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/checkout-success" element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            } />
            
            {/* Archive routes - Premium feature */}
            <Route path="/archive" element={
              <ProtectedRoute>
                <ArchivePage />
              </ProtectedRoute>
            } />
            <Route path="/archive/:id" element={
              <ProtectedRoute>
                <ArchiveQuestionPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        {/* Footer - conditional rendering */}
        {!hideHeaderFooter && <Footer />}
      </div>
    </>
  );
}

function App() {
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
}

export default App;