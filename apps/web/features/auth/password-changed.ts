// 비밀번호를 바꾼 뒤 마이페이지에 완료 토스트를 띄우기 위한 표시. 같은 페이지 안의 화면 이동이라 메모리로 충분하다
let changed = false;

export const passwordChanged = {
  mark() {
    changed = true;
  },
  peek: () => changed,
  clear() {
    changed = false;
  },
};
