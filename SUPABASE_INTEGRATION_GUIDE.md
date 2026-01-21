# Complete Supabase Integration Guide

This guide walks you through setting up Supabase for Integrated Learnings from scratch to fully tested.

---

## Part 1: Create Supabase Project

### Step 1a: Sign Up / Log In

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or sign in if you have an account
3. Sign up with email or GitHub (GitHub recommended for speed)

### Step 1b: Create a New Project

1. Click **"New Project"** (or in the dashboard: "Create a new project")
2. **Organization:** Create or select your organization
3. **Project Name:** Enter `integrated-learnings` (or similar)
4. **Database Password:** Generate a strong password (copy this, you'll need it)
5. **Region:** Select **Singapore** (closest to your users)
6. Click **"Create new project"**

⏳ **Wait 2-3 minutes** while Supabase initializes the database.

### Step 1c: Get Your Credentials

Once the project is ready:

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon Public Key** (long string starting with `eyJ...`)

**Save these somewhere safe** — you'll need them in the next section.

---

## Part 2: Create Database Tables

### Step 2a: Open SQL Editor

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**

### Step 2b: Create Parent Submissions Table

Copy and paste this SQL:

```sql
-- Create parent_submissions table
create table if not exists parent_submissions (
  id uuid primary key default gen_random_uuid(),
  parentName text not null,
  email text not null,
  phone text not null,
  childName text not null,
  childAge int not null,
  level text not null,
  subjects jsonb not null,
  currentGrades text,
  mainConcerns text not null,
  learningStyle text not null,
  preferredTiming text not null,
  preferredFormat text not null,
  assignmentType text not null,
  status text default 'pending',
  createdAt timestamptz default now(),
  updatedAt timestamptz default now()
);

-- Create an index on email for faster lookups
create index if not exists parent_submissions_email_idx on parent_submissions(email);
```

Click **"Run"** (or Cmd+Enter).

✅ You should see: **Query OK** with row count info.

### Step 2c: Create Tutor Submissions Table

Click **"New Query"** again and paste:

```sql
-- Create tutor_submissions table
create table if not exists tutor_submissions (
  id uuid primary key default gen_random_uuid(),
  fullName text not null,
  email text not null,
  phone text not null,
  qualification text not null,
  experienceYears int not null,
  subjects jsonb not null,
  levels jsonb not null,
  teachingPhilosophy text,
  availability text,
  preferredFormat text not null,
  certificationFile text,
  status text default 'pending',
  createdAt timestamptz default now(),
  updatedAt timestamptz default now()
);

-- Create an index on email for faster lookups
create index if not exists tutor_submissions_email_idx on tutor_submissions(email);
```

Click **"Run"**.

✅ You should see: **Query OK**.

### Step 2d: Verify Tables Were Created

1. Click **Table Editor** (left sidebar)
2. You should see both tables listed:
   - `parent_submissions`
   - `tutor_submissions`

If you see them, **you're good!** ✅

---

## Part 3: Link to Your Website

### Step 3a: Create .env.local File

In your project root (`/workspaces/integrated-learnings-v2/`), create a new file named `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**Replace:**
- `YOUR_PROJECT_ID` → First part of your Project URL (e.g., if URL is `https://abcdef123456.supabase.co`, use `abcdef123456`)
- `YOUR_ANON_KEY_HERE` → The full Anon Public Key you copied earlier

**Example:**
```bash
VITE_SUPABASE_URL=https://abcdef123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Save this file. Do NOT commit it to git (it's in .gitignore by default).

### Step 3b: Restart Dev Server

Stop the current dev server (if running):
```bash
# Press Ctrl+C in the terminal
```

Start it fresh:
```bash
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in XXX ms
  ➜  Local:   http://localhost:5174/
```

---

## Part 4: Test End-to-End

### Step 4a: Test Parent Form Submission

1. **Open browser:** http://localhost:5174/#/parents
2. Click **"Create New Account"**
3. **Fill in the form:**
   - Parent Name: `Test Parent`
   - Email: `testparent@example.com`
   - Phone: `+65 91234567`
   - Child's Name: `Test Child`
   - Child's Age: `14`
   - Level: `Secondary 3`
   - Main Concerns: `Struggling with A-Math`
4. Click **"Create Account"**

**Expected result:** ✅ Green toast appears: **"Application submitted! Check your email for updates."**

**Check Supabase:**
1. Go to Supabase dashboard → **Table Editor**
2. Click **`parent_submissions`**
3. You should see your test entry with all fields populated

If you see it, **parent form is working!** ✅

### Step 4b: Test Tutor Form Submission

1. **Open browser:** http://localhost:5174/#/teach
2. Click **"Apply as Tutor"**
3. **Step 1 - Profile:**
   - Full Name: `Test Tutor`
   - Email: `testtutor@example.com`
   - Phone: `+65 91234567`
   - Qualification: `Bachelor of Science (NUS)`
   - Years of Experience: `5`
   - Click **"Next: Subjects"**
4. **Step 2 - Subjects:**
   - Subjects: `Mathematics, A-Math, Physics`
   - Levels: `Secondary 3, Secondary 4, JC`
   - Preferred Format: `Either`
   - Click **"Next: Agreement"**
5. **Step 3 - Agreement:**
   - Check the agreement box
   - Click **"Submit Application"**

**Expected result:** ✅ Green toast appears: **"Application submitted! We will review and contact you within 48 hours."**

**Check Supabase:**
1. Go to Supabase dashboard → **Table Editor**
2. Click **`tutor_submissions`**
3. You should see your test entry

If you see it, **tutor form is working!** ✅

### Step 4c: Test Admin Dashboard

1. **Open browser:** http://localhost:5174/#/admin
2. **Login:**
   - Password: `admin123`
   - Click **"Login"**

**Expected result:** Admin dashboard loads and shows your test submissions.

3. **Check Submissions Tab:**
   - Should see both parent and tutor entries
   - Click **"Submissions"** tab
   - You should see a table with:
     - Your parent submission (type: `parent`)
     - Your tutor submission (type: `tutor`)

4. **Test Status Update:**
   - In the submissions table, find your parent entry
   - Click the status dropdown (should say `pending`)
   - Change it to `approved`
   - Click somewhere else
   - You should see confirmation toast

**Go back to Supabase:**
- Table Editor → `parent_submissions`
- Refresh the page
- Status should now be `approved` ✅

5. **Test CSV Export:**
   - In admin dashboard, click **"Export CSV"** button
   - Your browser should download a file: `form-submissions-2026-01-21.csv`
   - Open it in Excel/Google Sheets
   - You should see your test data ✅

### Step 4d: Verify Connection Working

**If everything worked above:**

1. Parent form submits to Supabase ✅
2. Tutor form submits to Supabase ✅
3. Admin dashboard reads from Supabase ✅
4. Admin can update status in Supabase ✅
5. Admin can export data ✅

**You're fully integrated!** 🎉

---

## Part 5: Code Walkthrough (What's Connected)

### Where the Frontend Reads Your Credentials

**File:** `services/supabase.ts`

```typescript
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = hasCreds ? createClient(url!, key!) : null;
```

This reads from `.env.local` at build/runtime.

### Where Forms Submit Data

**File:** `services/formHandler.ts`

```typescript
// submitParentForm() - When parent form submits
const { data: inserted, error } = await supabase
  .from('parent_submissions')
  .insert(payload)
  .select()
  .single();

// submitTutorForm() - When tutor form submits
const { data: inserted, error } = await supabase
  .from('tutor_submissions')
  .insert(payload)
  .select()
  .single();
```

### Where Admin Dashboard Fetches Data

**File:** `components/AdminDashboard.tsx`

```typescript
// In fetchData()
const [parentsRes, tutorsRes] = await Promise.all([
  supabase.from('parent_submissions').select('*'),
  supabase.from('tutor_submissions').select('*'),
]);
```

### Where Wizards Call Submit

**File:** `pages/Dashboards.tsx`

```typescript
// Parent signup
const result = await submitParentForm({
  parentName, email, phone, childName, childAge, 
  level, subjects, mainConcerns, learningStyle, 
  preferredTiming, preferredFormat, assignmentType
});

// Tutor signup
const result = await submitTutorForm({
  fullName, email, phone, qualification, 
  experienceYears, subjects, levels, 
  teachingPhilosophy, availability, preferredFormat
});
```

---

## Part 6: Troubleshooting

### "Failed to submit application"

**Check:**
1. `.env.local` exists in project root (not in `public/` or `src/`)
2. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct (no spaces, no extra quotes)
3. Dev server was restarted after creating `.env.local`
4. Browser console (F12 → Console) shows error details

**Fix:**
- Restart dev server: `npm run dev`
- Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Refresh page: F5

### "Admin dashboard shows no data"

**Check:**
1. You submitted test forms (should see success toast)
2. Supabase Table Editor shows the submissions
3. Admin password is `admin123` (case-sensitive)

**Fix:**
- Click "Refresh" button in admin dashboard
- Wait a few seconds (network latency)
- Check browser console for errors

### "Table doesn't exist"

**In Supabase:**
1. Go to Table Editor
2. If tables don't show up, go to SQL Editor
3. Paste the SQL from **Step 2b** and **Step 2c** again
4. Click Run
5. Check Table Editor again

### ".env.local is not being read"

**Check:**
1. File name is exactly `.env.local` (with the dot)
2. File is in project root (same level as `package.json`)
3. Dev server was restarted **after** creating the file
4. No special characters in the values (check for extra spaces, quotes)

**Verify:**
```bash
# In terminal, check if file exists and is readable
ls -la /workspaces/integrated-learnings-v2/.env.local
```

---

## Part 7: What's Next

### Phase 2: Production
- Deploy to Vercel: `npm run build` then push to GitHub
- Supabase will work automatically (same .env.local pattern via Vercel secrets)

### Phase 3: Enhanced Features
- Add email notifications (Resend API)
- Add tutor-parent messaging
- Add lesson tracking & feedback
- Add payment integration (Stripe)

### Phase 4: Scale
- Enable Row Level Security (RLS) in Supabase
- Add authentication for parents/tutors
- Implement role-based access control

---

## Verification Checklist

- [ ] Supabase project created
- [ ] Both tables created (parent_submissions, tutor_submissions)
- [ ] `.env.local` created with correct credentials
- [ ] Dev server restarted
- [ ] Parent form submitted successfully
- [ ] Tutor form submitted successfully
- [ ] Data visible in Supabase Table Editor
- [ ] Admin dashboard loads without errors
- [ ] Admin can view submissions
- [ ] Admin can update status
- [ ] Admin can export CSV

If all checkboxes are ticked, **you're fully integrated and production-ready!** 🚀

---

## Support

**If something goes wrong:**

1. Check browser console: F12 → Console tab (red errors)
2. Check Supabase logs: Dashboard → Logs
3. Verify `.env.local` values are exact matches from Supabase API settings
4. Restart dev server and clear cache
5. Check this guide's troubleshooting section

**Most common issue:** `.env.local` not reloaded after creation → Always restart dev server after creating/editing it.
