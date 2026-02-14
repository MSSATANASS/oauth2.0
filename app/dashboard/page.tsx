"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, CheckCircle, XCircle, Key, ExternalLink, LogOut, Shield } from 'lucide-react';
import axios from 'axios';
import ManualConnect from '@/components/ManualConnect';

interface ExchangeStatus {
  exchange: string;
  is_active: boolean;
  updated_at: string;
}

const EXCHANGES = [
  { name: 'Gemini', type: 'OAUTH', color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  { name: 'Binance', type: 'OAUTH', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  { name: 'Coinbase', type: 'OAUTH', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'Kraken', type: 'API_KEY', color: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  { name: 'Bitget', type: 'API_KEY', color: 'bg-teal-500', hover: 'hover:bg-teal-600' },
];

export default function Dashboard() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [connections, setConnections] = useState<ExchangeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExchange, setExpandedExchange] = useState<string | null>(null);

  const fetchConnections = async () => {
    if (!session?.access_token) return;
    
    try {
      const res = await axios.get('/api/user/exchanges', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      setConnections(res.data.exchanges || []);
    } catch (error) {
      console.error('Failed to fetch connections', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchConnections();
    } else if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, session, authLoading]);

  if (authLoading || (loading && user)) return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
    </div>
  );

  const isConnected = (exchangeName: string) => {
    return connections.some(c => c.exchange.toLowerCase() === exchangeName.toLowerCase());
  };

  const handleConnect = async (exchange: { name: string; type: string }) => {
    if (exchange.type === 'OAUTH') {
      try {
        const res = await axios.get(`/api/auth/${exchange.name.toLowerCase()}`, {
           headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        if (res.data.url) {
          window.location.href = res.data.url;
        }
      } catch (e) {
        console.error("Failed to start OAuth flow", e);
      }
    } else {
      setExpandedExchange(expandedExchange === exchange.name ? null : exchange.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-500 mr-3" />
              <h1 className="text-xl font-bold text-white">CryptoConnect Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
              <button 
                onClick={() => signOut()}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Connected Exchanges</h2>
          <p className="text-gray-400">Manage your exchange connections and API keys.</p>
        </div>

        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXCHANGES.map((exchange) => {
              const connected = isConnected(exchange.name);
              return (
                <div key={exchange.name} className={`bg-gray-800 overflow-hidden shadow-lg rounded-xl border ${connected ? 'border-green-500/30' : 'border-gray-700'}`}>
                  <div className="px-5 py-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">{exchange.name}</h3>
                      {connected ? (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <XCircle className="h-5 w-5 mr-1" />
                          <span className="text-xs font-bold uppercase tracking-wider">Inactive</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      {connected ? (
                        <div className="bg-green-900/20 rounded-lg p-3 border border-green-900/50">
                          <p className="text-sm text-green-300">Connection established securely.</p>
                        </div>
                      ) : (
                        <div>
                          <button
                            onClick={() => handleConnect(exchange)}
                            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${exchange.color} ${exchange.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all`}
                          >
                            {exchange.type === 'OAUTH' ? <ExternalLink className="mr-2 h-4 w-4" /> : <Key className="mr-2 h-4 w-4" />}
                            {exchange.type === 'OAUTH' ? 'Connect via OAuth' : 'Enter API Keys'}
                          </button>
                          
                          {/* Manual Connection Form */}
                          {expandedExchange === exchange.name && !connected && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <ManualConnect 
                                  exchange={exchange.name} 
                                  onSuccess={() => {
                                    setExpandedExchange(null);
                                    fetchConnections();
                                  }} 
                                />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}