/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https', 
        hostname: '**.blob.vercel-storage.com',
      }
    ],
  },
  // Temporary fixes for Next.js 15.3.3 + React 19 compatibility issues
  experimental: {
    // Disable problematic experimental features that might cause vendor chunk issues
    turbo: false,
    serverComponentsHmrCache: false,
  },
  // Ensure proper webpack configuration
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      // Add debug logging for development
      console.log('=== Webpack Debug Info ===');
      console.log('Is Server:', isServer);
      console.log('Is Development:', dev);
      console.log('Node Version:', process.version);
      console.log('=== End Webpack Debug ===');
    }
    
    // Ensure proper module resolution
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
}

export default nextConfig
