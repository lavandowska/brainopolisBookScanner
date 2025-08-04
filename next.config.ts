import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['books.google.com', 'covers.openlibrary.org'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'books.google.com',
        port: '',
        pathname: '/**',
      },
      new URL('http://books.google.com/books/**'),
      new URL('https://covers.openlibrary.org/**')
    ],
  },
};

export default nextConfig;
