# Tuition Matching Platform - Setup & Deployment Guide

This guide will help you set up and deploy the complete tuition matching platform with Supabase authentication.

## Prerequisites

- Node.js 16+ installed
- Supabase account (https://supabase.com)
- Git

## Step 1: Supabase Setup

### 1.1 Create a New Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Enter project details and wait for it to be created
4. Note down your project URL and anon key

### 1.2 Run Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database-schema.sql`
4. Paste and execute the SQL script
5. Verify all tables are created successfully

### 1.3 Create Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create bucket: `tutor-certificates`
   - Set to **public** (for public read access)
   - Enable authenticated uploads
3. Create bucket: `invoices`
   - Set to **private** (for secure access)
   - Configure RLS policies for parent/admin access

### 1.4 Configure Storage Policies

For `tutor-certificates` bucket:
```sql
-- Allow authenticated tutors to upload
CREATE POLICY "Tutors can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tutor-certificates');

-- Allow public read access
CREATE POLICY "Public can view certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tutor-certificates');
```

For `invoices` bucket:
```sql
-- Allow admin to upload
CREATE POLICY "Admin can upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');

-- Parents can read their own invoices
CREATE POLICY "Parents can view their invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoices');
```

## Step 2: Environment Configuration

### 2.1 Create Environment File

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase project URL and anon key from Step 1.1.

### 2.2 Update .gitignore

Ensure `.env.local` is in your `.gitignore` file to avoid committing secrets:

```
.env.local
.env*.local
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `@supabase/supabase-js` - Supabase client
- `jspdf` - PDF generation
- `react-router-dom` - Routing
- Other React and Vite dependencies

## Step 4: Development

### 4.1 Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4.2 Test the Application

#### Test Parent Flow:
1. Go to `/signup/parent`
2. Create a parent account
3. Login at `/login/parent`
4. You'll be redirected to `/parents` (parent dashboard)
5. Submit a tuition request
6. View request status

#### Test Tutor Flow:
1. Go to `/signup/tutor`
2. Complete the 3-step signup (basic info, teaching details, questionnaire)
3. Login at `/login/tutor`
4. You'll be redirected to `/tutors` (tutor dashboard)
5. View available cases
6. Submit bids
7. Upload certificates

#### Test Admin Flow:
1. Go to `/admin`
2. Enter password: `admin123`
3. Navigate to different sections:
   - `/admin/matching` - Review bids and approve matches
   - `/admin/verification` - Approve/reject tutors
   - `/admin/invoices` - Generate invoices

## Step 5: Production Build

### 5.1 Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 5.2 Preview Production Build

```bash
npm run preview
```

## Step 6: Deployment (Vercel)

### 6.1 Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 6.2 Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

Vercel will automatically detect it's a Vite project and configure build settings.

### 6.3 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

## Step 7: Post-Deployment Configuration

### 7.1 Update Supabase URL Settings

1. Go to Supabase dashboard > Authentication > URL Configuration
2. Add your production URL to "Site URL"
3. Add to "Redirect URLs" list

### 7.2 Test Production Environment

Test all flows in production:
- [ ] Parent signup and login
- [ ] Tutor signup with questionnaire
- [ ] Request submission
- [ ] Bidding system
- [ ] Admin matching
- [ ] Invoice generation
- [ ] File uploads

## Step 8: Ongoing Maintenance

### 8.1 Monitor Supabase Usage

- Check Database size
- Monitor API requests
- Review Storage usage

### 8.2 Backup Database

Regularly backup your Supabase database:
1. Go to Database > Backups
2. Enable automatic backups
3. Download manual backups periodically

### 8.3 Update Dependencies

```bash
npm update
npm audit fix
```

## Troubleshooting

### Issue: "Supabase not configured"

**Solution:** Ensure `.env.local` file exists with correct credentials and restart dev server.

### Issue: "Table does not exist"

**Solution:** Run the database schema SQL script in Supabase SQL Editor.

### Issue: Storage bucket errors

**Solution:** 
1. Verify buckets are created in Supabase Storage
2. Check RLS policies are configured
3. Ensure bucket names match exactly: `tutor-certificates` and `invoices`

### Issue: Authentication errors

**Solution:**
1. Check Supabase project URL is correct
2. Verify anon key is correct
3. Check if email confirmation is required in Supabase Auth settings

### Issue: Build errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Storage bucket policies configured
- [ ] Admin password changed from default
- [ ] HTTPS enabled in production
- [ ] Email verification enabled in Supabase Auth
- [ ] File upload size limits enforced

## Features Checklist

### Parent Features
- [x] Signup with email/password
- [x] Login and authentication
- [x] Submit tuition requests
- [x] Book diagnostic tests
- [x] View request status with progress bar
- [x] View matched tutor details
- [x] Download invoices

### Tutor Features
- [x] Multi-step signup with questionnaire
- [x] Login and authentication
- [x] View verification status
- [x] Browse available cases
- [x] Submit bids with proposals
- [x] View bid status
- [x] Upload certificates
- [x] Track uploaded certificates

### Admin Features
- [x] Password-protected access
- [x] View all parent requests
- [x] Review tutor bids
- [x] View tutor questionnaires
- [x] Download tutor certificates
- [x] Approve matches
- [x] Mark diagnostic tests complete
- [x] Verify/reject tutors
- [x] Generate PDF invoices
- [x] Manage workflow

## API Documentation

### Auth Functions (`services/auth.ts`)

- `signUpParent(email, password, fullName, phone)` - Register parent
- `signUpTutor(email, password, data, questionnaireAnswers)` - Register tutor
- `signIn(email, password)` - Login user
- `signOut()` - Logout user
- `getCurrentUser()` - Get current authenticated user
- `isAuthenticated()` - Check auth status

### Platform API (`services/platformApi.ts`)

**Parent APIs:**
- `submitParentRequest(data)` - Submit new tuition request
- `getMyRequests(parentId)` - Get parent's requests
- `getMyMatch(requestId)` - Get match details for request

**Tutor APIs:**
- `getAvailableCases()` - Get all available tuition cases
- `submitBid(tutorId, requestId, message)` - Submit bid
- `getMyBids(tutorId)` - Get tutor's bids
- `uploadCertificate(tutorId, file)` - Upload certificate
- `getTutorProfile(tutorId)` - Get tutor profile

**Admin APIs:**
- `getAllRequests()` - Get all requests with details
- `getBidsForRequest(requestId)` - Get bids for a request
- `approveBid(requestId, tutorId)` - Approve match
- `markTestComplete(requestId)` - Mark diagnostic test complete
- `verifyTutor(tutorId, status)` - Verify or reject tutor
- `getPendingTutors()` - Get pending tutor verifications
- `getMatchesForInvoicing()` - Get matches needing invoices
- `generateInvoice(matchData)` - Generate PDF invoice

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase dashboard logs
3. Check browser console for errors
4. Review Network tab in DevTools

## License

Copyright © 2024 Integrated Learnings. All rights reserved.
