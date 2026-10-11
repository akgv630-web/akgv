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
});
