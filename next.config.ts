// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" }, // OMDb poster host
      { protocol: "https", hostname: "image.tmdb.org" }      // (optional) TMDB if you add it later
    ],
  },
};

module.exports = nextConfig;
