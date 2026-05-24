import type { NextConfig } from "next";

const SUPABASE_URL = 'https://bqeduaentzxaguzpzswa.supabase.co'
const SUPABASE_WSS = 'wss://bqeduaentzxaguzpzswa.supabase.co'

const csp = [
  "default-src 'self'",
  // Next.js App Router requiere unsafe-inline para hidratación del cliente
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // data: y blob: para Leaflet; *.tile.openstreetmap.org para tiles; Supabase Storage para evidencia multimedia
  `img-src 'self' data: blob: https://*.tile.openstreetmap.org ${SUPABASE_URL}`,
  `media-src 'self' ${SUPABASE_URL}`,
  // WebSocket (wss:) para Supabase Realtime
  `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WSS}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig;
