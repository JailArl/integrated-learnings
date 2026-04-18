
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import MainLanding from './pages/MainLanding';
import FamilyHome from './pages/FamilyHome';
import EnrichmentHome from './pages/EnrichmentHome';
import StudyPulseLanding from './pages/StudyPulseLanding';
import { FamilyPSLEJuneIntensivePage, FamilyOLevelJuneIntensivePage } from './pages/FamilyCrashCoursePages';
import StudyPulseApp from './pages/StudyPulseApp';
import StudyPulseSetup from './pages/StudyPulseSetup';
import StudyPulseAdmin from './pages/StudyPulseAdmin';
import StudyPulseLogin from './pages/StudyPulseLogin';
import TuitionRequestLanding from './pages/TuitionRequestLanding';
import { RoadmapLanding, RoadmapDetail } from './pages/Roadmap';
import Pricing from './pages/Pricing';
import { AdminDashboard } from './pages/AdminDashboard'; 
import { AdminMatching } from './pages/AdminMatching';
import { AdminTutors } from './pages/AdminTutors';
import { AdminLogin } from './pages/AdminLogin';
import { Contact, ExtraLearnings, HolidayPrograms, CourseworkSupport, Policies, TutorLanding } from './pages/ContentPages';
import InternationalStudents from './pages/InternationalStudents';
import PersonalityDecode from './pages/PersonalityDecode';
import ServiceDetail from './pages/ServiceDetail';
import { Calendar } from './pages/Calendar';
import { TutorLogin } from './pages/TutorLogin';
import { TutorSignup } from './pages/TutorSignup';
import { ResetPassword } from './pages/ResetPassword';
import NewTutorDashboard from './pages/NewTutorDashboard';
import CaseDetail from './pages/CaseDetail';
import TutorAIInterview from './pages/TutorAIInterview';
import TutorInterviewResults from './pages/TutorInterviewResults';
import TutorOnboarding from './pages/TutorOnboarding';
import EnrichmentLogin from './pages/EnrichmentLogin';
import EnrichmentGame from './pages/EnrichmentGame';
import ClassroomAdmin from './pages/ClassroomAdmin';

// Global Error Boundary — prevents white-screen crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route for Coursework (Sec 4 only)
const Sec4OnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Note: This is a demo. In production, check actual user session/state
  // For now, show the content but with a note that it's for Sec 4 parents
  return <>{children}</>;
};

const LegacyRoadmapRedirect: React.FC = () => {
  const { topicId } = useParams();
  const targetPath = topicId ? `/tuition/roadmap/${topicId}` : '/tuition/roadmap';

  return <Navigate to={targetPath} replace />;
};

// Admin Protection Wrapper with Token Validation
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const tokenExpiry = localStorage.getItem('adminTokenExpiry');
  
  // Check if token exists and hasn't expired
  const isTokenValid = () => {
    if (!token || !tokenExpiry) return false;
    const expiryTime = parseInt(tokenExpiry);
    return Date.now() < expiryTime;
  };
  
  if (!isTokenValid()) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    // BrowserRouter for clean URLs on production with custom domain
    <ErrorBoundary>
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<MainLanding />} />
          
          {/* Authentication Routes - MUST be before dashboard routes for proper precedence */}
          <Route path="/parent-login" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/parent-signup" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/parents/login" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/parents/signup" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/tutor-login" element={<TutorLogin />} />
          <Route path="/tutor-signup" element={<TutorSignup />} />
          <Route path="/tutors/login" element={<TutorLogin />} />
          <Route path="/tutors/signup" element={<TutorSignup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Dashboards */}
          <Route path="/parents" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/tutors" element={<NewTutorDashboard />} />
          <Route path="/tutors/case/:caseId" element={<CaseDetail />} />
          <Route path="/tutors/questionnaire" element={<Navigate to="/tutors/ai-interview" replace />} />
          <Route path="/tutor/questionnaire" element={<Navigate to="/tutors/ai-interview" replace />} />
          <Route path="/tutors/onboarding" element={<TutorOnboarding />} />
          <Route path="/tutors/ai-interview" element={<TutorAIInterview />} />
          <Route path="/tutors/interview-results" element={<TutorInterviewResults />} />
          
          {/* Tuition Service Routes */}
          <Route path="/tuition" element={<FamilyHome />} />
          <Route path="/family/crash-courses/psle-june-intensive" element={<FamilyPSLEJuneIntensivePage />} />
          <Route path="/family/crash-courses/o-level-june-intensive" element={<FamilyOLevelJuneIntensivePage />} />
          <Route path="/studypulse" element={<StudyPulseLanding />} />
          <Route path="/studypulse/login" element={<StudyPulseLogin />} />
          <Route path="/studypulse/app" element={<StudyPulseApp />} />
          <Route path="/studypulse/setup" element={<StudyPulseSetup />} />
          <Route path="/studypulse/admin" element={<AdminRoute><StudyPulseAdmin /></AdminRoute>} />
          {/* Legacy StudyQuest → StudyPulse redirects */}
          <Route path="/studyquest" element={<Navigate to="/studypulse" replace />} />
          <Route path="/studyquest/*" element={<Navigate to="/studypulse" replace />} />
          <Route path="/service/:serviceId" element={<ServiceDetail />} />
          <Route path="/tuition/roadmap" element={<RoadmapLanding />} />
          <Route path="/tuition/roadmap/:topicId" element={<RoadmapDetail />} />
          <Route path="/tuition/pricing" element={<Pricing />} />
          <Route path="/tutor-request" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/tuition/parents" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/tuition/tutors" element={<NewTutorDashboard />} />
          <Route path="/tuition/teach" element={<TutorLanding />} />
          <Route path="/tuition/about" element={<Navigate to="/tuition" replace />} />
          <Route path="/tuition/contact" element={<Contact />} />
          <Route path="/tuition/request" element={<TuitionRequestLanding />} />
          <Route path="/tuition/specialized-request" element={<Navigate to="/tuition#parent-inquiry" replace />} />
          <Route path="/tuition/extra" element={<ExtraLearnings />} />
          <Route path="/zh" element={<InternationalStudents />} />
          <Route path="/zh/fortune" element={<PersonalityDecode />} />
          <Route path="/personality" element={<PersonalityDecode />} />
          <Route path="/international" element={<InternationalStudents />} />
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
          <Route path="/enrichment/login" element={<EnrichmentLogin />} />
          <Route path="/enrichment/game" element={<EnrichmentGame />} />
          <Route path="/classroom-admin" element={<ClassroomAdmin />} />
          
          {/* Legacy routes - redirect to tuition for backward compatibility */}
          <Route path="/roadmap" element={<Navigate to="/tuition/roadmap" replace />} />
          <Route path="/roadmap/:topicId" element={<LegacyRoadmapRedirect />} />
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
          
          {/* Admin Routes - Hidden from UI, but accessible via URL */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/matching" element={
            <AdminRoute>
              <AdminMatching />
            </AdminRoute>
          } />
          <Route path="/admin/tutors" element={
            <AdminRoute>
              <AdminTutors />
            </AdminRoute>
          } />
          <Route path="/admin/verification" element={
            <AdminRoute>
              <Navigate to="/admin/tutors" replace />
            </AdminRoute>
          } />

          {/* Catch-All Route: Redirects any unknown URL to Home to prevent crashes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
