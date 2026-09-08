/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@odthan/ui", "@odthan/database", "@odthan/validation", "@odthan/auth"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.odthan.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
