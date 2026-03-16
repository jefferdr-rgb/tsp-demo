/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfjs-dist uses Node.js APIs — keep it server-side or handle with webpack config
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
