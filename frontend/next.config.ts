import type { NextConfig } from "next";

const maxFileSizeKB = process.env.NEXT_PUBLIC_MAX_FILE_SIZE_KB || "300";
const maxFileSizeMB = Math.ceil(parseInt(maxFileSizeKB) / 1024);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://gray-abstract-hyena-886.mypinata.cloud/**"),
    ],
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  experimental: {
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: `${maxFileSizeMB}mb`,
    },
  },
};

export default nextConfig;
