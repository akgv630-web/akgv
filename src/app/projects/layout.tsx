import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Township Projects & Prime Locations | AKGV Infra City Private Limited',
  description:
    'Discover planned residential townships across Rampur, Lahartara, and Mirza Murad in Varanasi. Verified registry, wide asphalt roads, electricity transformer, and clear titles.',
  openGraph: {
    title: 'Township Projects & Prime Locations | AKGV Infra City Private Limited',
    description:
      'Discover planned residential townships across Rampur, Lahartara, and Mirza Murad in Varanasi. Verified registry, wide asphalt roads, electricity transformer, and clear titles.',
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
