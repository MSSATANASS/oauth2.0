import { KrakenService } from '@/services/exchange/kraken';
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

describe('KrakenService', () => {
  let service: KrakenService;

  beforeEach(() => {
    service = new KrakenService();
    (TelegramService.sendNotification as jest.Mock).mockClear();
    (encrypt as jest.Mock).mockImplementation((val) => `encrypted_${val}`);
    (supabase.from as jest.Mock).mockClear();
  });

  it('connect should validate keys, save connection, and notify', async () => {
    const userId = 'user_123';
    const apiKey = 'api_key';
    const apiSecret = 'api_secret';

    // Mock successful Supabase upsert
    (supabase.from('exchange_connections').upsert as jest.Mock).mockResolvedValue({ error: null });

    await service.connect(userId, { apiKey, apiSecret });

    // Verify DB call
    expect(supabase.from).toHaveBeenCalledWith('exchange_connections');
    expect(supabase.from('exchange_connections').upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        exchange: 'Kraken',
        api_key: `encrypted_${apiKey}`,
        api_secret: `encrypted_${apiSecret}`,
      }),
      expect.objectContaining({ onConflict: 'user_id, exchange' })
    );

    // Verify Notification
    expect(TelegramService.sendNotification).toHaveBeenCalledWith(
      userId,
      'Kraken',
      'Connected',
      `encrypted_${apiKey}`
    );
  });

  it('should throw error if keys are missing', async () => {
    // @ts-ignore
    await expect(service.connect('user_123', { apiKey: '', apiSecret: '' })).rejects.toThrow();
  });
});