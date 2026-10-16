'use client';

import { Button, ButtonLink, Modal } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { formatDateTimeRange, parseLocalDateTime } from '@/lib/format/datetime';
import { helpTypesText } from '@/lib/labels/help-request';
import type { HelpRequestApplication } from '../types';

/**
 * R-지원 결과 (Figma 209:3514 바로 매칭 · 209:3575 예비 N번). 같은 자리에서 모달이 바뀌므로
 * 제목("매칭됐어요!" / "예비 N번으로 등록됐어요")에 포커스가 가 결과를 읽어 준다.
 * 목업의 장소·특이사항은 응답에 없어 그리지 않는다 (일시 + 도움 유형으로 대체).
 */
export function ApplyResultModal({
  result,
  onClose,
}: {
  result: HelpRequestApplication | null;
  onClose: () => void;
}) {
  if (!result) return <Modal open={false} title="" onClose={onClose} />;

  const summary = `${formatDateTimeRange(
    parseLocalDateTime(result.startAt),
    parseLocalDateTime(result.endAt),
  )} · ${helpTypesText(result.helpTypes)}`;

  if (result.status === 'MATCHED') {
    return (
      <Modal
        open
        onClose={onClose}
        icon={<Icon name="check" />}
        title="매칭됐어요!"
        description={summary}
        dismissOnBackdrop={false}
        actions={
          <>
            <Button variant="secondary" className="min-w-0 flex-1" onClick={onClose}>
              계속 둘러보기
            </Button>
            <ButtonLink href="/matches" className="min-w-0 flex-1">
              매칭 현황 보기
            </ButtonLink>
          </>
        }
      >
        <div className="flex w-full flex-col gap-(--space-sm)">
          {/* 매칭된 장애학생 — 매칭 뒤에만 서버가 준다 (209:3520) */}
          {result.student && (
            <p className="flex min-h-(--control-height-sm) w-full flex-wrap items-center gap-(--space-xs) rounded-(--radius-md) bg-(--color-bg-muted) px-(--space-sm) py-(--space-xs)">
              <Icon name="user" size="calc(var(--font-caption) * 9 / 7)" />
              <span className="typo-body-strong text-(--color-text-primary)">
                {result.student.name}
              </span>
              <span className="typo-caption text-(--color-text-secondary)">
                카톡 {result.student.kakaoId}
              </span>
            </p>
          )}
          <p className="typo-caption text-(--color-text-secondary)">
            못 가게 되면 매칭 현황에서 취소해 주세요
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon={<Icon name="clock" />}
      title={
        result.waitingOrder !== undefined
          ? `예비 ${result.waitingOrder}번으로 등록됐어요`
          : '예비로 등록됐어요'
      }
      description="앞 순서가 취소하면 자동으로 매칭돼요"
      dismissOnBackdrop={false}
      actions={
        <>
          <ButtonLink href="/matches" variant="secondary" className="min-w-0 flex-1">
            매칭 현황 보기
          </ButtonLink>
          <Button className="min-w-0 flex-1" onClick={onClose}>
            확인
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-1.5">
        <p className="typo-body text-(--color-text-secondary)">{summary}</p>
        <p className="typo-caption text-(--color-text-secondary)">
          예비는 언제든 패널티 없이 빠질 수 있어요
        </p>
      </div>
    </Modal>
  );
}
