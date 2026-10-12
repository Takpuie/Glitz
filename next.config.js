/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self' https://api.glitzafrica.com; form-action 'self' https://checkout.paystack.com https://checkout.stripe.com; img-src 'self' data: https:; media-src 'self' https: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.glitzafrica.com https://api.paystack.co https://accounts.google.com" },
      ],
    }];
  },
  // Shared hosting limits the number of child processes available to a
  // single account. Keep Next's build worker pool to one process so
  // production builds do not fail with spawn EAGAIN on TechNE.
  experimental: {
    cpus: 1,
  },
  images: {
    // Every <Image> in the app already passes `unoptimized` (photos come
    // straight from the Django backend or from inline SVG placeholders,
    // never through Next's own pipeline). Disabling it here too closes off
    // the /_next/image endpoint's own attack surface (its CVE history
    // includes an unauthenticated RCE) instead of just not using it.
    unoptimized: true,
  },
};

module.exports = nextConfig;
