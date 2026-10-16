import type { MyApplication, MyApplications } from './types';

// 서버의 진행 중 분류와 같다 (GET /api/applications/me inProgress)
const IN_PROGRESS: readonly MyApplication['status'][] = ['MATCHED', 'PROMOTION_PENDING', 'WAITING'];

/**
 * 취소·빠지기·승격 응답으로 받은 지원 한 건을 목록에 반영한다 (F-02 applyUpdate와 같은 규칙).
 * 진행 중이면 그 자리에서 바꾸고, 지난으로 옮겨지면 가장 최근 건이므로 지난 목록 맨 앞에 둔다.
 */
export function applyApplicationUpdate(
  current: MyApplications,
  updated: MyApplication,
): MyApplications {
  const same = (application: MyApplication) => application.applicationId === updated.applicationId;
  const inProgressWithout = current.inProgress.filter((application) => !same(application));
  const pastWithout = current.past.filter((application) => !same(application));

  if (IN_PROGRESS.includes(updated.status)) {
    const wasInProgress = current.inProgress.some(same);
    return {
      inProgress: wasInProgress
        ? current.inProgress.map((application) => (same(application) ? updated : application))
        : [...inProgressWithout, updated],
      past: pastWithout,
    };
  }
  const wasPast = current.past.some(same);
  return {
    inProgress: inProgressWithout,
    past: wasPast
      ? current.past.map((application) => (same(application) ? updated : application))
      : [updated, ...pastWithout],
  };
}
