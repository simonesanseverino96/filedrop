/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts')


const nextConfig = {
  serverExternalPackages: ['bcryptjs'],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Previene clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Previene MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HSTS - forza HTTPS per 1 anno
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // XSS Protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com https://translate.google.com https://translate.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://pagead2.googlesyndication.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://pagead2.googlesyndication.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
