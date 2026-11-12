/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Security headers on every response. CSP is limited to framing, forms and
  // plugins so Google Tag Manager and analytics keep working.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // "Nearest to me" needs location on our own pages; nothing else does.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Until the homepage (design/homepage-v10.html) is built, the flagship
      // listing is the front door. Temporary, so it can be swapped later.
      { source: "/", destination: "/halal-restaurants-manchester", permanent: false },
      { source: "/restaurants", destination: "/halal-restaurants-manchester", permanent: false },
    ];
  },
};

export default nextConfig;
