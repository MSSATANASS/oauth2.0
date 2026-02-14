import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to get user from request
async function getUser(req: NextRequest) {
  // Try to get the session from the authorization header (Bearer token)
  let token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (!error && user) return user;
  return null;
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('exchange_connections')
      .select('exchange, updated_at, is_active')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching exchanges:', error);
      return NextResponse.json({ error: 'Failed to fetch exchanges' }, { status: 500 });
    }

    return NextResponse.json({ exchanges: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}