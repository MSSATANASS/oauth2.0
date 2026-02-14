import axios from 'axios';
import { BaseExchangeService } from './base';
import { encrypt } from '@/lib/encryption';

export class BinanceService extends BaseExchangeService {
  exchangeName = 'Binance';

  async connect(userId: string, code: string): Promise<void> {
    try {
      // Mock OAuth exchange
      // const response = await axios.post('https://www.binance.com/oauth/token', { ... });
      // For now, simulate success with a mock token
      const accessToken = `binance_access_token_${Date.now()}`;
      const refreshToken = `binance_refresh_token_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

      // Save to DB
      await this.saveConnection(userId, accessToken, refreshToken, null, null, expiresAt);

      // Notify Telegram
      await this.notify(userId, 'Connected', encrypt(accessToken));
    } catch (error) {
      console.error('Binance connection failed:', error);
      throw error;
    }
  }

  async getUserProfile(accessToken: string): Promise<{ id: string; email?: string; name?: string }> {
    return { id: 'binance_mock_id', email: 'mock_binance_user@example.com', name: 'Binance User' };
  }

  async validate(userId: string): Promise<boolean> {
    return true;
  }
}