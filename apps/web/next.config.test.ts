import { afterEach, describe, expect, it, vi } from 'vitest';

// 설정은 모듈을 읽을 때 환경변수를 보므로 경우마다 다시 불러온다
async function loadConfig(apiProxyTarget?: string) {
  vi.resetModules();
  vi.stubEnv('API_PROXY_TARGET', apiProxyTarget);
  return (await import('./next.config')).default;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('next.config', () => {
  it('API_PROXY_TARGET이 있으면 /api 경로를 그대로 백엔드로 넘긴다', async () => {
    const config = await loadConfig('http://api.example.com');

    expect(await config.rewrites?.()).toEqual([
      { source: '/api/:path*', destination: 'http://api.example.com/api/:path*' },
    ]);
  });

  it('끝에 /가 붙어 있어도 //api가 되지 않는다', async () => {
    const config = await loadConfig('http://api.example.com//');

    expect(await config.rewrites?.()).toEqual([
      { source: '/api/:path*', destination: 'http://api.example.com/api/:path*' },
    ]);
  });

  it('API_PROXY_TARGET이 있으면 브라우저 API 주소를 상대경로로 고정한다', async () => {
    const config = await loadConfig('http://api.example.com');

    expect(config.env).toEqual({ NEXT_PUBLIC_API_BASE_URL: '' });
  });

  it.each([
    ['없으면', undefined],
    ['비어 있으면', ''],
    ['공백뿐이면', '  '],
  ])('API_PROXY_TARGET이 %s rewrite도 API 주소 고정도 하지 않는다', async (_, target) => {
    const config = await loadConfig(target);

    expect(config.rewrites).toBeUndefined();
    expect(config.env).toBeUndefined();
  });
});
