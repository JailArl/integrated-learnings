# Multi-Service Website Structure

## Overview
Your website now supports **two separate services** under one domain (`integratedlearnings.com.sg`) while maintaining **MOE compliance** by keeping tuition and school enrichment completely separated.

## Website Structure

```
integratedlearnings.com.sg/
├── / (Main Landing Page)
│   ├── Overview of both services
│   ├── Link to Tuition Services
│   └── Link to School Enrichment Program
│
├── /tuition (Tuition Services - For Parents & Students)
│   ├── /tuition (Home)
│   ├── /tuition/pricing
│   ├── /tuition/about
│   ├── /tuition/contact
│   ├── /tuition/parents (Parent Dashboard)
│   ├── /tuition/tutors (Tutor Dashboard)
│   └── All existing tuition-related pages
│
└── /enrichment (School Enrichment - For Schools ONLY)
    ├── /enrichment (Program Overview)
    ├── /enrichment/login (Student Login with Access Code)
    └── ZERO mention of tuition services (MOE compliant)
```

## Key Features

### 1. **Separate Landing Pages**
- **Main Landing** (`/`): Neutral corporate page with both services
- **Tuition Home** (`/tuition`): All your current tuition content
- **Enrichment Home** (`/enrichment`): School program information

### 2. **MOE Compliance**
The enrichment section is **completely isolated**:
- ✅ No tuition service mentions
- ✅ Different header/footer design
- ✅ No WhatsApp button
- ✅ School-focused contact info
- ✅ Separate branding colors (green vs blue)

### 3. **Smart Navigation**
- Navigation adapts based on current section
- Tuition section shows tuition menu
- Enrichment section shows minimal school-focused menu
- Main landing shows both service options

### 4. **Backward Compatibility**
Old links automatically redirect to new structure:
- `/pricing` → `/tuition/pricing`
- `/about` → `/tuition/about`
- All existing links work!

## For School Presentations

When presenting to schools:
1. **Show only**: `integratedlearnings.com.sg/enrichment`
2. **Students login at**: `integratedlearnings.com.sg/enrichment/login`
3. **NO tuition content visible** in this section

## Game Integration (Ready for Your Developer)

The structure is ready for game integration:

### Student Login Flow:
1. School provides students with access codes
2. Students visit `/enrichment/login`
3. Enter access code
4. System validates and launches game

### API Endpoints Needed:
- `POST /api/auth/student-login` - Validate access code
- `POST /api/game/save-progress` - Save game state
- `GET /api/game/get-progress` - Load game state
- `POST /api/game/submit-results` - Submit completion/scores

### Database Tables Needed:
- `schools` - School information
- `student_access_codes` - Access codes linked to schools/classes
- `game_sessions` - Active game sessions
- `game_progress` - Student progress and decisions
- `game_results` - Final scores and analytics

## Files Changed

### New Files:
- `pages/MainLanding.tsx` - Main entry point
- `pages/TuitionHome.tsx` - Tuition service home (copy of old Home.tsx)
- `pages/EnrichmentHome.tsx` - School enrichment home

### Modified Files:
- `App.tsx` - Updated routing for three sections
- `components/Layout.tsx` - Dynamic navigation based on section

## Next Steps

### Phase 1: Content (Done ✓)
- [x] Main landing page created
- [x] Tuition section separated
- [x] Enrichment section created
- [x] MOE-compliant separation

### Phase 2: Game Integration (Upcoming)
- [ ] Upload Excel file with data structure
- [ ] Design database schema
- [ ] Create API endpoints
- [ ] Build student authentication
- [ ] Integrate game platform
- [ ] Create teacher dashboard
- [ ] Build analytics/reporting

### Phase 3: Deployment
- [ ] Test all routes
- [ ] Update meta tags for SEO
- [ ] Deploy to production
- [ ] Configure domain
- [ ] Test on mobile devices

## Testing Locally

Run the development server:
```bash
npm run dev
```

Test these URLs:
- `http://localhost:5173/#/` - Main landing
- `http://localhost:5173/#/tuition` - Tuition home
- `http://localhost:5173/#/enrichment` - School program
- `http://localhost:5173/#/enrichment/login` - Student login

## Contact Information

Update these in your files as needed:
- **Tuition**: manage.integrated.learnings@gmail.com / WhatsApp: 9888 2675
- **Schools**: schools@integratedlearnings.com.sg

---

**Important**: When pitching to schools, ONLY show the `/enrichment` route. No cross-promotion of tuition services.
