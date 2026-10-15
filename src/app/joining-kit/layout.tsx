import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '₹999 Joining Kit Ledger & Associate Verification | AKGV Infra City Private Limited',
  description:
    'Track and verify offline physical dispatch of the ₹999 Welcome Kit containing official brochure, associate diary, pen, badge, and ID card.',
  openGraph: {
    title: '₹999 Joining Kit Ledger & Associate Verification | AKGV Infra City Private Limited',
    description:
      'Track and verify offline physical dispatch of the ₹999 Welcome Kit containing official brochure, associate diary, pen, badge, and ID card.',
  },
};

export default function JoiningKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
