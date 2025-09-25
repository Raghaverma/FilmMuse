// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "ia.media-imdb.com" },
      { protocol: "https", hostname: "img.omdbapi.com" },
    ],
    // or simply:
    // domains: ["m.media-amazon.com", "ia.media-imdb.com", "img.omdbapi.com"],
  },
};

export default nextConfig;
