"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, ShieldCheck, ArrowRight, Lock, RefreshCw, Smartphone } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="w-full border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">CryptoConnect</span>
          </div>
          <nav>
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 text-indigo-500" />
            ) : user ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Log In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative isolate pt-14 lg:pt-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Unified Access to Your <span className="text-indigo-500">Crypto World</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                Securely manage your Gemini, Binance, Coinbase, Kraken, and Bitget accounts in one place. 
                No extra passwords to remember. Direct exchange authentication.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
                  >
                    Connect Exchanges <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <Lock className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    Bank-Grade Security
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">Your API keys are encrypted using AES-256 before storage. We never access your funds for withdrawal.</p>
                  </dd>
                </div>
                <div className="flex flex-col bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <RefreshCw className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    Real-time Sync
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">Direct connection to exchanges ensures your data is always up-to-date. OAuth supported where available.</p>
                  </dd>
                </div>
                <div className="flex flex-col bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <Smartphone className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    Mobile Ready
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">Fully responsive dashboard designed for seamless experience across all your devices.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 CryptoConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}