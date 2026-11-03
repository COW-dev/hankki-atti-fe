import { redirect } from 'next/navigation';

// admin.domain.com/ — 첫 메뉴(장애학생 관리)로 보낸다. 로그인 확인은 그 화면의 AdminShell이 한다
export default function AdminHome() {
  redirect('/students');
}
