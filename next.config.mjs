/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
