import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grievance Redressal Cell | AKGV Infra City Private Limited',
  description:
    'Dedicated customer and associate grievance redressal mechanism with tracked tickets, official escalation matrix, and regulatory resolution commitments.',
  openGraph: {
    title: 'Grievance Redressal Cell | AKGV Infra City Private Limited',
    description:
      'Dedicated customer and associate grievance redressal mechanism with tracked tickets, official escalation matrix, and regulatory resolution commitments.',
  },
};

export default function GrievanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
