import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '',        // ⛔ remove /stock-site
  assetPrefix: '',     // ⛔ remove /stock-site
}
export default nextConfig

