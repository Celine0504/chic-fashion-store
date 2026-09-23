// Provide build-time fallbacks for environment variables so Vercel builds never fail
process.env.DATABASE_URL = process.env.DATABASE_URL || "mysql://dummy:dummy@127.0.0.1:3306/chic_fashion_db";
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "chic_fashion_store_secret_jwt_key_2026";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "chic_fashion_store_secret_jwt_key_2026";

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
};

module.exports = nextConfig;
