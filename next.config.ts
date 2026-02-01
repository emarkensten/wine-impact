import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'product-cdn.systembolaget.se',
        pathname: '/productimages/**',
      },
    ],
  },
};

export default nextConfig;
