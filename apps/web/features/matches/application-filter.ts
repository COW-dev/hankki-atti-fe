import type { ChipOption } from '@hankki/ui';
import type { ApplicationFilter, MyApplication, MyApplications } from './types';

// F-07 필터 칩 (Figma 208:3371) — API filter 값과 같지만 목록은 ALL로 한 번 받고 화면에서 거른다 (plan 확인 필요 1)
export const DEFAULT_APPLICATION_FILTER: ApplicationFilter = 'ALL';

export const APPLICATION_FILTER_OPTIONS: ChipOption<ApplicationFilter>[] = [
  { value: 'ALL', label: '전체' },
  { value: 'MATCHED', label: '매칭' },
  { value: 'WAITING', label: '예비' },
  { value: 'PAST', label: '지난 활동' },
];

// "예비" 필터는 API WAITING 필터와 같이 예비 + 승격 응답 대기
const IN_PROGRESS_BY_FILTER: Record<
  Exclude<ApplicationFilter, 'ALL' | 'PAST'>,
  readonly MyApplication['status'][]
> = {
  MATCHED: ['MATCHED'],
  WAITING: ['WAITING', 'PROMOTION_PENDING'],
};

/**
 * 고른 필터에 맞는 진행 중·지난 목록만 남긴다. 서버가 준 순서(진행 중 = 식사 가까운 순, 지난 = 최근 순)는 그대로 둔다.
 */
export function filterApplications(
  data: MyApplications,
  filter: ApplicationFilter,
): MyApplications {
  if (filter === 'ALL') return data;
  if (filter === 'PAST') return { inProgress: [], past: data.past };
  const statuses = IN_PROGRESS_BY_FILTER[filter];
  return {
    inProgress: data.inProgress.filter((application) => statuses.includes(application.status)),
    past: [],
  };
}

export function countApplications(data: MyApplications): number {
  return data.inProgress.length + data.past.length;
}
