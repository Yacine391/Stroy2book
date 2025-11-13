/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel (Vercel handles this automatically)
  
  // Image optimization for Vercel
  images: {
    domains: ['via.placeholder.com'],
    // Remove unoptimized for better Vercel performance
  },
  
  // Environment variables - Optional, fallback handled in layout.tsx
  
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
  
  // ✅ ID de build unique pour forcer le rechargement
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  // Headers for security + NO CACHE
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
          // ✅ DÉSACTIVER LE CACHE COMPLÈTEMENT
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig