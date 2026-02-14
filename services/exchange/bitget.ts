import axios from 'axios';
import { BaseExchangeService } from './base';
import { encrypt } from '@/lib/encryption';
import crypto from 'crypto';

export class BitgetService extends BaseExchangeService {
  exchangeName = 'Bitget';

  async connect(userId: string, data: { apiKey: string, apiSecret: string, passphrase?: string }): Promise<void> {
    const { apiKey, apiSecret, passphrase } = data;

    if (!apiKey || !apiSecret) {
      throw new Error('API Key and Secret are required for Bitget');
    }

    try {
      // Mock validation success
      const isValid = true; 
      if (!isValid) throw new Error('Invalid Bitget API Credentials');

      await this.saveConnection(userId, null, null, apiKey, apiSecret, null);

      // Notify Telegram
      await this.notify(userId, 'Connected', encrypt(apiKey));
    } catch (error) {
      console.error('Bitget connection failed:', error);
      throw error;
    }
  }

  async validate(userId: string): Promise<boolean> {
    return true;
  }
}