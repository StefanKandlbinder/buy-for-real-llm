import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["gray-abstract-hyena-886.mypinata.cloud"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
