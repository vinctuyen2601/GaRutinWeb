import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GaRutin - Gà Rutin Cảnh Thuần Chủng';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #166534 0%, #16a34a 60%, #22c55e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Bird icon */}
        <div style={{ fontSize: 120, marginBottom: 24 }}>🐦</div>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: '#ffffff' }}>Ga</span>
          <span style={{ fontSize: 72, fontWeight: 600, color: '#bbf7d0' }}>Rutin</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28,
          color: '#dcfce7',
          marginTop: 16,
          letterSpacing: 2,
        }}>
          Gà Rutin Cảnh Thuần Chủng · Nhiều Màu Đẹp
        </div>

        {/* Sub */}
        <div style={{
          fontSize: 20,
          color: '#86efac',
          marginTop: 12,
        }}>
          Gà tí hon nhỏ nhất thế giới · Giao hàng toàn quốc
        </div>

        {/* Domain badge */}
        <div style={{
          marginTop: 40,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 40,
          padding: '10px 32px',
          fontSize: 22,
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          garutin.com
        </div>
      </div>
    ),
    { ...size },
  );
}
