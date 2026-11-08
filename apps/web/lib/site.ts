import type { Role } from '@/lib/auth/AuthProvider';

// admin 서브도메인은 app 안의 같은 이름 폴더로 연결한다.
// 메인 도메인은 장애학생·도우미·비로그인 화면을 제공한다 (docs/subdomain-rewrite.md).
export const SUBDOMAINS = ['admin'] as const;
export type Subdomain = (typeof SUBDOMAINS)[number];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// 메인 화면으로 합쳐져 app/helper에 없는 경로
const MERGED_HELPER_PATHS = ['/login', '/password-reset'];

export const isUnder = (pathname: string, segment: string) =>
  pathname === `/${segment}` || pathname.startsWith(`/${segment}/`);

export type SiteRoute =
  | { type: 'rewrite'; pathname: string }
  | { type: 'redirect'; pathname: string }
  | { type: 'moved'; pathname: string }
  | { type: 'next' };

const firstLabel = (host: string) => host.split(':')[0].split('.')[0];

/** host의 첫 이름이 서브도메인이면 그 이름, 아니면(메인) null. admin.localhost:3000 → admin */
export function subdomainOf(host: string): Subdomain | null {
  return SUBDOMAINS.find((name) => firstLabel(host) === name) ?? null;
}

/**
 * host와 경로로 proxy가 할 일을 정한다. admin.x/users → /admin/users, 메인에서 /admin 직접 접근은 / 로 보낸다.
 * 없어진 helper. 도메인은 북마크가 끊기지 않게 메인 주소로 보낸다. helper.x/matches → x/helper/matches
 */
export function resolveSiteRoute(host: string, pathname: string): SiteRoute {
  if (firstLabel(host) === 'helper') {
    const merged = MERGED_HELPER_PATHS.includes(pathname) || isUnder(pathname, 'helper');
    return {
      type: 'moved',
      pathname: merged ? pathname : `/helper${pathname === '/' ? '' : pathname}`,
    };
  }
  const sub = subdomainOf(host);
  if (sub) {
    return isUnder(pathname, sub)
      ? { type: 'next' }
      : { type: 'rewrite', pathname: `/${sub}${pathname === '/' ? '' : pathname}` };
  }
  return SUBDOMAINS.some((name) => isUnder(pathname, name))
    ? { type: 'redirect', pathname: '/' }
    : { type: 'next' };
}

/** 역할에 맞는 화면 경로. 도우미 화면만 /helper 아래에 있어 장애학생 경로를 넘기면 된다. */
export function rolePath(role: Role, path: string) {
  return role === 'HELPER' ? `/helper${path}` : path;
}
