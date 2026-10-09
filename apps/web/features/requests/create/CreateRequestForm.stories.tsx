import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
import type { HelpType } from '@/lib/labels/help-request';
import type { MyHelpRequest, TimeOptionDate } from '../types';
import { CreateRequestForm } from './CreateRequestForm';
import {
  initialForm,
  withDateChoice,
  withHelpTypeToggled,
  type CreateFormState,
} from './form-state';

function day(date: string, times: Array<[string, 'LUNCH' | 'DINNER']>): TimeOptionDate {
  return {
    date,
    startTimes: times.map(([time, meal]) => ({
      startAt: `${date}T${time}:00`,
      endAt: `${date}T${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}${time.slice(2)}:00`,
      meal,
    })),
  };
}
const LUNCH: Array<[string, 'LUNCH' | 'DINNER']> = [
  ['11:30', 'LUNCH'],
  ['12:00', 'LUNCH'],
  ['12:30', 'LUNCH'],
  ['13:00', 'LUNCH'],
];
const DINNER: Array<[string, 'LUNCH' | 'DINNER']> = [
  ['17:00', 'DINNER'],
  ['17:30', 'DINNER'],
];
const DATES = [
  day('2026-10-09', DINNER),
  day('2026-10-12', [...LUNCH, ...DINNER]),
  day('2026-10-13', [...LUNCH, ...DINNER]),
  day('2026-10-14', [...LUNCH, ...DINNER]),
  day('2026-10-15', [...LUNCH, ...DINNER]),
  day('2026-10-16', [...LUNCH, ...DINNER]),
];
const NOW = new Date(2026, 9, 9, 9, 0);

function Harness({
  initial,
  upcoming = [],
  error = null,
  otherHelpTextError = null,
  submitting = false,
  onSubmit = () => undefined,
}: {
  initial?: Partial<CreateFormState>;
  upcoming?: MyHelpRequest[];
  error?: string | null;
  otherHelpTextError?: string | null;
  submitting?: boolean;
  onSubmit?: () => void;
}) {
  const [state, setState] = useState<CreateFormState>({ ...initialForm(DATES), ...initial });
  return (
    <CreateRequestForm
      dates={DATES}
      upcoming={upcoming}
      state={state}
      now={NOW}
      submitting={submitting}
      error={error}
      otherHelpTextError={otherHelpTextError}
      onSelectDate={(value) => setState((current) => withDateChoice(current, value))}
      onSelectTime={(startAt) => setState((current) => ({ ...current, startAt }))}
      onToggleHelpType={(type: HelpType) =>
        setState((current) => withHelpTypeToggled(current, type))
      }
      onChangeOtherHelpText={(otherHelpText) =>
        setState((current) => ({ ...current, otherHelpText }))
      }
      onChangeMemo={(memo) => setState((current) => ({ ...current, memo }))}
      onSubmit={onSubmit}
    />
  );
}

const meta = {
  title: '화면/F-01 도우미 신청',
  component: Harness,
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div data-size="L" className="flex w-[390px] flex-col gap-2.5 bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {
  play: async ({ canvas }) => {
    // 첫 날짜(오늘)가 골라져 있고 오늘은 저녁만 남았다
    await expect(canvas.getByRole('radio', { name: '오늘 10/9' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(canvas.queryByRole('radiogroup', { name: '점심 시작 시각' })).toBeNull();
    await expect(canvas.getByRole('radiogroup', { name: '저녁 시작 시각' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '신청하기' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};
export const PickEverything: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '10/12 (월)' }));
    await userEvent.click(canvas.getByRole('radio', { name: '12:00' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('10월 12일 12:00 ~ 13:00 · 1시간');
    await userEvent.click(canvas.getByRole('checkbox', { name: '배식 보조' }));
    const submit = canvas.getByRole('button', { name: '신청하기' });
    await expect(submit).not.toHaveAttribute('aria-disabled');
    await userEvent.click(submit);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
// 10/12 12:00 신청이 있으면 11:30·12:00·12:30은 고를 수 없다
export const BlockedTimes: Story = {
  args: {
    initial: { date: '2026-10-12' },
    upcoming: [
      {
        id: 1,
        startAt: '2026-10-12T12:00:00',
        endAt: '2026-10-12T13:00:00',
        status: 'MATCHED',
        helpTypes: ['SERVING'],
        otherHelpText: null,
        memo: null,
        helper: { name: '이도움', kakaoId: 'dowoom_lee' },
        helperChanged: false,
        noShowReportable: false,
        noShowDeadline: null,
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const blocked = canvas.getByRole('radio', { name: /12:00.*겹쳐요/ });
    await expect(blocked).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('radio', { name: '13:00' })).not.toHaveAttribute('aria-disabled');
    await expect(
      canvas.getByText('이미 신청한 시간과 겹치는 시각은 고를 수 없어요'),
    ).toBeInTheDocument();
    await userEvent.click(blocked);
    await expect(blocked).toHaveAttribute('aria-checked', 'false');
  },
};
export const MoreDates: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('radio', { name: /10\// })).toHaveLength(3);
    await userEvent.click(canvas.getByRole('radio', { name: '다른 날짜' }));
    await expect(canvas.queryByRole('radio', { name: '다른 날짜' })).toBeNull();
    await expect(canvas.getAllByRole('radio', { name: /10\// })).toHaveLength(6);
  },
};
export const OtherHelpType: Story = {
  args: { initial: { date: '2026-10-12', startAt: '2026-10-12T12:00:00', helpTypes: ['OTHER'] } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: '기타 내용' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '신청하기' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};
export const WithError: Story = {
  args: {
    initial: { date: '2026-10-12', startAt: '2026-10-12T12:00:00', helpTypes: ['SERVING'] },
    error: '이미 신청한 시간과 겹쳐요. 다른 시각을 골라 주세요',
  },
};
export const LargeText: Story = {
  args: { initial: { date: '2026-10-12', startAt: '2026-10-12T12:00:00', helpTypes: ['SERVING'] } },
  globals: { textSize: 'large' },
};
