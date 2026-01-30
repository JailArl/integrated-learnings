# Parent Dashboard Improvements - Implementation Plan

## Issues to Fix

### 1. Parent Dashboard - Show Parent Name ❌
**Current:** Shows "Your Account" instead of parent name
**Fix Needed:**
- Load parent profile using `getTutorProfile` equivalent for parents
- Display parent name in dashboard header: "Welcome, [Parent Name]!"

### 2. Parent Request Form - Field Validation ❌
**Current:** Some fields are optional
**Fix Needed:**
- Make ALL fields compulsory:
  - Student Name (required)
  - Student Level (required) 
  - Subjects (required, at least 1)
  - Address (required)
  - Postal Code (required)
  - Type of Tutor (NEW - required)

### 3. Parent Request Form - Add Postal Code to Address Lookup ❌
**Current:** Separate postal code field
**Fix Needed:**
- Add address lookup API call after postal code entry
- Show "Searching for address..." loading state
- Display available addresses based on postal code
- Let parent select from list or enter custom address

### 4. Replace "Preferred Experience Level" with "Type of Tutor" ❌
**Current:** Form asks for "Preferred experience level"
**Fix Needed:**
- Remove experience level field
- Add dropdown for "Type of Tutor" with options:
  - Undergraduate
  - Full-Time Tutor
  - MOE/Ex-MOE Teacher

### 5. Remove "Teaching Style" Field ❌
**Current:** Shows teaching style selector
**Fix Needed:**
- Remove entire teaching style section from form

### 6. Fix Submit Button - UI Blocking (INP Issue) ❌
**Current:** Blocks UI for 2+ seconds on submit
**Fix Needed:**
- Yield to UI thread before async operation
- Show loading state immediately
- Use try/catch for error handling

## File Changes Needed

**pages/NewParentDashboard.tsx:**
1. Import parent profile fetching function
2. Add parent name state
3. Load parent profile in useEffect
4. Display parent name in header
5. Add TUTOR_TYPES constant
6. Add tutorType to RequestFormData interface
7. Initialize formData with tutorType: ''
8. Add tutor type selector to form
9. Remove teaching style field (if present)
10. Improve form validations with .trim() checks
11. Add UI thread yield in handleSubmit
12. Add try/catch error handling

**services/platformApi.ts:**
1. Add getParentProfile function (if not exists)
2. Add address lookup function for postal codes (if Singapore has API)

## Implementation Order
1. ✅ Add tutor type constant
2. ⏳ Update request form data interface  
3. ⏳ Improve form validation
4. ⏳ Add tutor type selector
5. ⏳ Fix submit button UI blocking
6. ⏳ Load and display parent name
7. ⏳ Add address lookup (optional - depends on API availability)
