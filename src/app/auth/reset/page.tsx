'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { supabaseUpdatePassword } from '@/lib/supabase/syncService';

function PasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, resetPasswordRequest } = useApp();

  const isInvite = searchParams.get('type') === 'invite';
  const initialEmail = searchParams.get('email') || '';

  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Form states
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuthRecovery() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) setCheckingSession(false);
        return;
      }

      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setHasRecoverySession(true);
        }

        // Listen for PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setHasRecoverySession(true);
          }
        });

        // Also check hash for access_token type=recovery
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          setHasRecoverySession(true);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn('[Auth Reset] Session check notice:', err);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    checkAuthRecovery();
    return () => {
      mounted = false;
    };
  }, []);

  // Request password reset link handler
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatusMessage({
        type: 'error',
        text:
          language === 'hi'
            ? 'कृपया अपना पंजीकृत ईमेल पता दर्ज करें।'
            : language === 'hinglish'
            ? 'Kripya apna registered email address enter karein.'
            : 'Please enter your registered email address.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordRequest(cleanEmail);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text:
            language === 'hi'
              ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है। कृपया अपना इनबॉक्स जांचें।'
              : language === 'hinglish'
              ? 'Password reset link aapke email par bhej diya gaya hai. Kripya apna inbox check karein.'
              : 'A password reset link has been dispatched to your email address. Please check your inbox.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text:
            res.error ||
            (language === 'hi'
              ? 'रीसेट लिंक भेजने में समस्या आई। कृपया ईमेल की पुष्टि करें।'
              : language === 'hinglish'
              ? 'Reset link bhejne mein issue aaya. Kripya email confirm karein.'
              : 'Failed to send password reset link. Please verify the email address.'),
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text:
          language === 'hi'
            ? 'तकनीकी त्रुटि। कृपया पुनः प्रयास करें।'
            : language === 'hinglish'
            ? 'Technical error. Kripya dubara koshish karein.'
            : 'A technical error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Set new password handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({
        type: 'error',
        text:
          language === 'hi'
            ? 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।'
            : language === 'hinglish'
            ? 'Password kam se kam 8 characters ka hona chahiye.'
            : 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text:
          language === 'hi'
            ? 'पासवर्ड मेल नहीं खाते। कृपया पुनः जांचें।'
            : language === 'hinglish'
            ? 'Passwords match nahi kar rahe. Kripya check karein.'
            : 'Passwords do not match. Please verify.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await supabaseUpdatePassword(newPassword);
      if (res && res.error) {
        setStatusMessage({
          type: 'error',
          text: res.error.message,
        });
      } else {
        setStatusMessage({
          type: 'success',
          text:
            language === 'hi'
              ? 'पासवर्ड सफलतापूर्वक अपडेट हो गया! लॉगिन पृष्ठ पर पुनर्निर्देशित किया जा रहा है...'
              : language === 'hinglish'
              ? 'Password successfully update ho gaya! Login page par redirect ho rahe hain...'
              : 'Password updated successfully! Redirecting to login portal...',
        });

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text:
          language === 'hi'
            ? 'पासवर्ड अपडेट करने में विफलता। कृपया पुनः प्रयास करें।'
            : language === 'hinglish'
            ? 'Password update karne mein dikkat aayi. Kripya dobara try karein.'
            : 'Failed to update password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <RefreshCw className="h-8 w-8 text-[#C7A35A] animate-spin" />
        <p className="text-xs text-gray-400">
          {language === 'hi'
            ? 'सुरक्षा सत्र की पुष्टि हो रही है...'
            : language === 'hinglish'
            ? 'Security session verify ho raha hai...'
            : 'Verifying security session...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0F1E3D]/95 to-[#070D1E]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#C7A35A]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C7A35A]/40 bg-gradient-to-br from-[#12234e] to-[#0B1734] shadow-lg shadow-[#C7A35A]/10 mb-4">
            {hasRecoverySession ? (
              <KeyRound className="h-7 w-7 text-[#C7A35A]" />
            ) : (
              <ShieldCheck className="h-7 w-7 text-[#C7A35A]" />
            )}
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
            {hasRecoverySession
              ? isInvite
                ? language === 'hi'
                  ? 'अपना पासवर्ड सेट करें'
                  : language === 'hinglish'
                  ? 'Apna Password Set Karein'
                  : 'Activate Your Account'
                : language === 'hi'
                ? 'नया पासवर्ड सेट करें'
                : language === 'hinglish'
                ? 'Naya Password Set Karein'
                : 'Set New Password'
              : language === 'hi'
              ? 'पासवर्ड रीसेट अनुरोध'
              : language === 'hinglish'
              ? 'Password Reset Request'
              : 'Reset Your Password'}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            {hasRecoverySession
              ? language === 'hi'
                ? 'कृपया अपने खाते के लिए एक मजबूत और सुरक्षित पासवर्ड दर्ज करें।'
                : language === 'hinglish'
                ? 'Kripya apne account ke liye strong password enter karein.'
                : 'Enter a secure password for your AKGV account.'
              : language === 'hi'
              ? 'अपना पंजीकृत ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट लिंक भेजेंगे।'
              : language === 'hinglish'
              ? 'Apna registered email enter karein. Hum aapko reset link bhejenge.'
              : 'Enter your registered email address to receive an official recovery link.'}
          </p>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mb-6 rounded-xl border p-3 text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-amber-500/40 bg-amber-950/40 text-amber-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {hasRecoverySession ? (
          /* FORM: SET NEW PASSWORD */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                {language === 'hi' ? 'नया पासवर्ड' : language === 'hinglish' ? 'Naya Password' : 'New Password'}
                <span className="text-[#C7A35A] ml-1">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:ring-1 focus:ring-[#C7A35A] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-gray-400">
                {language === 'hi'
                  ? 'न्यूनतम 8 वर्ण। अक्षर और अंक शामिल करें।'
                  : language === 'hinglish'
                  ? 'Minimum 8 characters. Letters aur numbers use karein.'
                  : 'Minimum 8 characters with letters and numbers.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                {language === 'hi'
                  ? 'पासवर्ड की पुष्टि करें'
                  : language === 'hinglish'
                  ? 'Confirm Password'
                  : 'Confirm Password'}
                <span className="text-[#C7A35A] ml-1">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:ring-1 focus:ring-[#C7A35A] focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] py-3 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {language === 'hi'
                      ? 'पासवर्ड सुरक्षित किया जा रहा है...'
                      : language === 'hinglish'
                      ? 'Updating password...'
                      : 'Updating Password...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {language === 'hi'
                      ? 'पासवर्ड सुरक्षित करें'
                      : language === 'hinglish'
                      ? 'Password Save Karein'
                      : 'Update & Secure Password'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORM: REQUEST RESET LINK */
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                {language === 'hi' ? 'पंजीकृत ईमेल' : language === 'hinglish' ? 'Registered Email' : 'Registered Email Address'}
                <span className="text-[#C7A35A] ml-1">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:ring-1 focus:ring-[#C7A35A] focus:outline-none transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {language === 'hi'
                  ? 'कंपनी में पंजीकृत ईमेल पता दर्ज करें।'
                  : language === 'hinglish'
                  ? 'Company mein registered email address enter karein.'
                  : 'Enter the email address registered with your AKGV account.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] py-3 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {language === 'hi'
                      ? 'अनुरोध भेजा जा रहा है...'
                      : language === 'hinglish'
                      ? 'Sending reset link...'
                      : 'Dispatching Link...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {language === 'hi'
                      ? 'रीसेट लिंक भेजें'
                      : language === 'hinglish'
                      ? 'Reset Link Bhejein'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Return to Login link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-[#C7A35A] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>
              {language === 'hi'
                ? 'लॉगिन पोर्टल पर वापस जाएं'
                : language === 'hinglish'
                ? 'Login portal par wapas jayein'
                : 'Back to Login Portal'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <div className="min-h-screen bg-[#050A17] text-white flex flex-col justify-between selection:bg-[#C7A35A] selection:text-[#0B1734]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B1734]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C7A35A] bg-gradient-to-br from-[#12234e] to-[#070D1E] shadow-lg shadow-[#C7A35A]/10">
              <Building2 className="h-5 w-5 text-[#C7A35A]" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wider text-white flex items-center gap-1.5">
                AKGV <span className="text-[#C7A35A]">INFRA CITY</span>
              </span>
              <span className="block text-[10px] tracking-widest text-[#DFC382]/80 uppercase font-sans">
                Corporate Account Security
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <RefreshCw className="h-8 w-8 text-[#C7A35A] animate-spin mb-3" />
              <p className="text-xs text-gray-400">Loading security portal...</p>
            </div>
          }
        >
          <PasswordResetContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050A17] py-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} AKGV Infra City Pvt. Ltd. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-gray-400">
          Strict Cryptographic Credentials • Zero Plaintext Storage
        </p>
      </footer>
    </div>
  );
}
