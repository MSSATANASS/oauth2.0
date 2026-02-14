import axios from 'axios';
import { BaseExchangeService } from './base';
import { encrypt } from '@/lib/encryption';

export class CoinbaseService extends BaseExchangeService {
  exchangeName = 'Coinbase';

  async connect(userId: string, code: string): Promise<void> {
    try {
      // For connect flow (existing user), we just get token and save it.
      // In production, swap code for token here.
      
      const accessToken = `coinbase_access_token_${Date.now()}`;
      const refreshToken = `coinbase_refresh_token_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 7200 * 1000); // 2 hours

      await this.saveConnection(userId, accessToken, refreshToken, null, null, expiresAt);
      await this.notify(userId, 'Connected', encrypt(accessToken));
    } catch (error) {
      console.error('Coinbase connection failed:', error);
      throw error;
    }
  }

  async getUserProfile(accessToken: string): Promise<{ id: string; email?: string; name?: string }> {
    try {
      // Mock for prototype
      return {
        id: 'coinbase_user_mock_id',
        email: 'mock_coinbase_user@example.com',
        name: 'Coinbase User'
      };
    } catch (error) {
      console.error('Failed to fetch Coinbase profile:', error);
      throw error;
    }
  }

  async validate(userId: string): Promise<boolean> {
    return true;
  }
}