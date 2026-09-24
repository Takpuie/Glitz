/** @type {import('next').NextConfig} */
const nextConfig = {
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
