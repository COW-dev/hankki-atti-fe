import { describe, expect, it } from 'vitest';
import { resolveSiteRoute, siteUrl } from './site';

describe('resolveSiteRoute', () => {
  it('서브도메인 접속이면 폴더 경로로 rewrite한다', () => {
    expect(resolveSiteRoute('helper.domain.com', '/matches')).toEqual({
      type: 'rewrite',
      pathname: '/helper/matches',
    });
    expect(resolveSiteRoute('admin.localhost:3000', '/')).toEqual({
      type: 'rewrite',
      pathname: '/admin',
    });
  });

  it('서브도메인에서 이미 폴더 경로면 그대로 둔다', () => {
    expect(resolveSiteRoute('admin.domain.com', '/admin/users')).toEqual({ type: 'next' });
  });

  it('메인 도메인에서 서브도메인 폴더로 직접 들어오면 첫 화면으로 보낸다', () => {
    expect(resolveSiteRoute('domain.com', '/helper/matches')).toEqual({
      type: 'redirect',
      pathname: '/',
    });
    expect(resolveSiteRoute('localhost:3000', '/admin')).toEqual({
      type: 'redirect',
      pathname: '/',
    });
  });

  it('폴더 이름으로 시작하기만 하는 경로는 막지 않는다', () => {
    expect(resolveSiteRoute('domain.com', '/administrator')).toEqual({ type: 'next' });
    expect(resolveSiteRoute('domain.com', '/requests')).toEqual({ type: 'next' });
  });
});

describe('siteUrl', () => {
  it('메인 주소 앞에 서브도메인을 붙인다', () => {
    expect(siteUrl('helper', '/signup')).toBe('http://helper.localhost:3000/signup');
  });
});
