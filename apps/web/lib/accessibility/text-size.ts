const STORAGE_KEY = 'hankki.textSize';

// 큰 글씨 설정은 이 기기(localStorage)에 저장한다. 같은 화면의 토글끼리 값을 공유하도록 작은 저장소로 감싼다.
// 계정 저장은 AccessibilitySync가 맡는다 — 사용자가 바꾼 것(setByUser)과 로그인 후 계정 값을 적용한 것(applyAccount)을 나눠
// 계정 값을 적용할 때 다시 계정에 저장하지 않게 한다
const listeners = new Set<() => void>();
const userListeners = new Set<(large: boolean) => void>();

function write(large: boolean) {
  localStorage.setItem(STORAGE_KEY, large ? 'large' : 'default');
  listeners.forEach((listener) => listener());
}

export const textSizeStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => localStorage.getItem(STORAGE_KEY) === 'large',
  getServerSnapshot: () => false,
  // 토글로 바꿈: 기기에 저장하고 "사용자가 바꿈"을 알린다
  setByUser(large: boolean) {
    write(large);
    userListeners.forEach((listener) => listener(large));
  },
  // 로그인 후 계정 설정 적용 (명세 §2.2 "로그인하면 계정 설정을 우선 적용"): 기기에도 저장한다
  applyAccount(large: boolean) {
    write(large);
  },
  onUserChange(listener: (large: boolean) => void) {
    userListeners.add(listener);
    return () => {
      userListeners.delete(listener);
    };
  },
};
