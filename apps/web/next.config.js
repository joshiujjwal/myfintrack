/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@myfintrack/shared'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
