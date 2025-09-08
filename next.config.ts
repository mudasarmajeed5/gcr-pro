import withPWA from 'next-pwa'

const nextConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
}

export default withPWA(nextConfig)