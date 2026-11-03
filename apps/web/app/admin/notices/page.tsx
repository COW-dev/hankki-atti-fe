import { AdminShell } from '@/components/layout/AdminShell';

// admin.domain.com/notices — 공지 관리. 화면은 A-12 이슈에서 채운다 (Figma 14:2477)
export default function AdminNoticesPage() {
  return <AdminShell active="/notices" title="공지 관리" />;
}
