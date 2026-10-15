import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Level Commission & 11-Tier Reward Plan | AKGV Infra City Private Limited',
  description:
    'Review the official transparent commission matrix and 11-tier career advancement program for associates at AKGV Infra City Private Limited.',
  openGraph: {
    title: 'Level Commission & 11-Tier Reward Plan | AKGV Infra City Private Limited',
    description:
      'Review the official transparent commission matrix and 11-tier career advancement program for associates at AKGV Infra City Private Limited.',
  },
};

export default function RewardsPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
