'use client';

import { MatchesScreen } from '@/features/matches/MatchesScreen';
import { useSessionGuard } from '@/lib/auth/useSessionGuard';

// 도우미 F-07 매칭 현황 (Figma 208:3143 · 208:3305) — helper.domain.com/matches
export default function MatchesPage() {
  const me = useSessionGuard('HELPER');
  if (!me) return null;

  return <MatchesScreen />;
}
