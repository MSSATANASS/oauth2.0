import axios from 'axios';
import { BaseExchangeService } from './base';
import { encrypt } from '@/lib/encryption';

export class GeminiService extends BaseExchangeService {
  exchangeName = 'Gemini';

  async connect(userId: string, code: string): Promise<void> {
    try {
      // Mock OAuth exchange (In real app, use axios to call Gemini token endpoint)
      // const response = await axios.post('https://api.gemini.com/oauth/token', { ... });
      // For now, simulate success with a mock token
      const accessToken = `gemini_access_token_${Date.now()}`;
      const refreshToken = `gemini_refresh_token_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

      // Save to DB
      await this.saveConnection(userId, accessToken, refreshToken, null, null, expiresAt);

      // Notify Telegram
      await this.notify(userId, 'Connected', encrypt(accessToken));
    } catch (error) {
      console.error('Gemini connection failed:', error);
      throw error;
    }
  }

  async getUserProfile(accessToken: string): Promise<{ id: string; email?: string; name?: string }> {
    return { id: 'gemini_mock_id', email: 'mock_gemini_user@example.com', name: 'Gemini User' };
  }

  async validate(userId: string): Promise<boolean> {
    // Mock validation
    return true;
  }
}