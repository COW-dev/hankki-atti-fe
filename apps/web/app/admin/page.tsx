'use client';

import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// admin.domain.com/ — 뼈대만 둔다. 관리자 목업이 정해지면 화면을 채운다
export default function AdminHome() {
  const me = useSessionGuard('ADMIN');
  if (!me) return null;

  return (
    <main className="flex flex-col gap-(--space-md) p-(--space-lg)">
      <h1 className="typo-title text-(--color-text-primary)">관리자</h1>
    </main>
  );
}
