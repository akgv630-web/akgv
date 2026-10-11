import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8 text-gray-300">
      <div className="border-b border-[#C7A35A]/30 pb-6">
        <div className="flex items-center gap-2 text-[#C7A35A] text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Statutory Policy</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-400 mt-2">
          Effective Date: October 2026 | AKGV Infra City Private Limited
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            When registering as a buyer or company member on the AKGV Infra City platform, we collect identifiable information such as your full name, telephone number, email address, KYC identity documentation (Aadhaar / PAN where legally applicable for property conveyance), and geolocation coordinates when utilizing our field evidence camera tool.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">2. Purpose of Processing</h2>
          <p>
            Information collected is utilized solely for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li>Processing official plot reservations, hold timers, and administrative verification.</li>
            <li>Scheduling on-site visits and managing transport coordination.</li>
            <li>Issuing offline joining kit receipts and reconciling treasury records.</li>
            <li>Maintaining commission audit ledgers and statutory tax deductions (TDS).</li>
            <li>Complying with Uttar Pradesh real estate regulations and anti-fraud mandates.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">3. Data Security & Storage</h2>
          <p>
            All application credentials and private documents are stored in secure cloud infrastructure protected by database-level Row Level Security (RLS) policies. Payment proofs and sensitive identification documents are accessible only to authorized supervisory personnel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">4. Contact Grievance Officer</h2>
          <p>
            For data inquiries, rectification requests, or grievance redressal, contact our designated privacy desk at <strong className="text-white">{COMPANY_DETAILS.phone}</strong> or visit our head office in Varanasi, Uttar Pradesh.
          </p>
        </section>
      </div>
    </div>
  );
}
