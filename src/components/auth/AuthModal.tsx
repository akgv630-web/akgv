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
import { tLang } from '@/lib/i18n';

const emptySubscribe = () => () => {};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'forgot';
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

  const [activeTab, setActiveTab] = useState<'login' | 'forgot'>('login');

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
        tLang(language, 'Please enter your mobile number, email, or member ID.', 'कृपया मोबाइल नंबर, ईमेल या सदस्य आईडी दर्ज करें।', 'Kripya mobile number, email ya member ID enter karein.')
      );
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError(
        tLang(language, 'Please enter your password.', 'कृपया पासवर्ड दर्ज करें।', 'Kripya password enter karein.')
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
            tLang(language, 'Authentication failed. Please verify credentials or contact the helpline.', 'प्रमाणीकरण विफल। क्रेडेंशियल जांचें या व्हाट्सएप हेल्पलाइन से संपर्क करें।', 'Authentication fail ho gaya. Credentials check karein ya helpline contact karein.')
        );
      }
    } catch {
      setLoginLoading(false);
      setLoginError(tLang(language, 'Authentication service unreachable. Please retry.', 'प्रमाणीकरण सेवा अनुपलब्ध है। कृपया पुनः प्रयास करें।', 'Authentication service unreachable. Kripya retry karein.'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) {
      setRegError(
        tLang(language, 'Please fill in your name, phone, and email.', 'कृपया नाम, फोन और ईमेल भरें।', 'Kripya name, phone aur email bharein.')
      );
      return;
    }

    if (!regPassword || regPassword.trim().length < 6) {
      setRegError(
        tLang(language, 'Password must be at least 6 characters long.', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', 'Password kam se kam 6 characters ka hona chahiye.')
      );
      return;
    }

    if (sponsorChecking) {
      setRegError(
        tLang(language, 'Sponsor verification is in progress, please wait a moment...', 'स्पॉन्सर सत्यापन प्रगति पर है, कृपया एक क्षण प्रतीक्षा करें...', 'Sponsor verification progress mein hai, kripya thoda wait karein...')
      );
      return;
    }

    if (!sponsorResult.valid) {
      setRegError(
        sponsorResult.error ||
          tLang(language, 'Invalid or inactive sponsor ID. Please verify the code.', 'अमान्य स्पॉन्सर कोड। कृपया सक्रिय सदस्य या सलाहकार आईडी दर्ज करें।', 'Invalid sponsor code. Kripya active member ID enter karein.')
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
      setForgotMsg(tLang(language, 'Please enter an email or phone', 'कृपया ईमेल या मोबाइल दर्ज करें', 'Kripya email ya mobile enter karein'));
      return;
    }

    setForgotLoading(true);
    if (forgotIdentifier.includes('@')) {
      const res = await resetPasswordRequest(forgotIdentifier.trim());
      setForgotLoading(false);
      if (res.success) {
        setForgotSent(true);
        setForgotMsg(tLang(language, 'Password reset link sent to your email inbox.', 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।', 'Password reset link aapke email par bhej diya gaya hai.'));
      } else {
        setForgotMsg(res.error || tLang(language, 'Could not send reset email. Contact support.', 'रीसेट ईमेल नहीं भेजा जा सका। कृपया सहायता डेस्क से संपर्क करें।', 'Reset email nahi bhej paye. Support se contact karein.'));
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
    setForgotMsg(tLang(language, 'Support ticket initiated via WhatsApp (+91 6306917991).', 'व्हाट्सएप सहायता टिकट प्रारंभ किया गया (+91 6306917991)।', 'WhatsApp helpline ticket start kiya gaya (+91 6306917991).'));
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#050A17]/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'login'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tLang(language, 'Sign In', 'लॉग इन', 'Sign In')}
          </button>
          
          <button
            onClick={() => setActiveTab('forgot')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'forgot'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tLang(language, 'Password Help', 'पासवर्ड सहायता', 'Password Help')}
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
                    {tLang(language, 'Login Successful!', 'लॉगिन सफल!', 'Login Safal!')}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {tLang(
                      language,
                      `Welcome back, ${loggedInName || currentUser?.fullName || 'User'}`,
                      `स्वागत है, ${loggedInName || currentUser?.fullName || 'उपयोगकर्ता'}`,
                      `Welcome, ${loggedInName || currentUser?.fullName || 'User'}`
                    )}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {tLang(language, 'Mobile Number / Email / Member ID', 'मोबाइल नंबर / ईमेल / सदस्य आईडी', 'Mobile Number / Email / Member ID')}
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
                        {tLang(language, 'Password', 'पासवर्ड', 'Password')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-[11px] text-[#DFC382] hover:underline"
                      >
                        {tLang(language, 'Forgot?', 'भूल गए?', 'Bhool gaye?')}
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
                      {tLang(language, 'Enter your authorized corporate or member password.', 'सुरक्षित पोर्टल पहुंच के लिए अपना अधिकृत पासवर्ड दर्ज करें।', 'Portal access ke liye apna authorized password enter karein.')}
                    </p>
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
                        <span>{tLang(language, 'Secure Portal Login', 'सुरक्षित पोर्टल लॉगिन', 'Secure Portal Login')}</span>
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
                  <span>{tLang(language, 'Authorized Access & IT Assistance', 'आधिकारिक पोर्टल सहायता', 'Authorized Access & IT Help')}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#050A17] p-3 text-[11px] text-gray-300 leading-relaxed space-y-1">
                  <p>
                    {tLang(
                      language,
                      'For enterprise account access, member verification, or credential assistance, contact corporate administration:',
                      'कॉर्पोरेट या सहयोगी पोर्टल क्रेडेंशियल सहायता के लिए, सीधे आधिकारिक आईटी डेस्क से संपर्क करें:',
                      'Enterprise account access ya credential help ke liye corporate admin se contact karein:'
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-[#DFC382]">
                    support@akgv.in • +91 6306917991 • Head Office, Varanasi
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Forgot Password */}
          {activeTab === 'forgot' && (
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                {tLang(
                  language,
                  'Enter your registered email address for an automated reset link, or use the verified WhatsApp support desk.',
                  'अपना पंजीकृत मोबाइल नंबर या ईमेल आईडी दर्ज करें। आप सीधे व्हाट्सएप हेल्पलाइन से भी पासवर्ड रीसेट प्राप्त कर सकते हैं।',
                  'Apna registered email ya mobile dalein reset link ke liye, ya WhatsApp helpline use karein.'
                )}
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {tLang(language, 'Registered Email or Mobile', 'पंजीकृत ईमेल या मोबाइल', 'Registered Email ya Mobile')}
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
                  {forgotLoading ? tLang(language, 'Processing...', 'प्रक्रिया जारी है...', 'Processing...') : tLang(language, 'Send Password Reset Link', 'पासवर्ड रीसेट लिंक भेजें', 'Password Reset Link Bhejein')}
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSendWhatsappReset}
                  className="w-full rounded-xl bg-[#25D366] py-2.5 font-bold text-xs text-white shadow-md hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                >
                  <span>{tLang(language, 'Reset via Official WhatsApp (+91 6306917991)', 'व्हाट्सएप से पासवर्ड रीसेट करें (+91 6306917991)', 'WhatsApp se Reset karein (+91 6306917991)')}</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-gray-300 hover:text-white transition"
                >
                  {tLang(language, 'Back to Sign In', 'लॉग इन पर वापस', 'Sign In par wapas')}
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
