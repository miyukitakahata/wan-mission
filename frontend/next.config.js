/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wan-mission-dev.s3.ap-northeast-1.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
