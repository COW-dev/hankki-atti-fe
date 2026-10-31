// 가입 직후 로그인 화면에 넘길 이메일. 화면 이동(router)은 같은 페이지 안이라 메모리로 충분하고,
// 주소·브라우저 저장소에 남기지 않는다. 새로고침하면 사라져도 된다
let joinedEmail: string | null = null;

export const joinedSignup = {
  set(email: string) {
    joinedEmail = email;
  },
  peek: () => joinedEmail,
  clear() {
    joinedEmail = null;
  },
};
