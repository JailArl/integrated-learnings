# WhatsApp Hybrid Smart System Implementation Guide

## 🎯 System Overview

The hybrid smart system categorizes parents based on their WhatsApp interaction stage and delivers **contextual, personalized responses**:

```
NEW CONTACT
    ↓
Send Welcome Menu
    ↓
    ├─ GREETING → Quick reply + menu
    ├─ QUESTION → AI-powered answer
    └─ CASE REQUEST → Extract details + create case
    ↓
REGISTERED
    ├─ Returned user → Continue conversation
    ├─ More questions → Detailed answers
    └─ Submit case → Create and match with tutors
    ↓
ENQUIRY_SUBMITTED
    ├─ No diagnostic yet → Suggest booking
    └─ Waiting for tutors → Show bid updates
    ↓
DIAGNOSTIC_BOOKED
    ├─ Check in status
    └─ Tutor matching in progress
    ↓
CASE_MATCHED
    └─ Ongoing support & case management
```

---

## 📊 Contact Categorization Taxonomy

### **Contact Status** (Primary Classification)

| Status | Definition | User Action |
|--------|-----------|------------|
| **NEW** | First message from phone number | Just messaged us |
| **REGISTERED** | Returned contact, profile created | Can see past conversations |
| **ENQUIRY_SUBMITTED** | Submitted a case request | Waiting for tutor bids |
| **DIAGNOSTIC_BOOKED** | Scheduled diagnostic test | Test is scheduled/in progress |
| **CASE_MATCHED** | Assigned to a tutor | Active tutoring relationship |

### **Conversion Stage** (Detailed Progression)

```
1. new
   └─ Triggered: First message
   └─ AI Response: Welcome menu + options
   └─ Parent Action: Choose what they need
   └─ Next: conversational

2. conversational
   └─ Triggered: Parent asks about tutors/services
   └─ AI Response: Answer questions, provide info
   └─ Parent Action: Decide if interested
   └─ Next: detailed_inquiry OR end

3. detailed_inquiry
   └─ Triggered: Parent provides subject/level/location
   └─ AI Response: Confirm details + show next steps
   └─ System Action: Prepare to create case
   └─ Next: case_created

4. case_created
   └─ Triggered: Case inserted into system
   └─ System Action: Notify tutors, start bidding
   └─ Parent Action: Review tutor profiles/bids
   └─ Next: diagnostic_booked OR case_matched

5. diagnostic_booked
   └─ Triggered: Parent schedules diagnostic test
   └─ System Action: Schedule test, notify tutors
   └─ Parent Action: Attend diagnostic test
   └─ Next: case_matched

6. matched
   └─ Triggered: Admin assigns tutor or parent accepts bid
   └─ System Action: Create match record, notify both
   └─ Next: Ongoing support
```

### **Inquiry Subcategories** (For Registered Users)

Even within a stage, parents can be further categorized:

```
REGISTERED + No Enquiry + No Diagnostic
    → "Browsing only" - Not ready yet
    → Response: Info only, no pressure

REGISTERED + Enquiry Submitted + No Diagnostic
    → "Waiting for tutors" - Case open
    → Response: Show bid updates, encourage action

REGISTERED + Enquiry Submitted + Diagnostic Booked
    → "In process" - Active matching
    → Response: Diagnostic check-in, matching update

REGISTERED + Enquiry Submitted + Diagnostic Done + No Match
    → "Waiting for match" - Analysis in progress
    → Response: ETA for matching, alternative tutors
```

---

## 💬 AI Response Templates by Stage

### **Stage 1: NEW Contact**

```
Input: "Hi"
Detected Intent: GREETING

AI Response:
"Hi there! 👋 Welcome to integrated-learnings! I'm here to help you find the perfect tutor for your child.

What can I help you with?
📚 TUTORS - Browse our qualified tutors
💰 PRICING - Check our rates
📝 CASE - Submit a tutoring request
❓ HELP - Get more information"

Next Stage: conversational
```

### **Stage 2: CONVERSATIONAL - Questions**

```
Input: "Do you have math tutors?"
Detected Intent: QUESTION_INQUIRY
Extracted: Subject = Math

AI Response:
"Absolutely! We have [Count] verified math tutors with 2-15 years of experience. 

📚 Experience levels: Primary to University
💰 Rates: $25-$50/hour
⭐ Average rating: 4.8/5

What level is your child? (Primary/Secondary/JC/IB/University)"

System Action:
- Update contact.preferredSubject = "Math"
- Store in metadata

Next Stage: detailed_inquiry
```

### **Stage 3: DETAILED_INQUIRY - Case Creation**

```
Input: "Secondary student, help with O-level math, Clementi area"
Detected Intent: CASE_CREATION
Extracted: 
  - Subject: Math
  - Level: Secondary (O-level)
  - Location: Clementi

AI Response:
"Perfect! I've recorded your request:

📚 Subject: Math (O-level)
👨‍🎓 Student: Secondary
📍 Location: Clementi

What's your preferred tutoring rate? (Skip to let tutors suggest)"

System Actions:
1. Create case_request record
2. Update contact.hasSubmittedEnquiry = true
3. Update contact.conversionStage = "case_created"
4. Notify tutors of new case
5. Save message with intent = "case_creation"

Next Stage: case_created (show bid updates)
```

### **Stage 4: CASE_CREATED - Bid Management**

```
Parent: "How long till tutors respond?"
Detected Intent: INQUIRY

AI Response:
"Good news! You have [N] tutors bidding on your case.

🔥 Hot tutors: [Names with ratings 4.5+]
📊 Average response: 45 minutes
💬 Review their profiles to choose the best match!

Want me to help compare tutors?"

System Action:
- No stage change
- Continue being helpful/supportive
```

### **Stage 5: DIAGNOSTIC_BOOKED - Check-in**

```
Parent: "When is the diagnostic test?"
Detected Intent: DIAGNOSTIC_INQUIRY

AI Response:
"Your diagnostic test is scheduled for:

📅 [Date & Time]
📍 [Location]
👨‍🏫 Tutor: [Name]

See you then! Questions? Reply here anytime 😊"

System Action:
- Provide diagnostic details
- Offer rescheduling option
```

### **Stage 6: MATCHED - Ongoing Support**

```
Parent: "My child finished first lesson, any feedback?"
Detected Intent: SUPPORT

AI Response:
"That's great! Your tutor [Name] should have sent feedback in your account.

Check your dashboard for:
✅ Lesson notes
📊 Progress assessment  
📅 Next lesson schedule

Need to reschedule? Message here and I'll help!"

System Action:
- Provide support options
- Escalate to admin if needed
```

---

## 🔄 FlowChart: Message Processing

```
┌─ WhatsApp Webhook receives message
│
├─ Parse: Phone number, Message content, Timestamp
│
├─ Categorize Contact:
│  ├─ NEW → Create whatsapp_contacts record
│  └─ REGISTERED → Fetch existing contact
│
├─ Detect Intent:
│  ├─ Call OpenAI to analyze message
│  ├─ Extract: subject, level, location
│  └─ Get: intent type, confidence score
│
├─ Save Message:
│  └─ Insert into whatsapp_conversations with intent metadata
│
├─ Generate Response:
│  ├─ Check contact.conversionStage
│  ├─ Call OpenAI with stage-specific system prompt
│  └─ Get: AI-generated response text
│
├─ Update Contact Status:
│  ├─ Based on intent + current stage
│  ├─ Possible actions:
│  │  ├─ Create case if case_creation intent
│  │  ├─ Update conversion_stage
│  │  └─ Update has_submitted_enquiry flags
│  │
│  └─ Save updated contact record
│
├─ Send Response:
│  ├─ Via Twilio WhatsApp API
│  ├─ Log message_timestamp
│  └─ Increment ai_responses_sent counter
│
└─ Update metrics:
   └─ last_message_date, message_count
```

---

## 🗄️ Database Tables

### **whatsapp_contacts**
Tracks each unique WhatsApp contact's journey

```sql
-- Key fields for categorization:
contact_status          -- new|registered|enquiry_submitted|diagnostic_booked|case_matched
conversion_stage        -- new|conversational|detailed_inquiry|case_created|diagnostic_booked|matched
has_submitted_enquiry   -- boolean, true if case created
has_booked_diagnostic   -- boolean, true if diagnostic scheduled
has_active_case         -- boolean, true if matched with tutor

-- Preferred info (extracted from messages):
preferred_subject       -- e.g., "Math"
student_level          -- e.g., "Secondary"

-- Metadata:
message_count          -- How many messages total
ai_responses_sent      -- How many AI responses given
last_message_date      -- For engagement tracking
```

### **whatsapp_conversations**
Stores all messages and intent detection

```sql
-- Key fields:
message_type        -- parent_message|ai_response|admin_message
intent              -- greeting|question_inquiry|case_creation|...
detected_intent_confidence  -- 0.0-1.0 (AI confidence)
ai_generated        -- true if generated by AI
metadata            -- JSONB with extracted data
```

---

## 🎯 Categorization Examples

### **Example 1: New Parent - Quick Question**

```
Contact: +65-9123-4567 [NEW]
Message: "Do you have chemistry tutors?"

Processing:
1. Categorize: NEW (not in database)
2. Detect Intent: QUESTION_INQUIRY (confidence: 0.95)
   Extracted: subject = "chemistry"
3. Response: "Yes, we have [X] chemistry tutors..."
4. Stage Update: conversational (was: new)

Result:
- contact_status: new
- conversion_stage: conversational
- preferred_subject: chemistry
- message_count: 1
```

### **Example 2: Registered Parent - Submits Case**

```
Contact: +65-9876-5432 [REGISTERED - seen before]
Message: "I need urgent JC physics help, Bedok area"

Processing:
1. Categorize: REGISTERED (found in database with history)
2. Detect Intent: CASE_CREATION (confidence: 0.98)
   Extracted: subject="physics", level="JC", location="Bedok", urgency="high"
3. Create Case:
   - case_requests table insert
   - Notify tutors of new case
4. Response: "Great! I've created your case..."
5. Stage Update: case_created (was: conversational)

Result:
- contact_status: enquiry_submitted
- conversion_stage: case_created
- preferred_subject: physics
- has_submitted_enquiry: true
- case_request_id: [uuid]
```

### **Example 3: Existing Parent - Ambiguous Message**

```
Contact: +65-8765-4321 [REGISTERED - has pending case]
Message: "When will I hear back?"

Processing:
1. Categorize: REGISTERED
2. Detect Intent: INQUIRY (confidence: 0.70) - Could be diagnostic check or tutor bids
3. Check Context:
   - has_active_case: true
   - has_booked_diagnostic: false
   → Likely asking about tutor bids
4. Response: "You have [N] tutor bids received..."
5. Stage: No change (already in case_created)

Result:
- conversation_stage: case_created (unchanged)
- AI infers from context which question they're asking
```

---

## 🔧 Configuration

### Environment Variables

```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890  # Your business WhatsApp number

# OpenAI
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxx

# Webhook
WHATSAPP_WEBHOOK_SECRET=your_secret_for_verification
```

### Twilio Setup

1. Go to [Twilio Console](https://console.twilio.com)
2. WhatsApp Sandbox → Enable WhatsApp
3. Copy Account SID, Auth Token, and WhatsApp phone number
4. Set webhook URL: `https://your-domain.com/api/webhook/whatsapp`
5. Configure webhook for:
   - Incoming messages
   - Message status updates

---

## 🚀 Implementation Roadmap

### Phase 1: Core System (Week 1-2)
- [ ] Create database tables (SQL)
- [ ] Build whatsappService.ts
- [ ] Create Twilio webhook endpoint
- [ ] Implement intent detection with GPT-4
- [ ] Basic responses for NEW contacts

### Phase 2: Smart Routing (Week 2-3)
- [ ] Stage-aware response generation
- [ ] Case creation automation
- [ ] Test with 5-10 real messages
- [ ] Refine prompts based on results

### Phase 3: Admin Dashboard (Week 3-4)
- [ ] WhatsApp contacts management UI
- [ ] Conversation history viewer
- [ ] Manual response sending
- [ ] Analytics: conversion funnel

### Phase 4: Advanced Features (Week 4+)
- [ ] Diagnostic test scheduling
- [ ] Tutor bid notifications
- [ ] Parent feedback integration
- [ ] Predictive next-best-action recommendations

---

## 📊 Analytics & Metrics

Track these KPIs per conversation:

```
Funnel Metrics:
- new → conversational: X% convert (conversation rate)
- conversational → detailed_inquiry: X% convert
- detailed_inquiry → case_created: X% convert
- case_created → diagnostic_booked: X% convert
- diagnostic_booked → matched: X% convert

Message Metrics:
- Average message count per conversion stage
- AI response confidence by intent type
- Response time (time from parent message to AI response)
- User satisfaction (follow-up messages indicating satisfaction)

Trend Metrics:
- Messages per day
- Contacts per day
- Case creation rate
- Diagnostic booking rate
```

---

## 🎓 Example Flows

### **Flow 1: Browse → Browse Again → Engage**

```
Day 1 - First Contact:
Parent: "Hi"
→ Stage: new → conversational
AI: Welcome + menu

Parent: "Do you have Primary tuition?"
→ Extract: level = "Primary"
AI: Yes, details about primary tutors

Day 3 - Returns:
Parent: "What subjects can you cover?"
→ Stage: Still conversational (no submission)
AI: Full subject list + level options

Day 7 - Ready to Submit:
Parent: "I need P3 math help, East Coast area"
→ Stage: case_created
AI: Create case + wait for bids
```

### **Flow 2: Direct Submission**

```
First Contact:
Parent: "Need O-level chemistry tutor ASAP"
→ Stage: new → detailed_inquiry → case_created
AI: Direct case creation + confirmation

Bids come in → Parent reviews
Submits diagnostic → System schedules test
Test complete → Admin assigns tutor
→ Stage: matched
```

---

## ✅ Success Criteria

By implementing this system:

✅ **Personalization**: Each parent gets contextual, relevant responses  
✅ **Efficiency**: Auto-capture subject/level/location from messages  
✅ **Conversion**: Guide parents through journey naturally  
✅ **Scale**: AI handles 90% of initial inquiries  
✅ **Tracking**: Know where each parent is in the funnel  
✅ **Support**: Admin can step in seamlessly when needed  

---

## 📝 Notes

- **Intent Detection Confidence**: Only auto-action if confidence > 0.85; otherwise ask clarification
- **Escalation**: If AI confidence low or admin needed, route to human team
- **Message History**: Always review conversation for context before generating response
- **Privacy**: Never store sensitive data (credit card, ID numbers, etc.)
- **Tone**: Keep friendly, encouraging, never pushy

---

Last Updated: February 2024
Version: 1.0 - Specification Complete
