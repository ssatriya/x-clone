/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "i.pravatar.cc",
      },
      {
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
