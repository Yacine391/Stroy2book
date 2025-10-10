/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel (Vercel handles this automatically)
  
  // Image optimization for Vercel
  images: {
    domains: ['via.placeholder.com'],
    // Remove unoptimized for better Vercel performance
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://hb-creator.vercel.app',
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
  
  // Transpile packages for better compatibility
  transpilePackages: ['@radix-ui/react-progress'],
  
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