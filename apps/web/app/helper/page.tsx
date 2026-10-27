import { redirect } from 'next/navigation';

// helper.domain.com/ — 소개 화면이 없으므로 도우미 첫 화면(homePathOf('HELPER'))으로 보낸다.
// 로그인 전이면 그 화면의 가드가 /login으로 보낸다. homePathOf는 클라이언트 모듈이라 서버에서 부르지 못한다
export default function HelperHome() {
  redirect('/matches');
}
