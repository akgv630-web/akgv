'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HouseViewerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/master-plan');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-center p-8">
      <p className="text-gray-400 text-sm">Redirecting to Master Layout Plan...</p>
    </div>
  );
}
