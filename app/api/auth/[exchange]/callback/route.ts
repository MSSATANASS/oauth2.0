
import { NextRequest, NextResponse } from 'next/server';
import { getExchangeService } from '@/services/exchange/factory';
import { decrypt } from '@/lib/encryption';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ exchange: string }> }) {
  const { exchange } = await params;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  let userId: string | null = null;
  if (state) {
    try {
      const decryptedState = decrypt(state);
      const parts = decryptedState.split(':');
      if (parts.length >= 2) {
        userId = parts[0];
        if (userId === 'undefined' || userId === '') userId = null;
      }
    } catch (error) {
      console.warn('State decryption failed, proceeding as new login flow if valid OAuth');
    }
  }

  try {
    const service = getExchangeService(exchange);
    
    // 1. Exchange Code for Tokens
    const { accessToken, refreshToken, expiresAt } = await service.exchangeCode(code);
    
    // 2. Get User Profile from Exchange (or synthetic profile)
    const profile = await service.getUserProfile(accessToken);
    
    // 3. Find or Create User
    // If we have a logged-in userId (from state), use it.
    // Otherwise, find by email or exchange identity.
    let user;
    
    if (userId) {
      // User is linking account
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      user = existingUser.user;
    } else {
      // User is logging in
      const email = profile.email || `${exchange}_${profile.id}@docmx.local`; // Fallback email
      
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      user = users.find(u => u.email === email);
      
      if (!user) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: { full_name: profile.name || `${exchange} User` }
        });
        if (createError) throw createError;
        user = newUser.user;
        
        // Create public profile entry
        await supabaseAdmin.from('users').insert({ id: user.id });
      }
    }

    if (!user) throw new Error('Failed to identify user');

    // 4. Save Connection
    // We pass null for apiKey/apiSecret as this is OAuth flow
    await service.saveConnection(user.id, accessToken, refreshToken, null, null, expiresAt);
    
    // 5. Create Session (if logging in)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!
    });

    if (linkError) throw linkError;

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    });
    
    if (sessionError || !sessionData.session) throw sessionError || new Error('Session creation failed');
    
    // 6. Redirect
    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.set('access_token', sessionData.session.access_token);
    redirectUrl.searchParams.set('refresh_token', sessionData.session.refresh_token);
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error: any) {
    console.error(`Callback error for ${exchange}:`, error);
    return NextResponse.json({ error: error.message || 'Connection failed' }, { status: 500 });
  }
}
