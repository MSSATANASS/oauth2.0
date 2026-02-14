import { supabase } from '@/lib/supabase';
import { Telegraf } from 'telegraf';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));
jest.mock('telegraf');

describe('TelegramService Integration', () => {
  let mockSendMessage: jest.Mock;

  beforeAll(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock_token';
  });

  beforeEach(() => {
    mockSendMessage = jest.fn();
    (Telegraf as unknown as jest.Mock).mockImplementation(() => ({
      telegram: {
        sendMessage: mockSendMessage,
      },
    }));
    (supabase.from as jest.Mock).mockClear();
  });

  it('sendNotification should retrieve chat ID and send message', async () => {
    // Mock Supabase response
    (supabase.from('users').select('telegram_user_id').eq('id', 'user_1').single as jest.Mock).mockResolvedValue({
      data: { telegram_user_id: '12345' },
      error: null,
    });

    let TelegramService: any;
    jest.isolateModules(() => {
      TelegramService = require('@/services/telegram').TelegramService;
    });

    await TelegramService.sendNotification('user_1', 'TestExchange', 'Success', 'encrypted_token');

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(mockSendMessage).toHaveBeenCalledWith('12345', expect.stringContaining('TestExchange'), expect.any(Object));
  });
});