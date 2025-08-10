import type { NextConfig } from "next";

const maxFileSizeKB = process.env.NEXT_PUBLIC_MAX_FILE_SIZE_KB || "300";
const maxFileSizeMB = Math.ceil(parseInt(maxFileSizeKB) / 1024);
// For video uploads, we need a larger body size limit
const bodySizeLimitMB = parseInt(
  process.env.NEXT_PUBLIC_BODY_SIZE_LIMIT_MB || "50"
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gray-abstract-hyena-886.mypinata.cloud",
        pathname: "/**",
      },
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
      bodySizeLimit: `${bodySizeLimitMB}mb`,
    },
  },
};

export default nextConfig;
