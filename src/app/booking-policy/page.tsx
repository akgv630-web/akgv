import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';

export default function BookingPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8 text-gray-300">
      <div className="border-b border-[#C7A35A]/30 pb-6">
        <div className="flex items-center gap-2 text-[#C7A35A] text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Real Estate Conveyance Rules</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Plot Booking, Hold & Cancellation Policy
        </h1>
        <p className="text-xs text-gray-400 mt-2">
          AKGV Infra City Private Limited | Transparent Transaction Guidelines
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">1. Plot Selection & Status Tiers</h2>
          <p>
            Plots designated in <strong>Green</strong> are open and bookable by registered buyers. Plots designated in <strong>Yellow</strong> are confirmed booked and strictly locked against duplicate reservations. Plots in <strong>Red</strong> represent vacant inventory reserved under administrative control.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">2. Temporary 72-Hour Hold</h2>
          <p>
            When a buyer submits a booking request, a 72-hour temporary hold is registered in the database. During this window, the buyer must upload proof of payment (UPI transaction ID, NEFT transfer receipt, or demand draft reference). If payment proof is not submitted within 72 hours, the plot automatically reverts to available status.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">3. Payment Verification & Receipts</h2>
          <p>
            A screenshot or transaction ID does not automatically confirm booking. Authorized supervisory finance staff verify the funds against actual company bank statements. Only upon successful verification is an official system receipt generated and the plot status transitioned to Yellow (Confirmed Booked).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-white">4. Cancellation & Refund Policy</h2>
          <p>
            In the event of an approved cancellation prior to official registry deed execution, token refunds are processed via original banking channels according to the company agreement. For cancellation queries, contact <strong className="text-white">{COMPANY_DETAILS.phone}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
