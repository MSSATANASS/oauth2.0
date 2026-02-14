import { NextRequest, NextResponse } from 'next/server';
import { getExchangeService } from '@/services/exchange/factory';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to get user from request
async function getUser(req: NextRequest) {
  let token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (!error && user) return user;
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ exchange: string }> }) {
  // Initiates OAuth Flow.
  // If user is logged in, we pass user ID in state to link account.
  // If user is NOT logged in, we pass a random state to verify CSRF later and trigger "Login" flow.
  
  const user = await getUser(req);
  const { exchange } = await params;
  
  // Format: "user_id:random_string" or "undefined:random_string"
  const userIdPart = user ? user.id : 'undefined';
  const stateRaw = `${userIdPart}:${Math.random().toString(36).substring(7)}`;
  const state = encrypt(stateRaw);
  
  let url = '';
  
  if (exchange === 'gemini') {
    const clientId = process.env.GEMINI_CLIENT_ID || 'mock_gemini_id';
    const redirectUri = process.env.GEMINI_REDIRECT_URI || 'http://localhost:3000/api/auth/gemini/callback';
    url = `https://exchange.gemini.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=trader&state=${state}`;
  } else if (exchange === 'binance') {
    const clientId = process.env.BINANCE_CLIENT_ID || 'mock_binance_id';
    const redirectUri = process.env.BINANCE_REDIRECT_URI || 'http://localhost:3000/api/auth/binance/callback';
    url = `https://accounts.binance.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  } else if (exchange === 'coinbase') {
    const clientId = process.env.COINBASE_CLIENT_ID || 'mock_coinbase_id';
    const redirectUri = process.env.COINBASE_REDIRECT_URI || 'http://localhost:3000/api/auth/coinbase/callback';
    const scope = 'wallet:accounts:read,wallet:transactions:send,wallet:trades:create,wallet:trades:read';
    url = `https://login.coinbase.com/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  } else {
     // For API Key exchanges, we don't redirect.
     return NextResponse.json({ message: 'Manual connection required via POST', method: 'API_KEY' });
  }
  
  return NextResponse.json({ url });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ exchange: string }> }) {
  const { exchange } = await params;
  const body = await req.json();
  const user = await getUser(req);
  
  // Handle "Login with API Key" (No user session yet)
  if (body.isLogin) {
    try {
      // Validate API Key with Exchange
      // Ideally we should use a specific 'loginWithApiKey' method or reuse connect logic carefully.
      // We'll mock the validation here or use service.validate() if possible? 
      // Validate requires userId usually to fetch keys from DB. Here we HAVE keys in body.
      
      // We will trust the keys are valid if we can fetch a profile/balance.
      // Mock validation for now:
      if (!body.apiKey || !body.apiSecret) {
        return NextResponse.json({ error: 'API Key and Secret required' }, { status: 400 });
      }
      
      // Simulate fetching profile to get a stable ID (e.g. hash of API Key or real User ID from exchange)
      // For Kraken/Bitget, we might not get a stable user ID easily without a specific endpoint.
      // We'll use the API Key itself as a unique identifier for this prototype (hashed).
      // WARN: Rotating API Keys would break this "identity".
      
      const crypto = require('crypto');
      const identityHash = crypto.createHash('sha256').update(body.apiKey).digest('hex');
      const mockEmail = `${exchange}_${identityHash.substring(0, 8)}@docmx.local`; // Synthetic email
      
      // Find/Create User
      const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
      let dbUser = users.find(u => u.email === mockEmail);
      
      if (!dbUser) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: mockEmail,
          email_confirm: true,
          password: crypto.randomUUID() // Random password, user never knows it
        });
        if (createError) throw createError;
        dbUser = newUser.user;
        await supabaseAdmin.from('users').insert({ id: dbUser.id });
      }
      
      // Save Connection
      // Using service logic or direct DB save.
      // Direct DB save is safer to avoid "connect" side effects requiring session.
      const { encrypt } = require('@/lib/encryption');
      await supabaseAdmin.from('exchange_connections').upsert({
        user_id: dbUser.id,
        exchange: exchange,
        api_key: encrypt(body.apiKey),
        api_secret: encrypt(body.apiSecret),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, exchange' });
      
      // Create Session
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        user_id: dbUser.id
      });
      
      if (sessionError) throw sessionError;
      
      return NextResponse.json({ success: true, session: sessionData });
      
    } catch (error: any) {
      console.error(`Login error for ${exchange}:`, error);
      return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
  }

  // Handle "Connect Exchange" (User already logged in)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const service = getExchangeService(exchange);
    await service.connect(user.id, body);
    return NextResponse.json({ success: true, message: `Connected to ${exchange}` });
  } catch (error: any) {
    console.error(`Connection error for ${exchange}:`, error);
    return NextResponse.json({ error: error.message || 'Connection failed' }, { status: 500 });
  }
}