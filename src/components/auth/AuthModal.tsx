'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
  X,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { allProfiles, loginUser, registerMember, switchUserRole, language, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('junior_member');
  const [regSponsorCode, setRegSponsorCode] = useState('AKGV-3498'); // default sponsor
  const [regError, setRegError] = useState('');
  const [registeredMemberCode, setRegisteredMemberCode] = useState<string | null>(null);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  // Real-time sponsor verification
  const normalizedSponsor = regSponsorCode.trim().toUpperCase();
  const matchedSponsor = allProfiles.find(
    (p) =>
      p.memberId?.toUpperCase() === normalizedSponsor ||
      p.id.toUpperCase() === normalizedSponsor ||
      (normalizedSponsor === 'AKGV3498' && p.memberId === 'AKGV-3498') ||
      (normalizedSponsor.startsWith('AKGV') && normalizedSponsor.length >= 6)
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError(
        language === 'hi'
          ? 'कृपया मोबाइल नंबर, ईमेल या सदस्य आईडी दर्ज करें।'
          : language === 'hinglish'
          ? 'Kripya mobile number, email ya member ID enter karein.'
          : 'Please enter your mobile number, email, or member ID.'
      );
      return;
    }

    const user = loginUser(loginIdentifier);
    if (user) {
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        onClose();
      }, 1200);
    } else {
      setLoginError(
        language === 'hi'
          ? 'यह मोबाइल नंबर, ईमेल या सदस्य आईडी पंजीकृत नहीं है। कृपया नया पंजीकरण करें या सहायता के लिए +91 6306917991 पर संपर्क करें।'
          : language === 'hinglish'
          ? 'Ye mobile number ya member ID registered nahi hai. Naya registration karein ya help desk 6306917991 par contact karein.'
          : 'Account not found for this identifier. Please register as a new member or contact the corporate helpdesk at +91 6306917991.'
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) {
      setRegError(
        language === 'hi'
          ? 'कृपया नाम, फोन और ईमेल भरें।'
          : language === 'hinglish'
          ? 'Kripya naam, phone aur email fields bharein.'
          : 'Please fill in your name, phone, and email.'
      );
      return;
    }

    try {
      const created = registerMember({
        fullName: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        role: regRole,
        sponsorId: regSponsorCode.trim() || 'AKGV-3498',
      });
      setRegisteredMemberCode(created.memberId || 'AKGV-NEW');
    } catch {
      setRegError(
        language === 'hi'
          ? 'पंजीकरण में त्रुटि हुई। पुनः प्रयास करें।'
          : language === 'hinglish'
          ? 'Registration me error hua. Dobara koshish karein.'
          : 'Registration failed. Please try again.'
      );
    }
  };

  const handleSendWhatsappReset = () => {
    const text = encodeURIComponent(
      `Hello AKGV Infra City Support, I need password reset assistance for my account (${forgotIdentifier || 'My Mobile'}).`
    );
    window.open(`https://wa.me/916306917991?text=${text}`, '_blank');
    setForgotSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] shadow-2xl overflow-hidden text-gray-200"
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
            onClick={() => {
              setActiveTab('login');
              setRegisteredMemberCode(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'login'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'लॉग इन' : language === 'hinglish' ? 'Login' : 'Sign In'}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegisteredMemberCode(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'register'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {language === 'hi'
              ? 'नया पंजीकरण (स्पॉन्सर आईडी)'
              : language === 'hinglish'
              ? 'Register (Sponsor Code)'
              : 'Register (With Sponsor)'}
          </button>
          <button
            onClick={() => {
              setActiveTab('forgot');
              setRegisteredMemberCode(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'forgot'
                ? 'border-[#C7A35A] text-[#DFC382] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'पासवर्ड भूल गए?' : language === 'hinglish' ? 'Forgot Pass' : 'Forgot Password'}
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
                  {language === 'hi' ? 'लॉगिन सफल!' : language === 'hinglish' ? 'Login Successful!' : 'Welcome Back!'}
                </h3>
                <p className="text-xs text-emerald-200">
                  {language === 'hi'
                    ? `स्वागत है, ${currentUser.fullName}`
                    : `Welcome, ${currentUser.fullName} (${currentUser.role})`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {language === 'hi'
                      ? 'मोबाइल / ईमेल / सदस्य आईडी (Member ID)'
                      : language === 'hinglish'
                      ? 'Mobile / Email / Member ID (Jaise AKGV-3498)'
                      : 'Mobile Number / Email / Member Code (e.g. AKGV-3498)'}
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
                      {language === 'hi' ? 'पासवर्ड' : language === 'hinglish' ? 'Password' : 'Password'}
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
                </div>

                {loginError && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 font-bold text-xs text-[#0B1734] shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
                >
                  <span>{language === 'hi' ? 'सुरक्षित पोर्टल लॉगिन' : 'Secure Portal Login'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Official Corporate Help / Access Guide */}
            <div className="border-t border-white/10 pt-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#DFC382] font-semibold text-[11px]">
                <ShieldCheck className="h-4 w-4 text-[#C7A35A]" />
                <span>{language === 'hi' ? 'आधिकारिक पोर्टल लॉगिन सहायता' : 'Corporate Account Access Assistance'}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#050A17] p-3 text-[11px] text-gray-300 space-y-1">
                <div>
                  <strong className="text-white">Admin / Director:</strong>{' '}
                  <span className="font-mono text-[#DFC382]">6306917991</span>{' '}
                  <span className="text-gray-400">or</span>{' '}
                  <span className="font-mono text-[#DFC382]">AKGV-HQ-001</span>
                </div>
                <div>
                  <strong className="text-white">Senior Associate Code:</strong>{' '}
                  <span className="font-mono text-[#DFC382]">AKGV-3498</span>{' '}
                  <span className="text-gray-400">or</span>{' '}
                  <span className="font-mono text-[#DFC382]">9876543210</span>
                </div>
                <div className="text-[10px] text-gray-400 pt-1 border-t border-white/5">
                  {language === 'hi'
                    ? 'प्लॉट खरीदार अपने पंजीकृत मोबाइल नंबर से सीधे लॉगिन या नया पंजीकरण कर सकते हैं।'
                    : 'Plot buyers can log in or register directly with their registered mobile number.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Register with Sponsor ID */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {registeredMemberCode ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">
                  {language === 'hi' ? 'पंजीकरण सफल!' : 'Registration Successful!'}
                </h3>
                <div className="rounded-xl bg-[#050A17] p-4 border border-[#C7A35A]/40 text-xs space-y-1">
                  <span className="text-gray-400 block">Your Unique AKGV Member Code:</span>
                  <span className="font-mono text-xl font-bold text-[#DFC382] block">{registeredMemberCode}</span>
                  <span className="text-[11px] text-emerald-300">
                    Sponsor Verified: {regSponsorCode || 'AKGV-3498'}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {language === 'hi'
                    ? 'कृपया अपने ₹999 जॉइनिंग किट (बैग, पेन, डायरी, प्रोजेक्ट फाइल) के लिए नजदीकी शाखा कार्यालय से संपर्क करें।'
                    : 'Please collect your ₹999 physical joining kit (Bag, Pen, Diary, File) from the company offline branch.'}
                </p>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-[#C7A35A] px-5 py-2 font-bold text-xs text-[#0B1734]"
                >
                  {language === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Proceed to Dashboard'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Sponsor Code Input with Real-time Check */}
                <div className="rounded-2xl border border-[#C7A35A]/40 bg-[#050A17] p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#DFC382] flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{language === 'hi' ? 'स्पॉन्सर आईडी / कोड' : 'Sponsor ID / Referral Code'}</span>
                    </label>
                    <span className="text-[10px] text-gray-400">Required</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. AKGV-3498 or akgv34..."
                    value={regSponsorCode}
                    onChange={(e) => setRegSponsorCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1734] px-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                  {matchedSponsor ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>
                        Verified: {matchedSponsor.fullName} ({matchedSponsor.memberId || 'Active Associate'})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
                      <Sparkles className="h-3 w-3 shrink-0 text-[#C7A35A]" />
                      <span>
                        Tip: You can use company default sponsor <strong>AKGV-3498</strong> (Vikram Singh)
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {language === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 98XXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {language === 'hi' ? 'पंजीकरण का प्रकार' : 'Account Role'}
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                    >
                      <option value="junior_member">Field Associate / Partner</option>
                      <option value="buyer">Plot Buyer / Investor</option>
                      <option value="senior_member">Senior Area Manager</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {language === 'hi' ? 'पासवर्ड बनाएं' : 'Create Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-[#050A17] p-3 text-[11px] text-gray-400 space-y-1">
                  <div className="font-semibold text-[#DFC382]">Notice on Joining Kit & Plot Sales:</div>
                  <p>
                    AKGV Infra City sells approved residential plots only. Joining fee ₹999 provides 1 Bag, 1 Pen, 1 Diary, and 1 Project File handed over physically via branch office cash ledger.
                  </p>
                </div>

                {regError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-2.5 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 font-bold text-xs text-[#0B1734] shadow-lg hover:brightness-110 active:scale-[0.99] transition"
                >
                  {language === 'hi' ? 'खाता बनाएं एवं कोड प्राप्त करें' : 'Create Account & Generate Member Code'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Forgot Password */}
        {activeTab === 'forgot' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              {language === 'hi'
                ? 'अपना पंजीकृत मोबाइल नंबर या ईमेल आईडी दर्ज करें। आप सीधे व्हाट्सएप हेल्पलाइन से भी पासवर्ड रीसेट प्राप्त कर सकते हैं।'
                : 'Enter your registered mobile number or email ID. You can also contact our direct WhatsApp helpline for immediate reset.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {language === 'hi' ? 'पंजीकृत मोबाइल या ईमेल' : 'Registered Mobile or Email'}
              </label>
              <input
                type="text"
                placeholder="e.g. 6306917991 or name@gmail.com"
                value={forgotIdentifier}
                onChange={(e) => setForgotIdentifier(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            {forgotSent && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                Support request sent to WhatsApp. Our administrative desk will verify and reset your access within 10 minutes.
              </div>
            )}

            <div className="space-y-2 pt-2">
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
    </div>
  );
}
