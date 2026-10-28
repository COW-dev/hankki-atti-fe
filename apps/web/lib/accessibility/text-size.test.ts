import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { textSizeStore } from '@/lib/accessibility/text-size';

// 테스트 환경에서는 Node의 localStorage가 jsdom 것을 가리므로 메모리 저장소로 바꿔 둔다
function stubLocalStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
}

describe('textSizeStore', () => {
  beforeEach(stubLocalStorage);
  afterEach(() => vi.unstubAllGlobals());

  it('사용자가 바꾸면 기기에 저장하고 구독자와 "사용자가 바꿈" 구독자 모두에게 알린다', () => {
    // given
    const onSnapshot = vi.fn();
    const onUser = vi.fn();
    const stopSnapshot = textSizeStore.subscribe(onSnapshot);
    const stopUser = textSizeStore.onUserChange(onUser);

    // when
    textSizeStore.setByUser(true);

    // then
    expect(textSizeStore.getSnapshot()).toBe(true);
    expect(onSnapshot).toHaveBeenCalledOnce();
    expect(onUser).toHaveBeenCalledWith(true);
    stopSnapshot();
    stopUser();
  });

  it('계정 값 적용은 기기에 저장하지만 "사용자가 바꿈"으로 알리지 않는다', () => {
    const onUser = vi.fn();
    const stopUser = textSizeStore.onUserChange(onUser);

    textSizeStore.applyAccount(true);

    expect(textSizeStore.getSnapshot()).toBe(true);
    expect(onUser).not.toHaveBeenCalled();
    stopUser();
  });
});
