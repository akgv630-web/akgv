'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Building,
  Calendar,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Phone
} from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';

export function WhatsAppPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const phoneNumber = '916306917991'; // Official primary phone: 6306917991

  const quickTemplates = [
    {
      id: 'book-plot',
      title: '🏡 Book a Plot (प्लॉट बुकिंग)',
      text: 'Namaste AKGV Infra City! I am interested in booking a residential plot in Varanasi (Rampur / Lahartara / Mirza Murad). Please share available plot numbers, dimensions, and token hold details.',
    },
    {
      id: 'site-visit',
      title: '🚗 Free Site Visit (साइट विजिट)',
      text: 'Namaste! I would like to schedule a free site visit to AKGV Infra City with free cab pickup. Please share available dates and coordinate.',
    },
    {
      id: 'rewards',
      title: '💰 11-Tier Rewards & Commission Plan',
      text: 'Namaste! I want to join AKGV Infra City as an Associate Member and understand the 11-Tier Commission & Rewards Plan (from 4% to 14%). Please guide me on registration.',
    },
    {
      id: 'joining-kit',
      title: '📦 ₹999 Joining Kit (जॉइनिंग किट)',
      text: 'Namaste! Please provide details regarding the ₹999 Physical Associate Joining Kit (Official Bag, Pen, Diary, and Document Folder).',
    },
  ];

  const handleSendTemplate = (text: string) => {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = customMessage.trim() || 'Namaste AKGV Infra City, I have an inquiry regarding your townships.';
    const encoded = encodeURIComponent(textToSend);
    const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setCustomMessage('');
  };

  return (
    <>
      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-[#0B1734]/95 px-3 py-1 text-[11px] font-semibold text-emerald-300 shadow-xl backdrop-blur-md animate-bounce">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chat on WhatsApp (6306917991)</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open WhatsApp Support"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50 active:scale-95 focus:outline-none"
        >
          {isOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <>
              {/* WhatsApp Icon SVG */}
              <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              {/* Ping notification dot */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">1</span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 sm:bottom-24 sm:right-6 z-50 w-[92vw] sm:w-[380px] overflow-hidden rounded-2xl border border-[#25D366]/40 bg-[#0B1734] shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#128C7E] to-[#075E54] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#075E54] font-bold shadow">
                <span className="font-serif text-sm">AKGV</span>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight">
                  AKGV Infra City Support
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>🟢 Online</span>
                  <span>•</span>
                  <span>Direct WhatsApp</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body with Official Details */}
          <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4 text-xs bg-[#050A17]/95">
            <div className="rounded-xl bg-[#0B1734] p-3 border border-white/10 text-gray-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#DFC382]">
                <Phone className="h-3.5 w-3.5 text-[#25D366]" />
                <span>Official Helpline: +91 6306917991</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Aap directly hamari customer team se WhatsApp par baat kar sakte hain. Niche diye gaye options par click karein:
              </p>
            </div>

            {/* Quick Formatted Message Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Choose a pre-formatted message:
              </span>

              {quickTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSendTemplate(template.text)}
                  className="w-full text-left rounded-xl border border-white/10 bg-[#0B1734] p-3 text-gray-200 transition-all hover:border-[#25D366] hover:bg-emerald-950/20 active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-[#25D366] text-xs">
                      {template.title}
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-[#25D366]" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                    {template.text}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Message Input Form */}
            <form onSubmit={handleSendCustom} className="space-y-2 border-t border-white/10 pt-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Or type your own custom message:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type message here..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-[#0B1734] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-xl bg-[#25D366] px-3.5 py-2 font-bold text-white shadow hover:bg-emerald-600 transition"
                  title="Send via WhatsApp"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <div className="border-t border-white/10 bg-[#0B1734] px-4 py-2 text-[10px] text-gray-400 text-center">
            Replies within minutes • AKGV Infra City Private Limited
          </div>
        </div>
      )}
    </>
  );
}
