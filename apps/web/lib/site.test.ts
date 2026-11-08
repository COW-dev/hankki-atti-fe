import { describe, expect, it } from 'vitest';
import { resolveSiteRoute, rolePath, subdomainOf } from './site';

describe('resolveSiteRoute', () => {
  it('서브도메인 접속이면 폴더 경로로 rewrite한다', () => {
    expect(resolveSiteRoute('admin.domain.com', '/users')).toEqual({
      type: 'rewrite',
      pathname: '/admin/users',
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
    expect(resolveSiteRoute('localhost:3000', '/admin')).toEqual({
      type: 'redirect',
      pathname: '/',
    });
  });

  it('메인 도메인의 도우미 경로는 그대로 연다', () => {
    expect(resolveSiteRoute('domain.com', '/helper/matches')).toEqual({ type: 'next' });
  });

  it('없어진 helper 도메인이면 메인의 도우미 경로로 옮긴다', () => {
    expect(resolveSiteRoute('helper.domain.com', '/matches')).toEqual({
      type: 'moved',
      pathname: '/helper/matches',
    });
    expect(resolveSiteRoute('helper.localhost:3000', '/')).toEqual({
      type: 'moved',
      pathname: '/helper',
    });
    expect(resolveSiteRoute('helper.domain.com', '/helper/matches')).toEqual({
      type: 'moved',
      pathname: '/helper/matches',
    });
  });

  it('helper 도메인의 로그인·비밀번호 재설정은 메인의 같은 경로로 옮긴다', () => {
    expect(resolveSiteRoute('helper.domain.com', '/login')).toEqual({
      type: 'moved',
      pathname: '/login',
    });
    expect(resolveSiteRoute('helper.domain.com', '/password-reset')).toEqual({
      type: 'moved',
      pathname: '/password-reset',
    });
  });

  it('폴더 이름으로 시작하기만 하는 경로는 막지 않는다', () => {
    expect(resolveSiteRoute('domain.com', '/administrator')).toEqual({ type: 'next' });
    expect(resolveSiteRoute('domain.com', '/requests')).toEqual({ type: 'next' });
  });
});

describe('rolePath', () => {
  it('도우미면 /helper 아래 경로, 장애학생이면 그대로 돌려준다', () => {
    expect(rolePath('HELPER', '/notices/3')).toBe('/helper/notices/3');
    expect(rolePath('STUDENT', '/notices/3')).toBe('/notices/3');
  });
});

describe('subdomainOf', () => {
  it('host의 첫 이름이 서브도메인이면 그 이름, 메인이면 null', () => {
    expect(subdomainOf('admin.localhost:3000')).toBe('admin');
    expect(subdomainOf('admin.atti.bluerack.org')).toBe('admin');
    expect(subdomainOf('atti.bluerack.org')).toBeNull();
    expect(subdomainOf('localhost:3000')).toBeNull();
  });
});
