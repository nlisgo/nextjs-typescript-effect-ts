import type { NextConfig } from 'next';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePathEnv = process.env.NEXT_PUBLIC_BASE_PATH;
const inferredBasePath = basePathEnv ?? (process.env.GITHUB_ACTIONS && repoName ? `/${repoName}` : '');
const basePath = inferredBasePath === '' ? undefined : inferredBasePath;

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
