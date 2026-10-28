import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilitySync } from '@/lib/accessibility/AccessibilitySync';
import { textSizeStore } from '@/lib/accessibility/text-size';

const authRequest = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ status: 'authenticated', authRequest }),
}));
// jsdom 주소는 localhost라 관리자 도메인으로 보이게 서브도메인 판단만 바꾼다
vi.mock('@/lib/site', () => ({ subdomainOf: () => 'admin' }));
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

describe('AccessibilitySync (관리자 도메인)', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    authRequest.mockReset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('관리자 도메인에서는 계정 설정을 받지도 저장하지도 않는다', () => {
    render(<AccessibilitySync />);

    act(() => textSizeStore.setByUser(true));

    expect(authRequest).not.toHaveBeenCalled();
  });
});
