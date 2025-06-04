// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Differentiators from './components/Differentiators';
import Features from './components/Features';
import CallToAction from './components/CallToAction';
import Pricing from './components/Pricing';
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
import SeeItWork from './components/SeeItWork';

// Import new pages
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refunds from './pages/Refunds';
import Contact from './pages/Contact';
import About from './pages/About';

// Create a wrapper component that can use useLocation
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Define routes where footer should be hidden
  const hideFooterRoutes = [
    '/dashboard', 
    '/settings', 
    '/history', 
    '/login', 
    '/signup', 
    '/signup-success',
    '/forgot-password',
    '/reset-password'
  ];
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
              <SeeItWork /> 
              <Differentiators />
              <Features />
              <CallToAction />
              <Pricing />
            </main>
          } />
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
            <Route path="/dashboard/results" element={<Dashboard />} />
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
        <ScrollToTop /> {/* Add the ScrollToTop component here */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;