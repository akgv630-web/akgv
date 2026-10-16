'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, PhoneCall } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to local diagnostic console
    console.error('[Application Runtime Notice]:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 rounded-3xl border border-rose-500/30 bg-[#0B1734]/95 p-8 shadow-2xl backdrop-blur-md">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-xs text-gray-400">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] text-gray-500">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C7A35A] px-5 py-3 font-semibold text-xs text-[#0B1734] hover:brightness-110 transition shadow-lg shadow-[#C7A35A]/20"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050A17] px-5 py-2.5 font-semibold text-xs text-gray-300 hover:text-white transition"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/contact"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-transparent px-4 py-2 text-xs text-gray-400 hover:text-[#DFC382] transition"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Helpdesk: +91 63069 17991</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
