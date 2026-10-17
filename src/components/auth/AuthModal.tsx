'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { UserRole } from '@/types';
import { resolveAndValidateSponsor, SponsorValidationResult } from '@/lib/supabase/syncService';

const emptySubscribe = () => () => {};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot' | 'sandbox';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const {
    loginWithCredentials,
    registerWithCredentials,
    resetPasswordRequest,
    language,
    currentUser,
  } = useApp();

  const isDev = process.env.NODE_ENV !== 'production';
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isDemo = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      const host = window.location.hostname;
      return (
        process.env.NODE_ENV !== 'production' ||
        host.includes('pages.dev') ||
        host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.includes('vercel.app')
      );
    },
    () => false
  );
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'sandbox'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInName, setLoggedInName] = useState('');

  // Register form state (Public registration is strictly for buyers)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const regRole: UserRole = 'buyer';
  const [regSponsorCode, setRegSponsorCode] = useState('AKGV-3498'); // default sponsor
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [registeredBuyerName, setRegisteredBuyerName] = useState<string | null>(null);
  const [emailConfirmationNotice, setEmailConfirmationNotice] = useState<boolean>(false);
  const [registeredEmailSuccess, setRegisteredEmailSuccess] = useState<string | null>(null);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const resetRegState = () => {
    setRegisteredBuyerName(null);
    setEmailConfirmationNotice(false);
    setRegisteredEmailSuccess(null);
  };

  const [sponsorResult, setSponsorResult] = useState<SponsorValidationResult>({
    valid: true,
    canonicalSponsorId: 'AKGV-3498',
    sponsorMemberId: 'AKGV-3498',
    sponsorName: 'Vikram Singh',
    sponsorRole: 'senior_member',
  });
  const [sponsorChecking, setSponsorChecking] = useState(false);

  useEffect(() => {
    const trimmed = regSponsorCode.trim();
    let active = true;

    const timer = setTimeout(async () => {
      if (!trimmed) {
        if (active) {
          setSponsorResult({ valid: false, error: 'Sponsor ID / referral code is required.' });
          setSponsorChecking(false);
        }
        return;
      }

      if (active) setSponsorChecking(true);
      try {
        const res = await resolveAndValidateSponsor(trimmed);
        if (active) {
          setSponsorResult(res);
          setSponsorChecking(false);
        }
      } catch {
        if (active) {
          setSponsorResult({ valid: false, error: 'Unable to verify sponsor code.' });
          setSponsorChecking(false);
        }
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [regSponsorCode]);

  if (!isOpen || !isMounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError(
        language === 'hi'
          ? 'कृपया मोबाइल नंबर, ईमेल या सदस्य आईडी दर्ज करें।'
          : 'Please enter your mobile number, email, or member ID.'
      );
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError(
        language === 'hi'
          ? 'कृपया पासवर्ड दर्ज करें।'
          : 'Please enter your password.'
      );
      return;
    }

    setLoginLoading(true);
    try {
      const res = await loginWithCredentials(loginIdentifier.trim(), loginPassword.trim());
      setLoginLoading(false);
      if (res.success && res.profile) {
        setLoggedInName(res.profile.fullName);
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginSuccess(false);
          onClose();
        }, 1200);
      } else {
        setLoginError(
          res.error ||
            (language === 'hi'
              ? 'प्रमाणीकरण विफल। क्रेडेंशियल जांचें या व्हाट्सएप हेल्पलाइन से संपर्क करें।'
              : 'Authentication failed. Please verify credentials or contact the helpline.')
        );
      }
    } catch {
      setLoginLoading(false);
      setLoginError('Authentication service unreachable. Please retry.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) {
      setRegError(
        language === 'hi'
          ? 'कृपया नाम, फोन और ईमेल भरें।'
          : 'Please fill in your name, phone, and email.'
      );
      return;
    }

    if (!regPassword || regPassword.trim().length < 6) {
      setRegError(
        language === 'hi'
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (sponsorChecking) {
      setRegError(
        language === 'hi'
          ? 'स्पॉन्सर सत्यापन प्रगति पर है, कृपया एक क्षण प्रतीक्षा करें...'
          : 'Sponsor verification is in progress, please wait a moment...'
      );
      return;
    }

    if (!sponsorResult.valid) {
      setRegError(
        sponsorResult.error ||
          (language === 'hi'
            ? 'अमान्य स्पॉन्सर कोड। कृपया सक्रिय सदस्य या सलाहकार आईडी दर्ज करें।'
            : 'Invalid or inactive sponsor ID. Please verify the code.')
      );
      return;
    }

    setRegLoading(true);
    try {
      const res = await registerWithCredentials({
        fullName: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword.trim(),
        role: regRole,
        sponsorId: sponsorResult.canonicalSponsorId || regSponsorCode.trim() || undefined,
      });
      setRegLoading(false);
      if (res.success) {
        if (res.emailConfirmationRequired) {
          setRegisteredEmailSuccess(regEmail.trim());
          setEmailConfirmationNotice(true);
        } else if (res.profile) {
          setRegisteredBuyerName(res.profile.fullName);
        }
      } else {
        setRegError(res.error || 'Registration failed with authentication service. Please verify your details.');
      }
    } catch (err: unknown) {
      setRegLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration error. Please try again.';
      setRegError(msg);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotMsg(language === 'hi' ? 'कृपया ईमेल या मोबाइल दर्ज करें' : 'Please enter an email or phone');
      return;
    }

    setForgotLoading(true);
    if (forgotIdentifier.includes('@')) {
      const res = await resetPasswordRequest(forgotIdentifier.trim());
      setForgotLoading(false);
      if (res.success) {
        setForgotSent(true);
        setForgotMsg('Password reset link sent to your email inbox.');
      } else {
        setForgotMsg(res.error || 'Could not send reset email. Contact support.');
      }
    } else {
      setForgotLoading(false);
      handleSendWhatsappReset();
    }
  };

  const handleSendWhatsappReset = () => {
    const text = encodeURIComponent(
      `Hello AKGV Infra City Support, I need password reset assistance for account (${forgotIdentifier || 'My Mobile'}).`
    );
    window.open(`https://wa.me/916306917991?text=${text}`, '_blank');
    setForgotSent(true);
    setForgotMsg('Support ticket initiated via WhatsApp (+91 6306917991).');
  };

  const handleQuickSandboxLogin = async (role: UserRole, identifier: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword('akgv@2026');
    const res = await loginWithCredentials(identifier, 'akgv@2026');
    if (res.success && res.profile) {
      setLoggedInName(res.profile.fullName);
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        onClose();
      }, 1000);
    } else {
      setLoginError(res.error || 'Authentication failed. Please verify credentials.');
      setActiveTab('login');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] my-auto flex flex-col rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] shadow-2xl overflow-hidden text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#050A17] via-[#0B1734] to-[#050A17] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1734] border border-[#C7A35A] shadow-md">
              <span className="font-serif font-bold text-xs text-[#C7A35A]">AKGV</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-bold tracking-wider text-white">AKGV</span>
                <span className="text-xs font-semibold tracking-wider text-[#C7A35A]">INFRA CITY</span>
              </div>
              <p className="text-[10px] text-gray-400">Portal Authentication & Member Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs - Self-registration disabled, unified sign in */}
        <div className="flex border-b border-white/10 bg-[#050A17]/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'login'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'लॉग इन (Sign In)' : 'Sign In'}
          </button>
          {(isDev || isDemo) && (
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex-1 py-3 text-center transition border-b-2 ${
                activeTab === 'sandbox'
                  ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? 'सैंडबॉक्स टेस्ट' : 'Sandbox Roles'}
            </button>
          )}
          <button
            onClick={() => setActiveTab('forgot')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'forgot'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'पासवर्ड सहायता' : 'Password Help'}
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab 1: Login */}
          {activeTab === 'login' && (
            <div className="p-6 space-y-5">
              {loginSuccess ? (
                <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/30 p-6 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">
                    {language === 'hi' ? 'लॉगिन सफल!' : 'Login Successful!'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {language === 'hi'
                      ? `स्वागत है, ${loggedInName || currentUser?.fullName || 'उपयोगकर्ता'}`
                      : `Welcome back, ${loggedInName || currentUser?.fullName || 'User'}`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {language === 'hi'
                        ? 'मोबाइल / ईमेल / सदस्य आईडी (Member ID)'
                        : 'Mobile Number / Email / Member ID (e.g. AKGV-HQ-001 or 6306917991)'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. 6306917991 or AKGV-3498"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-300">
                        {language === 'hi' ? 'पासवर्ड' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-[11px] text-[#DFC382] hover:underline"
                      >
                        {language === 'hi' ? 'भूल गए?' : 'Forgot?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {language === 'hi'
                        ? 'सुरक्षित पोर्टल पहुंच के लिए अपना अधिकृत पासवर्ड दर्ज करें।'
                        : 'Enter your authorized corporate or member password.'}
                    </p>
                  </div>

                  {/* Pre-Seeded Super Admin Access Badge */}
                  <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17] p-2.5 text-[11px] text-gray-300 space-y-1.5">
                    <div className="flex items-center justify-between text-[#DFC382] font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-[#C7A35A]" />
                        <span>{language === 'hi' ? 'सुपर एडमिन एक्सेस (Pre-Configured):' : 'Super Admin Pre-Configured Access:'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('6306917991');
                          setLoginPassword('akgv@2026');
                          setLoginError('');
                        }}
                        className="rounded bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382] hover:bg-[#C7A35A]/30 transition"
                      >
                        {language === 'hi' ? 'ऑटो-भरें (Auto-Fill)' : 'Auto-Fill'}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                      <span>ID/Phone: <strong className="text-white">6306917991</strong></span>
                      <span>•</span>
                      <span>Pass: <strong className="text-white">akgv@2026</strong></span>
                    </div>
                  </div>

                  {loginError && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 font-bold text-xs text-[#0B1734] shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>{language === 'hi' ? 'सुरक्षित पोर्टल लॉगिन' : 'Secure Portal Login'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Authorized Access & IT Assistance */}
              <div className="border-t border-white/10 pt-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#DFC382] font-semibold text-[11px]">
                  <ShieldCheck className="h-4 w-4 text-[#C7A35A]" />
                  <span>{language === 'hi' ? 'आधिकारिक पोर्टल सहायता' : 'Authorized Access & IT Assistance'}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#050A17] p-3 text-[11px] text-gray-300 leading-relaxed space-y-1">
                  <p>
                    {language === 'hi'
                      ? 'कॉर्पोरेट या सहयोगी पोर्टल क्रेडेंशियल सहायता के लिए, सीधे आधिकारिक आईटी डेस्क से संपर्क करें:'
                      : 'For enterprise account access, member verification, or credential assistance, contact corporate administration:'}
                  </p>
                  <p className="font-mono text-[10px] text-[#DFC382]">
                    support@akgv.in • +91 6306917991 • Head Office, Varanasi
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Registration Policy (Self-registration strictly disabled) */}
          {activeTab === 'register' && (
            <div className="p-6 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 text-[#C7A35A] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-white">
                {language === 'hi' ? 'सेल्फ-पंजीकरण बंद है' : 'Public Registration Closed'}
              </h3>
              <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 text-xs text-gray-300 space-y-2 max-w-sm mx-auto">
                <p>
                  {language === 'hi'
                    ? 'AKGV इन्फ्रा सिटी एक प्राइवेट एवं अधिकृत पोर्टल है। यहाँ कोई भी व्यक्ति स्वयं से पंजीकरण नहीं कर सकता।'
                    : 'AKGV Infra City is an exclusive private portal. Self-registration is strictly disabled.'}
                </p>
                <p className="text-[11px] text-[#DFC382]">
                  {language === 'hi'
                    ? 'नए एसोसिएट एवं ग्राहक खाते केवल कंपनी एडमिन द्वारा जारी किए जाते हैं। कृपया अपने लॉगिन क्रेडेंशियल्स के लिए कंपनी मुख्यालय (6306917991) से संपर्क करें।'
                    : 'New accounts are provisioned solely by AKGV Administration. Contact HQ at +91 6306917991 for access.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('login')}
                className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 font-bold text-xs text-[#0B1734] hover:brightness-110 transition"
              >
                {language === 'hi' ? 'लॉगिन स्क्रीन पर जाएं' : 'Proceed to Sign In'}
              </button>
            </div>
          )}

          {/* Tab 3: Sandbox Quick Evaluation (Available on local dev and preview hosts) */}
          {(isDev || isDemo) && activeTab === 'sandbox' && (
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17] p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#DFC382]">
                  <Sparkles className="h-4 w-4 text-[#C7A35A]" />
                  <span>Sandbox Evaluation Directory</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Click any account below to sign in instantly with full role-based permissions and test dashboards, master plan, booking flows, and reports.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Super Admin */}
                <div className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 hover:border-purple-400/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">Preet Yadav</span>
                      <span className="rounded bg-purple-500/30 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">SUPER ADMIN</span>
                    </div>
                    <p className="text-[10px] text-gray-400">ID: AKGV-HQ-001 | Phone: 6306917991</p>
                  </div>
                  <button
                    onClick={() => handleQuickSandboxLogin('super_admin', '6306917991')}
                    className="rounded-lg bg-purple-500/20 border border-purple-400/40 px-3 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-500/30"
                  >
                    Sign In
                  </button>
                </div>

                {/* Senior Member */}
                <div className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 hover:border-blue-400/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">Vikram Singh</span>
                      <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">SENIOR MANAGER</span>
                    </div>
                    <p className="text-[10px] text-gray-400">ID: AKGV-3498 | Phone: 9876543210</p>
                  </div>
                  <button
                    onClick={() => handleQuickSandboxLogin('senior_member', '9876543210')}
                    className="rounded-lg bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-500/30"
                  >
                    Sign In
                  </button>
                </div>

                {/* Junior Member */}
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 hover:border-emerald-400/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">Priya Sharma</span>
                      <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">FIELD ASSOCIATE</span>
                    </div>
                    <p className="text-[10px] text-gray-400">ID: AKGV-7821 | Phone: 9876543211</p>
                  </div>
                  <button
                    onClick={() => handleQuickSandboxLogin('junior_member', '9876543211')}
                    className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
                  >
                    Sign In
                  </button>
                </div>

                {/* Buyer */}
                <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 hover:border-amber-400/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">Rajesh Verma</span>
                      <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">PLOT BUYER</span>
                    </div>
                    <p className="text-[10px] text-gray-400">ID: AKGV-BUYER-01 | Phone: 9876543212</p>
                  </div>
                  <button
                    onClick={() => handleQuickSandboxLogin('buyer', '9876543212')}
                    className="rounded-lg bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Forgot Password */}
          {activeTab === 'forgot' && (
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'अपना पंजीकृत मोबाइल नंबर या ईमेल आईडी दर्ज करें। आप सीधे व्हाट्सएप हेल्पलाइन से भी पासवर्ड रीसेट प्राप्त कर सकते हैं।'
                  : 'Enter your registered email address for an automated reset link, or use the verified WhatsApp support desk.'}
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {language === 'hi' ? 'पंजीकृत ईमेल या मोबाइल' : 'Registered Email or Mobile'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. name@gmail.com or 6306917991"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                {forgotMsg && (
                  <div className={`rounded-xl border p-3 text-xs ${forgotSent ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-amber-500/40 bg-amber-950/30 text-amber-300'}`}>
                    {forgotMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2 font-bold text-xs text-[#0B1734] shadow-md transition disabled:opacity-50"
                >
                  {forgotLoading ? 'Processing...' : 'Send Password Reset Link'}
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSendWhatsappReset}
                  className="w-full rounded-xl bg-[#25D366] py-2.5 font-bold text-xs text-white shadow-md hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                >
                  <span>Reset via Official WhatsApp (+91 6306917991)</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-gray-300 hover:text-white transition"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="shrink-0 border-t border-white/10 bg-[#050A17] px-6 py-3 text-[11px] text-gray-400 flex items-center justify-between">
          <span>Official Helpline: {COMPANY_DETAILS.displayPhone}</span>
          <span className="text-[#DFC382]">Varanasi, UP</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
