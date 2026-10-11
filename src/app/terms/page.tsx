import React from 'react';
import { FileText } from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8 text-gray-300">
      <div className="border-b border-[#C7A35A]/30 pb-6">
        <div className="flex items-center gap-2 text-[#C7A35A] text-xs font-bold uppercase tracking-wider mb-2">
          <FileText className="h-4 w-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Terms and Conditions
        </h1>
        <p className="text-xs text-gray-400 mt-2">
          Official Terms of Service for AKGV Infra City Private Limited
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">1. Company Entity & Branding</h2>
          <p>
            The company name displayed on this platform is AKGV Infra City Private Limited, subject to confirmation against official company registration filings. All property offerings in Rampur, Lahartara, and Mirza Murad are subject to official land titles and municipal regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">2. Member Accounts & Hierarchy</h2>
          <p>
            Buyers are permitted to register public customer accounts. Internal company members (Junior Members, Senior Members, Sub-Admins) cannot publicly self-register; they are created strictly through supervisory administrative workflows. Predictable member identifiers do not serve as standalone authorization credentials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">3. Joining Kit Rules</h2>
          <p>
            The ₹999 Joining Kit amount is collected strictly in offline cash for physical onboarding materials (Bag, Pen, Diary, File). It does not constitute a security deposit, investment scheme, or equity interest in real property.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">4. 3D Architectural Visualizations</h2>
          <p>
            3D house models rendered on this platform are conceptual architectural simulations intended for visual inspection of plot fitment. They do not constitute sanctioned municipal building plans or guarantee structural approvals without statutory architectural clearances.
          </p>
        </section>
      </div>
    </div>
  );
}
