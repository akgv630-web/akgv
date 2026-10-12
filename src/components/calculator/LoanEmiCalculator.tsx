'use client';

import React, { useState, useMemo } from 'react';
import {
  Banknote,
  Building,
  Calculator,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Percent,
  PhoneCall,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { useApp } from '@/context/AppContext';

export function LoanEmiCalculator() {
  const { t, language } = useApp();
  const c = t.loanCalc;

  // Input states
  const [propertyPrice, setPropertyPrice] = useState<number>(1400000); // 14 Lakh INR default
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20%
  const [tenureYears, setTenureYears] = useState<number>(10); // 10 Years
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [buyerGender, setBuyerGender] = useState<'male' | 'female'>('female'); // 7% vs 6% UP stamp duty

  // Computations
  const {
    downPaymentAmount,
    loanPrincipal,
    monthlyEmi,
    totalInterest,
    totalPayable,
    stampDuty,
    registrationFee,
    totalRegistryCost
  } = useMemo(() => {
    const downPayment = Math.round((propertyPrice * downPaymentPercent) / 100);
    const principal = propertyPrice - downPayment;

    // Monthly interest rate
    const monthlyRate = interestRate / (12 * 100);
    const totalMonths = tenureYears * 12;

    let emi = 0;
    if (principal > 0 && monthlyRate > 0) {
      emi = Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    }

    const totalAmt = emi * totalMonths;
    const interest = totalAmt - principal;

    // Uttar Pradesh Stamp Duty & Registration Fees
    // UP: 7% for Male, 6% for Female / Joint Women ownership, 1% Registration
    const stampPercent = buyerGender === 'female' ? 6 : 7;
    const sDuty = Math.round((propertyPrice * stampPercent) / 100);
    const regFee = Math.round((propertyPrice * 1) / 100); // 1%

    return {
      downPaymentAmount: downPayment,
      loanPrincipal: principal,
      monthlyEmi: emi,
      totalInterest: Math.max(0, interest),
      totalPayable: totalAmt,
      stampDuty: sDuty,
      registrationFee: regFee,
      totalRegistryCost: sDuty + regFee,
    };
  }, [propertyPrice, downPaymentPercent, tenureYears, interestRate, buyerGender]);

  const bankPartners = useMemo(() => [
    {
      name: 'State Bank of India',
      rate: '8.40%*',
      tag: language === 'hi' ? 'अधिकतम प्री-अप्रूवल' : language === 'hinglish' ? 'Max Pre-Approvals' : 'Max Pre-Approvals'
    },
    {
      name: 'HDFC Bank',
      rate: '8.50%*',
      tag: language === 'hi' ? 'शीघ्र स्वीकृति' : language === 'hinglish' ? 'Fast Sanction' : 'Fast Sanction'
    },
    {
      name: 'ICICI Bank',
      rate: '8.65%*',
      tag: language === 'hi' ? 'त्वरित डिजिटल' : language === 'hinglish' ? 'Instant Digital' : 'Instant Digital'
    },
    {
      name: 'Bank of Baroda',
      rate: '8.45%*',
      tag: language === 'hi' ? 'वाराणसी शाखा' : language === 'hinglish' ? 'Varanasi Hub' : 'Varanasi Hub'
    },
    {
      name: 'Punjab National Bank',
      rate: '8.50%*',
      tag: language === 'hi' ? 'कम प्रोसेसिंग फीस' : language === 'hinglish' ? 'Low Processing Fee' : 'Low Processing Fee'
    }
  ], [language]);

  const whatsappInquiryText = useMemo(() => {
    if (language === 'hi') {
      return `*एकेजीवी इन्फ्रा सिटी — बैंक लोन एवं ईएमआई पूछताछ*
━━━━━━━━━━━━━━━━━━━━
*प्लॉट मूल्यांकन:* ₹${(propertyPrice / 100000).toFixed(2)} लाख
*डाउन पेमेंट (${downPaymentPercent}%):* ₹${downPaymentAmount.toLocaleString()}
*अनुमानित बैंक लोन:* ₹${loanPrincipal.toLocaleString()}
*लोन अवधि:* ${tenureYears} वर्ष (${tenureYears * 12} महीने)
*मासिक किस्त (EMI):* ₹${monthlyEmi.toLocaleString()} / महीना
*अनुमानित यूपी रजिस्ट्री व स्टाम्प:* ₹${totalRegistryCost.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
कृपया मुझे वाराणसी में बैंक लोन प्री-अप्रूवल सहायता हेतु संपर्क करें।`;
    }
    if (language === 'hinglish') {
      return `*AKGV INFRA CITY — BANK LOAN & EMI INQUIRY*
━━━━━━━━━━━━━━━━━━━━
*Plot Valuation:* ₹${(propertyPrice / 100000).toFixed(2)} Lakh
*Down Payment (${downPaymentPercent}%):* ₹${downPaymentAmount.toLocaleString()}
*Estimated Loan:* ₹${loanPrincipal.toLocaleString()}
*Preferred Tenure:* ${tenureYears} Saal (${tenureYears * 12} Mahine)
*Monthly EMI:* ₹${monthlyEmi.toLocaleString()} / month
*Estimated UP Registry & Stamp:* ₹${totalRegistryCost.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
Please mujhe Varanasi me bank loan pre-approval ke liye guidance provide karein.`;
    }
    return `*AKGV INFRA CITY — BANK LOAN & EMI INQUIRY*
━━━━━━━━━━━━━━━━━━━━
*Plot Valuation:* ₹${(propertyPrice / 100000).toFixed(2)} Lakh
*Down Payment (${downPaymentPercent}%):* ₹${downPaymentAmount.toLocaleString()}
*Estimated Loan Required:* ₹${loanPrincipal.toLocaleString()}
*Preferred Tenure:* ${tenureYears} Years (${tenureYears * 12} Months)
*Calculated Monthly EMI:* ₹${monthlyEmi.toLocaleString()} / month
*Estimated UP Stamp & Registry:* ₹${totalRegistryCost.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
Please connect me with your banking desk for pre-approval assistance in Varanasi.`;
  }, [language, propertyPrice, downPaymentPercent, downPaymentAmount, loanPrincipal, tenureYears, monthlyEmi, totalRegistryCost]);

  return (
    <div className="w-full rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#080E21] via-[#0B1734] to-[#080E21] p-5 sm:p-8 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7A35A]/40 bg-[#C7A35A]/10 px-3.5 py-1 text-xs font-semibold text-[#DFC382]">
            <Calculator className="h-3.5 w-3.5 text-[#C7A35A]" />
            <span>{c.badge}</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
            {c.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            {c.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold block text-white">{c.bankAssistance}</span>
            <span className="text-[11px] text-emerald-300">{c.bankAssistanceSub}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Sliders & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Property Price Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200">{c.propertyValuation}</span>
              <span className="font-mono text-base font-bold text-[#DFC382]">
                ₹{(propertyPrice / 100000).toFixed(2)} Lakh (₹{propertyPrice.toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min={600000}
              max={5000000}
              step={50000}
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-[#C7A35A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>₹6 Lakh (Min)</span>
              <span>₹25 Lakh</span>
              <span>₹50 Lakh (Max)</span>
            </div>
          </div>

          {/* 2. Down Payment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200">{c.downPayment} ({downPaymentPercent}%)</span>
              <span className="font-mono text-sm font-bold text-white">
                ₹{downPaymentAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#1EA275] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>10% (Min)</span>
              <span>20% (Recommended)</span>
              <span>50%</span>
            </div>
          </div>

          {/* 3. Loan Tenure Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200">{c.tenure}</span>
              <span className="font-mono text-sm font-bold text-white">
                {tenureYears} {c.years} ({tenureYears * 12} {c.months})
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-[#C7A35A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>3 {c.years}</span>
              <span>10 {c.years}</span>
              <span>20 {c.years}</span>
            </div>
          </div>

          {/* 4. Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200">{c.interestRate}</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {interestRate.toFixed(2)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={7.5}
              max={12.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>7.5% (Prime)</span>
              <span>8.5% (Avg)</span>
              <span>12.0%</span>
            </div>
          </div>

          {/* 5. Uttar Pradesh Registry Stamp Duty Selector */}
          <div className="rounded-2xl border border-white/10 bg-[#050A17] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-[#C7A35A]" />
                <span className="text-xs font-bold text-white">{c.stampDutyTitle}</span>
              </div>
              <span className="text-[10px] text-gray-400">{c.stampDutyDept}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBuyerGender('female')}
                className={`rounded-xl p-2.5 text-left border transition ${
                  buyerGender === 'female'
                    ? 'border-[#C7A35A] bg-[#C7A35A]/15 text-white'
                    : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs">{c.femaleRegistry}</span>
                <span className="text-[10px] text-emerald-400">{c.femaleDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => setBuyerGender('male')}
                className={`rounded-xl p-2.5 text-left border transition ${
                  buyerGender === 'male'
                    ? 'border-[#C7A35A] bg-[#C7A35A]/15 text-white'
                    : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs">{c.maleRegistry}</span>
                <span className="text-[10px] text-gray-400">{c.maleDesc}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Cards & EMI Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main EMI Highlight Card */}
          <div className="rounded-3xl border-2 border-[#C7A35A] bg-gradient-to-br from-[#0B1734] to-[#050A17] p-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-xl bg-[#C7A35A] px-3 py-1 text-[10px] font-bold text-[#0B1734]">
              {c.estimatedRepayment}
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300 block">
              {c.monthlyEmiTitle}
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#DFC382] my-2">
              ₹{monthlyEmi.toLocaleString()} <span className="text-xs text-gray-400 font-sans font-normal">{c.perMonth}</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {c.forPrincipal} ₹{loanPrincipal.toLocaleString()} ({tenureYears} {c.years})
            </p>

            {/* Financial Breakdown Table */}
            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-left">
              <div className="flex justify-between text-gray-300">
                <span>{c.principalLoanAmount}</span>
                <span className="font-mono font-semibold text-white">₹{loanPrincipal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>{c.totalInterestPayable}</span>
                <span className="font-mono font-semibold text-amber-400">₹{totalInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>{c.totalAmountPayable}</span>
                <span className="font-mono font-semibold text-white">₹{totalPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-[#DFC382]">
                <span>{c.estRegistryCost}</span>
                <span className="font-mono font-bold">₹{totalRegistryCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Direct WhatsApp Pre-Approval Action */}
            <div className="mt-6 pt-2">
              <a
                href={`https://wa.me/916306917991?text=${encodeURIComponent(whatsappInquiryText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-600 transition"
              >
                <span>💬 {c.checkEligibilityWhatsApp}</span>
              </a>
            </div>
          </div>

          {/* Bank Partners Showcase */}
          <div className="rounded-2xl border border-white/10 bg-[#050A17] p-4 text-xs space-y-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Building className="h-4 w-4 text-[#C7A35A]" />
              <span>{c.approvedBanksTitle}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {bankPartners.map((bank, i) => (
                <div key={i} className="rounded-lg bg-[#0B1734] p-2 border border-white/5">
                  <div className="font-semibold text-white truncate">{bank.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                    <span className="text-[#DFC382] font-bold">{bank.rate}</span>
                    <span className="text-[9px] text-gray-500 truncate">{bank.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-500 text-center">
              {c.rateDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
