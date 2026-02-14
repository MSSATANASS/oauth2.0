import { GeminiService } from '@/services/exchange/gemini';
import { TelegramService } from '@/services/telegram';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));
jest.mock('@/services/telegram');
jest.mock('@/lib/encryption');

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService();
    (TelegramService.sendNotification as jest.Mock).mockClear();
    (encrypt as jest.Mock).mockImplementation((val) => `encrypted_${val}`);
    (supabase.from as jest.Mock).mockClear();
  });

  it('connect should exchange code for token, save connection, and notify', async () => {
    const userId = 'user_123';
    const code = 'auth_code';

    // Mock successful Supabase upsert
    (supabase.from('exchange_connections').upsert as jest.Mock).mockResolvedValue({ error: null });

    await service.connect(userId, code);

    // Verify DB call
    expect(supabase.from).toHaveBeenCalledWith('exchange_connections');
    expect(supabase.from('exchange_connections').upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        exchange: 'Gemini',
        access_token: expect.stringContaining('encrypted_'),
      }),
      expect.objectContaining({ onConflict: 'user_id, exchange' })
    );

    // Verify Notification
    expect(TelegramService.sendNotification).toHaveBeenCalledWith(
      userId,
      'Gemini',
      'Connected',
      expect.stringContaining('encrypted_')
    );
  });
});