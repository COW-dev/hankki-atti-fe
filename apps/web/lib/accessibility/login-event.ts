// 로그인할 때마다 알린다. 이미 로그인된 상태에서 다른 계정으로 로그인하면 useAuth().status가 authenticated 그대로라
// AccessibilitySync가 계정이 바뀐 것을 모른다 — 이 신호로 새 계정의 접근성 설정을 다시 맞춘다
const listeners = new Set<() => void>();

export const loginEvents = {
  notify() {
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
