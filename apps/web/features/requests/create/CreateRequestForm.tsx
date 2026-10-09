'use client';

import { useId, type FormEvent } from 'react';
import {
  Button,
  ChipGroup,
  ErrorNotice,
  OptionGroup,
  OptionTile,
  TextField,
  type ChipOption,
} from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { dateChipLabel, formatTime, parseLocalDateTime } from '@/lib/format/datetime';
import { HELP_TYPE_LABEL, type HelpType } from '@/lib/labels/help-request';
import type { MyHelpRequest, TimeOption, TimeOptionDate } from '../types';
import {
  blockedStartTimes,
  canSubmit,
  MEMO_MAX_LENGTH,
  MORE_DATES,
  needsOtherHelpText,
  OTHER_HELP_TEXT_MAX_LENGTH,
  summaryText,
  timeOptionsOf,
  visibleDateChoices,
  type CreateFormState,
} from './form-state';

const HELP_TYPES: HelpType[] = ['SERVING', 'SEATING', 'MOVING', 'OTHER'];

type Props = {
  dates: TimeOptionDate[];
  // 내 진행 중 신청 — 겹치는 시각 칩을 비활성으로 보여 준다 (서버 409를 미리 막음)
  upcoming: MyHelpRequest[];
  state: CreateFormState;
  now: Date;
  submitting: boolean;
  error: string | null;
  otherHelpTextError: string | null;
  onSelectDate: (value: string) => void;
  onSelectTime: (startAt: string) => void;
  onToggleHelpType: (type: HelpType) => void;
  onChangeOtherHelpText: (value: string) => void;
  onChangeMemo: (value: string) => void;
  onSubmit: () => void;
};

/**
 * F-01 도우미 신청 · 입력 (Figma 206:1435). 날짜 → 시작 시각 → 요약 → 필요한 도움 → 메모 → 신청하기.
 * 상태와 동작은 props로 받아 Storybook에서도 그린다.
 */
export function CreateRequestForm({
  dates,
  upcoming,
  state,
  now,
  submitting,
  error,
  otherHelpTextError,
  onSelectDate,
  onSelectTime,
  onToggleHelpType,
  onChangeOtherHelpText,
  onChangeMemo,
  onSubmit,
}: Props) {
  const id = useId();
  const dateLabelId = `${id}-date`;
  const timeLabelId = `${id}-time`;
  const hintId = `${id}-hint`;
  const noteId = `${id}-note`;

  const dateOptions: ChipOption<string>[] = visibleDateChoices(dates, state.datesExpanded).map(
    (choice) =>
      'date' in choice
        ? { value: choice.value, label: dateChipLabel(choice.date, now) }
        : { value: MORE_DATES, label: '다른 날짜' },
  );
  const { lunch, dinner } = timeOptionsOf(dates, state.date);
  const blocked = blockedStartTimes(dates, upcoming);
  const dayOptions = [...lunch, ...dinner];
  const blockedCount = dayOptions.filter((option) => blocked.has(option.startAt)).length;
  const selected = dayOptions.find((option) => option.startAt === state.startAt) ?? null;
  const summary = summaryText(selected);
  const ready = canSubmit(state);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (ready && !submitting) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="contents">
      <section className="flex w-full flex-col gap-(--space-lg) bg-(--color-bg-default) p-(--space-lg)">
        {error && <ErrorNotice message={error} />}

        {/* 날짜 (206:1502) */}
        <div className="flex w-full flex-col gap-(--space-sm)">
          <p id={dateLabelId} className="typo-label text-(--color-text-primary)">
            날짜
          </p>
          <ChipGroup
            labelledBy={dateLabelId}
            options={dateOptions}
            value={state.date}
            onChange={onSelectDate}
            columns={2}
          />
        </div>

        <hr className="w-full border-t border-(--color-border-default)" />

        {/* 시작 시각 (206:1516) */}
        <div className="flex w-full flex-col gap-(--space-sm)">
          <p id={timeLabelId} className="typo-label text-(--color-text-primary)">
            시작 시각
          </p>
          {lunch.length > 0 && (
            <TimeChips
              meal="점심"
              options={lunch}
              blocked={blocked}
              value={state.startAt}
              onChange={onSelectTime}
            />
          )}
          {dinner.length > 0 && (
            <TimeChips
              meal="저녁"
              options={dinner}
              blocked={blocked}
              value={state.startAt}
              onChange={onSelectTime}
            />
          )}
          {blockedCount > 0 && (
            <p className="typo-caption text-(--color-text-secondary)">
              {blockedCount === dayOptions.length
                ? '이날은 이미 신청한 시간과 모두 겹쳐서 고를 수 없어요'
                : '이미 신청한 시간과 겹치는 시각은 고를 수 없어요'}
            </p>
          )}
          {/* 선택 요약 (206:1538): 고를 때마다 조용히 읽어 준다 */}
          <p
            role="status"
            className={`typo-caption-strong flex w-full items-center gap-1.5 rounded-(--radius-sm) bg-(--color-bg-muted) px-3.5 py-2.5 text-(--color-text-primary) ${summary ? '' : 'hidden'}`}
          >
            <Icon name="tag-progress" size="calc(var(--font-caption) * 8 / 7)" />
            {summary}
          </p>
        </div>

        <hr className="w-full border-t border-(--color-border-default)" />

        {/* 필요한 도움 (206:1543) */}
        <OptionGroup legend="필요한 도움" legendClassName="typo-label" columns={1}>
          {HELP_TYPES.map((type) => (
            <OptionTile
              key={type}
              type="checkbox"
              name="helpTypes"
              value={type}
              checked={state.helpTypes.includes(type)}
              onChange={() => onToggleHelpType(type)}
            >
              {HELP_TYPE_LABEL[type]}
            </OptionTile>
          ))}
        </OptionGroup>
        {needsOtherHelpText(state) && (
          <TextField
            label="기타 내용"
            placeholder="필요한 도움을 적어 주세요"
            count={OTHER_HELP_TEXT_MAX_LENGTH}
            value={state.otherHelpText}
            error={otherHelpTextError ?? undefined}
            onChange={(event) => onChangeOtherHelpText(event.target.value)}
          />
        )}

        <hr className="w-full border-t border-(--color-border-default)" />

        {/* 메모 (206:1561) */}
        <TextField
          multiline
          rows={2}
          label="메모 (선택)"
          placeholder="도우미에게 알려 줄 내용"
          count={MEMO_MAX_LENGTH}
          value={state.memo}
          onChange={(event) => onChangeMemo(event.target.value)}
        />
      </section>

      {/* 신청하기 (236:6230) */}
      <section className="flex w-full flex-col gap-(--space-sm) bg-(--color-bg-default) p-(--space-lg)">
        <Button
          type="submit"
          inactive={!ready || submitting}
          aria-describedby={ready ? noteId : `${hintId} ${noteId}`}
          className="w-full"
        >
          신청하기
        </Button>
        {!ready && (
          <p id={hintId} className="sr-only">
            날짜, 시작 시각, 필요한 도움을 고르면 신청할 수 있어요
          </p>
        )}
        <p id={noteId} className="typo-caption w-full text-center text-(--color-text-secondary)">
          시작 시각까지 지원자가 없으면 알려드려요
        </p>
      </section>
    </form>
  );
}

// 점심·저녁 칩 묶음 (206:1518 · 206:1531). 보이는 캡션은 "점심", 그룹 이름은 "점심 시작 시각"
function TimeChips({
  meal,
  options,
  blocked,
  value,
  onChange,
}: {
  meal: '점심' | '저녁';
  options: TimeOption[];
  blocked: Set<string>;
  value: string | null;
  onChange: (startAt: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <p className="typo-caption text-(--color-text-secondary)">{meal}</p>
      <ChipGroup
        label={`${meal} 시작 시각`}
        options={options.map((option) => ({
          value: option.startAt,
          label: formatTime(parseLocalDateTime(option.startAt)),
          disabled: blocked.has(option.startAt),
          disabledReason: '이미 신청한 시간과 겹쳐요',
        }))}
        value={value}
        onChange={onChange}
        columns={4}
      />
    </div>
  );
}
