import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule a Free Site Visit | AKGV Infra City Private Limited',
  description:
    'Book a free, guided on-ground site visit with complimentary transportation to our township project in Rampur, Varanasi. Inspect road widths, plot boundaries, and infrastructure.',
  openGraph: {
    title: 'Schedule a Free Site Visit | AKGV Infra City Private Limited',
    description:
      'Book a free, guided on-ground site visit with complimentary transportation to our township project in Rampur, Varanasi. Inspect road widths, plot boundaries, and infrastructure.',
  },
};

export default function SiteVisitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
