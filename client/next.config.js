/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };

    // Ignore problematic map and declaration files
    config.module.rules.push({
      test: /\.(d\.ts|map)$/,
      loader: 'ignore-loader'
    });

    return config;
  },
  
  typescript: {
    ignoreBuildErrors: true
  },

  reactStrictMode: true
};

module.exports = nextConfig;