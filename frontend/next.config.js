// Provide build-time fallbacks for environment variables so Vercel builds never fail
process.env.DATABASE_URL = process.env.DATABASE_URL || "mysql://dummy:dummy@127.0.0.1:3306/chic_fashion_db";
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "chicfashionstoresupersecretkey1234567890";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "chicfashionstoresupersecretkey1234567890";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', '@auth/prisma-adapter'],
  },
};

module.exports = nextConfig;
