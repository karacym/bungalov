import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX?.replace(/\/$/, '') ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@uiw/react-md-editor'],
  ...(basePath ? { basePath } : {}),
  ...(assetPrefix ? { assetPrefix } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
