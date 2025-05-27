/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Ignorar errores de comprobación de tipos
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    serverTimeout: 120000, // 2 minutes in milliseconds
  }
}

export default nextConfig;
