import path from 'path'
import fs from 'fs'
/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
        port: '',
        pathname: '/public/storage/**',
      },
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
        port: '',
        pathname: '/images/**',
      }
    ],
    unoptimized: true
    // unoptimized: process.env.NEXT_PUBLIC_SEO === "false" ? true : false
  },

  experimental: {
    scrollRestoration: true,
  },
  async exportPathMap(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    if (dir && outDir && fs.existsSync(path.join(dir, '.htaccess'))) {
      fs.copyFileSync(path.join(dir, '.htaccess'), path.join(outDir, '.htaccess'))
    } else {
      // console.log('No .htaccess file found')
    }
    return defaultPathMap
  }
};

if (process.env.NEXT_PUBLIC_SEO === "true") {
  nextConfig.output = "standalone";
} else {
  nextConfig.output = "export";
}
export default nextConfig;
