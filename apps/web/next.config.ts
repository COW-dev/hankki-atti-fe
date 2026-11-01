import type { NextConfig } from 'next';

const nextConfig: NextConfig =
  // 이미지 빌드(Dockerfile)에서만 켠다. 켜 두면 로컬 pnpm start가 standalone용이 아니라고 경고한다
  process.env.NEXT_OUTPUT_STANDALONE === 'true' ? { output: 'standalone' } : {};

export default nextConfig;
