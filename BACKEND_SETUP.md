# Backend Form Handler Setup - Option B

## Overview
This guide walks you through setting up a complete backend for handling parent and tutor form submissions, with an admin dashboard to manage all submissions.

## Architecture

```
Frontend (React)
    ↓ (form submission)
    ├─ services/formHandler.ts (API client)
    └─ Dashboards.tsx (ParentSignupWizard, TutorSignupWizard)
    
Backend Server
    ├─ POST /api/forms/parent (receive parent submissions)
    ├─ POST /api/forms/tutor (receive tutor applications)
    ├─ GET /api/forms/all (fetch all submissions for admin)
    ├─ PATCH /api/forms/:id (update submission status)
    └─ GET /api/admin/stats (dashboard statistics)
    
Admin Dashboard
    └─ components/AdminDashboard.tsx (view & manage submissions)
```

## Files Created

1. **services/formHandler.ts** - API client functions for form submission
2. **backend-setup.ts** - Node.js/Express backend server code
3. **components/AdminDashboard.tsx** - Enhanced admin dashboard UI
4. **pages/AdminDashboard.tsx** - Page wrapper (redirects to component)

## Quick Start

### Step 1: Run the Frontend (Already Done)
```bash
npm run dev
# Server running on http://localhost:5173
```

### Step 2: Run the Backend Server

Create a `backend/` folder in your project:

```bash
mkdir backend
cp backend-setup.ts backend/server.ts
```

Install backend dependencies:
```bash
npm install express cors dotenv multer uuid
npm install -D @types/express @types/node typescript ts-node
```

Create `.env` file in project root:
```env
ADMIN_PASSWORD=admin123
PORT=3001
```

Run backend:
```bash
npx ts-node backend/server.ts
# Server running on http://localhost:3001
```

### Step 3: Access Admin Dashboard

1. Go to http://localhost:5173/#/admin
2. Enter password: `admin123`
3. View all submissions, filter by type/status, export CSV

## Integration with Dashboards

### Update Dashboards.tsx ParentSignupWizard

Find the `onComplete` callback in ParentSignupWizard and add:

```tsx
import { submitParentForm } from '../services/formHandler';

// Inside ParentSignupWizard component, in the final step handler:
const handleParentSubmit = async (formData: ParentFormData) => {
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
    showSuccessToast('Application submitted! Check your email for confirmation.');
    navigateTo('/parents');
  } else {
    showErrorToast(`Error: ${result.error}`);
  }
};
```

### Update Dashboards.tsx TutorSignupWizard

Find the tutor application form and add:

```tsx
import { submitTutorForm } from '../services/formHandler';

const handleTutorSubmit = async (formData: TutorFormData) => {
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
    certificationFile: formData.certificationFile,
  });

  if (result.success) {
    showSuccessToast('Application submitted! You'll hear from us within 48 hours.');
    navigateTo('/tutors');
  } else {
    showErrorToast(`Error: ${result.error}`);
  }
};
```

## Email Notifications (Optional)

To send confirmation emails, add Resend API integration:

```bash
npm install resend
```

Add to backend-setup.ts:

```tsx
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// After creating submission
if (submission.type === 'parent') {
  await resend.emails.send({
    from: 'noreply@integratedlearnings.com',
    to: submission.data.email,
    subject: 'Your Match Request Received',
    html: `<h1>Thank you!</h1><p>We've received your application and will match you within 48 hours.</p>`,
  });
}
```

Add to `.env`:
```env
RESEND_API_KEY=your_resend_api_key
```

## Database Options

### Option A: PostgreSQL (Supabase)

1. Create Supabase project at https://supabase.com
2. Install: `npm install @supabase/supabase-js`
3. Update backend-setup.ts:

```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Instead of in-memory array, insert into database:
app.post('/api/forms/parent', async (req, res) => {
  const { data, error } = await supabase
    .from('parent_submissions')
    .insert([{ 
      ...req.body, 
      submitted_at: new Date(),
      status: 'pending'
    }]);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, id: data[0].id });
});
```

### Option B: Firebase Firestore

1. Create Firebase project at https://firebase.google.com
2. Install: `npm install firebase-admin`
3. Update backend-setup.ts to use Firestore collection

### Option C: Simple File-based (Development)

Current in-memory setup works for development. For persistence, add:

```tsx
import fs from 'fs';

const SUBMISSIONS_FILE = 'submissions.json';

const loadSubmissions = () => {
  if (fs.existsSync(SUBMISSIONS_FILE)) {
    return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8'));
  }
  return [];
};

const saveSubmissions = (data: any) => {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2));
};
```

## Admin Dashboard Features

✅ **Overview Tab** - System health, setup guide
✅ **Submissions Tab** - View all forms, search, filter by type/status, export CSV
✅ **Parents Tab** - View all parent requests
✅ **Tutors Tab** - View all tutor applications
✅ **Status Updates** - Change submission status from dashboard
✅ **Details Modal** - View full form details
✅ **Export** - Download submissions as CSV

### Access Admin Dashboard

- **Dev:** http://localhost:5173/#/admin
- **Production:** yourdomain.com/#/admin
- **Password:** admin123

## Testing

### Test Parent Form Submission

1. Go to http://localhost:5173
2. Click "Find a Tutor" → Fill parent form
3. Check admin dashboard to see new submission

### Test Tutor Form Submission

1. Go to http://localhost:5173/#/teach
2. Click "Apply as Tutor" → Fill application form
3. Check admin dashboard to see new tutor application

### Test Email Notifications

When Resend is configured, parents/tutors will receive confirmation emails after submission.

## Production Deployment

### Hosting Backend Server

**Option 1: Vercel**
- Copy `backend-setup.ts` to `api/handler.ts`
- Deploy with Vercel serverless functions
- Update frontend API calls to use production domain

**Option 2: Railway/Render**
```bash
# Create Procfile
web: npm run start

# Add to package.json
"start": "ts-node backend/server.ts"

# Deploy
railway up
```

**Option 3: AWS Lambda**
- Wrap backend-setup.ts as Lambda handler
- Use AWS API Gateway for routing

## Troubleshooting

**CORS Error:**
```
Add your frontend domain to backend CORS config:
app.use(cors({ origin: 'https://yourdomain.com' }));
```

**Form not submitting:**
- Check backend is running (http://localhost:3001/api/health)
- Check browser console for network errors
- Verify admin password is correct

**Admin dashboard shows no data:**
- Make sure backend is running on port 3001
- Check admin password: `admin123`
- Manually refresh data with Refresh button

## Next Steps

1. ✅ Backend server running on localhost:3001
2. ✅ Admin dashboard accessible at /#/admin
3. ⏳ Integrate form submission handlers to Dashboards.tsx wizards
4. ⏳ Add email notifications with Resend API
5. ⏳ Choose and integrate persistent database (Supabase/Firebase)
6. ⏳ Deploy backend and frontend to production

## Support

- **Docs:** Check backend-setup.ts comments
- **API:** All endpoints documented in backend-setup.ts
- **Types:** Check services/formHandler.ts interfaces
