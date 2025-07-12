/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['jsx', 'js'],
  // Mobile build optimizations
  ...(process.env.MOBILE_BUILD === 'true' && {
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    experimental: {
      missingSuspenseWithCSRBailout: false,
    }
  })
}

module.exports = nextConfig