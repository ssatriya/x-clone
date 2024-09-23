/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "wsrv.nl",
      },
      {
        hostname: "hhzftnqgkohqpubzcouh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
