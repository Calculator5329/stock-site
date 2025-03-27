import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/stock-site',
  assetPrefix: '/stock-site',
}

export default nextConfig
