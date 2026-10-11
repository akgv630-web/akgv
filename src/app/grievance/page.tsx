'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Mail, MapPin, PhoneCall, Send, ShieldAlert } from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { useApp } from '@/context/AppContext';

export default function GrievancePage() {
  const { createSupportTicket } = useApp();
  const [category, setCategory] = useState<'booking' | 'payment' | 'plot_enquiry' | 'commission' | 'joining_kit' | 'general'>('booking');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    createSupportTicket(category, subject, description);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8 text-gray-300">
      <div className="border-b border-[#C7A35A]/30 pb-6">
        <div className="flex items-center gap-2 text-[#C7A35A] text-xs font-bold uppercase tracking-wider mb-2">
          <HelpCircle className="h-4 w-4" />
          <span>Customer Protection & Redressal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Grievance & Customer Support Desk
        </h1>
        <p className="text-xs text-gray-400 mt-2">
          AKGV Infra City Private Limited is committed to prompt resolution of buyer inquiries and member support tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Support Ticket Form (7 Cols) */}
        <div className="md:col-span-7 rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] p-6 shadow-xl space-y-4">
          <h2 className="font-serif text-base font-bold text-white">Submit Official Ticket</h2>
          {submitted ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400" />
              <p className="font-bold text-sm">Grievance Ticket Lodged Successfully!</p>
              <p className="text-gray-300">
                Your ticket has been dispatched to our legal and customer support desk. You can monitor live replies in your portal dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Ticket Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="booking">Plot Booking & Registry</option>
                  <option value="payment">Payment Verification & Receipts</option>
                  <option value="joining_kit">₹999 Joining Kit Issue</option>
                  <option value="commission">Commission Ledger Inquiry</option>
                  <option value="plot_enquiry">General Plot & Layout Query</option>
                  <option value="general">Other Grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiring about possession date for Plot A-04"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Detailed Grievance Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete details including plot number, receipt reference, or date..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-3 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Grievance Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info (5 Cols) */}
        <div className="md:col-span-5 rounded-2xl border border-white/10 bg-[#050A17] p-6 space-y-5 text-xs">
          <h2 className="font-serif text-base font-bold text-white">Direct Assistance</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <PhoneCall className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Official Telephone Desk</span>
                <a href={`tel:${COMPANY_DETAILS.phone}`} className="font-bold text-[#DFC382] hover:underline">
                  {COMPANY_DETAILS.displayPhone}
                </a>
                <span className="text-[10px] text-gray-400 block">Mon - Sat: 9:30 AM to 6:30 PM</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Electronic Grievance Desk</span>
                <span className="text-gray-300">{COMPANY_DETAILS.emailPlaceholder}</span>
                <span className="text-[10px] text-gray-400 block">Typical response within 24 business hours</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Regional Operations Headquarters</span>
                <span className="text-gray-300">Varanasi, Uttar Pradesh, India</span>
                <span className="text-[10px] text-gray-400 block">Township sites: Rampur, Lahartara, Mirza Murad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
