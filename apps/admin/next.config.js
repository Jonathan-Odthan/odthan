/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@odthan/ui", "@odthan/database", "@odthan/validation", "@odthan/auth", "@odthan/tracking", "@odthan/notifications"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.odthan.com" }],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
