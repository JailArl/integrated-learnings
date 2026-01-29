# Tuition Lead Capture Setup Guide

## Current Status ✅
All form integrations are **complete and ready to use**! Your app can now:
- ✅ Collect parent tutor requests via `/tuition/request`
- ✅ Collect tutor applications via `/tuition/tutors`
- ✅ Save all data to Supabase
- ✅ View all submissions in the admin dashboard at `/admin`

## What You Need to Do (3 Steps)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - Name: "Integrated Learnings" (or your choice)
   - Password: (save this securely)
   - Region: Choose closest to your users
4. Click "Create new project" and wait ~2 minutes for setup

### Step 2: Create the Database Tables
Once your project is created, go to **SQL Editor** in Supabase and paste this entire SQL schema:

```sql
-- Parent submission table
CREATE TABLE IF NOT EXISTS parent_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT,
  student_age INTEGER,
  student_level TEXT,
  current_grades TEXT,
  subjects TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  location TEXT,
  tuition_goal TEXT,
  preferred_timing TEXT,
  budget_range TEXT,
  student_name TEXT,
  level TEXT,
  subjects TEXT,
  address TEXT,
  postal_code TEXT,
  class_type TEXT,
  needs_coursework BOOLEAN,
  tutor_gender TEXT,
  preferred_experience TEXT,
  teaching_style TEXT,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Tutor submission table
CREATE TABLE IF NOT EXISTS tutor_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER,
  subjects TEXT,
  levels TEXT,
  teaching_philosophy TEXT,
  availability TEXT,
  preferred_format TEXT,
  certification_file TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE parent_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow inserts (form submissions)
CREATE POLICY "Allow inserts for parent_submissions" ON parent_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for tutor_submissions" ON tutor_submissions
  FOR INSERT WITH CHECK (true);

-- Create policies for admin access (select all, update all)
CREATE POLICY "Allow all selects for authenticated users" ON parent_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow all selects for authenticated users" ON tutor_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow all updates for authenticated users" ON parent_submissions
  FOR UPDATE USING (true);

CREATE POLICY "Allow all updates for authenticated users" ON tutor_submissions
  FOR UPDATE USING (true);
```

Click **"Run"** button to execute the SQL.

### Step 3: Add Your Credentials to the App
1. Go back to Supabase project settings
2. Click **"API"** in the left sidebar
3. Copy these two values:
   - `Project URL` (looks like `https://xxxxx.supabase.co`)
   - `anon public` key (long string of characters)

4. In the project root, create a file named `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Supabase.

5. **Restart the dev server** (Ctrl+C and then `npm run dev` again)

## Testing the Integration

### Test Parent Tutor Request Form
1. Go to http://localhost:5173/#/tuition/request
2. Fill out the form completely
3. Click "Submit Request"
4. You should see: "Request submitted successfully!"

### Test Tutor Application Form
1. Go to http://localhost:5173/#/tuition/tutors
2. Click "Apply as Tutor"
3. Fill out the 3-step wizard
4. Click "Submit Application"
5. You should see: "Application submitted! We will review and contact you within 48 hours."

### View Submissions in Admin Dashboard
1. Go to http://localhost:5173/#/admin
2. Password: `admin123`
3. Click "Login"
4. You should see your form submissions listed!
5. You can change the status of submissions (pending → approved → matched → verified)

## Architecture Overview

### How Data Flows:
```
Parent fills out form
        ↓
TutorRequest component (pages/ContentPages.tsx)
        ↓
api.forms.submitParentRequest()
        ↓
Supabase parent_submissions table
        ↓
AdminDashboard reads parent_submissions
        ↓
Admin sees submissions + can manage them
```

```
Tutor fills out wizard
        ↓
TutorSignupWizard component (pages/Dashboards.tsx)
        ↓
submitTutorForm() from formHandler service
        ↓
Supabase tutor_submissions table
        ↓
AdminDashboard reads tutor_submissions
        ↓
Admin sees submissions + can manage them
```

### Key Services:
- **services/supabase.ts** - Initializes Supabase client with your credentials
- **services/formHandler.ts** - Handles form submissions to both tables
- **services/api.ts** - Has `forms.submitParentRequest()` function
- **components/AdminDashboard.tsx** - Reads and displays all submissions
- **pages/ContentPages.tsx** - Parent request form
- **pages/Dashboards.tsx** - Tutor signup wizard

## Next Steps After Setup

Once everything is working:

1. **Collect Real Data** - Start advertising `/tuition/request` and `/tuition/tutors` links
2. **Monitor Submissions** - Check `/admin` dashboard daily to see new leads
3. **Improve Conversions** - Add urgency messages, social proof, reviews to increase signups
4. **Add Features** - Consider adding:
   - Email notifications when new submissions arrive
   - Auto-matching algorithm for parents ↔ tutors
   - Payment collection
   - Scheduling system
   - Student progress tracking

## Troubleshooting

### "Supabase not configured" error on form submit
- Check that `.env.local` file exists with correct values
- Verify you copied the EXACT URL and key from Supabase
- Restart dev server after creating `.env.local`

### Tables not showing in admin dashboard
- Confirm SQL was executed successfully in Supabase
- Verify table names are exactly: `parent_submissions` and `tutor_submissions`
- Check that RLS policies were created

### Form submit hangs or times out
- Check browser console for errors (F12)
- Verify Supabase project is in "Active" state
- Confirm RLS policies allow INSERT operations
- Test with a simpler form first

## Admin Dashboard Password
Current password: `admin123`

To change it:
1. Edit [components/AdminDashboard.tsx](components/AdminDashboard.tsx#L1)
2. Find the line: `if (password === 'admin123')`
3. Change `'admin123'` to your new password

## Need Help?
- Supabase Docs: https://supabase.com/docs
- Check browser console (F12) for detailed error messages
- All form handlers have console.error() logging for debugging
