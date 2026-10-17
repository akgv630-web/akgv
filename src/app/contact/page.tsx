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
import { tLang } from '@/lib/i18n';

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
      alert(tLang(language, 'Please fill in your name and phone number.', 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें।', 'Kripya apna naam aur phone number bharein.'));
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
            <span>{tLang(language, 'Immediate Response Active', 'तत्काल प्रतिक्रिया सक्रिय', 'Immediate Response Active')}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {tLang(language, 'Contact Us & Book a Site Visit', 'संपर्क करें एवं साइट विजिट बुक करें', 'Contact Karein Aur Site Visit Book Karein')}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {tLang(
              language,
              'Connect directly with our authorized sales and customer assistance desk for guided site visits, token payments, and plot allocation across Rampur, Lahartara, and Mirza Murad.',
              'एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड की रामपुर, लहरतारा या मिर्ज़ा मुराद टाउनशिप पर व्यक्तिगत साइट विजिट या प्लॉट बुकिंग परामर्श के लिए हमारी टीम से सीधे संपर्क करें।',
              'AKGV Infra City Private Limited ki Rampur, Lahartara ya Mirza Murad township par personal site visit ya plot booking guidance ke liye direct hamari team se contact karein.'
            )}
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
              {tLang(language, 'Complimentary Escorted Site Tour', 'निःशुल्क साइट विजिट फॉर्म', 'Free Escorted Site Tour Form')}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {tLang(
                language,
                'Complimentary private AC car pickup available from Varanasi Cantt Station or Babatpur Airport.',
                'वाराणसी कैंट रेलवे स्टेशन या बाबतपुर एयरपोर्ट से पिक-अप सुविधा उपलब्ध है।',
                'Varanasi Cantt railway station ya Babatpur airport se pickup car suvidha available hai.'
              )}
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/30 p-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-white">
                {tLang(language, 'Site Visit Request Registered!', 'आपकी साइट विजिट दर्ज हो गई है!', 'Aapki Site Visit Register Ho Gayi Hai!')}
              </h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                {tLang(
                  language,
                  'Our area coordinator will contact your mobile within 30 minutes to confirm vehicle details and timings.',
                  'हमारे एरिया मैनेजर शीघ्र ही आपसे फोन पर संपर्क कर समय एवं वाहन विवरण साझा करेंगे।',
                  'Hamare area coordinator jaldi hi aapke mobile par call karke timing aur car details share karenge.'
                )}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-xl bg-[#C7A35A] px-5 py-2 font-bold text-xs text-[#0B1734] hover:brightness-110 transition"
              >
                {tLang(language, 'Book Another Tour', 'दूसरी विजिट बुक करें', 'Doosri Visit Book Karein')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Full Name *', 'आपका पूरा नाम *', 'Aapka Poora Naam *')}
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
                    {tLang(language, 'Mobile Number *', 'मोबाइल नंबर *', 'Mobile Number *')}
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
                    {tLang(language, 'Email Address', 'ईमेल आईडी', 'Email ID')}
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
                    {tLang(language, 'Select Township Location *', 'टाउनशिप लोकेशन चुनें *', 'Township Location Chunein *')}
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
                    {tLang(language, 'Preferred Visit Date', 'पसंदीदा विजिट तिथि', 'Preferred Visit Date')}
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
                    {tLang(language, 'Time Slot', 'समय स्लॉट', 'Time Slot')}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="09:00 AM - 11:00 AM">{tLang(language, 'Morning: 09:00 AM - 11:00 AM', 'सुबह: 09:00 AM - 11:00 AM', 'Morning: 09:00 AM - 11:00 AM')}</option>
                    <option value="11:00 AM - 01:00 PM">{tLang(language, 'Mid-Day: 11:00 AM - 01:00 PM', 'दोपहर: 11:00 AM - 01:00 PM', 'Mid-Day: 11:00 AM - 01:00 PM')}</option>
                    <option value="02:00 PM - 04:00 PM">{tLang(language, 'Afternoon: 02:00 PM - 04:00 PM', 'तीसरे पहर: 02:00 PM - 04:00 PM', 'Afternoon: 02:00 PM - 04:00 PM')}</option>
                    <option value="04:00 PM - 06:00 PM">{tLang(language, 'Evening: 04:00 PM - 06:00 PM', 'शाम: 04:00 PM - 06:00 PM', 'Evening: 04:00 PM - 06:00 PM')}</option>
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
                  {tLang(
                    language,
                    'I require complimentary vehicle pickup from Cantt Station / Airport',
                    'मुझे वाराणसी कैंट या बाबतपुर एयरपोर्ट से पिक-अप वाहन की आवश्यकता है',
                    'Mujhe Varanasi Cantt ya Babatpur airport se pickup vehicle chahiye'
                  )}
                </label>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Notes / Preferred Plot Size', 'अतिरिक्त टिप्पणी अथवा पसंदीदा प्लॉट आकार', 'Extra Notes / Preferred Plot Size')}
                </label>
                <textarea
                  rows={3}
                  placeholder={tLang(language, 'e.g. Looking for a 1250 sq.ft corner plot facing 30ft road...', 'उदा. 1250 वर्गफुट कॉर्नर प्लॉट 30 फीट रोड के सामने...', 'e.g. Looking for a 1250 sq.ft corner plot facing 30ft road...')}
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
                <span>{tLang(language, 'Confirm Site Visit Reservation', 'साइट विजिट बुक करें', 'Site Visit Confirm Karein')}</span>
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
              {tLang(language, 'Official Company Contact Details', 'कंपनी के आधिकारिक संपर्क सूत्र', 'Official Company Contact Details')}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <Phone className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">{tLang(language, 'Primary Calling Helpline:', 'मुख्य हेल्पलाइन नंबर:', 'Primary Calling Helpline:')}</span>
                  <a
                    href={`tel:${COMPANY_DETAILS.phone}`}
                    className="font-bold text-base text-[#DFC382] hover:underline"
                  >
                    {COMPANY_DETAILS.displayPhone}
                  </a>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tLang(language, 'Available Mon - Sun (9 AM to 8 PM)', 'उपलब्ध: सोमवार - रविवार (सुबह 9 से रात 8)', 'Available Mon - Sun (9 AM to 8 PM)')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <MessageCircle className="h-4 w-4 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">{tLang(language, 'Official WhatsApp Desk:', 'आधिकारिक व्हाट्सएप डेस्क:', 'Official WhatsApp Desk:')}</span>
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
                  <p className="text-[10px] text-gray-400 mt-0.5">{tLang(language, 'Instant plot layout PDFs & brochure sharing', 'तुरंत प्लॉट लेआउट पीडीएफ एवं ब्रोशर प्राप्ति', 'Instant plot layout PDFs aur brochure sharing')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <Mail className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">{tLang(language, 'Official Corporate Gmail:', 'आधिकारिक कॉर्पोरेट ईमेल:', 'Official Corporate Gmail:')}</span>
                  <a
                    href="mailto:akgvinfacity@gmail.com"
                    className="font-bold text-white hover:text-sky-400 transition"
                  >
                    akgvinfacity@gmail.com
                  </a>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tLang(language, 'For legal documentation & registry inquiries', 'कानूनी दस्तावेज़ एवं रजिस्ट्री संबंधी पूछताछ', 'Legal documents aur registry queries ke liye')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">{tLang(language, 'Registered Office & Headquarters:', 'पंजीकृत कार्यालय एवं मुख्यालय:', 'Registered Office & Headquarters:')}</span>
                  <span className="font-semibold text-white">AKGV Infra City Private Limited</span>
                  <p className="text-gray-400 text-[11px]">{tLang(language, 'Varanasi, Uttar Pradesh, India', 'वाराणसी, उत्तर प्रदेश, भारत', 'Varanasi, Uttar Pradesh, India')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & UPI QR Info */}
          <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#C7A35A]" />
              {tLang(language, 'Official Booking & Token Payment', 'आधिकारिक बुकिंग एवं टोकन भुगतान', 'Official Booking & Token Payment')}
            </h4>
            <p className="text-gray-400 leading-relaxed">
              {tLang(
                language,
                'Booking tokens for residential plots can be transferred via official UPI ID akgvinfacity@icici or NEFT/RTGS into the corporate bank account.',
                'आवासीय प्लॉट्स के लिए टोकन राशि आधिकारिक यूपीआई आईडी akgvinfacity@icici अथवा बैंक खाते में आरटीजीएस/नेफ्ट द्वारा जमा की जा सकती है।',
                'Residential plots ke liye booking token official UPI ID akgvinfacity@icici ya corporate bank account me transfer kiya ja sakta hai.'
              )}
            </p>
            <div className="rounded-xl bg-[#050A17] p-3 text-[11px] text-gray-300 space-y-1 font-mono border border-white/5">
              <div>{tLang(language, 'UPI ID:', 'यूपीआई आईडी:', 'UPI ID:')} <strong className="text-sky-400">akgvinfacity@icici</strong></div>
              <div>{tLang(language, 'Account Name:', 'खाता धारक:', 'Account Name:')} <strong className="text-white">AKGV Infra City Private Limited</strong></div>
              <div>{tLang(language, 'Payment Receipt: Instant PDF on buyer portal', 'भुगतान रसीद: बायर पोर्टल पर तुरंत पीडीएफ', 'Payment Receipt: Buyer portal par instant PDF')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
