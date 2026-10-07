'use client';

import { Footer } from '@/components/layout/Footer';
import { Block, PageShell } from '@/components/layout/PageShell';
import { TopBar } from '@/components/layout/TopBar';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// F-07 매칭 현황 — 디자인(208:3143) 반영 전 임시 화면. 도우미 로그인 후 이동 확인용
export default function MatchesPage() {
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  return (
    <PageShell size="M" topBar={<TopBar title="매칭 현황" logo bell />} footer={<Footer />}>
      <Block>
        <h2 className="typo-title w-full text-center">아직 지원한 건이 없어요</h2>
        <p className="typo-body w-full text-center text-(--color-text-secondary)">
          먼저 지원하면 바로 매칭돼요
        </p>
      </Block>
    </PageShell>
  );
}
