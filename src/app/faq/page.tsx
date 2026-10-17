'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  HelpCircle,
  Layers,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { tLang } from '@/lib/i18n';

export default function FaqPage() {
  const { language } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'Does AKGV Infra City Private Limited construct houses or villas?',
      qHi: 'क्या एकेजीवी इन्फ्रा सिटी मकान या विला का निर्माण करवाती है?',
      qHinglish: 'Kya AKGV Infra City ghar ya villa banwati hai?',
      aEn: 'No. AKGV Infra City Private Limited exclusively develops, demarcates, and sells approved residential plots. The company does NOT construct houses. The 3D elevations and villa models on our website are provided strictly as architectural guidance to inspire buyers designing their own homes.',
      aHi: 'नहीं। एकेजीवी इन्फ्रा सिटी केवल सुव्यवस्थित एवं अनुमोदित आवासीय प्लॉट्स का विकास और विक्रय करती है। कंपनी स्वयं मकान निर्माण का कार्य नहीं करती है। वेबसाइट पर दिखाए गए 3D मॉडल केवल खरीदारों के मार्गदर्शन हेतु वास्तुशिल्प सुझाव (Architectural Guidance) हैं।',
      aHinglish: 'Nahi. AKGV Infra City sirf approved residential plots sell karti hai, ghar ya construction nahi karti. Website par dikhaye gaye 3D designs sirf architectural reference aur guidance ke liye hain.',
      category: 'Plot Sales Policy'
    },
    {
      qEn: 'What do the plot colors mean on the interactive Master Plan?',
      qHi: 'मास्टर लेआउट प्लान पर प्लॉट्स के रंगों का क्या अर्थ है?',
      qHinglish: 'Master plan par plot colors ka kya matlab hai?',
      aEn: 'Green indicates available plots ready for immediate booking. Yellow indicates booked plots where token or full payment has been confirmed. Red indicates reserved or vacant company plots. Orange/Amber indicates a plot currently under hold review.',
      aHi: 'हरा (Green) रंग उपलब्ध प्लॉट्स दर्शाता है जिन्हें आप तुरंत बुक कर सकते हैं। पीला (Yellow) रंग उन प्लॉट्स का है जिनकी बुकिंग व भुगतान सफल हो चुका है। लाल (Red) रंग आरक्षित प्लॉट्स का है।',
      aHinglish: 'Green color available plots ke liye hai jo open hain. Yellow color booked plots ke liye hai jiska payment verify ho chuka hai. Red color reserved plots ke liye hai.',
      category: 'Plot Booking'
    },
    {
      qEn: 'What are the road specifications and infrastructure in AKGV townships?',
      qHi: 'टाउनशिप में सड़कों की चौड़ाई और क्या-क्या सुविधाएं हैं?',
      qHinglish: 'Township me road width aur infrastructure kya hai?',
      aEn: 'All AKGV townships feature 30-0" wide asphalt entrance boulevards and 25-0" wide internal avenues, underground drainage and sewage lines, dedicated 24x7 power transformers, street lighting, and individual potable water supply pipelines.',
      aHi: 'हमारी सभी टाउनशिप में 30 फीट चौड़ा मुख्य प्रवेश मार्ग, 25 फीट चौड़े आंतरिक रास्ते, भूमिगत सीवर लाइन, समर्पित विद्युत ट्रांसफार्मर, स्ट्रीट लाइट और शुद्ध पेयजल आपूर्ति उपलब्ध है।',
      aHinglish: 'Har township me 30ft entrance road aur 25ft internal roads hain, sath me drainage, dedicated transformer aur water supply lines available hain.',
      category: 'Infrastructure'
    },
    {
      qEn: 'Where are your approved project locations situated?',
      qHi: 'आपके प्रोजेक्ट्स वाराणसी में किन-किन स्थानों पर स्थित हैं?',
      qHinglish: 'Aapke township projects Varanasi me kahan kahan hain?',
      aEn: 'We have three flagship township developments in Varanasi: 1) Rampur (Ring Road-2 corridor), 2) Lahartara (near Varanasi Cantt Railway Station), and 3) Mirza Murad (NH-19 Expressway growth corridor).',
      aHi: 'हमारे तीन प्रमुख टाउनशिप स्थल हैं: 1) रामपुर (रिंग रोड-2 के पास), 2) लहरतारा (वाराणसी कैंट रेलवे स्टेशन के पास), और 3) मिर्ज़ा मुराद (NH-19 हाईवे एक्सप्रेसवे)।',
      aHinglish: 'Hamare 3 flagship projects hain: 1) Rampur, 2) Lahartara Cantt ke paas, aur 3) Mirza Murad NH-19 expressway par.',
      category: 'Locations'
    },
    {
      qEn: 'What is included in the ₹999 Joining Fee for associates?',
      qHi: 'सहयोगियों के लिए ₹999 जॉइनिंग शुल्क में क्या प्राप्त होता है?',
      qHinglish: 'Associates ke ₹999 joining kit me kya milta hai?',
      aEn: 'The ₹999 one-time physical kit includes: 1 Executive Bag, 1 Premium Pen, 1 Official Diary, and 1 Detailed Project File. This is paid strictly offline in cash at our branch office and accounted in the physical cash ledger with a printed receipt.',
      aHi: '₹999 की भौतिक जॉइनिंग किट में 1 बैग, 1 पेन, 1 डायरी और 1 प्रोजेक्ट फाइल शामिल है। यह शुल्क शाखा कार्यालय में ऑफलाइन नकद देकर प्राप्त किया जाता है और इसकी रसीद दी जाती है।',
      aHinglish: '₹999 physical joining kit me 1 Bag, 1 Pen, 1 Diary aur 1 Project File milta hai, jo branch office me offline cash jama karke receipt ke sath issue hota hai.',
      category: 'Joining Kit'
    },
    {
      qEn: 'How does the 11-Tier Commission and Rewards Plan work?',
      qHi: '11-स्तरीय कमीशन एवं पुरस्कार योजना किस प्रकार कार्य करती है?',
      qHinglish: '11-Tier Commission aur Rewards Plan kaise kaam karta hai?',
      aEn: 'Commission begins at Level 1 (Sales Assistant) at 5% and scales through Star, Gold Star, Ruby, Diamond, and Ambassador up to Crown Ambassador at 15%. Milestone rewards include Android Smartphone, Goa 4D/3N Tour, Sports Bike, Royal Enfield, Luxury Cars, and Cash incentives.',
      aHi: 'कमीशन लेवल 1 (सेल्स असिस्टेंट) पर 5% से शुरू होकर क्राउन एंबेसडर पर 15% तक जाता है। बिज़नेस लक्ष्यों को पूरा करने पर स्मार्टफोन, गोवा टूर, स्पोर्ट्स बाइक और कार पुरस्कार दिए जाते हैं।',
      aHinglish: 'Commission Level 1 par 5% se start hokar 15% tak badhta hai, sath me Smartphone, Goa Trip, Sports Bike aur luxury vehicles rewards milte hain.',
      category: 'Rewards Plan'
    },
    {
      qEn: 'How does the Live Field GPS Camera detection work?',
      qHi: 'लाइव फील्ड जीपीएस कैमरा सत्यापन कैसे कार्य करता है?',
      qHinglish: 'Live Field GPS Camera capture kaise kaam karta hai?',
      aEn: 'Field associates tap the "Plot GPS Capture" button inside their portal. The app accesses device camera and geolocation sensors, stamping real-time latitude, longitude, timestamp, company name, and plot number directly onto the image canvas to prevent misrepresentation.',
      aHi: 'फील्ड सहयोगी पोर्टल में "Plot GPS Capture" दबाते हैं। ऐप कैमरा और जीपीएस की सहायता से अक्षांश, देशांतर और समय को सीधे फोटो पर वॉटरमार्क करता है, जिससे प्लॉट की वास्तविक स्थिति प्रमाणित होती है।',
      aHinglish: 'Field associates camera se photo click karte hain aur platform live coordinates aur timestamp photo par watermark karke plot verification complete karta hai.',
      category: 'Field GPS'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#C7A35A]/40 bg-[#C7A35A]/10 px-4 py-1 text-xs font-semibold text-[#DFC382]">
          <HelpCircle className="h-3.5 w-3.5 text-[#C7A35A]" />
          <span>{tLang(language, 'Frequently Asked Questions', 'अक्सर पूछे जाने वाले प्रश्न', 'Frequently Asked Questions')}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
          {tLang(language, 'Frequently Asked Questions (FAQ)', 'अक्सर पूछे जाने वाले महत्वपूर्ण प्रश्न', 'Frequently Asked Questions (FAQ)')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          {tLang(
            language,
            'Clear answers on plot booking, registry compliance, township road standards, and associate policies.',
            'प्लॉट बुकिंग, कानूनी वैधता, सड़कों की चौड़ाई और कंपनी नियमों से संबंधित समस्त जानकारी।',
            'Plot booking, registry rules, road standards aur company policies ki complete jaankari.'
          )}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const question = language === 'hi' ? faq.qHi : language === 'hinglish' ? faq.qHinglish : faq.qEn;
          const answer = language === 'hi' ? faq.aHi : language === 'hinglish' ? faq.aHinglish : faq.aEn;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#C7A35A] bg-[#0B1734] shadow-xl'
                  : 'border-white/10 bg-[#050A17] hover:border-white/20'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-semibold text-white gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-[11px] font-bold text-[#DFC382] border border-[#C7A35A]/40">
                    {idx + 1}
                  </span>
                  <span>{question}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#C7A35A] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-white/10 px-5 pb-5 pt-3 text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#0B1734]/50">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#DFC382] mb-1">
                    {faq.category}
                  </span>
                  <p>{answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Box */}
      <div className="rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] p-8 text-center space-y-4 shadow-xl">
        <h3 className="font-serif text-lg font-bold text-white">
          {tLang(language, 'Have More Questions About Our Townships?', 'क्या आपके पास कोई अन्य प्रश्न है?', 'Kya aapka koi aur sawal hai?')}
        </h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          {tLang(
            language,
            'Contact our helpline directly or visit our registered office for free consultation and blueprint copies.',
            'हमारी हेल्पलाइन पर सीधे संपर्क करें या मुफ्त परामर्श और लेआउट जानकारी के लिए कार्यालय पधारें।',
            'Hamari helpline par contact karein ya free consultation aur layout ke liye branch visit karein.'
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`tel:${COMPANY_DETAILS.phone}`}
            className="rounded-xl bg-[#C7A35A] px-5 py-2.5 font-bold text-xs text-[#0B1734] hover:brightness-110 transition flex items-center gap-2"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call: {COMPANY_DETAILS.displayPhone}</span>
          </a>
          <Link
            href="/contact"
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 font-semibold text-xs text-white hover:bg-white/10 transition"
          >
            {tLang(language, 'Contact Desk', 'संपर्क डेस्क', 'Contact Desk')}
          </Link>
        </div>
      </div>
    </div>
  );
}
