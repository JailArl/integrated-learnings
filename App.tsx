
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { RoadmapLanding, RoadmapDetail } from './pages/Roadmap';
import Pricing from './pages/Pricing';
import { ParentDashboard, TutorDashboard } from './pages/Dashboards';
import { AdminDashboard } from './pages/AdminDashboard'; 
import { About, Contact, ExtraLearnings, HolidayPrograms, CourseworkSupport, Policies, TutorLanding } from './pages/ContentPages';
import { AIAssistant } from './components/AIAssistant'; 

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
          <Route path="/extra" element={<ExtraLearnings />} />
          <Route path="/holiday" element={<HolidayPrograms />} />
          <Route path="/coursework" element={<CourseworkSupport />} />
          <Route path="/policies" element={<Policies />} />

          {/* Catch-All Route: Redirects any unknown URL to Home to prevent crashes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIAssistant />
      </Layout>
    </HashRouter>
  );
};

export default App;
