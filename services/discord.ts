/**
 * Discord Webhook Service
 * Sends real-time notifications to Discord when users sign up
 */

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1468866993213014018/2crF4a4psrmSYPEpBAoT7RRPASlmhVyirbvOlUAqPgizoLAi0q3LldtvYljANC9hJ_td';

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
 * Send a notification to Discord for new parent signup
 */
export const notifyParentSignup = async (data: {
  fullName: string;
  email: string;
  phone: string;
}): Promise<void> => {
  try {
    const message: DiscordMessage = {
      embeds: [
        {
          title: '👨‍👩‍👧 New Parent Signup!',
          description: `A new parent has registered on Integrated Learnings`,
          color: 0x3b82f6, // Blue
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
              value: '[View in Admin Panel](https://www.integratedlearnings.com.sg/admin/matching)',
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

    console.log('✅ Parent signup notification sent to Discord');
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error);
    // Don't throw - we don't want signup to fail if Discord is down
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
