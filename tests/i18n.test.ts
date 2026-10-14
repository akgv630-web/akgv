import { describe, it, expect } from 'vitest';
import { DICTIONARY } from '../src/lib/i18n';

describe('Multi-Language Localization Tests', () => {
  it('should provide complete dictionaries for English, Hindi, and Hinglish', () => {
    expect(DICTIONARY.en).toBeDefined();
    expect(DICTIONARY.hi).toBeDefined();
    expect(DICTIONARY.hinglish).toBeDefined();
  });

  it('should contain matching navigation and tagline keys across languages', () => {
    expect(DICTIONARY.en.tagline).toBe('Where Dreams Find Their Address');
    expect(DICTIONARY.hi.tagline).toBe('जहां सपने पाते हैं अपना ठिकाना');
    expect(DICTIONARY.en.nav.home).toBe('Home');
    expect(DICTIONARY.hi.nav.home).toBe('होम');
    expect(DICTIONARY.hinglish.nav.home).toBe('Home');
  });

  it('should maintain consistent phone helpline across all dictionaries', () => {
    expect(DICTIONARY.en.phoneLabel).toContain('6306917991');
    expect(DICTIONARY.hi.phoneLabel).toContain('6306917991');
    expect(DICTIONARY.hinglish.phoneLabel).toContain('6306917991');
  });

  it('should ensure English keys do not contain Devanagari script (strict English isolation)', () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    // Check titles, badges, and footer in English
    expect(devanagariRegex.test(DICTIONARY.en.hero.badge)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.hero.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.hero.subtitle)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.masterPlan.inspector.sloganTitle)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.houseViewer.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.loanCalc.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.trust.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.certificate.modalTitleGenerated)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.whatsAppPopup.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.footer.tagline)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.footer.disclaimer)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.rewards.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.rewards.headerTagline)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.mobileNav.home)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.en.mobileNav.plots)).toBe(false);
  });

  it('should ensure Hindi keys use authentic Devanagari script (strict Hindi isolation)', () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    expect(devanagariRegex.test(DICTIONARY.hi.hero.badge)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.hero.title)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.hero.subtitle)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.masterPlan.inspector.sloganTitle)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.houseViewer.title)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.loanCalc.title)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.trust.title)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.certificate.modalTitleGenerated)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.footer.tagline)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.footer.disclaimer)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.rewards.title)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.rewards.headerTagline)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.mobileNav.home)).toBe(true);
    expect(devanagariRegex.test(DICTIONARY.hi.mobileNav.plots)).toBe(true);
  });

  it('should ensure Hinglish keys do not contain Devanagari script (pure conversational Hinglish)', () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    expect(devanagariRegex.test(DICTIONARY.hinglish.hero.title)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.hinglish.hero.subtitle)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.hinglish.footer.tagline)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.hinglish.rewards.headerTagline)).toBe(false);
    expect(devanagariRegex.test(DICTIONARY.hinglish.architecturalGuidance.policyNotice)).toBe(false);
  });

  it('should strictly affirm plot-sales-only business model in houseViewer notices and architectural guidance across all languages', () => {
    expect(DICTIONARY.en.houseViewer.noticeText).toContain('does NOT construct houses');
    expect(DICTIONARY.hi.houseViewer.noticeText).toContain('कंपनी मकान निर्माण नहीं करती है');
    expect(DICTIONARY.hinglish.houseViewer.noticeText).toContain('Company house construction nahi karti');

    expect(DICTIONARY.en.architecturalGuidance.policyNotice).toContain('NOT construct houses');
    expect(DICTIONARY.hi.architecturalGuidance.policyNotice).toContain('कंपनी मकान निर्माण नहीं करती है');
    expect(DICTIONARY.hinglish.architecturalGuidance.policyNotice).toContain('Company house construction nahi karti');
  });
});
