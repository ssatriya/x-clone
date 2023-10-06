const webpack = require("webpack");

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
      {
        hostname: "utfs.io",
      },
    ],
  },
};

module.exports = nextConfig;
