import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Master Plan & Verified Plots | AKGV Infra City Private Limited',
  description:
    'Explore the 55-plot master layout plan at Rampur, Varanasi. Real-time availability, vastu facing details, 30ft road widths, and direct 72-hour plot reservation certificate.',
  openGraph: {
    title: 'Interactive Master Plan & Verified Plots | AKGV Infra City Private Limited',
    description:
      'Explore the 55-plot master layout plan at Rampur, Varanasi. Real-time availability, vastu facing details, 30ft road widths, and direct 72-hour plot reservation certificate.',
  },
};

export default function MasterPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
