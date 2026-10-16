'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Block, Button, ButtonLink, ChipGroup, Notice } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import {
  APPLICATION_FILTER_OPTIONS,
  countApplications,
  filterApplications,
} from './application-filter';
import { InProgressApplicationCard } from './InProgressApplicationCard';
import { PastApplicationRow } from './PastApplicationRow';
import type { ApplicationFilter, MyApplication, MyApplications } from './types';
import type { ApplicationAction } from './useMyApplications';

// 지난 활동은 최근 3건만 보여 주고 "전체 보기"로 펼친다 (F-02 지난 신청과 같은 규칙)
const PAST_PREVIEW_COUNT = 3;

/**
 * F-07 매칭 현황 (Figma 빈 상태 208:3143 · 목록 208:3370): 필터 블록 → 진행 중 → 지난 활동.
 * 데이터와 동작을 props로 받아 Storybook에서도 그린다. 필터는 여기서 거른다.
 */
export function MatchesView({
  data,
  filter,
  onChangeFilter,
  notice,
  error,
  busyId,
  onAction,
  focusKey = 0,
}: {
  data: MyApplications;
  filter: ApplicationFilter;
  onChangeFilter: (filter: ApplicationFilter) => void;
  // 취소·빠지기·승격 완료 안내 (polite)
  notice: string | null;
  // 상태가 바뀌어 목록을 다시 받은 뒤 보여 주는 사유 (assertive)
  error: string | null;
  // 처리 중인 지원 (그 카드 버튼만 inactive)
  busyId: number | null;
  onAction: (action: ApplicationAction, application: MyApplication) => void;
  // 카드가 바뀌거나 사라진 뒤 포커스를 첫 섹션 제목으로 보낸다. 값이 바뀔 때마다
  focusKey?: number;
}) {
  const filterLabelId = useId();
  const pastListId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [pastExpanded, setPastExpanded] = useState(false);
  const visible = useMemo(() => filterApplications(data, filter), [data, filter]);
  const count = countApplications(visible);
  const isEmpty = countApplications(data) === 0;
  const visiblePast = pastExpanded ? visible.past : visible.past.slice(0, PAST_PREVIEW_COUNT);
  const canExpandPast = visible.past.length > PAST_PREVIEW_COUNT;

  useEffect(() => {
    if (focusKey > 0) headingRef.current?.focus();
  }, [focusKey]);

  if (isEmpty) {
    return (
      // F-07 빈 상태 (Figma 208:3143 · 블록 237:6294)
      <Block>
        <div className="flex w-full flex-col items-center gap-2.5 pt-6 pb-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-(--color-bg-muted)">
            <Icon name="users" />
          </div>
          <div className="h-0.5" />
          <h2 ref={headingRef} tabIndex={-1} className="typo-title w-full text-center">
            아직 지원한 건이 없어요
          </h2>
          <p className="typo-body w-full text-center text-(--color-text-secondary)">
            먼저 지원하면 바로 매칭돼요
          </p>
        </div>
        <ButtonLink href="/requests" className="w-full">
          요청 목록 보기
        </ButtonLink>
      </Block>
    );
  }

  // 첫 섹션 제목에만 포커스 대상 ref를 단다 (필터 결과 없음 → 진행 중 → 지난 활동 순)
  const firstSection: 'none' | 'inProgress' | 'past' =
    count === 0 ? 'none' : visible.inProgress.length > 0 ? 'inProgress' : 'past';

  return (
    <>
      {/* 필터 (208:3371). 목업은 한 줄 4개지만 "지난 활동"이 M 기본 글씨에서도 칩 안에서 줄바꿈돼 F-06처럼 2열로 둔다 */}
      <Block>
        <p id={filterLabelId} className="sr-only">
          필터
        </p>
        <ChipGroup
          labelledBy={filterLabelId}
          options={APPLICATION_FILTER_OPTIONS}
          value={filter}
          onChange={onChangeFilter}
          columns={2}
        />
        <p role="status" className="sr-only">
          {count}건 표시
        </p>
      </Block>

      {notice && (
        <Block>
          <Notice type="success" message={notice} />
        </Block>
      )}
      {error && (
        <Block>
          <Notice type="error" message={error} />
        </Block>
      )}

      {count === 0 && (
        // 고른 필터에 해당 건이 없을 때 (목업 없음 — 빈 상태 모양)
        <Block>
          <div className="flex w-full flex-col items-center gap-2.5 pt-6 pb-2">
            <h2 ref={headingRef} tabIndex={-1} className="typo-title w-full text-center">
              해당하는 건이 없어요
            </h2>
            <p className="typo-body w-full text-center text-(--color-text-secondary)">
              다른 필터를 골라 보세요
            </p>
          </div>
        </Block>
      )}

      {visible.inProgress.length > 0 && (
        // 진행 중 (208:3383)
        <Block>
          <div className="flex w-full items-center justify-between pb-1">
            <h2
              ref={firstSection === 'inProgress' ? headingRef : undefined}
              tabIndex={-1}
              className="typo-label text-(--color-text-primary)"
            >
              진행 중
            </h2>
            <p className="typo-caption text-(--color-text-secondary)">
              {visible.inProgress.length}건
            </p>
          </div>
          <ul className="flex w-full flex-col">
            {visible.inProgress.map((application) => (
              <InProgressApplicationCard
                key={application.applicationId}
                application={application}
                busy={busyId === application.applicationId}
                onAction={onAction}
              />
            ))}
          </ul>
        </Block>
      )}

      {visible.past.length > 0 && (
        // 지난 활동 (208:3420)
        <Block>
          <div className="flex w-full items-center justify-between pb-1">
            <h2
              ref={firstSection === 'past' ? headingRef : undefined}
              tabIndex={-1}
              className="typo-label text-(--color-text-primary)"
            >
              지난 활동
            </h2>
            {canExpandPast && (
              <Button
                variant="tertiary"
                size="small"
                aria-expanded={pastExpanded}
                aria-controls={pastListId}
                onClick={() => setPastExpanded((expanded) => !expanded)}
                className="typo-caption-strong text-(--color-text-brand)"
              >
                {pastExpanded ? '접기' : '전체 보기'}
              </Button>
            )}
          </div>
          <ul id={pastListId} className="flex w-full flex-col">
            {visiblePast.map((application) => (
              <PastApplicationRow key={application.applicationId} application={application} />
            ))}
          </ul>
          {canExpandPast && (
            <p role="status" className="sr-only">
              {pastExpanded ? `지난 활동 ${visible.past.length}건 표시` : ''}
            </p>
          )}
        </Block>
      )}
    </>
  );
}
