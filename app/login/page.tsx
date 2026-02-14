"use client";

import { useState } from 'react';
import { Loader2, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const EXCHANGES = [
  { name: 'Gemini', type: 'OAUTH', color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  { name: 'Binance', type: 'OAUTH', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  { name: 'Coinbase', type: 'OAUTH', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'Kraken', type: 'API_KEY', color: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  { name: 'Bitget', type: 'API_KEY', color: 'bg-teal-500', hover: 'hover:bg-teal-600' },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedExchange, setExpandedExchange] = useState<string | null>(null);
  const router = useRouter();

  // Manual Login Form State
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const handleOAuthLogin = async (exchangeName: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/auth/${exchangeName.toLowerCase()}`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initiate login with ' + exchangeName);
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent, exchangeName: string) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`/api/auth/${exchangeName.toLowerCase()}`, {
        apiKey,
        apiSecret,
        isLogin: true
      });

      if (res.data.success && res.data.session) {
        const { access_token, refresh_token } = res.data.session;
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-900">
            <ShieldCheck className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            CryptoConnect
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Securely access your portfolio via exchange authentication
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {EXCHANGES.map((exchange) => (
            <div key={exchange.name} className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
              {exchange.type === 'OAUTH' ? (
                <button
                  onClick={() => handleOAuthLogin(exchange.name)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium text-white transition-colors duration-200 ${exchange.color} ${exchange.hover}`}
                >
                  <span className="flex items-center">
                    <ExternalLink className="mr-3 h-5 w-5 opacity-80" />
                    Log in with {exchange.name}
                  </span>
                  <span className="text-xs opacity-75 bg-black/20 px-2 py-1 rounded">OAuth</span>
                </button>
              ) : (
                <div className="bg-gray-800">
                  <button
                    onClick={() => setExpandedExchange(expandedExchange === exchange.name ? null : exchange.name)}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium text-white transition-colors duration-200 ${exchange.color} ${exchange.hover}`}
                  >
                    <span className="flex items-center">
                      <Key className="mr-3 h-5 w-5 opacity-80" />
                      Log in with {exchange.name}
                    </span>
                    <span className="text-xs opacity-75 bg-black/20 px-2 py-1 rounded">API Key</span>
                  </button>
                  
                  {expandedExchange === exchange.name && (
                    <div className="px-4 py-4 bg-gray-900/50 border-t border-gray-700">
                      <form onSubmit={(e) => handleManualLogin(e, exchange.name)} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">API Key</label>
                          <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Enter your API Key"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">API Secret</label>
                          <input
                            type="password"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Enter your API Secret"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-2"
                        >
                          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Authenticate'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-red-900/50 p-4 border border-red-800">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">Authentication Error</h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}