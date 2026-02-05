# AI Interview & Ranking System - Implementation Guide

## Overview

This guide documents the **Dynamic AI Question Generation** and **AI-Powered Tutor Ranking System** implemented for the integrated learnings platform.

---

## 🎯 Features Implemented

### 1. Dynamic Question Generation
The AI interview now personalizes questions based on each tutor's background:

- **Tutor Profile Context**: Uses subjects taught, years of experience, and qualifications
- **Balanced Assessment**: 50% teaching strengths + 50% personality traits
- **Question Count**: 7-10 personalized questions per interview
- **7 Scoring Dimensions**: 
  - Patience (1-10)
  - Empathy (1-10)
  - Communication (1-10)
  - Professionalism (1-10)
  - Subject Mastery (1-10) *NEW*
  - Teaching Ability (1-10) *NEW*
  - Overall Score (1-10)

### 2. AI Ranking System
Comprehensive tutor quality assessment using GPT-4:

- **Ranking Score**: 1-100 scale
- **Weighted Criteria**:
  - Interview Performance (40%)
  - Certificate Quality (30%)
  - Response Time (15%)
  - Completion Rate (15%)
- **AI Reasoning**: Detailed assessment explaining the ranking
- **Admin Dashboard**: Leaderboard with filtering and sorting

---

## 📁 Files Modified/Created

### New Files

1. **services/aiRanking.ts**
   - `calculateTutorRanking()` - Main ranking calculation function
   - `getTutorForRanking()` - Fetches tutor data for ranking
   - `calculateAllTutorRankings()` - Batch process all tutors
   - `saveTutorRanking()` - Saves ranking to database

2. **components/AdminTutorRanking.tsx**
   - Admin dashboard leaderboard component
   - Displays ranked tutors with visual indicators
   - Individual and batch ranking recalculation
   - Detailed score breakdowns and AI assessments
   - Sorting options (by ranking, interview, recent)

### Modified Files

1. **services/aiInterview.ts**
   - `generateSystemPrompt(tutorProfile)` - Dynamic prompt generation
   - Updated `InterviewScore` interface (added 2 new fields)
   - Modified `sendInterviewMessage()` to accept tutorProfile
   - Updated `extractScoresFromResponse()` for 7 scores

2. **components/AIInterview.tsx**
   - Added `tutorProfile` prop
   - Pass profile to `sendInterviewMessage()`
   - Display all 7 score dimensions
   - Updated grid layout for score cards

3. **pages/TutorAIInterview.tsx**
   - Fetch full tutor profile (already existed)
   - Pass `tutorProfile` to AIInterview component

4. **components/AdminDashboard.tsx**
   - Added 'rankings' tab to navigation
   - Import and render AdminTutorRanking component
   - Updated activeTab type definition

5. **phase1-database-updates.sql**
   - Added `ai_interview_assessment` TEXT
   - Added `ranking_score` INTEGER
   - Added `ai_ranking_assessment` TEXT
   - Added `response_time_avg` INTEGER
   - Added `completion_rate` DECIMAL(5,2)
   - Added `ranking_updated_at` TIMESTAMP
   - Added index on ranking_score for performance

---

## 🗄️ Database Schema Updates

Run the updated `phase1-database-updates.sql` in Supabase SQL Editor:

```sql
ALTER TABLE tutor_profiles
ADD COLUMN IF NOT EXISTS ai_interview_assessment TEXT,
ADD COLUMN IF NOT EXISTS ranking_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_ranking_assessment TEXT,
ADD COLUMN IF NOT EXISTS response_time_avg INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ranking_updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_ranking 
ON tutor_profiles(ranking_score DESC NULLS LAST);
```

---

## 🚀 How It Works

### Dynamic Question Generation Flow

1. **Tutor starts AI interview** → TutorAIInterview.tsx loads
2. **Profile fetched** → Includes subjects, experience_years, qualification
3. **First message sent** → `sendInterviewMessage()` receives tutorProfile
4. **Dynamic prompt generated** → `generateSystemPrompt(tutorProfile)` creates personalized system prompt
5. **OpenAI processes** → GPT-4 generates questions based on tutor's background
6. **Conversation continues** → Questions adapt to tutor's specific subjects and experience level
7. **Completion** → All 7 scores extracted from AI response

### AI Ranking Flow

1. **Admin opens Rankings tab** → AdminTutorRanking.tsx loads
2. **Tutors fetched** → All tutors with `ai_interview_status = 'completed'`
3. **Admin clicks "Recalculate All"** or individual recalculate button
4. **For each tutor**:
   - `getTutorForRanking()` fetches complete data
   - `calculateTutorRanking()` sends data to GPT-4
   - GPT-4 evaluates using weighted criteria
   - Returns JSON: `{ rankingScore, assessment, breakdown }`
   - `saveTutorRanking()` updates database
5. **Leaderboard updates** → Sorted by ranking score
6. **Admin views details** → Click eye icon to see full breakdown and AI reasoning

---

## 📊 Ranking Calculation Details

### Weighted Scoring

**Interview Performance (40 points)**
- Overall interview score
- Individual dimension scores (patience, empathy, etc.)
- Subject mastery and teaching ability (new metrics)

**Certificate Quality (30 points)**
- Number of certificates uploaded
- Number of approved certificates
- Types and relevance of certifications

**Response Time (15 points)**
- Average time to respond to case opportunities
- Excellent: <30 mins (15 pts)
- Good: 30-120 mins (10-12 pts)
- Average: 2-24 hours (5-9 pts)
- Poor: >24 hours (0-4 pts)

**Completion Rate (15 points)**
- Percentage of accepted cases completed
- Excellent: 90%+ (15 pts)
- Good: 70-89% (10-12 pts)
- Average: 50-69% (5-9 pts)
- Poor: <50% (0-4 pts)

### Score Interpretation

- **80-100**: Exceptional - Top tier tutors
- **60-79**: Good - Reliable and competent
- **40-59**: Average - Needs development
- **0-39**: Needs Improvement - Additional training required

---

## 🎨 Admin Dashboard Features

### Leaderboard Display

- **Visual Rank Indicators**:
  - 🏆 Gold Trophy (1st place)
  - 🥈 Silver Medal (2nd place)
  - 🥉 Bronze Medal (3rd place)
  - 🏅 Blue Award (4th+)

- **Sortable Columns**:
  - Ranking Score
  - Interview Score
  - Recently Updated

- **Quick Stats**:
  - Name and subjects
  - Experience years
  - Ranking score with color coding
  - Interview score (/10)
  - Approved certificates count
  - Response time (minutes/hours)
  - Completion rate (%)

- **Actions**:
  - 👁️ View detailed breakdown
  - 🔄 Recalculate individual ranking
  - 🔄 Batch recalculate all tutors

### Details Modal

When viewing a tutor's ranking details:

- **Overall Score**: Large display with label
- **Score Breakdown**: 4 cards showing points earned out of max
  - Interview Performance (/40)
  - Certificate Quality (/30)
  - Response Time (/15)
  - Completion Rate (/15)
- **AI Assessment**: Full explanation of ranking decision
- **Last Updated**: Timestamp of ranking calculation

---

## 🧪 Testing Guide

### Test Dynamic Questions

1. **Create Test Tutors** with different profiles:
   - Tutor A: Math, 5 years, Bachelor's Degree
   - Tutor B: English, 2 years, Teaching Certificate
   - Tutor C: Science, 10 years, PhD

2. **Complete AI Interviews** for each tutor

3. **Verify Personalization**:
   - Math tutor should get questions about problem-solving, numerical concepts
   - English tutor should get questions about reading comprehension, writing
   - Science tutor should get questions about experiments, scientific method

4. **Check Scores**: All 7 dimensions should be populated in database

### Test AI Ranking

1. **Complete prerequisites**:
   - Run database migration SQL
   - Ensure tutors have completed AI interviews
   - Add some certificates to tutors

2. **Access Admin Dashboard**:
   - Login as admin
   - Navigate to "Rankings" tab

3. **Initial Calculation**:
   - Click "Recalculate All"
   - Wait for completion (shows progress)
   - Verify leaderboard populates

4. **Test Individual Recalculation**:
   - Click refresh icon on specific tutor
   - New score should appear

5. **Test Sorting**:
   - Click "By Ranking Score" - descending order
   - Click "By Interview Score" - sort by interview
   - Click "Recently Updated" - most recent first

6. **Test Details Modal**:
   - Click eye icon on any tutor
   - Verify all 4 breakdown scores
   - Read AI assessment
   - Check timestamp

### Test Edge Cases

- **No interviews completed**: Should show empty state
- **Missing certificates**: Should still calculate (lower score)
- **New tutor (no response time data)**: Should default to 0
- **100% completion rate**: Should get full 15 points

---

## 🔧 Configuration

### Environment Variables

Ensure `.env` includes:

```env
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxx
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### OpenAI API Configuration

- **Model**: GPT-4 Turbo Preview
- **Temperature**: 0.3 (for consistent scoring)
- **Max Tokens**: 
  - Interview: 600 (dynamic questions need more space)
  - Ranking: 800 (detailed assessments)
- **Response Format**: JSON for ranking (structured output)

---

## 📈 Performance Considerations

### Optimization Tips

1. **Ranking Calculation**:
   - Batch processing includes 1-second delay between tutors to avoid rate limits
   - Can be run asynchronously (admin sees progress)
   - Results cached in database

2. **Database Queries**:
   - Indexed ranking_score column for fast sorting
   - Limit query to completed interviews only
   - Use select with specific columns (not *)

3. **API Costs**:
   - Interview: ~$0.01 per tutor (600 tokens)
   - Ranking: ~$0.02 per tutor (800 tokens)
   - Batch recalculation for 100 tutors: ~$2

---

## 🐛 Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Check `.env` file exists and has `VITE_OPENAI_API_KEY`
- Restart dev server after adding

**"No ranked tutors yet"**
- Ensure tutors have completed AI interviews
- Check `ai_interview_status = 'completed'` in database
- Run "Recalculate All" button

**Ranking shows NULL**
- Database migration may not have run
- Check if `ranking_score` column exists
- Manually add columns from phase1-database-updates.sql

**Interview questions not personalized**
- Verify tutorProfile is passed to AIInterview component
- Check tutor_profiles has subjects, experience_years, qualification
- Review browser console for errors

**TypeScript errors after implementation**
- Run `npm install` to ensure dependencies
- Check all imports are correct
- Verify interface definitions match usage

---

## 🎓 Usage Examples

### Example System Prompt (Dynamic)

For tutor teaching **Math, 5 years experience, Bachelor's Degree**:

```
You are an expert education interviewer...

TUTOR CONTEXT:
- Subjects: Math, Algebra, Geometry
- Experience: 5 years
- Qualification: Bachelor's Degree in Mathematics

ASSESSMENT AREAS:
Teaching Strengths (50%): Subject knowledge, lesson planning, explanation skills
Personality Traits (50%): Patience, empathy, communication, professionalism

Generate 7-10 personalized questions covering:
1. How they explain complex mathematical concepts
2. Strategies for students struggling with algebra
3. Lesson planning for geometry topics
4. Patience when students don't understand
5. Building confidence in math-anxious students
...
```

### Example Ranking Output

```json
{
  "rankingScore": 82,
  "assessment": "This tutor demonstrates exceptional teaching ability with strong subject mastery in mathematics. Interview scores are consistently high across all dimensions, particularly in patience (9/10) and communication (9/10). Has 3 approved certificates including a teaching degree. Response time is excellent at 25 minutes average. Completion rate of 92% shows high reliability. Overall, this is a top-tier tutor suitable for priority matching.",
  "breakdown": {
    "interviewScore": 36,
    "certificateScore": 27,
    "responseTimeScore": 14,
    "completionRateScore": 14
  }
}
```

---

## 🚧 Future Enhancements

### Potential Improvements

1. **Machine Learning Integration**:
   - Train model on successful tutor patterns
   - Predict tutor success probability
   - Automated matching optimization

2. **Real-time Ranking Updates**:
   - Webhook triggers on new interview completion
   - Auto-recalculate when certificates approved
   - Live leaderboard updates

3. **Parent Feedback Integration**:
   - Add parent ratings to ranking formula
   - Student progress metrics (5-10% weight)
   - Case outcomes as quality indicator

4. **Advanced Analytics**:
   - Ranking trends over time
   - Subject-specific rankings
   - Geographic performance comparisons

5. **Gamification**:
   - Achievement badges
   - Milestone rewards
   - Monthly top tutor spotlight

---

## ✅ Checklist for Deployment

- [ ] Run database migration: `phase1-database-updates.sql`
- [ ] Verify OpenAI API key in `.env`
- [ ] Test dynamic questions with 3+ different tutor profiles
- [ ] Complete at least 5 tutor interviews
- [ ] Run "Recalculate All" rankings successfully
- [ ] Verify leaderboard displays correctly
- [ ] Test details modal for ranking breakdown
- [ ] Check all 7 score dimensions appear
- [ ] Ensure no TypeScript compilation errors
- [ ] Push code to GitHub
- [ ] Deploy to Vercel/production
- [ ] Monitor API usage and costs

---

## 📞 Support

For issues or questions:
- Check this guide first
- Review browser console for errors
- Inspect database schema in Supabase
- Verify OpenAI API key is valid and has credits
- Check network tab for failed API requests

---

## 📝 Summary

**What's New:**
✅ Dynamic AI interview questions personalized to each tutor
✅ 7 scoring dimensions (added Subject Mastery & Teaching Ability)
✅ AI-powered tutor ranking (1-100 scale)
✅ Weighted criteria: Interview 40%, Certs 30%, Response 15%, Completion 15%
✅ Admin leaderboard with sorting and filtering
✅ Detailed ranking breakdowns with AI reasoning
✅ Batch and individual ranking recalculation

**Impact:**
- Better interview quality and relevance
- Objective tutor quality assessment
- Data-driven matching decisions
- Incentivizes tutor improvement
- Transparency in tutor selection

---

Last Updated: January 2024
Version: 2.0
