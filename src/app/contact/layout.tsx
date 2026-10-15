import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Branch Helpdesks | AKGV Infra City Private Limited',
  description:
    'Get in touch with AKGV Infra City Private Limited. Visit our branch offices in Rampur, Lahartara, and Mirza Murad or contact our official helpline at +91 6306917991.',
  openGraph: {
    title: 'Contact Us & Branch Helpdesks | AKGV Infra City Private Limited',
    description:
      'Get in touch with AKGV Infra City Private Limited. Visit our branch offices in Rampur, Lahartara, and Mirza Murad or contact our official helpline at +91 6306917991.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
