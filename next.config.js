/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['jsx', 'js'],
  // Enable static export for mobile builds when MOBILE_BUILD=true
  ...(process.env.MOBILE_BUILD === 'true' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    // Skip API routes for mobile build
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
    exportPathMap: async function () {
      return {
        '/': { page: '/' },
        '/about': { page: '/about' },
        '/competitions': { page: '/competitions' },
        '/hello': { page: '/hello' },
        '/live': { page: '/live' },
        '/login': { page: '/login' },
        '/matches': { page: '/matches' },
        '/players': { page: '/players' },
        '/rewards': { page: '/rewards' },
        '/teams': { page: '/teams' },
        '/auth/callback': { page: '/auth/callback' }
      }
    }
  })
}

module.exports = nextConfig