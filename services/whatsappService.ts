import { supabase } from './supabase';

/**
 * WhatsApp Messaging System
 * 
 * Contact Categorization:
 * - NEW: First message - send welcome menu
 * - REGISTERED: Returned user with saved parent profile
 * - ENQUIRY_SUBMITTED: Has submitted a case request
 * - DIAGNOSTIC_BOOKED: Diagnostic test scheduled
 * - CASE_MATCHED: Assigned to a tutor
 * 
 * Conversion Stages:
 * - new → conversational → detailed_inquiry → case_created → diagnostic_booked → matched
 */

export interface WhatsAppContact {
  id: string;
  phoneNumber: string;
  contactStatus: 'new' | 'registered' | 'enquiry_submitted' | 'diagnostic_booked' | 'case_matched';
  parentId?: string;
  firstMessageDate: string;
  lastMessageDate: string;
  messageCount: number;
  conversionStage: string;
  preferredSubject?: string;
  studentLevel?: string;
  hasSubmittedEnquiry: boolean;
  hasBookedDiagnostic: boolean;
  hasActiveCase: boolean;
  notes?: string;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  messageType: 'parent_message' | 'ai_response' | 'admin_message' | 'system_notification';
  content: string;
  intent?: string;
  detectedIntentConfidence?: number;
  aiGenerated: boolean;
  timestamp: string;
}

export interface DetectedIntent {
  type: 'greeting' | 'question_inquiry' | 'case_creation' | 'diagnostic_inquiry' | 'support' | 'unknown';
  confidence: number;
  extractedData?: {
    subjects?: string[];
    studentLevel?: string;
    location?: string;
  };
}

// Categorize parent based on their WhatsApp interaction history
export const categorizeParent = async (phoneNumber: string): Promise<WhatsAppContact | null> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data: contact, error } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (new contact)
      throw error;
    }

    if (!contact) {
      // NEW contact - create entry
      return await createWhatsAppContact(phoneNumber);
    }

    return contact as WhatsAppContact;
  } catch (error: any) {
    console.error('Error categorizing parent:', error);
    return null;
  }
};

// Create new WhatsApp contact
const createWhatsAppContact = async (phoneNumber: string): Promise<WhatsAppContact> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: contact, error } = await supabase
    .from('whatsapp_contacts')
    .insert({
      phone_number: phoneNumber,
      contact_status: 'new',
      conversion_stage: 'new',
      message_count: 0,
      has_submitted_enquiry: false,
      has_booked_diagnostic: false,
      has_active_case: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`);
  }

  return contact as WhatsAppContact;
};

// Detect intent from parent message
export const detectMessageIntent = async (
  message: string,
  contactData: WhatsAppContact
): Promise<DetectedIntent> => {
  const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      type: 'unknown',
      confidence: 0,
    };
  }

  try {
    const systemPrompt = `You are an expert at understanding parent inquiries about tutoring. Analyze the message and detect the user's intent.

PARENT CONTEXT:
- Contact Status: ${contactData.contactStatus}
- Conversion Stage: ${contactData.conversionStage}
- Has submitted enquiry: ${contactData.hasSubmittedEnquiry}
- Has booked diagnostic: ${contactData.hasBookedDiagnostic}

Detect the intent and extract relevant information. Return JSON with:
{
  "intent": "greeting|question_inquiry|case_creation|diagnostic_inquiry|support|unknown",
  "confidence": 0.0-1.0,
  "extractedData": {
    "subjects": ["subject1", "subject2"],
    "studentLevel": "primary/secondary/jc/university",
    "location": "location if mentioned",
    "urgency": "high/medium/low"
  },
  "reasoning": "why this intent"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      type: result.intent,
      confidence: result.confidence,
      extractedData: result.extractedData,
    };
  } catch (error: any) {
    console.error('Error detecting intent:', error);
    return {
      type: 'unknown',
      confidence: 0,
    };
  }
};

// Generate appropriate AI response based on contact stage and intent
export const generateAIResponse = async (
  contact: WhatsAppContact,
  parentMessage: string,
  detectedIntent: DetectedIntent
): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return 'Sorry, I\'m unable to process your message right now. Please try again later.';
  }

  try {
    let systemPrompt = '';

    // Customize response based on contact stage
    if (contact.conversionStage === 'new') {
      systemPrompt = `You are a friendly WhatsApp assistant for integrated-learnings tutoring platform. This is a NEW parent contacting us for the first time. They may have just said "Hi" or asked a basic question.

Generate a warm, brief (1-2 sentences + options) response that:
1. Welcomes them
2. Guides them on what to do next
3. Uses a friendly, conversational tone

Keep it SHORT for WhatsApp. Include emoji where appropriate.`;
    } else if (contact.conversionStage === 'conversational') {
      systemPrompt = `You are a WhatsApp assistant for a tutoring platform. This parent is asking about our tutors/services.

Respond helpfully and concisely. Based on their question, provide:
1. A direct answer
2. Next steps (what they can do)

Intent detected: ${detectedIntent.type}
Subject (if mentioned): ${detectedIntent.extractedData?.subjects?.join(', ') || 'Not specified'}
Student Level: ${detectedIntent.extractedData?.studentLevel || 'Not specified'}

Keep response SHORT for WhatsApp (max 150 words). Be conversational and helpful.`;
    } else if (contact.conversionStage === 'detailed_inquiry') {
      systemPrompt = `You are a WhatsApp assistant. This parent is providing detailed information about their tutoring needs.

Summarize their requirements and:
1. Confirm what you understood
2. Explain next steps (we'll match them with tutors, they can review bids, etc.)
3. Ask for any missing information

Keep it SHORT but helpful. Use emoji where appropriate.`;
    } else {
      // Default for other stages
      systemPrompt = `You are a helpful WhatsApp assistant for integrated-learnings. Respond helpfully to this parent's message. Keep it SHORT (max 150 words) and conversational.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: parentMessage },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return 'Sorry, I\'m having trouble processing your message. A team member will review it shortly!';
  }
};

// Update contact status based on conversion stage
export const updateContactStatus = async (
  contactId: string,
  stage: string
): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Map conversion stage to contact status
  const statusMap: Record<string, string> = {
    'new': 'new',
    'conversational': 'registered',
    'detailed_inquiry': 'enquiry_submitted',
    'diagnostic_booked': 'diagnostic_booked',
    'matched': 'case_matched',
  };

  const { error } = await supabase
    .from('whatsapp_contacts')
    .update({
      conversion_stage: stage,
      contact_status: statusMap[stage] || 'registered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId);

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }
};

// Save conversation message
export const saveConversationMessage = async (
  contactId: string,
  messageType: 'parent_message' | 'ai_response' | 'admin_message',
  content: string,
  intent?: string,
  confidence?: number
): Promise<WhatsAppMessage> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: message, error } = await supabase
    .from('whatsapp_conversations')
    .insert({
      contact_id: contactId,
      message_type: messageType,
      content: content,
      intent: intent,
      detected_intent_confidence: confidence,
      ai_generated: messageType === 'ai_response',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  return message as WhatsAppMessage;
};

// Get conversation history
export const getConversationHistory = async (
  contactId: string,
  limit: number = 10
): Promise<WhatsAppMessage[]> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: messages, error } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('contact_id', contactId)
    .order('message_timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }

  return (messages || []).reverse() as WhatsAppMessage[]; // Reverse to show chronological order
};

// Get contact statistics for admin dashboard
export const getWhatsAppStatistics = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .select('contact_status, conversion_stage, count()');

    if (error) throw error;

    // Group by status and stage for analytics
    const statistics = {
      totalContacts: 0,
      byStatus: {} as Record<string, number>,
      byStage: {} as Record<string, number>,
    };

    // Calculate totals
    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        statistics.totalContacts += row.count || 0;
        const status = row.contact_status || 'unknown';
        const stage = row.conversion_stage || 'unknown';
        statistics.byStatus[status] = (statistics.byStatus[status] || 0) + (row.count || 0);
        statistics.byStage[stage] = (statistics.byStage[stage] || 0) + (row.count || 0);
      });
    }

    return statistics;
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    return {
      totalContacts: 0,
      byStatus: {},
      byStage: {},
    };
  }
};
