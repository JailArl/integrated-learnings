import { supabase } from './supabase';
import { sendDiscordMessage } from './discord';

export interface FutureChoicesEnquiryData {
  parent_name: string;
  contact_number: string;
  student_level: string;
  workshop_option: string;
  additional_notes: string;
  source_path: string;
}

export const submitFutureChoicesEnquiry = async (
  data: FutureChoicesEnquiryData,
): Promise<{ success: boolean; error?: string; id?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please check your environment variables.' };
  }

  try {
    const { data: result, error } = await supabase
      .from('future_choices_enquiries')
      .insert([
        {
          parent_name: data.parent_name,
          contact_number: data.contact_number,
          student_level: data.student_level,
          workshop_option: data.workshop_option,
          additional_notes: data.additional_notes || null,
          source_path: data.source_path,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    sendDiscordMessage({
      embeds: [
        {
          title: 'June Holiday Workshop Enquiry',
          description: 'A parent has enquired about the Future Choices workshop.',
          color: 0x2563eb,
          fields: [
            { name: 'Parent Name', value: data.parent_name, inline: true },
            { name: 'Phone', value: data.contact_number, inline: true },
            { name: 'Student Level', value: data.student_level, inline: true },
            { name: 'Workshop Option', value: data.workshop_option, inline: false },
            { name: 'Notes', value: data.additional_notes || 'No additional note provided', inline: false },
            { name: 'Source', value: data.source_path, inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Future choices enquiry error:', error);
    return { success: false, error: error.message || 'Failed to submit enquiry' };
  }
};