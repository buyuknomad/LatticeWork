import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import BackgroundAnimation from './components/BackgroundAnimation';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="relative min-h-screen bg-[#1A1A1A] text-white overflow-hidden">
          <BackgroundAnimation />
          <div className="relative z-10">
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
                {/* Add other protected routes here */}
              </Route>
            </Routes>
            <Footer />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;