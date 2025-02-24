import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "leptonstoragepro.blob.core.windows.net",
      },
    ]
  },
  output: process.env.NODE_ENV === "development" ? undefined : "standalone"
};

export default nextConfig;
