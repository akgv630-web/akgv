'use client';

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';

export default function ContactPage() {
  const { language, bookSiteVisit } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locationId, setLocationId] = useState('loc-rampur');
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 01:00 PM');
  const [pickupRequired, setPickupRequired] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const loc = PROJECT_LOCATIONS.find((l) => l.id === locationId);
    bookSiteVisit({
      visitorName: name.trim(),
      visitorPhone: phone.trim(),
      visitorEmail: email.trim() || undefined,
      locationId,
      locationName: loc ? loc.name : 'AKGV Rampur',
      preferredDate: visitDate || new Date().toISOString().slice(0, 10),
      preferredTimeSlot: timeSlot,
      pickupRequired,
      notes: message.trim() || undefined,
    });

    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 space-y-12">
      {/* Top Banner */}
      <div className="rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-8 sm:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Immediate Response Active</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {language === 'hi' ? 'संपर्क करें एवं साइट विजिट बुक करें' : 'Contact Us & Book a Site Visit'}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {language === 'hi'
              ? 'एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड की रामपुर, लहरतारा या मिर्ज़ा मुराद टाउनशिप पर व्यक्तिगत साइट विजिट या प्लॉट बुकिंग परामर्श के लिए हमारी टीम से सीधे संपर्क करें।'
              : 'Connect directly with our authorized sales and customer assistance desk for guided site visits, token payments, and plot allocation across Rampur, Lahartara, and Mirza Murad.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Site Visit Form */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#0B1734] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C7A35A]" />
              {language === 'hi' ? 'निःशुल्क साइट विजिट फॉर्म' : 'Complimentary Escorted Site Tour'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'hi'
                ? 'वाराणसी कैंट रेलवे स्टेशन या बाबतपुर एयरपोर्ट से पिक-अप सुविधा उपलब्ध है।'
                : 'Complimentary private AC car pickup available from Varanasi Cantt Station or Babatpur Airport.'}
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/30 p-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-white">
                {language === 'hi' ? 'आपकी साइट विजिट दर्ज हो गई है!' : 'Site Visit Request Registered!'}
              </h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                {language === 'hi'
                  ? 'हमारे एरिया मैनेजर शीघ्र ही आपसे फोन पर संपर्क कर समय एवं वाहन विवरण साझा करेंगे।'
                  : 'Our area coordinator will contact your mobile within 30 minutes to confirm vehicle details and timings.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-xl bg-[#C7A35A] px-5 py-2 font-bold text-xs text-[#0B1734] hover:brightness-110 transition"
              >
                Book Another Tour
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {language === 'hi' ? 'आपका पूरा नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Mishra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9839XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. anand@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {language === 'hi' ? 'टाउनशिप लोकेशन चुनें *' : 'Select Township Location *'}
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="loc-rampur">AKGV Rampur (30ft Entrance Boulevard)</option>
                    <option value="loc-lahartara">AKGV Lahartara (Near Varanasi Cantt)</option>
                    <option value="loc-mirza-murad">AKGV Mirza Murad (NH-19 Corridor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {language === 'hi' ? 'पसंदीदा विजिट तिथि' : 'Preferred Visit Date'}
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {language === 'hi' ? 'समय स्लॉट' : 'Time Slot'}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="09:00 AM - 11:00 AM">Morning: 09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">Mid-Day: 11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">Afternoon: 02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">Evening: 04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#050A17] p-3 border border-white/5">
                <input
                  type="checkbox"
                  id="pickup"
                  checked={pickupRequired}
                  onChange={(e) => setPickupRequired(e.target.checked)}
                  className="rounded border-gray-600 text-[#C7A35A] focus:ring-[#C7A35A]"
                />
                <label htmlFor="pickup" className="text-gray-300 cursor-pointer text-xs">
                  {language === 'hi'
                    ? 'मुझे वाराणसी कैंट या बाबतपुर एयरपोर्ट से पिक-अप वाहन की आवश्यकता है'
                    : 'I require complimentary vehicle pickup from Cantt Station / Airport'}
                </label>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {language === 'hi' ? 'अतिरिक्त टिप्पणी अथवा पसंदीदा प्लॉट आकार' : 'Notes / Preferred Plot Size'}
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Looking for a 1250 sq.ft corner plot facing 30ft road..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-3 font-bold text-xs text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{language === 'hi' ? 'साइट विजिट बुक करें' : 'Confirm Site Visit Reservation'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Helplines, Gmail, QR Code */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Helpline Card */}
          <div className="rounded-3xl border border-[#C7A35A]/50 bg-gradient-to-br from-[#0B1734] to-[#050A17] p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#C7A35A]" />
              Official Company Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <Phone className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Primary Calling Helpline:</span>
                  <a
                    href={`tel:${COMPANY_DETAILS.phone}`}
                    className="font-bold text-base text-[#DFC382] hover:underline"
                  >
                    {COMPANY_DETAILS.displayPhone}
                  </a>
                  <p className="text-[10px] text-gray-400 mt-0.5">Available Mon - Sun (9 AM to 8 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <MessageCircle className="h-4 w-4 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Official WhatsApp Desk:</span>
                  <a
                    href={`https://wa.me/916306917991?text=${encodeURIComponent(
                      'Hello AKGV Infra City, I want details regarding your plots.'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-white hover:text-[#25D366] transition flex items-center gap-1.5"
                  >
                    <span>+91 6306917991</span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </a>
                  <p className="text-[10px] text-gray-400 mt-0.5">Instant plot layout PDFs & brochure sharing</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <Mail className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Official Corporate Gmail:</span>
                  <a
                    href="mailto:akgvinfacity@gmail.com"
                    className="font-bold text-white hover:text-sky-400 transition"
                  >
                    akgvinfacity@gmail.com
                  </a>
                  <p className="text-[10px] text-gray-400 mt-0.5">For legal documentation & registry inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Registered Office & Headquarters:</span>
                  <span className="font-semibold text-white">AKGV Infra City Private Limited</span>
                  <p className="text-gray-400 text-[11px]">Varanasi, Uttar Pradesh, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & UPI QR Info */}
          <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#C7A35A]" />
              Official Booking & Token Payment
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Booking tokens for residential plots can be transferred via official UPI ID <strong className="text-[#DFC382]">akgvinfacity@icici</strong> or NEFT/RTGS into the corporate bank account.
            </p>
            <div className="rounded-xl bg-[#050A17] p-3 text-[11px] text-gray-300 space-y-1 font-mono border border-white/5">
              <div>UPI ID: <strong className="text-sky-400">akgvinfacity@icici</strong></div>
              <div>Account Name: <strong className="text-white">AKGV Infra City Private Limited</strong></div>
              <div>Payment Receipt: Instant PDF on buyer portal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
