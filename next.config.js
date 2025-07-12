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
    }
  })
}

module.exports = nextConfig