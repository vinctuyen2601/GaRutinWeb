'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const GA_ID = 'G-GCTB0DCD1V';
const AW_ID = 'AW-18180783236';
const VALID_PLATFORMS = ['facebook', 'youtube', 'tiktok', 'zalo'];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function TrackVisitInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const utmSource = searchParams.get('utm_source');
    const platform = utmSource && VALID_PLATFORMS.includes(utmSource) ? utmSource : 'web';

    // Internal tracking (our own analytics)
    fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, path: pathname }),
    }).catch(() => {});

    // Google Analytics / Ads — send page_view on every SPA navigation
    if (typeof window.gtag === 'function') {
      if (GA_ID) {
        window.gtag('config', GA_ID, { page_path: pathname });
      }
      window.gtag('config', AW_ID, { page_path: pathname });
    }
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
