# Supabase Setup Guide

Your frontend is now fully wired to Supabase! Here's how to set it up end-to-end.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for it to initialize (2-3 minutes)
5. Get your credentials:
   - **URL:** Project Settings → API → Project URL
   - **Anon Key:** Project Settings → API → anon public key

## Step 2: Add Environment Variables

Create `.env.local` in project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Save and **restart dev server** (`npm run dev`).

## Step 3: Create Database Tables

Open Supabase dashboard → SQL Editor → New Query

Copy and paste this SQL block:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Parent submissions table
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
  submittedAt timestamptz default now()
);

-- Tutor submissions table
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
  submittedAt timestamptz default now()
);
```

Click Run and confirm both tables are created.

## Step 4: Test End-to-End

### Submit Parent Form
1. Go to http://localhost:5174/#/parents
2. Click "Create New Account"
3. Fill in parent details
4. Click "Create Account"
5. You should see a green success toast: "Application submitted! Check your email for updates."

### Submit Tutor Form
1. Go to http://localhost:5174/#/teach
2. Click "Apply as Tutor"
3. Fill in tutor profile (email, qualification, years)
4. Click "Next: Subjects"
5. Add subjects and levels
6. Click "Next: Agreement"
7. Check the agreement box
8. Click "Submit Application"
9. You should see: "Application submitted! We will review and contact you within 48 hours."

### View in Admin Dashboard
1. Go to http://localhost:5174/#/admin
2. Enter password: `admin123`
3. Click "Submissions" tab
4. You should see your parent and tutor submissions listed
5. Click "Refresh" to reload latest data from Supabase

### Verify in Supabase
1. Go to Supabase dashboard → Table Editor
2. Click `parent_submissions` → see your parent form data
3. Click `tutor_submissions` → see your tutor form data

## How It Works

- **Parent/Tutor Forms:** When you submit, data inserts directly into Supabase tables
- **Admin Dashboard:** Reads both tables and auto-computes stats
- **Status Updates:** Admin can change status in the dashboard, which updates Supabase
- **No Backend Required:** Forms skip the local Express backend and go straight to Supabase

## API Behavior

Without `.env.local` set:
- Forms fall back to local Express endpoints (`/api/forms/parent`, etc.)
- Admin dashboard tries Express endpoints first

With `.env.local` configured:
- Forms write directly to Supabase
- Admin dashboard reads from Supabase and computes stats
- Much faster, no backend server needed

## Troubleshooting

**"Failed to submit application"**
- Check `.env.local` is saved in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Restart dev server: `npm run dev`
- Open browser console (F12) for error details

**"Admin dashboard shows no data"**
- Confirm you submitted forms (check browser console for success/error)
- Verify Supabase tables exist in Table Editor
- Click Refresh button on admin dashboard

**Tables don't exist**
- Go to Supabase SQL Editor and run the CREATE TABLE queries
- Confirm both tables show in Table Editor left sidebar

**Port already in use**
- Dev server will auto-use next available port (5174, 5175, etc.)
- Check output for which port it's using

## Next Steps

1. ✅ Supabase project created
2. ✅ Tables created
3. ✅ `.env.local` configured
4. ✅ Forms tested
5. ✅ Admin dashboard tested
6. (Optional) Add email notifications with Resend API
7. (Optional) Deploy to production (Vercel/Railway)

## Verifying Everything Works

Run this checklist:

- [ ] Parent form submits → success toast appears
- [ ] Admin dashboard shows parent submission
- [ ] Tutor form submits → success toast appears
- [ ] Admin dashboard shows tutor submission
- [ ] Admin can change status → Supabase updates
- [ ] Admin can export to CSV
- [ ] Supabase Table Editor shows all records

---

**Support:** Check the browser console (F12 → Console tab) for detailed error messages if something fails.
