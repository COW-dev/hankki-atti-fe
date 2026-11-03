import { AdminShell } from '@/components/layout/AdminShell';

// admin.domain.com/helpers — 도우미 관리. 화면은 A-06~ 이슈에서 채운다 (Figma 14:2149)
export default function AdminHelpersPage() {
  return <AdminShell active="/helpers" title="도우미 관리" />;
}
