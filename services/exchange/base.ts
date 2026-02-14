export interface IExchangeService {
  connect(userId: string, data: any): Promise<void>;
  validate(userId: string): Promise<boolean>;
  refreshToken(userId: string): Promise<void>;
  notify(userId: string, status: string, encryptedToken: string): Promise<void>;
  getUserProfile(accessToken: string): Promise<{ id: string; email?: string; name?: string }>;
}

import { supabase } from '@/lib/supabase';
import { TelegramService } from '@/services/telegram';
import { encrypt } from '@/lib/encryption';

export abstract class BaseExchangeService implements IExchangeService {
  abstract exchangeName: string;

  async connect(userId: string, data: any): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async validate(userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async refreshToken(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getUserProfile(accessToken: string): Promise<{ id: string; email?: string; name?: string }> {
    throw new Error('Method not implemented.');
  }

  async notify(userId: string, status: string, encryptedToken: string): Promise<void> {
    await TelegramService.sendNotification(userId, this.exchangeName, status, encryptedToken);
  }

  protected async saveConnection(userId: string, accessToken: string, refreshToken: string | null, apiKey: string | null, apiSecret: string | null, expiresAt: Date | null) {
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;
    const encryptedApiKey = apiKey ? encrypt(apiKey) : null;
    const encryptedApiSecret = apiSecret ? encrypt(apiSecret) : null;

    const { error } = await supabase
      .from('exchange_connections')
      .upsert({
        user_id: userId,
        exchange: this.exchangeName,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        api_key: encryptedApiKey,
        api_secret: encryptedApiSecret,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, exchange' });

    if (error) {
      console.error('Error saving connection to Supabase:', error);
      throw new Error(`Failed to save connection: ${error.message}`);
    }
  }
}