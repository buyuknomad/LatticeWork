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
import AdminRoute from './components/AdminRoute'; // NEW: Admin protection component
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
import CognitiveBiasDetail from './pages/CognitiveBiases/CognitiveBiasDetail';

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

// Import Admin pages - NEW
import AdminAnalytics from './pages/AdminAnalytics';
// Uncomment if you create the test component
// import SearchTrackingTest from './components/Analytics/SearchTrackingTest';

// ===== PHASE 5: Import Personalization Components =====
import PersonalizedDashboard from './components/Personalization/PersonalizedDashboard';
// Optional: Import other personalization components if you want dedicated routes
// import RecommendationWidget from './components/Personalization/RecommendationWidget';
// import LearningPath from './components/Personalization/LearningPath';

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
            
            {/* Cognitive Biases Routes */}
            <Route path="/cognitive-biases" element={<CognitiveBiases />} />
            <Route path="/cognitive-biases" element={<CognitiveBiases />} />
            <Route path="/cognitive-biases/:slug" element={<CognitiveBiasDetail />} />

            {/* Other Public Routes */}
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
            
            {/* ===== PHASE 5: PERSONALIZATION ROUTES ===== */}
            {/* Main Personalized Dashboard */}
            <Route 
              path="/personalized" 
              element={
                <ProtectedRoute>
                  <PersonalizedDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Alternative URL for better UX */}
            <Route 
              path="/my-learning" 
              element={
                <ProtectedRoute>
                  <PersonalizedDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Optional: Dedicated Learning Path Route */}
            {/* Uncomment if you want a standalone learning path page */}
            {/* <Route 
              path="/learning-path" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-[#1A1A1A] pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <LearningPath variant="tree" showProgress={true} />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Optional: Recommendations Page */}
            {/* Uncomment if you want a standalone recommendations page */}
            {/* <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-[#1A1A1A] pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <h1 className="text-3xl font-bold mb-6 text-white">Personalized Recommendations</h1>
                      <RecommendationWidget 
                        title="Recommended for You"
                        variant="card"
                        limit={12}
                        showRefresh={true}
                      />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            /> */}
            
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
            
            {/* ===== ADMIN ROUTES - NEW ===== */}
            {/* Admin Analytics Dashboard */}
            <Route 
              path="/admin/analytics" 
              element={
                <AdminRoute
                  allowedEmails={['infiernodel@gmail.com']} // Add more admin emails here
                  allowedRoles={['admin', 'super_admin']} // Optional: role-based access
                  redirectTo="/dashboard"
                >
                  <AdminAnalytics />
                </AdminRoute>
              } 
            />
            
            {/* Admin nested routes for future expansion */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute
                  allowedEmails={['infiernodel@gmail.com']}
                  redirectTo="/dashboard"
                >
                  <Routes>
                    {/* Add more admin pages here as you build them */}
                    <Route path="users" element={
                      <div className="min-h-screen bg-[#1A1A1A] pt-20 px-4">
                        <div className="max-w-7xl mx-auto">
                          <h1 className="text-2xl font-bold text-white">User Management (Coming Soon)</h1>
                        </div>
                      </div>
                    } />
                    <Route path="content" element={
                      <div className="min-h-screen bg-[#1A1A1A] pt-20 px-4">
                        <div className="max-w-7xl mx-auto">
                          <h1 className="text-2xl font-bold text-white">Content Management (Coming Soon)</h1>
                        </div>
                      </div>
                    } />
                    <Route path="*" element={
                      <div className="min-h-screen bg-[#1A1A1A] pt-20 px-4">
                        <div className="max-w-7xl mx-auto text-center">
                          <h1 className="text-2xl font-bold text-white mb-4">Admin Page Not Found</h1>
                          <a href="/admin/analytics" className="text-[#00FFFF] hover:underline">
                            Go to Admin Dashboard
                          </a>
                        </div>
                      </div>
                    } />
                  </Routes>
                </AdminRoute>
              } 
            />
            
            {/* Development/Test Routes - Only in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Route 
                  path="/test/search-tracking" 
                  element={
                    <AdminRoute
                      allowedEmails={['infiernodel@gmail.com']}
                      redirectTo="/dashboard"
                    >
                      <div className="min-h-screen bg-[#1A1A1A] pt-20">
                        {/* Uncomment when you create the test component */}
                        {/* <SearchTrackingTest /> */}
                        <div className="max-w-4xl mx-auto px-4">
                          <h1 className="text-2xl font-bold text-white mb-4">Search Tracking Test</h1>
                          <p className="text-gray-400">
                            Import and add SearchTrackingTest component here
                          </p>
                        </div>
                      </div>
                    </AdminRoute>
                  } 
                />
                
                {/* General test area for development */}
                <Route 
                  path="/test/*" 
                  element={
                    <AdminRoute
                      allowedEmails={['infiernodel@gmail.com']}
                      redirectTo="/dashboard"
                    >
                      <div className="min-h-screen bg-[#1A1A1A] pt-20 px-4">
                        <div className="max-w-7xl mx-auto">
                          <h1 className="text-2xl font-bold text-white mb-4">
                            Development Test Area
                          </h1>
                          <div className="bg-[#252525] rounded-lg p-6">
                            <p className="text-gray-400 mb-4">
                              This area is only visible in development mode.
                            </p>
                            <div className="space-y-2">
                              <a href="/test/search-tracking" className="block text-[#00FFFF] hover:underline">
                                → Search Tracking Test
                              </a>
                              <a href="/admin/analytics" className="block text-[#00FFFF] hover:underline">
                                → Admin Analytics Dashboard
                              </a>
                              <a href="/personalized" className="block text-[#00FFFF] hover:underline">
                                → Personalized Dashboard (Phase 5)
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AdminRoute>
                  } 
                />
              </>
            )}
            
            {/* 404 Route - Catch all undefined routes */}
            <Route path="*" element={
              <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                  <p className="text-xl text-gray-400 mb-8">Page not found</p>
                  <a href="/" className="text-[#00FFFF] hover:underline">
                    Go back home
                  </a>
                </div>
              </div>
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