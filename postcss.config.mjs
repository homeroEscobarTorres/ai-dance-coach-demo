/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export', // ← CHIAVE: Abilita static export
  basePath: isProd ? '/ai-dance-coach-demo' : '',
  assetPrefix: isProd ? '/ai-dance-coach-demo/' : '',
  images: {
    unoptimized: true, // Necessario per static export
  },
  reactStrictMode: true,
};

export default nextConfig;
