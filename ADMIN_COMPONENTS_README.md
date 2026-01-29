# Admin Dashboard Components

This document describes the three new admin components created for the platform's admin dashboard.

## Components Created

### 1. AdminMatching.tsx
**Location:** `/components/AdminMatching.tsx`  
**Route:** `/admin/matching`  
**Purpose:** Bid review and matching interface

#### Features:
- Fetches all parent requests using `getAllRequests()` from platformApi.ts
- Displays request details including:
  - Parent name
  - Student name and level
  - Requested subjects
  - Request status
  - Diagnostic test status
- "View Bids" button that expands to show all tutor bids for a request
- For each bid, displays:
  - Tutor name, qualification, experience years
  - Verification status with color-coded badges
  - Bid message
  - "View Questionnaire" button (opens modal showing questionnaire_answers JSONB data)
  - "View Certificates" button (shows list of certificates with download links)
  - "Approve Match" button (calls `approveBid(requestId, tutorId)`)
- "Mark Test Complete" button for requests with `test_booked` status
- Loading and error state handling
- Success/error messages with auto-dismissal

#### Key Functions:
- `fetchRequests()` - Loads all parent requests
- `fetchBidsForRequest(requestId)` - Loads bids for a specific request
- `handleApproveBid(requestId, tutorId)` - Approves a tutor bid and creates a match
- `handleMarkTestComplete(requestId)` - Marks diagnostic test as completed
- `openQuestionnaireModal(answers)` - Opens modal to view tutor questionnaire

### 2. AdminInvoices.tsx
**Location:** `/components/AdminInvoices.tsx`  
**Route:** `/admin/invoices`  
**Purpose:** Invoice generation for approved matches

#### Features:
- Fetches matches needing invoices using `getMatchesForInvoicing()` from platformApi.ts
- Displays matches where `invoice_generated = false`
- Shows match details:
  - Parent name
  - Student name
  - Tutor name and hourly rate
  - Diagnostic test status (and $50 fee if booked)
  - Match creation date
- "Generate Invoice" button that:
  - Calls `generateInvoice()` from platformApi.ts with proper data structure
  - Generates PDF invoice using jsPDF
  - Uploads invoice to Supabase storage
  - Updates match record with invoice URL
- Success message with download link for generated invoice
- Loading states during invoice generation
- Error handling with user-friendly messages

#### Key Functions:
- `fetchMatches()` - Loads all matches without invoices
- `handleGenerateInvoice(match)` - Generates and uploads invoice for a match

### 3. AdminVerification.tsx
**Location:** `/components/AdminVerification.tsx`  
**Route:** `/admin/verification`  
**Purpose:** Tutor verification and approval

#### Features:
- Fetches pending tutors using `getPendingTutors()` from platformApi.ts
- Lists all tutors with `verification_status = 'pending'`
- Shows comprehensive tutor details:
  - Name, email, phone
  - Qualification and experience years
  - Subjects and levels they can teach
  - Hourly rate
  - Application date
- Displays uploaded certificates with:
  - Certificate file names
  - Download links (opens in new tab)
- Action buttons:
  - "Approve" button (calls `verifyTutor(tutorId, 'verified')`)
  - "Reject" button (calls `verifyTutor(tutorId, 'rejected')`)
- Confirmation dialogs before approve/reject actions
- Success/error messages with auto-dismissal
- Processing states to prevent double-clicks

#### Key Functions:
- `fetchPendingTutors()` - Loads all tutors pending verification
- `handleVerifyTutor(tutorId, status)` - Approves or rejects a tutor application

## Common Features

All three components share these characteristics:

### UI Components
- Use existing UI components from `Components.tsx`:
  - `Section` - Container wrapper with consistent padding
  - `Card` - Content cards with title and styling
  - `Button` - Styled buttons with variants (primary, outline)

### State Management
- Loading states with user-friendly loading messages
- Error states with red error banners
- Success states with green success banners
- Auto-dismissal of success messages after 3-10 seconds

### TypeScript Typing
- Fully typed interfaces for all data structures
- Type-safe API calls
- Proper React.FC typing

### Responsive Design
- Mobile-friendly grid layouts
- Responsive columns (1 column on mobile, 2 on desktop)
- Proper spacing and padding for all screen sizes

### User Experience
- Confirmation dialogs for destructive actions
- Disabled states during processing
- Clear visual feedback for all actions
- Color-coded status badges (green/yellow/red)
- Expandable sections to reduce clutter

## Integration

### Routes Added to App.tsx
```typescript
import { AdminMatching } from './pages/AdminMatching';
import { AdminInvoices } from './pages/AdminInvoices';
import { AdminVerification } from './pages/AdminVerification';

// Routes:
<Route path="/admin/matching" element={<AdminRoute><AdminMatching /></AdminRoute>} />
<Route path="/admin/invoices" element={<AdminRoute><AdminInvoices /></AdminRoute>} />
<Route path="/admin/verification" element={<AdminRoute><AdminVerification /></AdminRoute>} />
```

### Navigation in AdminDashboard
The main AdminDashboard component (at `/admin`) now includes an "Admin Tools" section with navigation cards linking to:
- Bid Matching (`/admin/matching`)
- Invoice Generation (`/admin/invoices`)
- Tutor Verification (`/admin/verification`)

## API Dependencies

All components depend on functions from `services/platformApi.ts`:

### AdminMatching uses:
- `getAllRequests()` - Fetch all parent requests with nested parent and match data
- `getBidsForRequest(requestId)` - Fetch all bids for a request with tutor and certificate data
- `approveBid(requestId, tutorId)` - Create a match and update request status
- `markTestComplete(requestId)` - Mark diagnostic test as completed

### AdminInvoices uses:
- `getMatchesForInvoicing()` - Fetch matches without invoices
- `generateInvoice(matchData)` - Generate PDF invoice and upload to storage

### AdminVerification uses:
- `getPendingTutors()` - Fetch tutors with pending verification status
- `verifyTutor(tutorId, status)` - Update tutor verification status

## Database Tables Used

### AdminMatching:
- `parent_requests` - Parent tuition requests
- `tutor_bids` - Tutor bids on requests
- `tutor_profiles` - Tutor information and questionnaire answers
- `tutor_certificates` - Uploaded certificates
- `matches` - Approved tutor-parent matches

### AdminInvoices:
- `matches` - Approved matches
- `parent_requests` - Request details
- `parent_profiles` - Parent information
- `tutor_profiles` - Tutor information

### AdminVerification:
- `tutor_profiles` - Tutor applications
- `tutor_certificates` - Uploaded certificates

## Usage Instructions

### For Admins:

1. **Access Admin Dashboard**
   - Navigate to `/admin`
   - Enter admin password (currently: `admin123`)

2. **Bid Matching** (`/admin/matching`)
   - View all parent requests
   - Click "View Bids" to see tutor applications
   - Review tutor qualifications and certificates
   - Click "View Questionnaire" to see detailed answers
   - Click "Approve Match" to create a match
   - Use "Mark Test Complete" for diagnostic tests

3. **Invoice Generation** (`/admin/invoices`)
   - View all matched cases needing invoices
   - Verify parent, student, and tutor details
   - Click "Generate Invoice" to create PDF
   - Download generated invoice using the link

4. **Tutor Verification** (`/admin/verification`)
   - Review pending tutor applications
   - Check certificates and qualifications
   - Click "Approve" or "Reject" as appropriate
   - Approved tutors can then bid on cases

## Security Considerations

- All routes use `AdminRoute` wrapper for protection
- Requires admin authentication to access
- Confirmation dialogs for critical actions
- No direct database access from frontend
- All operations go through platformApi.ts
- Row Level Security (RLS) policies on database tables

## Future Enhancements

Potential improvements:
- Email notifications after match approval
- Bulk actions (approve multiple tutors at once)
- Advanced filtering and search
- Export functionality for invoices
- Match history and analytics
- Automated matching suggestions based on criteria
- Communication tools (messaging between admin and users)
