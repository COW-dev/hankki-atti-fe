import { NextResponse, type NextRequest } from 'next/server';
import { resolveSiteRoute } from '@/lib/site';

// App Router는 host를 보지 않으므로 서브도메인을 경로로 바꿔 준다 (docs/subdomain-rewrite.md).
// 권한 판단은 여기서 하지 않는다 — 화면은 useSessionGuard, 최종은 서버
export function proxy(req: NextRequest) {
  const route = resolveSiteRoute(req.headers.get('host') ?? '', req.nextUrl.pathname);
  if (route.type === 'next') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = route.pathname;
  return route.type === 'rewrite' ? NextResponse.rewrite(url) : NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
