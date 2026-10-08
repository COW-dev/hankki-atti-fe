import type { MyHelpRequest, MyHelpRequests } from './types';

const IN_PROGRESS = ['RECRUITING', 'MATCHED'] as const;

/**
 * 철회·노쇼 응답으로 받은 신청 한 건을 목록에 반영한다.
 * 진행 중(모집 중·매칭 완료)이면 다가오는 목록, 아니면 지난 목록으로 간다 — 서버의 분류 기준과 같다.
 * 다가오는 → 지난으로 옮겨지면 가장 최근 건이므로 지난 목록 맨 앞에 둔다.
 */
export function applyUpdate(current: MyHelpRequests, updated: MyHelpRequest): MyHelpRequests {
  const inProgress = (IN_PROGRESS as readonly string[]).includes(updated.status);
  const upcomingWithout = current.upcoming.filter((request) => request.id !== updated.id);
  const pastWithout = current.past.filter((request) => request.id !== updated.id);

  if (inProgress) {
    const wasUpcoming = current.upcoming.some((request) => request.id === updated.id);
    return {
      upcoming: wasUpcoming
        ? current.upcoming.map((request) => (request.id === updated.id ? updated : request))
        : [...upcomingWithout, updated],
      past: pastWithout,
    };
  }
  const wasPast = current.past.some((request) => request.id === updated.id);
  return {
    upcoming: upcomingWithout,
    past: wasPast
      ? current.past.map((request) => (request.id === updated.id ? updated : request))
      : [updated, ...pastWithout],
  };
}
