# Quick Admin Dashboard Access

## Current Status ✅

Your admin dashboard is now fully set up and ready to use!

## Access URLs

**Frontend (already running):**
```
http://localhost:5173        - Main website
http://localhost:5173/#/admin - Admin dashboard
```

**Backend (needs to be started):**
```
http://localhost:3001/api/health - Health check
```

## Admin Dashboard Login

- **URL:** http://localhost:5173/#/admin
- **Password:** `admin123`
- **No username required**

## What's Inside Admin Dashboard

### Overview Tab
- System status (Database, API, Email service)
- Quick setup guide
- Health indicators

### Submissions Tab
- View ALL form submissions (parents + tutors)
- Search by name, email, or ID
- Filter by:
  - **Type:** All / Parents / Tutors
  - **Status:** Pending / Approved / Verified / Matched / Cancelled / Rejected
- Export to CSV with one click
- Click "View Details" to see full form data
- Update status directly from dashboard

### Parents Tab
- View only parent requests
- See child name, level, email
- See which pricing package they selected
- Current matching status

### Tutors Tab
- View only tutor applications
- See experience, subjects, qualifications
- See verification status
- Track application progress

## Next Steps to Complete

### 1. Start Backend Server (Required for real data collection)
```bash
# Install dependencies
npm install express cors dotenv multer uuid

# Create and run backend
npx ts-node backend-setup.ts
```

Backend will start on `http://localhost:3001`

### 2. Connect Forms to Backend (Update Dashboards.tsx)
When parents/tutors submit forms, they should POST data to:
- `POST /api/forms/parent` - Parent form submission
- `POST /api/forms/tutor` - Tutor application with file upload

### 3. Test Data Flow
1. Submit a test parent form → Check admin dashboard
2. Submit a test tutor form → Check admin dashboard
3. Change submission status in admin panel
4. Export data as CSV

### 4. Production Setup
- Deploy backend to Vercel/Railway/AWS
- Update API calls to production domain
- Add Resend API for email confirmations
- Connect to Supabase/Firebase for persistent storage

## Supabase (Option A)

You can run without the local backend by configuring Supabase. The frontend auto-detects Supabase credentials and will write/read directly.

### 1) Add Vite env vars
Create `.env.local` in project root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Restart `npm run dev` after adding env.

### 2) Create tables in Supabase
Run these in the Supabase SQL editor:

```
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

Note: If `gen_random_uuid()` is unavailable, enable `pgcrypto` or use `uuid-ossp`.

### 3) How it works
- Parent/Tutor form submissions insert into `parent_submissions` / `tutor_submissions`.
- Admin Dashboard reads both tables and computes stats.
- Status updates write back to the appropriate table.

No backend server is required for this mode. Remove or ignore the Express backend if you prefer Supabase-only.

## Files Created

| File | Purpose |
|------|---------|
| `services/formHandler.ts` | API client for form submissions |
| `backend-setup.ts` | Node.js/Express backend server code |
| `components/AdminDashboard.tsx` | Full admin dashboard UI |
| `BACKEND_SETUP.md` | Detailed setup documentation |

## Security

⚠️ **Development Only:**
- Password is hardcoded as `admin123`
- Backend running locally on port 3001
- In-memory data storage (resets on restart)

### For Production:
- Use environment variable for admin password
- Add JWT token authentication
- Use persistent database (Supabase/Firebase)
- Deploy with HTTPS only
- Add IP whitelisting
- Rate limiting on API endpoints
- Store passwords as hashed bcrypt

## Features Included

✅ Password-protected admin login
✅ Real-time data display (after backend integration)
✅ Search and advanced filtering
✅ Status management (change submission status)
✅ CSV export for reporting
✅ Detailed view modal for each submission
✅ System health indicators
✅ Dashboard statistics (total submissions, pending, matched, etc.)
✅ Responsive design (mobile-friendly)
✅ Dark/light UI with proper contrast

## API Endpoints (When Backend Running)

```
POST   /api/forms/parent          - Submit parent form
POST   /api/forms/tutor           - Submit tutor application with file
GET    /api/forms/all             - Get all submissions (admin only)
GET    /api/forms/:id             - Get single submission (admin only)
PATCH  /api/forms/:id             - Update submission status (admin only)
GET    /api/admin/stats           - Get dashboard statistics (admin only)
GET    /api/health                - Health check endpoint
```

All admin endpoints require: `Authorization: Bearer admin123`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Admin dashboard shows "No submissions" | Start backend server on port 3001 |
| Can't login to admin panel | Password is `admin123` (case-sensitive) |
| Forms not submitting | Backend must be running AND Dashboards.tsx must call submitParentForm/submitTutorForm |
| CORS errors | Backend CORS is configured for localhost:5173 |
| File upload fails | Make sure backend has `uploads/` directory |

## Test Credentials

**Admin Dashboard:**
- Password: `admin123`

**Backend API (Authorization):**
- Token: `admin123` (sent as Bearer token)

## Support & Next Steps

1. **Read:** `BACKEND_SETUP.md` for complete integration guide
2. **Start Backend:** Run `npx ts-node backend-setup.ts`
3. **Test:** Submit test forms and view in admin dashboard
4. **Integrate:** Update Dashboards.tsx to POST form data to backend
5. **Deploy:** Push to production with proper environment setup

---

**Status:** ✅ Admin Dashboard Ready | 🟡 Backend Integration Pending | 🔄 Database Selection Pending
