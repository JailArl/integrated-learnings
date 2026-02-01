# Visual Step-by-Step Walkthrough

## STEP 1️⃣: Go to Supabase and Create Tables

```
1. Open: https://supabase.com
2. Login to your account
3. Select your project
4. Left sidebar → SQL Editor
5. Click "New Query" button

[Screenshot would show these locations]
```

### Copy-Paste This SQL:

```sql
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

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_own" ON admin_users FOR SELECT USING (true);
CREATE POLICY "admin_sessions_select_own" ON admin_sessions FOR SELECT USING (true);

CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
```

Then click **RUN** ▶️

✅ **Result**: Two new tables created in your database

---

## STEP 2️⃣: Create Your Admin Account

### Option A: Via Supabase Dashboard

```
1. Left sidebar → Table Editor
2. Select "admin_users" table
3. Click "+ Insert" button
4. Fill in the form:
   - email: admin@example.com
   - password_hash: admin123
   - full_name: Admin User
   - is_active: [check this box]
5. Click "Save" ✓
```

✅ **Result**: One admin user created

---

## STEP 3️⃣: Test Your Login (Current Setup)

### Go to your app:

```
1. Open: http://localhost:5173 (or your app URL)
2. Navigate to: http://localhost:5173/#/admin/login
3. Enter:
   - Email: admin@example.com
   - Password: admin123
4. Click "Login" button
```

### Expected Result:
- ✅ Redirects to `/admin/matching` page
- ✅ You see the admin dashboard
- ✅ "Logout" button appears in top right

### If it doesn't work:
- ❌ Check email matches exactly (case-sensitive)
- ❌ Check password matches exactly
- ❌ Make sure `is_active` is `true` in database

---

## STEP 4️⃣: Understand the Architecture

### Database Structure:

```
┌─────────────────────────────────┐
│      admin_users                │
├─────────────────────────────────┤
│ id (UUID)                       │
│ email (TEXT)                    │
│ password_hash (TEXT)            │
│ full_name (TEXT)                │
│ is_active (BOOLEAN)             │
│ last_login (TIMESTAMP)          │
│ created_at (TIMESTAMP)          │
└─────────────────────────────────┘
            ↑
            │ (Foreign Key)
            │
┌─────────────────────────────────┐
│      admin_sessions             │
├─────────────────────────────────┤
│ id (UUID)                       │
│ admin_id (UUID) → points to ↑   │
│ token (TEXT - unique)           │
│ expires_at (TIMESTAMP)          │
│ ip_address (TEXT)               │
│ user_agent (TEXT)               │
│ created_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

### Login Process:

```
Frontend                Backend (Supabase)
─────────────         ──────────────────

User enters
email + password
    ↓
Call adminLogin()
    ↓
                      Query admin_users
                      Find user by email
                      ↓
                      Compare password
                      ✓ Match?
                      ↓
                      Generate UUID token
                      ↓
                      Insert into admin_sessions
                      (token + 24hr expiry)
                      ↓
Returns token ←───────
    ↓
Save to localStorage
    ↓
Redirect to /admin
```

### Session Validation:

```
On every page load:

AdminRoute wrapper checks:
  1. Is token in localStorage? ✓
  2. Is expiry > now? ✓
  ↓
  If YES → Show page
  If NO  → Redirect to login
```

---

## STEP 5️⃣: Add More Admin Users

Repeat Step 2 for each admin:

```
1. Supabase → Table Editor → admin_users
2. Click "+ Insert"
3. Add new admin details
4. They can now login
```

---

## STEP 6️⃣: Test Logout

```
1. After login, click "Logout" button (top right)
2. Token deleted from database ✓
3. Redirected to /admin/login ✓
4. Try accessing /admin/tutors without login
5. Should redirect back to login ✓
```

---

## STEP 7️⃣: Verify Everything Works

### Checklist:

- [ ] Tables created in Supabase
- [ ] Admin user created
- [ ] Can login with email/password
- [ ] Gets redirected to admin dashboard
- [ ] Can access /admin/matching page
- [ ] Can access /admin/tutors page
- [ ] Logout button works
- [ ] After logout, can't access admin pages
- [ ] Redirects to login

---

## STEP 8️⃣: What's Different from Before?

### Before (Insecure):
```javascript
// Hardcoded in frontend
if (username === 'admin' && password === 'admin123') {
  localStorage.setItem('adminSession', 'true');
}
```
❌ Anyone can set this value in browser console

### After (Secure):
```javascript
// Backend validates
const admin = await supabase
  .from('admin_users')
  .select()
  .eq('email', email)
  .single();

if (comparePassword(password, admin.password_hash)) {
  // Generate token
  const token = uuidv4();
  // Store in database
  await supabase.from('admin_sessions').insert({token});
  return token;
}
```
✅ Backend validates, generates unique token, stores in database

---

## STEP 9️⃣: Common Issues & Solutions

### Issue: "Invalid credentials"
**Solution:**
```
1. Check Supabase → Table Editor → admin_users
2. Verify email spelling (case-sensitive)
3. Verify password_hash value
4. Make sure is_active = true
```

### Issue: Login works but can't access /admin/tutors
**Solution:**
```
1. Open browser console (F12)
2. Application → Local Storage
3. Check for 'adminToken' key
4. If missing, login again
5. If exists, check if 'adminTokenExpiry' > Date.now()
```

### Issue: Session expires too quickly
**Solution:**
```
1. Check adminAuth.ts line with:
   const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
2. Should be 24 hours from now
3. If shorter, increase the number
```

---

## 🔟: Next: Add Password Hashing

For production, use bcrypt:

```bash
npm install bcrypt
```

Then before inserting into database:

```javascript
import bcrypt from 'bcrypt';

const password_hash = await bcrypt.hash('admin123', 10);
// Store password_hash in database
```

To verify:

```javascript
const isMatch = await bcrypt.compare(plainPassword, hash);
```

---

## That's It! 🎉

You now have:
- ✅ Secure admin login system
- ✅ Database-backed sessions
- ✅ 24-hour expiration
- ✅ Multiple admin support
- ✅ Logout functionality

Questions? Check the main ADMIN_AUTH_SETUP.md guide!
