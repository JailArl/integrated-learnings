/**
 * Discord Webhook Service
 * Sends real-time notifications to Discord when users sign up
 */

const DISCORD_WEBHOOK_URL = (import.meta as any).env?.VITE_DISCORD_WEBHOOK_URL || '';

interface DiscordMessage {
  content?: string;
  embeds?: Array<{
    title: string;
    description: string;
    color: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

/**
 * Send a notification to Discord for new tutor signup
 */
export const notifyTutorSignup = async (data: {
  fullName: string;
  email: string;
  phone: string;
}): Promise<void> => {
  try {
    const message: DiscordMessage = {
      embeds: [
        {
          title: '🎓 New Tutor Signup!',
          description: `A new educator has registered on Integrated Learnings`,
          color: 0x10b981, // Green
          fields: [
            {
              name: 'Name',
              value: data.fullName,
              inline: true,
            },
            {
              name: 'Email',
              value: data.email,
              inline: true,
            },
            {
              name: 'Phone',
              value: data.phone || 'Not provided',
              inline: false,
            },
            {
              name: 'Link to Dashboard',
              value: '[View in Admin Panel](https://www.integratedlearnings.com.sg/admin/tutors)',
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    console.log('✅ Tutor signup notification sent to Discord');
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error);
    // Don't throw - we don't want signup to fail if Discord is down
  }
};

/**
 * Send a notification to Discord for new parent inquiry
 */
export const notifyParentInquiry = async (data: {
  parentName: string;
  email: string;
  phone: string;
  studentLevel: string;
  subjects: string[];
}): Promise<void> => {
  try {
    const message: DiscordMessage = {
      embeds: [
        {
          title: '📋 New Parent Inquiry!',
          description: `A parent has submitted a tuition inquiry`,
          color: 0x3b82f6,
          fields: [
            { name: 'Parent Name', value: data.parentName, inline: true },
            { name: 'Email', value: data.email, inline: true },
            { name: 'Phone', value: data.phone || 'Not provided', inline: false },
            { name: 'Student Level', value: data.studentLevel, inline: true },
            { name: 'Subjects', value: data.subjects.join(', ') || 'Not specified', inline: true },
            { name: 'Action', value: '[View in Admin Dashboard](https://www.integratedlearnings.com.sg/admin)', inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    console.log('✅ Parent inquiry notification sent to Discord');
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error);
  }
};

/**
 * Send a generic message to Discord
 */
export const sendDiscordMessage = async (message: DiscordMessage): Promise<void> => {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('❌ Failed to send Discord message:', error);
  }
};
