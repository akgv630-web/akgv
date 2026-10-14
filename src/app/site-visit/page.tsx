'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, PhoneCall, ShieldCheck, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';

export default function SiteVisitPage() {
  const { bookSiteVisit } = useApp();
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState(PROJECT_LOCATIONS[0].id);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [pickupRequired, setPickupRequired] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone || !preferredDate) {
      alert('Please fill out all required fields.');
      return;
    }

    const loc = PROJECT_LOCATIONS.find((l) => l.id === selectedLocationId);
    bookSiteVisit({
      visitorName,
      visitorPhone,
      visitorEmail,
      locationId: selectedLocationId,
      locationName: loc ? loc.name : 'AKGV Township',
      preferredDate,
      preferredTimeSlot,
      pickupRequired,
      notes,
    });

    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#1EA275] uppercase tracking-wider">
          Complimentary Field Visit
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Schedule an Official Site Visit
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Inspect ground-level roads, electricity transformer points, and demarcated plots in Varanasi with guided departure from our Rampur, Lahartara or Mirza Murad branch offices.
        </p>
      </div>

      <div className="rounded-3xl border border-[#C7A35A]/30 bg-[#0B1734] p-6 sm:p-10 shadow-2xl">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-400" />
            <h2 className="font-serif text-2xl font-bold text-white">
              Site Visit Scheduled Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
              Our regional coordinator will contact you shortly on <strong>{visitorPhone}</strong> to confirm your vehicle pickup and dispatch our site engineer.
            </p>
            <div className="pt-4">
              <a
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C7A35A] px-5 py-2.5 text-xs font-bold text-[#0B1734]"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call Helpline {COMPANY_DETAILS.displayPhone}</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Chandra Gupta"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Mobile Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9839012345"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Nearest Departure Branch / Meeting Point *</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  {PROJECT_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Preferred Visit Date *</label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Preferred Time Slot *</label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</option>
                  <option value="12:00 PM - 02:00 PM">Noon (12:00 PM - 02:00 PM)</option>
                  <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                  <option value="04:00 PM - 06:00 PM">Sunset / Evening (04:00 PM - 06:00 PM)</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-white/10 bg-[#050A17] p-3 w-full">
                  <input
                    type="checkbox"
                    checked={pickupRequired}
                    onChange={(e) => setPickupRequired(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#C7A35A]"
                  />
                  <div>
                    <span className="font-semibold text-white block text-xs">Request Pickup / Transit Assistance</span>
                    <span className="text-[10px] text-gray-400">From Cantt Station, Airport or City Hub</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-medium">Special Requests or Plot Interests</label>
              <textarea
                rows={3}
                placeholder="e.g. Interested in 1250 sqft or 1500 sqft plots facing 30ft road."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Helpline: <strong className="text-[#DFC382]">{COMPANY_DETAILS.displayPhone}</strong>
              </span>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-8 py-3 font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95"
              >
                Confirm Site Visit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
