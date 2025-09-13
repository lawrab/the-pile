/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'steamcdn-a.akamaihd.net',
      'cdn.akamai.steamstatic.com',
      'steam.com'
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig