// Backend API endpoint to proxy OpenAI calls for AI Interview
// This avoids CORS issues and keeps the API key secure

import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SendInterviewRequest {
  systemPrompt: string;
  messages: InterviewMessage[];
}

interface SendInterviewResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * POST /api/interview/message
 * Proxy OpenAI API call for interview messages
 */
router.post('/api/interview/message', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured on server',
      });
    }

    const { systemPrompt, messages } = req.body as SendInterviewRequest;

    if (!systemPrompt || !messages) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: systemPrompt, messages',
      });
    }

    // Call OpenAI API from server (avoids CORS issues)
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({
        success: false,
        error: error.error?.message || 'OpenAI API error',
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return res.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error('Interview API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process interview response',
    });
  }
});

export default router;
