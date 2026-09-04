'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { layVisitorId } from '@/lib/track';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const GA_ID = 'G-GCTB0DCD1V';
const AW_ID = 'AW-18180783236';
const VISITED_KEY = 'garutin_visited';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function TrackVisitInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const isNewUser = !localStorage.getItem(VISITED_KEY);
    if (isNewUser) localStorage.setItem(VISITED_KEY, '1');

    fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, isNewUser, event: 'view', visitorId: layVisitorId() }),
    }).catch(() => {});

    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: pathname });
      window.gtag('config', AW_ID, { page_path: pathname });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}

export default function TrackVisit() {
  return (
    <Suspense fallback={null}>
      <TrackVisitInner />
    </Suspense>
  );
}
