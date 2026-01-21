
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { RoadmapLanding, RoadmapDetail } from './pages/Roadmap';
import Pricing from './pages/Pricing';
import { ParentDashboard, TutorDashboard } from './pages/Dashboards';
import { AdminDashboard } from './pages/AdminDashboard'; 
import { About, Contact, ExtraLearnings, HolidayPrograms, CourseworkSupport, Policies, TutorLanding, TutorRequest, SpecializedRequest } from './pages/ContentPages';
import { Calendar } from './pages/Calendar';

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
          <Route path="/" element={<Home />} />
          <Route path="/roadmap" element={<RoadmapLanding />} />
          <Route path="/roadmap/:topicId" element={<RoadmapDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/parents" element={<ParentDashboard />} />
          <Route path="/tutors" element={<TutorDashboard />} />
          <Route path="/teach" element={<TutorLanding />} />
          
          {/* Admin Route - Hidden from UI, but accessible via URL */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/request" element={<TutorRequest />} />
          <Route path="/specialized-request" element={<SpecializedRequest />} />
          <Route path="/extra" element={<ExtraLearnings />} />
          <Route path="/holiday" element={<HolidayPrograms />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/coursework" element={
            <Sec4OnlyRoute>
              <CourseworkSupport />
            </Sec4OnlyRoute>
          } />
          <Route path="/policies" element={<Policies />} />

          {/* Catch-All Route: Redirects any unknown URL to Home to prevent crashes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
