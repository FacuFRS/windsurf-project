/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: '0x679cc85aFDDca3d717A290Cc2cC97caedF4B781C',
    NEXT_PUBLIC_NETWORK_ID: '97'
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };
    return config;
  }
}

module.exports = nextConfig
