'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Globe,
  HelpCircle,
  Layout,
  Megaphone,
  Plus,
  Save,
  Sparkles,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CmsContent } from '@/types';

export function AdminCmsTab() {
  const { cmsContent, updateCmsContent, currentUser } = useApp();

  const [heroHeadlineEn, setHeroHeadlineEn] = useState(cmsContent.heroHeadlineEn || '');
  const [heroHeadlineHi, setHeroHeadlineHi] = useState(cmsContent.heroHeadlineHi || '');
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(cmsContent.heroSubtitleEn || '');
  const [heroSubtitleHi, setHeroSubtitleHi] = useState(cmsContent.heroSubtitleHi || '');

  // Announcement Banner
  const [bannerActive, setBannerActive] = useState(cmsContent.announcementBanner?.isActive ?? true);
  const [bannerTextEn, setBannerTextEn] = useState(cmsContent.announcementBanner?.textEn || '');
  const [bannerTextHi, setBannerTextHi] = useState(cmsContent.announcementBanner?.textHi || '');
  const [bannerLinkUrl, setBannerLinkUrl] = useState(cmsContent.announcementBanner?.linkUrl || '/plots');

  // FAQs
  const [faqsList, setFaqsList] = useState(cmsContent.faqs || []);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newFaqQEn, setNewFaqQEn] = useState('');
  const [newFaqQHi, setNewFaqQHi] = useState('');
  const [newFaqAEn, setNewFaqAEn] = useState('');
  const [newFaqAHi, setNewFaqAHi] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Legal & Registry');

  // Public Offers
  const [offersList, setOffersList] = useState(cmsContent.publicOffers || []);
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferHighlight, setNewOfferHighlight] = useState('');
  const [newOfferBadge, setNewOfferBadge] = useState('LIMITED TIME');
  const [isAddingOffer, setIsAddingOffer] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateCmsContent({
        heroHeadlineEn,
        heroHeadlineHi,
        heroSubtitleEn,
        heroSubtitleHi,
        announcementBanner: {
          isActive: bannerActive,
          textEn: bannerTextEn,
          textHi: bannerTextHi,
          linkUrl: bannerLinkUrl,
        },
        faqs: faqsList,
        publicOffers: offersList,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.fullName || 'Super Admin',
      });

      showNotification('Dynamic website content and CMS settings updated successfully!');
    } catch {
      showNotification('Failed to update website content', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQEn || !newFaqAEn) {
      showNotification('English Question and Answer are required', 'error');
      return;
    }

    const newFaq = {
      id: `faq-${Date.now()}`,
      questionEn: newFaqQEn,
      questionHi: newFaqQHi || newFaqQEn,
      answerEn: newFaqAEn,
      answerHi: newFaqAHi || newFaqAEn,
      category: newFaqCategory,
    };

    setFaqsList([newFaq, ...faqsList]);
    setIsAddingFaq(false);
    setNewFaqQEn('');
    setNewFaqQHi('');
    setNewFaqAEn('');
    setNewFaqAHi('');
    showNotification('New FAQ added to pending save queue');
  };

  const handleDeleteFaq = (faqId: string) => {
    setFaqsList(faqsList.filter((f) => f.id !== faqId));
    showNotification('FAQ item removed from queue');
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle || !newOfferHighlight) {
      showNotification('Offer title and highlight are required', 'error');
      return;
    }

    const offer = {
      id: `offer-${Date.now()}`,
      title: newOfferTitle,
      highlight: newOfferHighlight,
      badge: newOfferBadge,
    };

    setOffersList([...offersList, offer]);
    setIsAddingOffer(false);
    setNewOfferTitle('');
    setNewOfferHighlight('');
    showNotification('Offer added to pending save queue');
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffersList(offersList.filter((o) => o.id !== offerId));
    showNotification('Offer removed from queue');
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-semibold shadow-lg ${
            actionNotice.type === 'success'
              ? 'border border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
              : 'border border-red-500/40 bg-red-950/80 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner with Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 shadow-2xl">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#C7A35A]" />
            Dynamic CMS & Website Content Desk
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Update homepage hero headlines, announcement ticker, promotional offers and FAQs without redeploying code.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-6 py-3 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Publishing Changes...' : 'Save & Publish Website Changes'}</span>
        </button>
      </div>

      {/* Hero Content Section */}
      <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-4">
        <h3 className="font-serif text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Layout className="h-4 w-4 text-[#C7A35A]" />
          Homepage Hero Headlines & Subtitles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* English Hero */}
          <div className="space-y-3 rounded-2xl bg-[#050A17] p-4 border border-white/5">
            <span className="text-xs font-bold text-[#DFC382] block">English Version</span>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Hero Main Headline</label>
              <input
                type="text"
                value={heroHeadlineEn}
                onChange={(e) => setHeroHeadlineEn(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Hero Subtitle</label>
              <textarea
                rows={3}
                value={heroSubtitleEn}
                onChange={(e) => setHeroSubtitleEn(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              />
            </div>
          </div>

          {/* Hindi Hero */}
          <div className="space-y-3 rounded-2xl bg-[#050A17] p-4 border border-white/5">
            <span className="text-xs font-bold text-[#DFC382] block">हिंदी संस्करण (Hindi Version)</span>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">हीरो मुख्य शीर्षक (Headline)</label>
              <input
                type="text"
                value={heroHeadlineHi}
                onChange={(e) => setHeroHeadlineHi(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">हीरो उप-शीर्षक (Subtitle)</label>
              <textarea
                rows={3}
                value={heroSubtitleHi}
                onChange={(e) => setHeroSubtitleHi(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#C7A35A]" />
            Top Announcement Banner Ticker
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bannerActive}
              onChange={(e) => setBannerActive(e.target.checked)}
              className="rounded border-white/10 text-[#C7A35A] focus:ring-[#C7A35A]"
            />
            <span className="text-xs font-semibold text-gray-300">
              {bannerActive ? 'Ticker Active (Visible)' : 'Ticker Hidden'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">English Ticker Text</label>
            <input
              type="text"
              value={bannerTextEn}
              onChange={(e) => setBannerTextEn(e.target.value)}
              placeholder="e.g. Navratri Special: 5% Cash Discount on Immediate Full Payment Plots"
              className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Hindi Ticker Text</label>
            <input
              type="text"
              value={bannerTextHi}
              onChange={(e) => setBannerTextHi(e.target.value)}
              placeholder="e.g. नवरात्रि विशेष: तुरंत रजिस्ट्री वाले प्लॉट्स पर 5% की सीधी छूट"
              className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Banner Target Link URL</label>
          <input
            type="text"
            value={bannerLinkUrl}
            onChange={(e) => setBannerLinkUrl(e.target.value)}
            placeholder="e.g. /plots or /member"
            className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
          />
        </div>
      </div>

      {/* Public Offers Manager */}
      <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#C7A35A]" />
            Promotional Offers & Highlights ({offersList.length})
          </h3>
          <button
            onClick={() => setIsAddingOffer(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#C7A35A]/10 border border-[#C7A35A]/40 px-3 py-1.5 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Offer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {offersList.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border border-white/10 bg-[#050A17] p-4 space-y-2 relative group"
            >
              <button
                onClick={() => handleDeleteOffer(offer.id)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                title="Delete Offer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <span className="rounded-full bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382] border border-[#C7A35A]/30">
                {offer.badge}
              </span>
              <h4 className="font-semibold text-white text-xs">{offer.title}</h4>
              <p className="text-[11px] text-gray-400">{offer.highlight}</p>
            </div>
          ))}
        </div>

        {isAddingOffer && (
          <form onSubmit={handleAddOffer} className="rounded-2xl border border-[#C7A35A]/30 bg-[#050A17] p-4 space-y-3">
            <span className="font-serif text-xs font-bold text-[#DFC382] block">Add New Offer</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Offer Title (e.g. Free Registry)"
                value={newOfferTitle}
                onChange={(e) => setNewOfferTitle(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Highlight (e.g. 100% Free on full payment)"
                value={newOfferHighlight}
                onChange={(e) => setNewOfferHighlight(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Badge (e.g. FESTIVE OFFER)"
                value={newOfferBadge}
                onChange={(e) => setNewOfferBadge(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingOffer(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#C7A35A] px-4 py-1.5 text-xs font-bold text-[#0B1734]"
              >
                Add to List
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FAQs Knowledge Base Manager */}
      <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#C7A35A]" />
            Frequently Asked Questions (FAQs) ({faqsList.length})
          </h3>
          <button
            onClick={() => setIsAddingFaq(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#C7A35A]/10 border border-[#C7A35A]/40 px-3 py-1.5 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-3">
          {faqsList.map((faq) => (
            <div
              key={faq.id}
              className="rounded-2xl border border-white/10 bg-[#050A17] p-4 space-y-2 relative group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-gray-400">
                    {faq.category}
                  </span>
                  <h4 className="font-semibold text-white text-xs mt-1">{faq.questionEn}</h4>
                  <p className="text-[11px] text-[#DFC382] mt-0.5">{faq.questionHi}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition shrink-0"
                  title="Delete FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="border-t border-white/5 pt-2 text-xs text-gray-300 space-y-1">
                <p><strong>EN:</strong> {faq.answerEn}</p>
                <p className="text-gray-400"><strong>HI:</strong> {faq.answerHi}</p>
              </div>
            </div>
          ))}
        </div>

        {isAddingFaq && (
          <form onSubmit={handleAddFaq} className="rounded-2xl border border-[#C7A35A]/30 bg-[#050A17] p-5 space-y-4">
            <span className="font-serif text-sm font-bold text-[#DFC382] block">Add New FAQ</span>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Category</label>
              <select
                value={newFaqCategory}
                onChange={(e) => setNewFaqCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
              >
                <option value="Legal & Registry">Legal & Registry (143/Kharij Dakhil)</option>
                <option value="Plots & Layout">Plots & Master Plan Layout</option>
                <option value="Payment & Pricing">Payment, EMI & ₹999 Joining Kit</option>
                <option value="Associate Hierarchy">Associate Network & Commission Rules</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Question (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Is registry done immediately?"
                  value={newFaqQEn}
                  onChange={(e) => setNewFaqQEn(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Question (Hindi)</label>
                <input
                  type="text"
                  placeholder="e.g. क्या रजिस्ट्री तुरंत होती है?"
                  value={newFaqQHi}
                  onChange={(e) => setNewFaqQHi(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Answer (English) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Yes, immediate registry and possession upon full payment..."
                  value={newFaqAEn}
                  onChange={(e) => setNewFaqAEn(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Answer (Hindi)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. हाँ, पूर्ण भुगतान पर तत्काल रजिस्ट्री और कब्जा दिया जाता है..."
                  value={newFaqAHi}
                  onChange={(e) => setNewFaqAHi(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingFaq(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#C7A35A] px-5 py-2 text-xs font-bold text-[#0B1734]"
              >
                Add FAQ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
