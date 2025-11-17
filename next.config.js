/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Important: This tells Next.js to build a static app for GitHub Pages
  
  // For GitHub Pages, we need to add a path prefix if hosted on a subdirectory
  basePath: process.env.NODE_ENV === 'production' ? '/coding-agent-template' : '',
  
  // Disable server-side features not supported on static hosting
  images: {
    unoptimized: true, // Disable image optimization for static exports
  },
  
  trailingSlash: true, // This helps with GitHub Pages routing
  
  // Remove any API route dependencies that require server-side processing
  experimental: {
    // Disable features not compatible with static export
    serverComponentsExternalPackages: [],
  },
  
  // Redirects and rewrites won't work in static export, so we'll handle client-side
  // async redirects() {
  //   return []
  // },
  //
  // async rewrites() {
  //   return []
  // },
}

module.exports = nextConfig
export default nextConfig