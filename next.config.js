/** @type {import('next').NextConfig} */
const nextConfig = {
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
