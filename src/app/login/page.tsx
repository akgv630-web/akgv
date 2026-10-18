'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, safeRedirectUrl } from '@/context/AppContext';
import { tLang } from '@/lib/i18n';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { loginWithCredentials, currentUser, language } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<string | null>(null);

  // Auto-fill and 1-Click Auto-Login from WhatsApp / Email welcome link
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('identifier') || params.get('email') || params.get('id') || params.get('phone');
    const urlPwd = params.get('password') || params.get('pwd') || params.get('pass');
    const auto = params.get('auto') === '1' || params.get('autologin') === 'true';

    if (urlId) {
      setIdentifier(decodeURIComponent(urlId));
    }
    if (urlPwd) {
      setPassword(decodeURIComponent(urlPwd));
    }

    if (urlId && urlPwd && auto) {
      const cleanId = decodeURIComponent(urlId).trim();
      const cleanPwd = decodeURIComponent(urlPwd).trim();
      setLoading(true);
      loginWithCredentials(cleanId, cleanPwd)
        .then((res) => {
          if (res.success && res.profile) {
            setSuccess(true);
            setSuccessUser(res.profile.fullName || res.profile.email);
            setTimeout(() => {
              const returnUrl = params.get('returnUrl') || params.get('redirect');
              if (returnUrl) {
                const safe = safeRedirectUrl(returnUrl, '');
                if (safe) {
                  router.push(safe);
                  return;
                }
              }
              const role = res.profile?.role;
              if (role === 'super_admin' || role === 'sub_admin') {
                router.push('/admin');
              } else if (role === 'senior_member' || role === 'junior_member') {
                router.push('/member');
              } else if (role === 'buyer') {
                router.push('/buyer');
              } else {
                router.push('/');
              }
            }, 600);
          } else {
            setError(res.error || 'Auto-login failed. Please verify credentials.');
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Auto-login service error.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError(
        language === 'hi'
          ? 'कृपया अपनी लॉगिन आईडी, ईमेल या मोबाइल नंबर दर्ज करें।'
          : language === 'hinglish'
          ? 'Kripya apni login ID, email ya mobile number enter karein.'
          : 'Please enter your Member ID, Email, or Mobile Number.'
      );
      return;
    }

    if (!password.trim()) {
      setError(
        language === 'hi'
          ? 'कृपया अपना पासवर्ड दर्ज करें।'
          : language === 'hinglish'
          ? 'Kripya apna password enter karein.'
          : 'Please enter your password.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await loginWithCredentials(trimmedId, password.trim());
      if (res.success && res.profile) {
        setSuccess(true);
        setSuccessUser(res.profile.fullName || res.profile.email);

        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get('returnUrl') || params.get('redirect');
            if (returnUrl) {
              const safe = safeRedirectUrl(returnUrl, '');
              if (safe) {
                router.push(safe);
                return;
              }
            }
          }

          const role = res.profile?.role;
          if (role === 'super_admin' || role === 'sub_admin') {
            router.push('/admin');
          } else if (role === 'senior_member' || role === 'junior_member') {
            router.push('/member');
          } else if (role === 'buyer') {
            router.push('/buyer');
          } else {
            router.push('/');
          }
        }, 800);
      } else {
        setError(
          res.error ||
            (language === 'hi'
              ? 'अमान्य क्रेडेंशियल्स। कृपया अपनी आईडी और पासवर्ड पुनः जांचें।'
              : language === 'hinglish'
              ? 'Invalid credentials. Kripya apni ID aur password check karein.'
              : 'Invalid credentials. Please verify your ID and password.')
        );
      }
    } catch {
      setError(
        language === 'hi'
          ? 'लॉगिन करते समय तकनीकी समस्या आई। कृपया पुनः प्रयास करें।'
          : language === 'hinglish'
          ? 'Login karte waqt technical issue aaya. Kripya dubara koshish karein.'
          : 'A technical error occurred while signing in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A17] text-white flex flex-col justify-between selection:bg-[#C7A35A] selection:text-[#0B1734]">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-[#0B1734]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C7A35A] bg-gradient-to-br from-[#12234e] to-[#070D1E] shadow-lg shadow-[#C7A35A]/10">
              <Building2 className="h-5 w-5 text-[#C7A35A]" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wider text-white flex items-center gap-1.5">
                AKGV <span className="text-[#C7A35A]">INFRA CITY</span>
              </span>
              <span className="block text-[10px] tracking-widest text-[#DFC382]/80 uppercase font-sans">
                Corporate & Client Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#DFC382] transition bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>
              {language === 'hi'
                ? 'वेबसाइट पर वापस'
                : language === 'hinglish'
                ? 'Website Par Wapas'
                : 'Back to Website'}
            </span>
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[#C7A35A]/40 bg-[#070D1E] p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#C7A35A]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="text-center space-y-2 mb-6 relative">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C7A35A]/50 bg-[#0B1734] shadow-inner mb-1">
                <Lock className="h-6 w-6 text-[#C7A35A]" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
                {language === 'hi'
                  ? 'आधिकारिक पोर्टल लॉगिन'
                  : language === 'hinglish'
                  ? 'Official Portal Login'
                  : 'Official Portal Login'}
              </h1>
              <p className="text-xs text-gray-300">
                {language === 'hi'
                  ? 'कंपनी एडमिन, एसोसिएट टीम सदस्य एवं अधिकृत ग्राहक'
                  : language === 'hinglish'
                  ? 'Company Admin, Associate Members aur Authorized Clients'
                  : 'Company Admin, Associate Members & Authorized Clients'}
              </p>
            </div>

            {/* Success State */}
            {success ? (
              <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-6 text-center space-y-3 animate-in fade-in duration-300">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h2 className="font-serif text-lg font-bold text-white">
                  {language === 'hi' ? 'लॉगिन सफल!' : language === 'hinglish' ? 'Login Safal!' : 'Login Successful!'}
                </h2>
                <p className="text-xs text-emerald-200">
                  {language === 'hi'
                    ? `स्वागत है, ${successUser || 'उपयोगकर्ता'}। डैशबोर्ड लोड हो रहा है...`
                    : language === 'hinglish'
                    ? `Welcome, ${successUser || 'User'}. Dashboard open ho raha hai...`
                    : `Welcome, ${successUser || 'User'}. Redirecting to your dashboard...`}
                </p>
                <div className="pt-2">
                  <RefreshCw className="h-5 w-5 text-emerald-400 animate-spin mx-auto" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 relative">
                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                    {language === 'hi'
                      ? 'लॉगिन आईडी / ईमेल / मोबाइल नंबर'
                      : language === 'hinglish'
                      ? 'Login ID / Email / Mobile Number'
                      : 'Login ID / Email / Mobile Number'}
                    <span className="text-[#C7A35A] ml-1">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder={tLang(
                        language,
                        'e.g. AKGV-5821, 6306917991, admin@akgv.com',
                        'उदा. AKGV-5821, 6306917991, admin@akgv.com',
                        'e.g. AKGV-5821, 6306917991, admin@akgv.com'
                      )}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:ring-1 focus:ring-[#C7A35A] focus:outline-none transition"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {language === 'hi' ? (
                      <>एसोसिएट अपनी <strong className="text-gray-300">सदस्य आईडी (जैसे AKGV-...)</strong> या मोबाइल डालें। ग्राहक अपना ईमेल/फोन दर्ज करें।</>
                    ) : language === 'hinglish' ? (
                      <>Associate apni <strong className="text-gray-300">Member ID (e.g. AKGV-...)</strong> ya mobile dalein. Customer apna email/phone enter karein.</>
                    ) : (
                      <>Associates enter your <strong className="text-gray-300">Member ID (e.g. AKGV-...)</strong> or mobile. Clients enter registered email/phone.</>
                    )}
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-200">
                      {language === 'hi' ? 'पासवर्ड' : language === 'hinglish' ? 'Password' : 'Password'}
                      <span className="text-[#C7A35A] ml-1">*</span>
                    </label>
                    <Link
                      href="/auth/reset"
                      className="text-[11px] text-[#DFC382] hover:text-[#C7A35A] hover:underline transition"
                    >
                      {language === 'hi' ? 'पासवर्ड भूल गए?' : language === 'hinglish' ? 'Password bhool gaye?' : 'Forgot Password?'}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:ring-1 focus:ring-[#C7A35A] focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {language === 'hi'
                      ? 'अपना पंजीकृत खाता पासवर्ड अथवा आमंत्रण लिंक द्वारा सेट किया पासवर्ड दर्ज करें।'
                      : language === 'hinglish'
                      ? 'Apna registered password ya invite link dwara set kiya gaya password enter karein.'
                      : 'Enter your account password or the password set via invitation link.'}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] py-3 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>
                        {language === 'hi'
                          ? 'प्रमाणीकरण हो रहा है...'
                          : language === 'hinglish'
                          ? 'Authenticating...'
                          : 'Authenticating...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {language === 'hi'
                          ? 'सुरक्षित लॉगिन करें'
                          : language === 'hinglish'
                          ? 'Surakshit Login Karein'
                          : 'Sign In Securely'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* No Self-Registration Notice */}
                <div className="rounded-xl border border-white/10 bg-[#050A17]/60 p-3 text-[11px] text-gray-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#C7A35A]" />
                    <span>
                      {language === 'hi'
                        ? 'पंजीकरण नीति:'
                        : language === 'hinglish'
                        ? 'Registration Policy:'
                        : 'Registration Policy:'}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {language === 'hi'
                      ? 'AKGV इन्फ्रा सिटी एक एक्सक्लूसिव प्राइवेट पोर्टल है। यहाँ कोई भी व्यक्ति स्वयं से रजिस्ट्रेशन नहीं कर सकता। नए खाते केवल कंपनी एडमिन द्वारा जारी किए जाते हैं।'
                      : language === 'hinglish'
                      ? 'AKGV Infra City ek exclusive private portal hai. Yahan koi bhi person self-registration nahi kar sakta. Naye accounts sirf company admin dwara issue kiye jaate hain.'
                      : 'AKGV Infra City is an exclusive private enterprise portal. Self-registration is strictly restricted. All authorized accounts and credentials are provisioned exclusively by system administrators.'}
                  </p>
                </div>
              </form>
            )}

            {/* Help & Support */}
            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <p className="text-[11px] text-gray-400">
                {language === 'hi'
                  ? 'लॉगिन या आईडी में सहायता के लिए कंपनी मुख्यालय से संपर्क करें:'
                  : language === 'hinglish'
                  ? 'Login ya ID me help ke liye company head office se contact karein:'
                  : 'For credential inquiries or login assistance, contact company headquarters:'}
              </p>
              <a
                href="tel:6306917991"
                className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-[#DFC382] hover:underline"
              >
                <Phone className="h-3.5 w-3.5 text-[#C7A35A]" />
                <span>+91 6306917991 (AKGV Head Office)</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0B1734]/60 py-4 text-center text-xs text-gray-400">
        <p>
          © 2026 AKGV Infra City Private Limited.{' '}
          {language === 'hi'
            ? 'सर्वाधिकार सुरक्षित।'
            : language === 'hinglish'
            ? 'All Rights Reserved.'
            : 'All Rights Reserved.'}
        </p>
      </footer>
    </div>
  );
}
