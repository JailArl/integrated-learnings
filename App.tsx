import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import MainLanding from './pages/MainLanding';
import TuitionHome from './pages/TuitionHome';
import EnrichmentHome from './pages/EnrichmentHome';
import { RoadmapLanding, RoadmapDetail } from './pages/Roadmap';
import Pricing from './pages/Pricing';
import { AdminDashboard } from './pages/AdminDashboard';
import { About, Contact, ExtraLearnings, HolidayPrograms, CourseworkSupport, Policies, TutorLanding, TutorRequest, SpecializedRequest } from './pages/ContentPages';
import ServiceDetail from './pages/ServiceDetail';
import { Calendar } from './pages/Calendar';
import { ParentLogin } from './pages/ParentLogin';
import { ParentSignup } from './pages/ParentSignup';
import { TutorLogin } from './pages/TutorLogin';
import { TutorSignup } from './pages/TutorSignup';

const Sec4OnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MainLanding />} />
          <Route path="/tuition" element={<TuitionHome />} />
          <Route path="/service/:serviceId" element={<ServiceDetail />} />
          <Route path="/tuition/roadmap" element={<RoadmapLanding />} />
          <Route path="/tuition/roadmap/:topicId" element={<RoadmapDetail />} />
          <Route path="/tuition/pricing" element={<Pricing />} />
          <Route path="/tuition/parents" element={<Navigate to="/parents/signup" replace />} />
          <Route path="/tuition/tutors" element={<Navigate to="/tutors/signup" replace />} />
          <Route path="/tuition/teach" element={<TutorLanding />} />
          <Route path="/parent-login" element={<ParentLogin />} />
          <Route path="/parent-signup" element={<ParentSignup />} />
          <Route path="/parents/login" element={<ParentLogin />} />
          <Route path="/parents/signup" element={<ParentSignup />} />
          <Route path="/tutor-login" element={<TutorLogin />} />
          <Route path="/tutor-signup" element={<TutorSignup />} />
          <Route path="/tutors/login" element={<TutorLogin />} />
          <Route path="/tutors/signup" element={<TutorSignup />} />
          <Route path="/parents" element={<Navigate to="/parents/signup" replace />} />
          <Route path="/tutors" element={<Navigate to="/tutors/signup" replace />} />
          <Route path="/tuition/about" element={<Navigate to="/tuition" replace />} />
          <Route path="/tuition/contact" element={<Contact />} />
          <Route path="/tuition/request" element={<TutorRequest />} />
          <Route path="/tuition/specialized-request" element={<SpecializedRequest />} />
          <Route path="/tuition/extra" element={<ExtraLearnings />} />
          <Route path="/tuition/holiday" element={<HolidayPrograms />} />
          <Route path="/tuition/calendar" element={<Calendar />} />
          <Route path="/tuition/coursework" element={<Sec4OnlyRoute><CourseworkSupport /></Sec4OnlyRoute>} />
          <Route path="/tuition/policies" element={<Policies />} />
          <Route path="/enrichment" element={<EnrichmentHome />} />
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
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
