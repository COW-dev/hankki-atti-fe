import type { NextConfig } from 'next';

// 값이 있으면 브라우저는 같은 출처의 /api만 부르고 이 서버가 백엔드로 넘긴다 (docs/subdomain-rewrite.md).
// NEXT_PUBLIC_을 붙이지 않아 주소가 브라우저 번들에 들어가지 않는다
const apiProxyTarget = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, '');

const nextConfig: NextConfig = apiProxyTarget
  ? {
      // 절대 주소가 남아 있으면 rewrite를 거치지 않으므로, 프록시를 쓰면 API 주소를 상대경로로 고정한다
      env: { NEXT_PUBLIC_API_BASE_URL: '' },
      rewrites: async () => [
        { source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` },
      ],
    }
  : {};

export default nextConfig;
