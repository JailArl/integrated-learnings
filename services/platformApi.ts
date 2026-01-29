import { supabase } from './supabase';
// import jsPDF from 'jspdf'; // TODO: Install jspdf package when needed

// ============================================================================
// PARENT API FUNCTIONS
// ============================================================================

export const submitParentRequest = async (data: {
  parentId: string;
  studentName: string;
  studentLevel: string;
  subjects: string[];
  address: string;
  postalCode: string;
  diagnosticTestBooked: boolean;
  diagnosticTestDate?: string;
}): Promise<{ success: boolean; error?: string; requestId?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data: result, error } = await supabase
      .from('parent_requests')
      .insert([
        {
          parent_id: data.parentId,
          student_name: data.studentName,
          student_level: data.studentLevel,
          subjects: data.subjects,
          address: data.address,
          postal_code: data.postalCode,
          diagnostic_test_booked: data.diagnosticTestBooked,
          diagnostic_test_date: data.diagnosticTestDate || null,
          status: data.diagnosticTestBooked ? 'test_booked' : 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, requestId: result.id };
  } catch (error: any) {
    console.error('Submit parent request error:', error);
    return { success: false, error: error.message };
  }
};

export const getMyRequests = async (
  parentId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('parent_requests')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get my requests error:', error);
    return { success: false, error: error.message };
  }
};

export const getMyMatch = async (
  requestId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        tutor:tutor_profiles(*)
      `
      )
      .eq('request_id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Get my match error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// TUTOR API FUNCTIONS
// ============================================================================

export const getAvailableCases = async (): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('parent_requests')
      .select('*')
      .in('status', ['pending', 'test_booked', 'test_completed'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get available cases error:', error);
    return { success: false, error: error.message };
  }
};

export const submitBid = async (
  tutorId: string,
  requestId: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.from('tutor_bids').insert([
      {
        tutor_id: tutorId,
        request_id: requestId,
        message: message,
      },
    ]);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Submit bid error:', error);
    return { success: false, error: error.message };
  }
};

export const getMyBids = async (
  tutorId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('tutor_bids')
      .select(
        `
        *,
        request:parent_requests(*)
      `
      )
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get my bids error:', error);
    return { success: false, error: error.message };
  }
};

export const uploadCertificate = async (
  tutorId: string,
  file: File
): Promise<{ success: boolean; error?: string; fileUrl?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Upload file to storage
    const fileName = `${tutorId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tutor-certificates')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tutor-certificates')
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Save to database
    const { error: dbError } = await supabase.from('tutor_certificates').insert([
      {
        tutor_id: tutorId,
        file_url: fileUrl,
        file_name: file.name,
      },
    ]);

    if (dbError) throw dbError;

    return { success: true, fileUrl };
  } catch (error: any) {
    console.error('Upload certificate error:', error);
    return { success: false, error: error.message };
  }
};

export const getTutorProfile = async (
  tutorId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select('*')
      .eq('id', tutorId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Get tutor profile error:', error);
    return { success: false, error: error.message };
  }
};

export const getTutorCertificates = async (
  tutorId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('tutor_certificates')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get tutor certificates error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

export const getAllRequests = async (): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('parent_requests')
      .select(
        `
        *,
        parent:parent_profiles(*),
        match:matches(*)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get all requests error:', error);
    return { success: false, error: error.message };
  }
};

export const getBidsForRequest = async (
  requestId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('tutor_bids')
      .select(
        `
        *,
        tutor:tutor_profiles(*),
        certificates:tutor_certificates(*)
      `
      )
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get bids for request error:', error);
    return { success: false, error: error.message };
  }
};

export const approveBid = async (
  requestId: string,
  tutorId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Create match
    const { error: matchError } = await supabase.from('matches').insert([
      {
        request_id: requestId,
        tutor_id: tutorId,
      },
    ]);

    if (matchError) throw matchError;

    // Update request status
    const { error: updateError } = await supabase
      .from('parent_requests')
      .update({ status: 'matched' })
      .eq('id', requestId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error('Approve bid error:', error);
    return { success: false, error: error.message };
  }
};

export const markTestComplete = async (
  requestId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('parent_requests')
      .update({
        diagnostic_test_completed: true,
        status: 'test_completed',
      })
      .eq('id', requestId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Mark test complete error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyTutor = async (
  tutorId: string,
  status: 'verified' | 'rejected'
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('tutor_profiles')
      .update({ verification_status: status })
      .eq('id', tutorId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Verify tutor error:', error);
    return { success: false, error: error.message };
  }
};

export const getPendingTutors = async (): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(
        `
        *,
        certificates:tutor_certificates(*)
      `
      )
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get pending tutors error:', error);
    return { success: false, error: error.message };
  }
};

export const getMatchesForInvoicing = async (): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        request:parent_requests(*),
        tutor:tutor_profiles(*),
        parent:parent_requests(parent:parent_profiles(*))
      `
      )
      .eq('invoice_generated', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get matches for invoicing error:', error);
    return { success: false, error: error.message };
  }
};

// TODO: Uncomment when jspdf is installed
/* export const generateInvoice = async (matchData: {
  matchId: string;
  requestId: string;
  parentName: string;
  studentName: string;
  tutorName: string;
  hourlyRate: number;
  diagnosticTestBooked: boolean;
}): Promise<{ success: boolean; error?: string; invoiceUrl?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Integrated Learnings', 20, 40);
    doc.text('Tuition Matching Platform', 20, 47);
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Invoice #: INV-${matchData.matchId.slice(0, 8)}`, 20, 67);
    
    // Bill to
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 80);
    doc.setFontSize(10);
    doc.text(matchData.parentName, 20, 87);
    doc.text(`Student: ${matchData.studentName}`, 20, 94);
    
    // Service details
    doc.setFontSize(12);
    doc.text('Services:', 20, 110);
    doc.setFontSize(10);
    
    let yPos = 120;
    doc.text(`Tutor: ${matchData.tutorName}`, 20, yPos);
    yPos += 7;
    doc.text(`Hourly Rate: $${matchData.hourlyRate}`, 20, yPos);
    yPos += 7;
    
    if (matchData.diagnosticTestBooked) {
      doc.text('Diagnostic Test: $50', 20, yPos);
      yPos += 7;
    }
    
    // Total includes hourly rate plus diagnostic test fee if booked
    const diagnosticFee = matchData.diagnosticTestBooked ? 50 : 0;
    const total = (matchData.hourlyRate || 0) + diagnosticFee;
    doc.setFontSize(12);
    doc.text(`Total Due: $${total}`, 20, yPos + 10);
    
    // Payment instructions
    doc.setFontSize(10);
    // TODO: Replace this placeholder messaging with an actual payment QR code
    //       once QR-based payment integration is implemented.
    doc.text('Payment via QR code will be available in a future update.', 20, yPos + 37);
    doc.text('Please follow the payment instructions provided by the tutoring center.', 20, yPos + 50);
    doc.text('[QR CODE PLACEHOLDER]', 20, yPos + 50);
    
    // Convert to blob
    const pdfBlob = doc.output('blob');
    
    // Upload to storage
    const fileName = `invoices/invoice_${matchData.matchId}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdfBlob);

    if (uploadError) throw uploadError;

    // Get URL (private, signed URL)
    const { data: urlData } = await supabase.storage
      .from('invoices')
      .createSignedUrl(fileName, 31536000); // 1 year expiry

    if (!urlData?.signedUrl) throw new Error('Failed to generate signed URL');

    const invoiceUrl = urlData.signedUrl;

    // Update match record
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        invoice_generated: true,
        invoice_url: invoiceUrl,
      })
      .eq('id', matchData.matchId);

    if (updateError) throw updateError;

    // Update request status
    const { error: statusError } = await supabase
      .from('parent_requests')
      .update({ status: 'invoiced' })
      .eq('id', matchData.requestId);

    if (statusError) throw statusError;

    return { success: true, invoiceUrl };
  } catch (error: any) {
    console.error('Generate invoice error:', error);
    return { success: false, error: error.message };
  }
}; */
