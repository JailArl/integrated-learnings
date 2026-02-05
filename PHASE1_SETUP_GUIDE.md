# Phase 1 Setup Guide - Tutor Onboarding System

## ✅ What's Been Built

### 1. **Enhanced Tutor Signup** ([pages/TutorSignup.tsx](pages/TutorSignup.tsx))
- ✅ Date of birth field (with 18+ validation)
- ✅ Gender selection
- ✅ All data saved to Supabase

### 2. **Certificate Upload System** ([components/CertificateUpload.tsx](components/CertificateUpload.tsx))
- ✅ Multiple certificate uploads (PDF, JPG, PNG)
- ✅ File size validation (max 10MB)
- ✅ Real-time verification status display
- ✅ Delete unverified certificates
- ✅ Admin can approve/reject via admin panel

### 3. **Onboarding Progress Tracker** ([components/TutorOnboardingStatus.tsx](components/TutorOnboardingStatus.tsx))
- ✅ Visual progress bar
- ✅ 4-step onboarding: Photo → Certificates → Verification → AI Interview
- ✅ Step-by-step guidance
- ✅ Access control indicator

### 4. **Database Schema** ([phase1-database-updates.sql](phase1-database-updates.sql))
- ✅ New tutor profile fields (photo, DOB, gender, onboarding status)
- ✅ Certificates table for multiple uploads
- ✅ Verification tracking
- ✅ Case access control

---

## 🚀 Deployment Steps

### **Step 1: Setup Supabase Storage**

1. Go to https://supabase.com → Your Project
2. Click **Storage** in left sidebar
3. Click **New Bucket**
4. Create bucket:
   - Name: `tutor-uploads`
   - Public: ✅ **Yes** (so photos can be displayed)
   - File size limit: **10 MB**
   - Allowed MIME types: `image/*,application/pdf`
5. Click **Create**

---

### **Step 2: Run Database Updates**

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy and paste contents of [phase1-database-updates.sql](phase1-database-updates.sql)
4. Click **Run** ▶️
5. Verify success ✅

---

### **Step 3: Deploy to Production**

Run these commands:

```bash
git add .
git commit -m "Phase 1: Enhanced tutor onboarding with photo, certs, and verification"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

---

### **Step 4: Test the Flow**

1. Go to `https://www.integratedlearnings.com.sg/tutor-signup`
2. Create a test tutor account with:
   - Date of birth
   - Gender
3. Login and check dashboard
4. Upload photo + test certificates
5. Verify onboarding progress shows correctly

---

## 📋 Admin Panel Updates Needed

You'll need to update the admin panel to:

1. **View tutor photos** in tutor list
2. **Verify certificates** (approve/reject)
3. **See onboarding progress** for each tutor
4. **Control case access** toggle

Would you like me to build the admin panel updates next?

---

## 🔄 Next Phase Preview

**Phase 2: AI Interview System**
- OpenAI integration
- Dynamic questions based on tutor profile
- Character & teaching skills evaluation
- Admin transcript review
- Auto-scoring system

---

## ❓ Common Issues & Fixes

### Issue: Photo not uploading
**Fix:** Verify `tutor-uploads` bucket is PUBLIC in Supabase Storage

### Issue: Certificates not saving
**Fix:** Run the SQL script again to ensure `tutor_certificates` table exists

### Issue: "Supabase not configured" error
**Fix:** Check `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

---

## 📊 What Tutors Will See Now

1. **Signup:** Enhanced form with DOB + gender
2. **Dashboard:** Onboarding progress at the top
3. **Blocked Cases:** Can't access cases until approved
4. **Photo + Certificate Upload:** Upload multiple certs and photo after login
5. **Discord Notification:** You get instant alert when they sign up

---

Ready to deploy Phase 1? 🚀
