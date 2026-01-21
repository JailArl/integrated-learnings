/**
 * INTEGRATION EXAMPLE - How to Connect Dashboards.tsx Forms to Backend
 * 
 * Copy and paste these snippets into Dashboards.tsx to enable form submissions
 */

// 1. Add import at top of Dashboards.tsx
// ============================================
import { submitParentForm, submitTutorForm, ParentFormData, TutorFormData } from '../services/formHandler';


// 2. PARENT SIGNUP WIZARD - Add this to the onComplete handler
// ============================================================
/**
 * Call this when parent completes all 3 steps of signup wizard
 */
const handleParentSignupComplete = async (formData: ParentFormData) => {
  try {
    // Show loading state
    setLoading(true);

    // Submit to backend
    const result = await submitParentForm({
      parentName: formData.parentName,
      email: formData.email,
      phone: formData.phone,
      childName: formData.childName,
      childAge: formData.childAge,
      level: formData.level,
      subjects: formData.subjects,
      currentGrades: formData.currentGrades,
      mainConcerns: formData.mainConcerns,
      learningStyle: formData.learningStyle,
      preferredTiming: formData.preferredTiming,
      preferredFormat: formData.preferredFormat,
      assignmentType: formData.assignmentType,
    });

    if (result.success) {
      // ✅ Success - Show confirmation
      setShowSuccessToast(true);
      setSuccessMessage('Application submitted! Check your email for confirmation and next steps.');
      
      // Optional: Wait 2 seconds then navigate to dashboard
      setTimeout(() => {
        navigate('/parents');
      }, 2000);
    } else {
      // ❌ Error - Show error message
      setShowErrorToast(true);
      setErrorMessage(`Failed to submit: ${result.error}`);
    }
  } catch (error: any) {
    setShowErrorToast(true);
    setErrorMessage('Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
};


// 3. TUTOR SIGNUP WIZARD - Add this to the onComplete handler
// ===========================================================
/**
 * Call this when tutor completes all steps of application
 */
const handleTutorApplicationComplete = async (formData: TutorFormData) => {
  try {
    setLoading(true);

    // Submit to backend (includes file upload if present)
    const result = await submitTutorForm({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      qualification: formData.qualification,
      experienceYears: formData.experienceYears,
      subjects: formData.subjects,
      levels: formData.levels,
      teachingPhilosophy: formData.teachingPhilosophy,
      availability: formData.availability,
      preferredFormat: formData.preferredFormat,
      certificationFile: formData.certificationFile, // Optional PDF/Word file
    });

    if (result.success) {
      // ✅ Success
      setShowSuccessToast(true);
      setSuccessMessage('Application submitted! We\'ll review and get back to you within 48 hours.');
      
      setTimeout(() => {
        navigate('/tutors');
      }, 2000);
    } else {
      // ❌ Error
      setShowErrorToast(true);
      setErrorMessage(`Failed to submit: ${result.error}`);
    }
  } catch (error: any) {
    setShowErrorToast(true);
    setErrorMessage('Network error. Please try again later.');
  } finally {
    setLoading(false);
  }
};


// 4. ADD UI COMPONENTS FOR USER FEEDBACK
// ======================================

// Success Toast Component
const SuccessToast = () => (
  <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-green-900">{successMessage}</p>
      </div>
    </div>
  </div>
);

// Error Toast Component
const ErrorToast = () => (
  <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm">!</span>
      </div>
      <div>
        <p className="font-semibold text-red-900">{errorMessage}</p>
      </div>
    </div>
  </div>
);

// Loading Overlay
const LoadingOverlay = () => (
  loading && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 text-center">Submitting your application...</p>
      </div>
    </div>
  )
);


// 5. COMPONENT STATE (Add to Dashboards component)
// ================================================
export const Dashboards: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-hide toasts after 3 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => setShowErrorToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  return (
    <div>
      {/* Your existing JSX */}
      
      {/* Add these UI elements */}
      {showSuccessToast && <SuccessToast />}
      {showErrorToast && <ErrorToast />}
      {<LoadingOverlay />}
    </div>
  );
};


// 6. BACKEND REQUIREMENTS CHECK
// =============================

/**
 * Call this on page load to verify backend is running
 */
const checkBackendConnection = async () => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      console.warn('Backend health check failed - features may not work');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Backend not running - form submissions will fail');
    return false;
  }
};

// Call in useEffect
useEffect(() => {
  checkBackendConnection();
}, []);


// 7. DEBUGGING TIPS
// =================

/**
 * If forms aren't submitting, check:
 * 
 * 1. Backend server running?
 *    npx ts-node backend-setup.ts
 *    Should show: "Form handling server running on http://localhost:3001"
 * 
 * 2. CORS error in browser console?
 *    - Make sure backend has CORS enabled for http://localhost:5173
 *    - Currently configured in backend-setup.ts
 * 
 * 3. Form data missing?
 *    - Check console.log before submitParentForm/submitTutorForm
 *    - Ensure all required fields are populated
 * 
 * 4. File upload failing?
 *    - Backend needs multipart/form-data support (already configured)
 *    - Make sure certificationFile is a File object, not a string
 * 
 * 5. View submitted data:
 *    - Go to http://localhost:5173/#/admin
 *    - Login with password: admin123
 *    - Check "Submissions" tab
 */


// 8. EXAMPLE - Full Parent Signup Wizard Call
// ============================================

/**
 * Example of complete parent signup flow:
 * 
 * Step 1: Parent fills form
 * Step 2: After validation, collect this data:
 */
const exampleParentData: ParentFormData = {
  parentName: "Sarah Williams",
  email: "sarah@example.com",
  phone: "+65 9123 4567",
  childName: "Emma",
  childAge: 15,
  level: "Secondary 3",
  subjects: ["Mathematics", "English", "Physics"],
  currentGrades: "B3, B4, C5",
  mainConcerns: "Needs boost for O-Levels",
  learningStyle: "Visual learner, prefers structured lessons",
  preferredTiming: "Weekday evenings 6-8 PM",
  preferredFormat: "zoom",
  assignmentType: "rightFit", // quick, rightFit, or premium
};

/**
 * Step 3: Submit via
 */
// const result = await submitParentForm(exampleParentData);
// if (result.success) {
//   console.log('Parent form submitted with ID:', result.id);
//   // Navigate to dashboard
// }


// 9. EXAMPLE - Full Tutor Application Call
// ==========================================

/**
 * Example tutor application:
 */
const exampleTutorData: TutorFormData = {
  fullName: "Dr. Lee Wei Ming",
  email: "lee@example.com",
  phone: "+65 9876 5432",
  qualification: "Masters in Physics, NUS",
  experienceYears: 8,
  subjects: ["Physics", "Mathematics", "Chemistry"],
  levels: ["O-Level", "A-Level", "IB"],
  teachingPhilosophy: "Conceptual understanding over memorization",
  availability: "Flexible, can teach weekday evenings and weekends",
  preferredFormat: "either", // zoom, inPerson, or either
  certificationFile: undefined, // Optional: File object from input
};

/**
 * Step 2: Submit
 */
// const result = await submitTutorForm(exampleTutorData);
// if (result.success) {
//   console.log('Tutor application submitted with ID:', result.id);
//   // Show confirmation message
// }
