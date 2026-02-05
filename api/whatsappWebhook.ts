/**
 * WhatsApp Webhook Handler
 * 
 * Handles incoming WhatsApp messages from Twilio
 * Place this in your backend API routes: /api/webhook/whatsapp
 * 
 * This is pseudocode for a Node.js/Express backend
 * Adapt to your actual backend framework
 */

import {
  categorizeParent,
  detectMessageIntent,
  generateAIResponse,
  saveConversationMessage,
  updateContactStatus,
} from '../services/whatsappService';

/**
 * POST /api/webhook/whatsapp
 * 
 * Receives incoming messages from Twilio WhatsApp
 * Expected body format (form-data from Twilio):
 * {
 *   From: "whatsapp:+65912345678",
 *   To: "whatsapp:+1987654321",
 *   Body: "message content",
 *   MediaUrl0: "optional media URL",
 *   NumMedia: "0"
 * }
 */

export const handleWhatsAppIncoming = async (req: any, res: any) => {
  try {
    // 1. Extract message data
    const phoneNumber = req.body.From?.replace('whatsapp:', '') || '';
    const messageContent = req.body.Body || '';
    const mediaUrl = req.body.MediaUrl0 || null;

    if (!phoneNumber || !messageContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Categorize parent (NEW or REGISTERED)
    const contact = await categorizeParent(phoneNumber);
    if (!contact) {
      console.error('Failed to categorize contact:', phoneNumber);
      return res.status(500).json({ error: 'Failed to process contact' });
    }

    // 3. Save parent's message
    await saveConversationMessage(
      contact.id,
      'parent_message',
      messageContent
    );

    // 4. Detect intent from message
    const detectedIntent = await detectMessageIntent(messageContent, contact);

    // 5. Save intent metadata
    await saveConversationMessage(
      contact.id,
      'parent_message',
      messageContent,
      detectedIntent.type,
      detectedIntent.confidence
    );

    // 6. Generate AI response based on stage + intent
    const aiResponse = await generateAIResponse(
      contact,
      messageContent,
      detectedIntent
    );

    // 7. Update contact status based on progression
    // Stage transitions based on detected intent
    if (contact.conversionStage === 'new' && detectedIntent.type !== 'greeting') {
      // Parent asked a question → conversational
      await updateContactStatus(contact.id, 'conversational');
    } else if (
      contact.conversionStage === 'conversational' &&
      detectedIntent.type === 'case_creation'
    ) {
      // Parent provided details → create case
      await createCaseFromMessage(
        contact.id,
        detectedIntent.extractedData,
        messageContent
      );
      await updateContactStatus(contact.id, 'case_created');
    }

    // 8. Save AI response
    await saveConversationMessage(
      contact.id,
      'ai_response',
      aiResponse,
      'generated_response',
      1.0
    );

    // 9. Send response via Twilio
    await sendWhatsAppMessage(phoneNumber, aiResponse);

    // 10. Return 200 OK to Twilio webhook
    return res.status(200).json({ success: true, message_sid: 'twilio-msg-id' });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Helper: Create case from detected message intent
 */
const createCaseFromMessage = async (
  contactId: string,
  extractedData: any,
  originalMessage: string
) => {
  const { supabase } = await import('../services/supabase');

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Create case_requests record
  const { data: caseRecord, error } = await supabase
    .from('case_requests')
    .insert({
      subjects: extractedData?.subjects || [],
      student_level: extractedData?.studentLevel || null,
      location: extractedData?.location || null,
      postal_code: extractedData?.postalCode || null,
      message: originalMessage,
      source: 'whatsapp',
      status: 'open',
      contact_id: contactId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create case: ${error.message}`);
  }

  return caseRecord;
};

/**
 * Helper: Send WhatsApp message via Twilio
 * 
 * Requires:
 * npm install twilio
 */
const sendWhatsAppMessage = async (toPhoneNumber: string, messageText: string) => {
  // Pseudo-code - implement with actual Twilio SDK
  /*
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  const twilio = require('twilio');
  const client = twilio(accountSid, authToken);
  
  const message = await client.messages.create({
    body: messageText,
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:${toPhoneNumber}`,
  });
  
  return message.sid;
  */
  console.log(`[Mock] Sending WhatsApp to ${toPhoneNumber}: ${messageText}`);
  return 'mock-message-id';
};

/**
 * Webhook Status/Status Callback Handler
 * 
 * Twilio sends status updates (delivered, read, failed)
 * POST /api/webhook/whatsapp/status
 */
export const handleWhatsAppStatus = async (req: any, res: any) => {
  try {
    const messageStatus = req.body.MessageStatus; // delivered, failed, sent, read
    const messageSid = req.body.MessageSid;
    const errorCode = req.body.ErrorCode || null;

    console.log(`Message ${messageSid} status: ${messageStatus}`);

    if (messageStatus === 'failed') {
      console.error(`WhatsApp message failed: ${errorCode}`);
      // Could log to admin dashboard or retry
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Status callback error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Manual Response Endpoint
 * Admin sends message to parent via WhatsApp
 * POST /api/admin/whatsapp/send
 * 
 * Body:
 * {
 *   contactId: "uuid",
 *   message: "text to send"
 * }
 */
export const sendManualWhatsAppMessage = async (req: any, res: any) => {
  try {
    const { contactId, message } = req.body;

    // Get contact
    const { supabase } = await import('../services/supabase');
    const { data: contact } = await supabase
      .from('whatsapp_contacts')
      .select('phone_number')
      .eq('id', contactId)
      .single();

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Send message
    await sendWhatsAppMessage(contact.phone_number, message);

    // Save as admin message
    const { saveConversationMessage } = await import('../services/whatsappService');
    await saveConversationMessage(contactId, 'admin_message', message);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error sending manual message:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get Contact Details
 * GET /api/admin/whatsapp/contacts/:contactId
 */
export const getWhatsAppContactDetails = async (req: any, res: any) => {
  try {
    const { contactId } = req.params;
    const { supabase } = await import('../services/supabase');
    const { getConversationHistory } = await import('../services/whatsappService');

    // Get contact
    const { data: contact } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get conversation history
    const history = await getConversationHistory(contactId, 50);

    return res.status(200).json({
      contact,
      conversationHistory: history,
    });
  } catch (error: any) {
    console.error('Error fetching contact:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * List All Contacts with Filters
 * GET /api/admin/whatsapp/contacts?status=new&stage=conversational
 */
export const listWhatsAppContacts = async (req: any, res: any) => {
  try {
    const { status, stage, limit = 50, offset = 0 } = req.query;
    const { supabase } = await import('../services/supabase');

    let query = supabase
      .from('whatsapp_contacts')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('contact_status', status);
    }

    if (stage) {
      query = query.eq('conversion_stage', stage);
    }

    const { data: contacts, count } = await query
      .range(offset, offset + limit - 1);

    return res.status(200).json({
      contacts,
      total: count,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error listing contacts:', error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  handleWhatsAppIncoming,
  handleWhatsAppStatus,
  sendManualWhatsAppMessage,
  getWhatsAppContactDetails,
  listWhatsAppContacts,
};
