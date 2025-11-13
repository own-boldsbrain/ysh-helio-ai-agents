import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize lightningcss to prevent webpack from bundling the native module
      if (config.externals) {
        if (Array.isArray(config.externals)) {
          config.externals.push('lightningcss')
        } else {
          config.externals = [config.externals, 'lightningcss']
        }
      } else {
        config.externals = ['lightningcss']
      }
    }
    return config
  },
}

export default nextConfig
