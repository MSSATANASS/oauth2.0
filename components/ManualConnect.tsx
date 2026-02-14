"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/components/AuthProvider';

interface ManualConnectProps {
  exchange: string;
  onSuccess: () => void;
}

export default function ManualConnect({ exchange, onSuccess }: ManualConnectProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`/api/auth/${exchange.toLowerCase()}`, {
        apiKey,
        apiSecret,
      }, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mt-2">
      <h3 className="text-sm font-medium mb-3 text-gray-300">Connect {exchange} via API Key</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border placeholder-gray-500"
            placeholder="Enter API Key"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">API Secret</label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border placeholder-gray-500"
            placeholder="Enter API Secret"
            required
          />
        </div>
        {error && <p className="text-red-400 text-xs bg-red-900/20 p-2 rounded">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Connect Exchange'}
        </button>
      </form>
    </div>
  );
}