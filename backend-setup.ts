/**
 * Express Backend Setup for Form Handling
 * Install: npm install express cors dotenv multer uuid
 * 
 * Copy this to your backend server (e.g., backend/server.ts)
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
interface Submission {
  id: string;
  type: 'parent' | 'tutor';
  data: any;
  submittedAt: string;
  status: string;
  notes?: string;
}

const submissions: Submission[] = [];

// Admin authentication middleware
const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (token !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * POST /api/forms/parent - Submit parent form
 */
app.post('/api/forms/parent', (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const submission: Submission = {
      id,
      type: 'parent',
      data: req.body,
      submittedAt: req.body.submittedAt || new Date().toISOString(),
      status: 'pending',
    };

    submissions.push(submission);

    // Send confirmation email (implement with Resend/SendGrid/etc.)
    console.log(`Parent form submitted: ${id}`);
    console.log(`Email should be sent to: ${req.body.email}`);

    res.json({ success: true, id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit form' });
  }
});

/**
 * POST /api/forms/tutor - Submit tutor form with file
 */
app.post('/api/forms/tutor', upload.single('certificationFile'), (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    
    let certFile = null;
    if (req.file) {
      certFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
      };
    }

    const formData = {
      ...req.body,
      subjects: JSON.parse(req.body.subjects || '[]'),
      levels: JSON.parse(req.body.levels || '[]'),
      certificationFile: certFile,
    };

    const submission: Submission = {
      id,
      type: 'tutor',
      data: formData,
      submittedAt: req.body.submittedAt || new Date().toISOString(),
      status: 'pending',
    };

    submissions.push(submission);

    console.log(`Tutor form submitted: ${id}`);
    console.log(`Email should be sent to: ${req.body.email}`);

    res.json({ success: true, id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit form' });
  }
});

/**
 * GET /api/forms/all - Get all submissions (admin only)
 */
app.get('/api/forms/all', authenticateAdmin, (req: Request, res: Response) => {
  res.json(submissions);
});

/**
 * GET /api/forms/:id - Get single submission (admin only)
 */
app.get('/api/forms/:id', authenticateAdmin, (req: Request, res: Response) => {
  const submission = submissions.find(s => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  res.json(submission);
});

/**
 * PATCH /api/forms/:id - Update submission status (admin only)
 */
app.patch('/api/forms/:id', authenticateAdmin, (req: Request, res: Response) => {
  const submission = submissions.find(s => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  submission.status = req.body.status;
  submission.notes = req.body.notes || submission.notes;

  // Trigger email notification if status changed to "matched" or "verified"
  console.log(`Submission ${req.params.id} status updated to: ${req.body.status}`);

  res.json({ success: true });
});

/**
 * GET /api/admin/stats - Get dashboard stats (admin only)
 */
app.get('/api/admin/stats', authenticateAdmin, (req: Request, res: Response) => {
  const parentForms = submissions.filter(s => s.type === 'parent');
  const tutorForms = submissions.filter(s => s.type === 'tutor');

  res.json({
    totalSubmissions: submissions.length,
    parentRequests: parentForms.length,
    tutorApplications: tutorForms.length,
    pendingApprovals: submissions.filter(s => s.status === 'pending').length,
    activeMatches: submissions.filter(s => s.status === 'matched').length,
    verifiedTutors: submissions.filter(s => s.type === 'tutor' && s.status === 'verified').length,
  });
});

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Form handling server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/forms/parent - Submit parent form');
  console.log('  POST /api/forms/tutor - Submit tutor form');
  console.log('  GET /api/forms/all - Get all submissions (admin)');
  console.log('  PATCH /api/forms/:id - Update submission status (admin)');
});
