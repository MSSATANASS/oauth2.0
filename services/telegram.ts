import { Telegraf } from 'telegraf';
import { supabase } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  // Suppress warning in test if not needed
  if (process.env.NODE_ENV !== 'test') {
    console.warn('TELEGRAM_BOT_TOKEN is not defined');
  }
}

const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

export class TelegramService {
  static async sendNotification(userId: string, exchangeName: string, status: string, encryptedToken: string) {
    if (!bot) {
      if (process.env.NODE_ENV !== 'test') console.warn('Telegram bot not initialized');
      return;
    }

    try {
      // Fetch telegram_user_id from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('telegram_user_id')
        .eq('id', userId)
        .single();

      if (error || !data || !data.telegram_user_id) {
        console.warn(`No telegram_user_id found for user ${userId}`);
        return;
      }

      const telegramId = data.telegram_user_id;
      const timestamp = new Date().toISOString();

      const message = `
🔔 **Exchange Notification**

👤 **User ID:** \`${userId}\`
crypto **Exchange:** ${exchangeName}
📅 **Date:** ${timestamp}
✅ **Status:** ${status}
🔐 **Encrypted Token:**
\`${encryptedToken}\`

⚠️ *Security Warning: Do not share this token.*
      `;

      await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
      console.log(`Notification sent to ${telegramId}`);
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }
}