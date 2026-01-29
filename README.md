# 🎓 Integrated Learnings Platform

A comprehensive educational platform offering personalized tuition services and school enrichment programs in Singapore. Diagnostic-driven matching for academic excellence.

## Features

✅ **Personalized Tuition Service** - Connect students with qualified tutors for exam prep, subject mastery, and exam techniques  
✅ **School Enrichment Programs** - Interactive game-based financial literacy programs for schools  
✅ **Admin Dashboard** - Manage tutors, parents, and submissions  
✅ **Student & Tutor Portals** - Dedicated dashboards for tracking progress and availability  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Supabase Integration** - Secure authentication and database backend  

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Supabase (Auth + Database)
- **Routing:** React Router with HashRouter
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Run Locally

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables** - Create `.env.local`:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run the dev server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Main site: `http://localhost:5173/#/`
   - Admin dashboard: `http://localhost:5173/#/admin` (password: `admin123`)

## Deployment

Deploy to **Vercel** or **Netlify**:

1. Push code to GitHub
2. Connect your repository to Vercel/Netlify
3. Add environment variables in the platform settings
4. Deploy!

See [PLATFORM_SETUP_GUIDE.md](PLATFORM_SETUP_GUIDE.md) for detailed deployment instructions.

## Project Structure

```
├── pages/              # Page components (Home, Tuition, Enrichment, etc.)
├── components/         # Reusable components (Layout, Dashboard, etc.)
├── services/           # API and Supabase integration
├── styles/             # Tailwind CSS configuration
└── public/             # Static assets
```

## Support & Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md)
- [Platform Setup Guide](PLATFORM_SETUP_GUIDE.md)
- [Multi-Service Setup](MULTI_SERVICE_SETUP.md)
- [Admin Dashboard Guide](ADMIN_DASHBOARD_QUICK_START.md)
