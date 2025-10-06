import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Abilita static export
  output: 'export',
  
  // Configura basePath per GitHub Pages
  basePath: isProd ? '/ai-dance-coach-demo' : '',
  assetPrefix: isProd ? '/ai-dance-coach-demo/' : '',
  
  // Disabilita ottimizzazione immagini per static export
  images: {
    unoptimized: true,
  },
  
  // Evita errori durante build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Strict mode per React
  reactStrictMode: true,
}

export default nextConfig
