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
    const clientId = process.env.NEXT_PUBLIC_GEMINI_CLIENT_ID || 'mock_gemini_id';
    const redirectUri = process.env.GEMINI_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gemini/callback`;
    url = `https://exchange.gemini.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=trader&state=${state}`;
  } else if (exchange === 'binance') {
    const clientId = process.env.NEXT_PUBLIC_BINANCE_CLIENT_ID || 'mock_binance_id';
    const redirectUri = process.env.BINANCE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/binance/callback`;
    url = `https://accounts.binance.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  } else if (exchange === 'coinbase') {
    const clientId = process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID || 'mock_coinbase_id';
    const redirectUri = process.env.COINBASE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/coinbase/callback`;
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
      const service = getExchangeService(exchange);

      // 1. Validate Credentials FIRST
      const isValid = await service.validateCredentials(body);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid API Credentials' }, { status: 401 });
      }

      // 2. Identify User
      // Using API Key hash as stable identity
      const crypto = require('crypto');
      const identityHash = crypto.createHash('sha256').update(body.apiKey).digest('hex');
      const mockEmail = `${exchange}_${identityHash.substring(0, 8)}@docmx.local`;
      
      const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
      let dbUser = users.find(u => u.email === mockEmail);
      
      if (!dbUser) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: mockEmail,
          email_confirm: true,
          password: crypto.randomUUID(),
          user_metadata: { full_name: `${exchange} User` }
        });
        if (createError) throw createError;
        dbUser = newUser.user;
        await supabaseAdmin.from('users').insert({ id: dbUser.id });
      }
      
      // 3. Save Connection (and re-validate implicitly, but we know it's valid)
      await service.connect(dbUser.id, body);
      
      // 4. Create Session
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        user_id: dbUser.id
      });
      
      if (sessionError) throw sessionError;
      
      return NextResponse.json({ success: true, session: sessionData });
      
    } catch (error: any) {
      console.error(`Login error for ${exchange}:`, error);
      return NextResponse.json({ error: 'Login failed: ' + error.message }, { status: 500 });
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
