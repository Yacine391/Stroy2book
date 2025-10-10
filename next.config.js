/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 15
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: true // For static export compatibility
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  },
  
  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    return config
  },
  
  // Performance optimizations (swcMinify is enabled by default in Next.js 15)
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig