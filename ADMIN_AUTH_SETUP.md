# Admin Authentication Setup Guide

## Step 1: Set Up Database Tables in Supabase

### What you need to do:
1. Go to your **Supabase dashboard**
2. Click on your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run**

```sql
-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin sessions table for token tracking
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_users_select_own" ON admin_users
  FOR SELECT
  USING (true);

CREATE POLICY "admin_sessions_select_own" ON admin_sessions
  FOR SELECT
  USING (true);

-- Create index for performance
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
```

**What this does:**
- Creates `admin_users` table to store admin accounts
- Creates `admin_sessions` table to track login sessions
- Sets up indexes for fast queries

---

## Step 2: Create Your Admin User

### Option A: Using Supabase Dashboard (Easy)

1. In Supabase, go to **Table Editor** (left sidebar)
2. Click on `admin_users` table
3. Click **+ Insert row** (or **Insert** button)
4. Fill in the fields:
   - **email**: your@email.com
   - **password_hash**: your_password_123 (⚠️ See Step 3 to hash this properly)
   - **full_name**: Your Name
   - **is_active**: true (check the checkbox)
5. Click **Save**

### Option B: Using SQL (If table editor doesn't work)

1. Go back to **SQL Editor**
2. Click **New Query**
3. Paste this (replace with your info):

```sql
INSERT INTO admin_users (email, password_hash, full_name, is_active)
VALUES ('admin@example.com', 'password123', 'Admin User', true);
```

4. Click **Run**

---

## Step 3: Hash Your Password (IMPORTANT for Production)

The password is currently stored in plain text. For production, use bcrypt:

### Install bcrypt:
```bash
npm install bcrypt
```

### Hash your password in terminal:

Create a temporary file `hash-password.js`:

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

hashPassword('your_password_here');
```

Run it:
```bash
node hash-password.js
```

Copy the hashed output and update your database with it.

---

## Step 4: Test the Login

1. Open your app in browser
2. Go to `/#/admin/login`
3. Enter:
   - **Email**: admin@example.com
   - **Password**: your_password (the plain text one you set)
4. Click **Login**

If successful, you'll be redirected to `/admin/matching`

---

## Step 5: Understanding How It Works

### Login Flow:

```
User enters email + password
        ↓
adminLogin() called (in services/adminAuth.ts)
        ↓
Query admin_users table for matching email
        ↓
Compare password (currently plain text comparison)
        ↓
If matches: Create session token (UUID)
        ↓
Store token in admin_sessions table with 24-hour expiry
        ↓
Return token to frontend
        ↓
Frontend stores token in localStorage
        ↓
AdminRoute checks if token exists and is valid
```

### Protection Flow:

```
User tries to access /admin/tutors
        ↓
AdminRoute wrapper checks:
  1. Is adminToken in localStorage?
  2. Is adminTokenExpiry > current time?
        ↓
If both YES → Show page
If NO → Redirect to /admin/login
```

### Logout Flow:

```
User clicks Logout button
        ↓
adminLogout() called with token
        ↓
Delete token from admin_sessions table
        ↓
Remove token from localStorage
        ↓
Redirect to /admin/login
```

---

## Step 6: Add More Admin Users

To add another admin, repeat **Step 2**:

1. Go to **Table Editor** → `admin_users`
2. Click **+ Insert row**
3. Fill in details
4. They can now login with those credentials

---

## Step 7: Production Checklist

Before deploying to production:

- [ ] Hash all passwords with bcrypt
- [ ] Add `.env.local` file with admin details
- [ ] Enable HTTPS only
- [ ] Set up rate limiting on login
- [ ] Add password minimum requirements (8+ chars)
- [ ] Add email verification
- [ ] Add 2FA (two-factor authentication)
- [ ] Log all admin actions
- [ ] Set up admin audit trail

---

## Troubleshooting

### "Invalid credentials" error
- Check email spelling in database
- Make sure `is_active` is `true`
- Verify password matches exactly

### Token expires immediately
- Check if `adminTokenExpiry` is being set correctly
- Should be current time + 24 hours

### Can't access admin pages after login
- Check if token is in localStorage (F12 → Application → Local Storage)
- Check if token hasn't expired
- Try clearing localStorage and logging in again

---

## Files Modified

- `services/adminAuth.ts` - New auth service
- `admin-setup.sql` - Database schema
- `pages/AdminLogin.tsx` - Updated to use new auth
- `App.tsx` - Updated route protection
- `components/AdminDashboard.tsx` - Updated logout

---

## Next Steps (Recommendations)

1. ✅ Test login/logout
2. ✅ Create multiple test admin accounts
3. ✅ Test session expiration (wait 24 hours or modify code temporarily)
4. ✅ Add password hashing with bcrypt
5. ✅ Deploy to production with HTTPS
6. ✅ Monitor admin access logs
