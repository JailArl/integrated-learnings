# Twilio WhatsApp Setup - Step-by-Step Guide

## Complete Setup Process (30-45 minutes)

---

## **PART 1: Create Twilio Account & Project**

### Step 1: Create Organization & Account

You're already here! When creating a new account within your organization:

**In Account Creation:**
- [ ] **Account Name**: Something like `integrated-learnings-prod` or `integrated-learnings-dev`
- [ ] **Use Case**: Select `Messaging` or `Customer Communications`
- [ ] **Region**: Select your region (Asia, your location, etc.)
- [ ] Click **Create Account**

✅ You'll be taken to your Twilio Console

---

## **PART 2: Set Up WhatsApp Sandbox**

### Step 2: Enable WhatsApp in Console

1. **In Twilio Console** → Left sidebar → **Messaging**
2. Click **Try it out** → **WhatsApp Sandbox**

![What you'll see: "WhatsApp Sandbox is ready to use"]

### Step 3: Get Your WhatsApp Business Phone Number

You should see a screen showing:

```
Your WhatsApp Business Number:
+1 415-XXX-XXXX   (Twilio's sandbox number)

Webhook URL (you'll set this later)
```

**SAVE THIS NUMBER** - You'll need it for webhooks and environment variables

---

## **PART 3: Enable Messages & Set Webhook**

### Step 4: Connect Your First WhatsApp Contact (Personal Phone)

1. **In WhatsApp Sandbox setup page**, you'll see:
   ```
   "To use WhatsApp Sandbox, join this conversation:"
   ```

2. **Send this message to the sandbox number**:
   ```
   Message to: +1 415-XXX-XXXX (the number from Step 3)
   Type: "join [code]"
   Example: "join puppy-friendly"
   ```

3. **Confirm in Twilio Console** - Wait 30 seconds, you should see:
   ```
   ✅ Your number is connected!
   ```

**This registers YOUR phone number in the sandbox so you can test.**

---

## **PART 4: Get API Credentials**

### Step 5: Get Account SID & Auth Token

1. **Twilio Console** → Top left → **Account** menu
2. Click **Settings** (gear icon)
3. Scroll down to find:

```
Account SID:     ACxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:      your-auth-token-here-xxxxxxxxxx
```

**COPY & SAVE BOTH** - Use only HTTPS/secure vault!

### Step 6: Get WhatsApp Sandbox Credentials

1. **Twilio Console** → **Messaging** → **WhatsApp Sandbox**
2. Look for:

```
Account SID:     ACxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:      your-auth-token-here-xxxxxxxxxx

From Number:     +1 415-XXX-XXXX
```

---

## **PART 5: Create Environment Variables**

### Step 7: Update Your .env File

Create or update `.env` in your project root:

```env
# === TWILIO CREDENTIALS ===
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your-auth-token-here-xxxxxxxxxx
VITE_TWILIO_WHATSAPP_NUMBER=+1415XXXXXXX

# === OPENAI (Already have this) ===
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxx

# === SUPABASE (Already have this) ===
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

⚠️ **CRITICAL**: Add `.env` to `.gitignore` if not already there:

```
# In .gitignore
.env
.env.local
.env.*.local
.env.production.local
```

---

## **PART 6: Set Up Backend Webhook (Local Testing First)**

### Step 8a: Test Locally with ngrok

For testing webhooks locally before deploying:

1. **Install ngrok** (if you don't have it):
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your backend server locally**:
   ```bash
   # Your backend API (e.g., on port 3001, 5000, or wherever)
   npm run dev:backend
   # Or your backend command
   ```

3. **In new terminal, run ngrok**:
   ```bash
   ngrok http 3001
   # Replace 3001 with your backend port
   ```

4. **You'll see**:
   ```
   Session started: ngrok → http://localhost:3001
   
   Forwarding   https://abc123ef.ngrok.io → http://localhost:3001
   ```

5. **Copy the HTTPS URL**: `https://abc123ef.ngrok.io`
   - This is your **Webhook Base URL**

### Step 8b: Set Webhook in Twilio Console

1. **Twilio Console** → **Messaging** → **WhatsApp Sandbox**
2. Look for **Sandbox Configuration** section
3. Find field: **When a message comes in**
   - [ ] Set to: **Webhook**
   - [ ] URL: `https://abc123ef.ngrok.io/api/webhook/whatsapp`
   - [ ] HTTP method: **POST**
4. Find field: **Status Callback URL**
   - [ ] URL: `https://abc123ef.ngrok.io/api/webhook/whatsapp/status`
   - [ ] HTTP method: **POST**

**CLICK SAVE**

---

## **PART 7: Create Backend Webhook Endpoint**

### Step 9: Implement Webhook Handler

You already have the code! In your backend, create the route:

**Backend file** (e.g., `backend/routes/whatsapp.ts` or `api/whatsappWebhook.ts`):

```typescript
// For Express.js backend

import express from 'express';
import {
  handleWhatsAppIncoming,
  handleWhatsAppStatus,
} from '../services/whatsappService';

const router = express.Router();

// Incoming message webhook
router.post('/webhook/whatsapp', handleWhatsAppIncoming);

// Status callback webhook
router.post('/webhook/whatsapp/status', handleWhatsAppStatus);

export default router;
```

Add route to your Express app:

```typescript
import whatsappRoutes from '../routes/whatsapp';

app.use('/api', whatsappRoutes);
```

---

## **PART 8: Test the Connection**

### Step 10: Send Test Message

1. **From YOUR phone** (registered in Step 4)
2. **Message the Twilio WhatsApp number**: `+1 415-XXX-XXXX`
3. **Type**: `"Hi test"`

### Step 11: Check Backend Logs

In your backend terminal, you should see:

```
✅ POST /api/webhook/whatsapp received
WhatsApp message from: +1234567890 (your phone)
Content: "Hi test"
Intent detected: greeting
Response sent: "Hi there! 👋 Welcome to integrated-learnings!..."
```

✅ **If you see this, WhatsApp integration is working!**

---

## **PART 9: Prepare for Production**

### Step 12a: Get Production WhatsApp Number

**Once you're ready (not yet - stay on sandbox for testing)**

1. **Twilio Console** → **Messaging** → **WhatsApp**
2. Click **Request Production Access**

**Requirements:**
- [ ] Business verification (document upload)
- [ ] Business description (what you do)
- [ ] Expected message volume
- [ ] Takes 1-24 hours to approve

### Step 12b: Deploy Backend to Production Server

When ready to go live:

1. **Deploy your Node.js backend** to:
   - [ ] Vercel (with serverless functions)
   - [ ] Heroku
   - [ ] AWS Lambda
   - [ ] Your own server

2. **Update environment variables** on production server:
   ```env
   TWILLIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_NUMBER=+1415... (or new production number)
   ```

3. **Update webhook URL** in Twilio Console:
   ```
   https://your-production-api.com/api/webhook/whatsapp
   ```

---

## **QUICK REFERENCE: All Credentials You Need**

Create a secure document with:

```
=== TWILIO CREDENTIALS ===
Account SID:           ACxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:            your-auth-token-here
WhatsApp Sandbox #:    +1 415-XXX-XXXX
Webhook Base URL:      https://abc123ef.ngrok.io (local testing)
Production API URL:    https://your-api.com (after deployment)

=== OPENAI ===
API Key:               sk-xxxxxxxxxxxx

=== SUPABASE ===
Project URL:           https://your-project.supabase.co
Anon Key:              your-anon-key
```

---

## **TESTING SCENARIOS**

### Scenario 1: Parent Says "Hi"

```
Parent: "Hi"
↓
Backend receives webhook
↓
Intent detected: GREETING (confidence: 0.95)
↓
Stage: conversational
↓
AI Response: "Hi there! 👋 Welcome to integrated-learnings!..."
↓
Message sent back via WhatsApp
✅ Success!
```

### Scenario 2: Parent Asks About Tutors

```
Parent: "Do you have math tutors?"
↓
Intent detected: QUESTION_INQUIRY (confidence: 0.92)
Extracted: subject = "math"
↓
Stage: conversational → Wait for detailed inquiry
↓
AI Response: "Yes! We have [X] math tutors with..."
✅ Success!
```

### Scenario 3: Parent Submits Case

```
Parent: "I need secondary math tutor, east coast"
↓
Intent detected: CASE_CREATION (confidence: 0.98)
Extracted: subject="math", level="secondary", location="east coast"
↓
Action: Create case_requests record
↓
Stage: case_created
↓
AI Response: "Perfect! I've recorded your enquiry... [details]"
✅ Success!
```

---

## **TROUBLESHOOTING**

### Problem: "Webhook not delivering messages"

**Solution:**
1. Check ngrok is still running: `ngrok http 3001`
2. Restart ngrok - URL changes each time
3. Update webhook URL in Twilio console with new ngrok URL
4. Test again with a message

### Problem: "Auth token rejected"

**Solution:**
1. Double-check you copied the FULL Auth Token
2. No spaces at beginning/end
3. Create new Auth Token in Twilio Console if needed

### Problem: "Status 422 - Unprocessable Entity"

**Solution:**
1. Webhook URL format wrong - must be HTTPS
2. Check endpoint path: `/api/webhook/whatsapp`
3. Backend not returning 200 OK response

### Problem: "Message goes through but AI doesn't respond"

**Solution:**
1. Check OpenAI API key in `.env`
2. Check OpenAI account has credits/billing enabled
3. Check backend logs for error messages
4. Test OpenAI API directly in code

---

## **SECURITY CHECKLIST**

Before deploying to production:

- [ ] `.env` file in `.gitignore`
- [ ] No credentials in code
- [ ] Using HTTPS only (not HTTP)
- [ ] Auth token rotated if accidentally exposed
- [ ] Webhook URL secured with signature verification
- [ ] Rate limiting on backend endpoints
- [ ] CORS configured properly
- [ ] Error messages don't expose sensitive data

---

## **NEXT STEPS: What Comes After**

Once webhook is working:

1. **Admin Dashboard** - Create UI to view WhatsApp conversations
2. **Conversation History** - Display all parent messages
3. **Manual Responses** - Admin can reply to parents
4. **Automation** - Auto-create cases from WhatsApp
5. **Analytics** - Track conversion funnel

---

## **SUPPORT**

If you get stuck:

1. Check Twilio logs: **Twilio Console** → **Messaging** → **Logs**
2. Check backend logs for error stack traces
3. Add console.log statements in webhook handler
4. Test with curl:
   ```bash
   curl -X POST https://abc123ef.ngrok.io/api/webhook/whatsapp \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "From=whatsapp:%2B1234567890&To=whatsapp:%2B1415XXX&Body=test"
   ```

---

**You're ready to set up! Let me know when you get to each step and I can help debug if needed.** 🚀
