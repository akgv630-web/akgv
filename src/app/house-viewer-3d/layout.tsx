import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '3D Villa Architectural Studio | AKGV Infra City Private Limited',
  description:
    'Experience interactive 3D villa architectural models, exterior finishes, day/night lighting simulation, and plot fitments at AKGV Infra City, Varanasi.',
  openGraph: {
    title: '3D Villa Architectural Studio | AKGV Infra City Private Limited',
    description:
      'Experience interactive 3D villa architectural models, exterior finishes, day/night lighting simulation, and plot fitments at AKGV Infra City, Varanasi.',
  },
};

export default function HouseViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
