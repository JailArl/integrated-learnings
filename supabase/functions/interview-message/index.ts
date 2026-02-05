// supabase/functions/interview-message/index.ts
// Supabase Edge Function to proxy OpenAI calls for AI Interview

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { systemPrompt, messages } = await req.json()

    if (!systemPrompt || !messages) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing systemPrompt or messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

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
    })

    if (!response.ok) {
      const error = await response.json()
      return new Response(
        JSON.stringify({
          success: false,
          error: error.error?.message || 'OpenAI API error',
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Interview function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process request',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
