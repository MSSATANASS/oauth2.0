import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './page';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: jest.fn(),
    },
  },
}));

describe('Login Page', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Login />);
    expect(screen.getByText('CryptoConnect')).toBeInTheDocument();
    expect(screen.getByText('Log in with Gemini')).toBeInTheDocument();
    expect(screen.getByText('Log in with Binance')).toBeInTheDocument();
  });

  it('handles OAuth login click', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { url: 'https://oauth.example.com' },
    });
    
    // We need to mock window.location.href assign which is tricky in JSDOM
    // So we'll check if axios was called
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    render(<Login />);
    
    const geminiBtn = screen.getByText('Log in with Gemini');
    fireEvent.click(geminiBtn);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/auth/gemini');
    });
  });

  it('expands API Key form for Bitget', () => {
    render(<Login />);
    const bitgetBtn = screen.getByText('Log in with Bitget');
    fireEvent.click(bitgetBtn);
    
    expect(screen.getByPlaceholderText('Enter your API Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your API Secret')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your Passphrase')).toBeInTheDocument();
  });

  it('handles API Key login submission', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { success: true, session: { access_token: 'at', refresh_token: 'rt' } },
    });
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });

    render(<Login />);
    
    // Expand Bitget
    fireEvent.click(screen.getByText('Log in with Bitget'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your API Key'), { target: { value: 'test_key' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your API Secret'), { target: { value: 'test_secret' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your Passphrase'), { target: { value: 'test_pass' } });
    
    // Submit
    fireEvent.click(screen.getByText('Authenticate'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/bitget', expect.objectContaining({
        apiKey: 'test_key',
        apiSecret: 'test_secret',
        passphrase: 'test_pass',
        isLogin: true
      }));
      expect(supabase.auth.setSession).toHaveBeenCalledWith({ access_token: 'at', refresh_token: 'rt' });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
