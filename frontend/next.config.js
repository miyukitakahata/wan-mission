/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // VercelでのESLintエラーを無視
  },
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
