import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us & Leadership | AKGV Infra City Private Limited',
  description:
    'Learn about AKGV Infra City Private Limited, our mission, leadership, infrastructure engineering standards, and commitment to transparent plotted townships in Uttar Pradesh.',
  openGraph: {
    title: 'About Us & Leadership | AKGV Infra City Private Limited',
    description:
      'Learn about AKGV Infra City Private Limited, our mission, leadership, infrastructure engineering standards, and commitment to transparent plotted townships in Uttar Pradesh.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
