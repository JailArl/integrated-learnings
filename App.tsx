
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import MainLanding from './pages/MainLanding';
import TuitionHome from './pages/TuitionHome';
import EnrichmentHome from './pages/EnrichmentHome';
import { RoadmapLanding, RoadmapDetail } from './pages/Roadmap';
import Pricing from './pages/Pricing';
import { ParentDashboard, TutorDashboard } from './pages/Dashboards';
import { AdminDashboard } from './pages/AdminDashboard'; 
import { About, Contact, ExtraLearnings, HolidayPrograms, CourseworkSupport, Policies, TutorLanding, TutorRequest, SpecializedRequest } from './pages/ContentPages';
import ServiceDetail from './pages/ServiceDetail';
import { Calendar } from './pages/Calendar';
import { ParentLogin } from './pages/ParentLogin';
import { ParentSignup } from './pages/ParentSignup';
import { TutorLogin } from './pages/TutorLogin';
import { TutorSignup } from './pages/TutorSignup';
// Temporarily commented out to debug blank page
// import { NewParentDashboard } from './pages/NewParentDashboard';
// import { NewTutorDashboard } from './pages/NewTutorDashboard';

// Protected Route for Coursework (Sec 4 only)
const Sec4OnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Note: This is a demo. In production, check actual user session/state
  // For now, show the content but with a note that it's for Sec 4 parents
  return <>{children}</>;
};

// Simple Admin Protection Wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    // HashRouter is required for the preview environment to work correctly.
    // When deploying to production (e.g. Vercel) with a custom domain, you can switch this to BrowserRouter.
    <HashRouter>
      <Layout>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<MainLanding />} />
          
          {/* Tuition Service Routes */}
          <Route path="/tuition" element={<TuitionHome />} />
          <Route path="/service/:serviceId" element={<ServiceDetail />} />
          <Route path="/tuition/roadmap" element={<RoadmapLanding />} />
          <Route path="/tuition/roadmap/:topicId" element={<RoadmapDetail />} />
          <Route path="/tuition/pricing" element={<Pricing />} />
          <Route path="/tuition/parents" element={<ParentDashboard />} />
          <Route path="/tuition/tutors" element={<TutorDashboard />} />
          <Route path="/tuition/teach" element={<TutorLanding />} />
          
          {/* Authentication Routes */}
          <Route path="/parent-login" element={<ParentLogin />} />
          <Route path="/parent-signup" element={<ParentSignup />} />
          <Route path="/parents/login" element={<ParentLogin />} />
          <Route path="/parents/signup" element={<ParentSignup />} />
          <Route path="/tutor-login" element={<TutorLogin />} />
          <Route path="/tutor-signup" element={<TutorSignup />} />
          <Route path="/tutors/login" element={<TutorLogin />} />
          <Route path="/tutors/signup" element={<TutorSignup />} />
          
          {/* New Dashboards */}
          <Route path="/parents" element={<ParentDashboard />} />
          <Route path="/tutors" element={<TutorDashboard />} />
          <Route path="/tuition/about" element={<Navigate to="/tuition" replace />} />
          <Route path="/tuition/contact" element={<Contact />} />
          <Route path="/tuition/request" element={<TutorRequest />} />
          <Route path="/tuition/specialized-request" element={<SpecializedRequest />} />
          <Route path="/tuition/extra" element={<ExtraLearnings />} />
          <Route path="/tuition/holiday" element={<HolidayPrograms />} />
          <Route path="/tuition/calendar" element={<Calendar />} />
          <Route path="/tuition/coursework" element={
            <Sec4OnlyRoute>
              <CourseworkSupport />
            </Sec4OnlyRoute>
          } />
          <Route path="/tuition/policies" element={<Policies />} />
          
          {/* School Enrichment Routes */}
          <Route path="/enrichment" element={<EnrichmentHome />} />
          <Route path="/enrichment/login" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Login</h1>
                <p className="text-gray-600 mb-6">Access the Financial Literacy Game Platform</p>
                <a 
                  href="YOUR_GAME_URL_HERE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg"
                >
                  Launch Game Platform →
                </a>
                <p className="text-sm text-gray-500 mt-4">Opens in new tab</p>
              </div>
            </div>
          } />
          
          {/* Legacy routes - redirect to tuition for backward compatibility */}
          <Route path="/roadmap" element={<Navigate to="/tuition/roadmap" replace />} />
          <Route path="/roadmap/:topicId" element={<Navigate to="/tuition/roadmap/:topicId" replace />} />
          <Route path="/pricing" element={<Navigate to="/tuition/pricing" replace />} />
          <Route path="/teach" element={<Navigate to="/tuition/teach" replace />} />
          <Route path="/about" element={<Navigate to="/tuition" replace />} />
          <Route path="/contact" element={<Navigate to="/tuition/contact" replace />} />
          <Route path="/request" element={<Navigate to="/tuition/request" replace />} />
          <Route path="/specialized-request" element={<Navigate to="/tuition/specialized-request" replace />} />
          <Route path="/extra" element={<Navigate to="/tuition/extra" replace />} />
          <Route path="/holiday" element={<Navigate to="/tuition/holiday" replace />} />
          <Route path="/calendar" element={<Navigate to="/tuition/calendar" replace />} />
          <Route path="/coursework" element={<Navigate to="/tuition/coursework" replace />} />
          <Route path="/policies" element={<Navigate to="/tuition/policies" replace />} />
          
          {/* Admin Route - Hidden from UI, but accessible via URL */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Catch-All Route: Redirects any unknown URL to Home to prevent crashes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
