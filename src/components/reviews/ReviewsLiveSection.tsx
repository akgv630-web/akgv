'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Filter,
  PenLine,
  ShieldCheck,
  Star,
  ThumbsUp
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tLang } from '@/lib/i18n';
import { ReviewRecord } from '@/types';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';

export function ReviewsLiveSection() {
  const { reviews, voteHelpful, language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<'ALL' | 'buyer' | 'visitor' | '5_star'>('ALL');
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  // Only show approved reviews
  const approvedReviews = reviews.filter((r) => r.status === 'approved' || !r.status);

  // Filter logic
  const filteredReviews = approvedReviews.filter((r) => {
    if (filterRole === 'buyer') return r.authorRole === 'buyer';
    if (filterRole === 'visitor') return r.authorRole === 'visitor';
    if (filterRole === '5_star') return r.rating === 5;
    return true;
  });

  // Calculate live statistics
  const totalCount = approvedReviews.length;
  const avgRating = totalCount > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  const fiveStarCount = approvedReviews.filter((r) => r.rating === 5).length;
  const buyerCount = approvedReviews.filter((r) => r.authorRole === 'buyer').length;

  const handleVote = (id: string) => {
    if (votedIds[id]) return;
    voteHelpful(id);
    setVotedIds((prev) => ({ ...prev, [id]: true }));
  };

  const getRoleBadge = (role: ReviewRecord['authorRole']) => {
    switch (role) {
      case 'buyer':
        return { label: tLang(language, 'Verified Buyer', 'सत्यापित खरीदार', 'Verified Buyer'), color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'visitor':
        return { label: 'Site Inspection Visitor', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'associate':
        return { label: 'Registered Associate', color: 'bg-[#C7A35A]/10 text-[#DFC382] border-[#C7A35A]/20' };
      default:
        return { label: 'Public Review', color: 'bg-gray-500/10 text-gray-300 border-gray-500/20' };
    }
  };

  const getCategoryLabel = (category: ReviewRecord['category']) => {
    switch (category) {
      case 'plot_purchase':
        return 'Plot Booking & Demarcation';
      case 'site_visit':
        return 'Accompanied Site Visit';
      case 'legal_registry':
        return 'Legal & Registry Process';
      case 'staff_support':
        return 'Branch & Staff Support';
      case 'corporate_trust':
        return 'Developer Transparency';
      default:
        return 'General Feedback';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Stats Card */}
      <div className="rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% Real & Verified Reviews</span>
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Customer & Visitor Feedback Registry
            </h3>
            <p className="text-xs text-gray-300 max-w-xl">
              {tLang(
                language,
                'Authentic feedback from valued plot buyers and site visitors across Varanasi, Chandauli, and Mirzapur.',
                'वाराणसी, चंदौली एवं मीरजापुर के सम्मानित प्लॉट खरीदारों और साइट विजिटरों की वास्तविक एवं प्रामाणिक प्रतिक्रिया।',
                'Varanasi, Chandauli aur Mirzapur ke buyers aur visitors ka real feedback.'
              )}
            </p>
          </div>

          {/* Aggregate Rating & CTA */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start lg:self-auto">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-center">
                <div className="font-mono text-3xl font-extrabold text-[#DFC382] leading-none">
                  {avgRating}
                </div>
                <div className="flex text-amber-400 mt-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <div className="border-l border-white/10 pl-3 text-left">
                <div className="text-xs font-bold text-white">{totalCount} Direct Reviews</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{fiveStarCount} Five-Star Ratings</div>
                <div className="text-[10px] text-gray-400">{buyerCount} Verified Buyers</div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] px-5 py-3 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 transition flex items-center gap-2 hover:scale-[1.02]"
            >
              <PenLine className="h-4 w-4" />
              <span>{tLang(language, 'Write a Real Review', 'अपना रिव्यू दें', 'Apna Review Dein')}</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 flex items-center gap-1 mr-2 text-[11px]">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Reviews:</span>
          </span>
          <button
            onClick={() => setFilterRole('ALL')}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              filterRole === 'ALL'
                ? 'bg-[#C7A35A] text-[#0B1734]'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            All Reviews ({approvedReviews.length})
          </button>
          <button
            onClick={() => setFilterRole('buyer')}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              filterRole === 'buyer'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Verified Plot Buyers ({buyerCount})
          </button>
          <button
            onClick={() => setFilterRole('visitor')}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              filterRole === 'visitor'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Site Inspection Visitors ({approvedReviews.filter((r) => r.authorRole === 'visitor').length})
          </button>
          <button
            onClick={() => setFilterRole('5_star')}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              filterRole === '5_star'
                ? 'bg-amber-500 text-[#0B1734]'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            ★ 5-Star Only ({fiveStarCount})
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((rev) => {
          const roleBadge = getRoleBadge(rev.authorRole);
          const hasVoted = !!votedIds[rev.id];

          return (
            <div
              key={rev.id}
              className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#C7A35A]/40 transition group"
            >
              <div className="space-y-3">
                {/* Top Row: Stars + Role Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold border truncate max-w-[170px] ${roleBadge.color}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>

                {/* Review Title & Category */}
                <div>
                  <span className="text-[10px] font-semibold text-[#DFC382] uppercase tracking-wider block">
                    {getCategoryLabel(rev.category)}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-white mt-0.5 leading-snug">
                    {rev.title}
                  </h4>
                </div>

                {/* Review Comment */}
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {/* Official Corporate Admin Reply if present */}
                {rev.adminReply && (
                  <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17]/90 p-3 space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#DFC382]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#C7A35A]" />
                      <span>Official Corporate Reply — {rev.adminReply.replierName}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-normal">
                      {rev.adminReply.replyText}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#050A17] border border-[#C7A35A]/40 text-[#DFC382] font-serif font-bold text-xs">
                      {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-white text-xs">{rev.authorName}</div>
                      <div className="text-[10px] text-gray-400">
                        {rev.plotNumber ? `Plot #${rev.plotNumber} • ` : ''}
                        {rev.branchLocation}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-500">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Helpful voting button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-400/80 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Demarcated Registry Verified</span>
                  </span>

                  <button
                    onClick={() => handleVote(rev.id)}
                    type="button"
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold border transition ${
                      hasVoted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 cursor-default'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'text-emerald-400 fill-emerald-400' : ''}`} />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
