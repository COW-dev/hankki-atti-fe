import { AdminShell } from '@/components/layout/AdminShell';

// admin.domain.com/students — 장애학생 관리. 화면은 A-03~ 이슈에서 채운다 (Figma 14:1274)
export default function AdminStudentsPage() {
  return <AdminShell active="/students" title="장애학생 관리" />;
}
