import type { Role } from '@/lib/auth/AuthProvider';

// 서브도메인 이름 = app 안의 폴더 이름. 메인 도메인은 장애학생·비로그인 (docs/subdomain-rewrite.md)
export const SUBDOMAINS = ['helper', 'admin'] as const;
export type Subdomain = (typeof SUBDOMAINS)[number];

// 도메인마다 한 역할만 받는다. refresh 쿠키를 서브도메인끼리 공유하지 않으므로 로그인도 도메인별로 한다
export const SITE_ROLE: Record<Subdomain | 'main', Role> = {
  main: 'STUDENT',
  helper: 'HELPER',
  admin: 'ADMIN',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const isUnder = (pathname: string, segment: string) =>
  pathname === `/${segment}` || pathname.startsWith(`/${segment}/`);

export type SiteRoute =
  { type: 'rewrite'; pathname: string } | { type: 'redirect'; pathname: string } | { type: 'next' };

/** host와 경로로 proxy가 할 일을 정한다. admin.x/users → /admin/users, 메인에서 /admin 직접 접근은 / 로 보낸다. */
export function resolveSiteRoute(host: string, pathname: string): SiteRoute {
  const sub = SUBDOMAINS.find((name) => host.split(':')[0].split('.')[0] === name);
  if (sub) {
    return isUnder(pathname, sub)
      ? { type: 'next' }
      : { type: 'rewrite', pathname: `/${sub}${pathname === '/' ? '' : pathname}` };
  }
  return SUBDOMAINS.some((name) => isUnder(pathname, name))
    ? { type: 'redirect', pathname: '/' }
    : { type: 'next' };
}

/** 다른 서브도메인 화면의 절대 주소. 메인 주소(NEXT_PUBLIC_SITE_URL) 앞에 서브도메인을 붙인다. */
export function siteUrl(sub: Subdomain, path: string) {
  const url = new URL(path, SITE_URL);
  url.host = `${sub}.${url.host}`;
  return url.toString();
}
