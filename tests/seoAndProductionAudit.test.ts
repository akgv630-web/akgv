import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { INITIAL_PLOTS, COMPANY_DETAILS, HOUSE_MODELS } from '@/data/groundTruth';

describe('AKGV Infra City - SEO, Robots, Sitemap & Production Integrity Audit', () => {
  it('should verify robots.txt exists and protects private authenticated routes', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Disallow: /admin');
    expect(content).toContain('Disallow: /member');
    expect(content).toContain('Disallow: /buyer');
    expect(content).toContain('Sitemap: https://akgv.in/sitemap.xml');
  });

  it('should verify sitemap.xml exists and indexes all 14 canonical public routes', () => {
    const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const requiredUrls = [
      'https://akgv.in/',
      'https://akgv.in/master-plan',
      'https://akgv.in/projects',
      'https://akgv.in/house-viewer-3d',
      'https://akgv.in/site-visit',
      'https://akgv.in/rewards-plan',
      'https://akgv.in/joining-kit',
      'https://akgv.in/about',
      'https://akgv.in/contact',
      'https://akgv.in/faq',
      'https://akgv.in/grievance',
      'https://akgv.in/booking-policy',
      'https://akgv.in/privacy-policy',
      'https://akgv.in/terms',
    ];

    for (const url of requiredUrls) {
      expect(content).toContain(`<loc>${url}</loc>`);
    }

    // Verify private routes are NOT in sitemap
    expect(content).not.toContain('<loc>https://akgv.in/admin</loc>');
    expect(content).not.toContain('<loc>https://akgv.in/member</loc>');
    expect(content).not.toContain('<loc>https://akgv.in/buyer</loc>');
  });

  it('should verify dedicated server layouts with SEO metadata exist for key public routes', () => {
    const routesWithLayouts = [
      'house-viewer-3d',
      'master-plan',
      'projects',
      'rewards-plan',
      'joining-kit',
      'about',
      'contact',
      'site-visit',
      'grievance',
    ];

    for (const route of routesWithLayouts) {
      const layoutPath = path.resolve(process.cwd(), `src/app/${route}/layout.tsx`);
      expect(fs.existsSync(layoutPath), `Missing layout.tsx for route /${route}`).toBe(true);
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('metadata: Metadata');
      expect(content).toContain('AKGV Infra City');
    }
  });

  it('should verify 3D Villa models are configured with high fidelity data', () => {
    expect(HOUSE_MODELS.length).toBeGreaterThanOrEqual(3);
    for (const model of HOUSE_MODELS) {
      expect(model.id).toBeDefined();
      expect(model.name).toBeDefined();
      expect(model.carpetAreaSqft).toBeGreaterThan(0);
      expect(model.estimatedCostInr).toBeGreaterThan(0);
      expect(model.exteriorThemes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should verify total master plan plot count is exactly 55', () => {
    expect(INITIAL_PLOTS.length).toBe(55);
    const blocks = new Set(INITIAL_PLOTS.map((p) => p.block));
    expect(blocks.has('A')).toBe(true);
    expect(blocks.has('B')).toBe(true);
    expect(blocks.has('C')).toBe(true);
  });

  it('should verify corporate integrity and verified registration data', () => {
    expect(COMPANY_DETAILS.legalName).toBe('AKGV Infra City Private Limited');
    expect(COMPANY_DETAILS.phone).toBe('6306917991');
    expect(COMPANY_DETAILS.joiningKitPriceInr).toBe(999);
  });
});
