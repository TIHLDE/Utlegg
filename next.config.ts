import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "leptonstoragepro.blob.core.windows.net",
      },
    ]
  }
};

export default nextConfig;
