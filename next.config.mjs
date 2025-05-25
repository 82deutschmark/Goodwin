/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Cloudflare Workers deployment
  // Keep this minimal to avoid compatibility issues
  
  // Disable source maps for production build
  productionBrowserSourceMaps: false,
};

export default nextConfig;
