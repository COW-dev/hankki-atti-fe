import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { MatchesView } from './MatchesView';
import type { ApplicationFilter, MyApplication } from './types';

function application(
  partial: Partial<MyApplication> & Pick<MyApplication, 'applicationId' | 'status'>,
) {
  return {
    helpRequestId: partial.applicationId * 10,
    startAt: '2026-10-07T12:00:00',
    endAt: '2026-10-07T13:00:00',
    helpTypes: ['SERVING', 'SEATING'],
    ...partial,
  } satisfies MyApplication;
}

// 목업 208:3305의 두 카드(매칭 완료 · 예비 2번) + 승격 응답 대기 한 건, 지난 활동 다섯 건
const DATA = {
  inProgress: [
    application({
      applicationId: 1,
      status: 'MATCHED',
      student: { name: '박서연', kakaoId: 'seoyeon_p' },
    }),
    application({
      applicationId: 2,
      status: 'PROMOTION_PENDING',
      startAt: '2026-10-07T17:00:00',
      endAt: '2026-10-07T18:00:00',
      helpTypes: ['MOVING'],
      promotionDeadline: '2026-10-07T16:45:00',
    }),
    application({
      applicationId: 3,
      status: 'WAITING',
      startAt: '2026-10-08T18:00:00',
      endAt: '2026-10-08T19:00:00',
      helpTypes: ['MOVING'],
      waitingOrder: 2,
    }),
  ],
  past: [
    application({ applicationId: 4, status: 'EXCLUDED' }),
    application({
      applicationId: 5,
      status: 'STUDENT_CANCELED',
      startAt: '2026-10-06T12:30:00',
      endAt: '2026-10-06T13:30:00',
    }),
    application({
      applicationId: 6,
      status: 'EXPIRED',
      startAt: '2026-10-05T12:00:00',
      endAt: '2026-10-05T13:00:00',
    }),
    application({
      applicationId: 7,
      status: 'COMPLETED',
      startAt: '2026-10-02T12:30:00',
      endAt: '2026-10-02T13:30:00',
      volunteerHours: 1,
    }),
    application({
      applicationId: 8,
      status: 'HELPER_CANCELED',
      startAt: '2026-10-01T17:00:00',
      endAt: '2026-10-01T18:00:00',
      cancelReason: 'ILLNESS',
    }),
  ],
};

const meta = {
  title: '화면/F-07 매칭 현황',
  component: MatchesView,
  args: {
    data: DATA,
    filter: 'ALL',
    onChangeFilter: fn(),
    notice: null,
    error: null,
    busyId: null,
    onAction: fn(),
  },
  // 필터를 실제로 바꿔 볼 수 있게 선택값은 스토리에서 관리한다
  render: function Example(args) {
    const [filter, setFilter] = useState<ApplicationFilter>(args.filter);
    return (
      <MatchesView
        {...args}
        filter={filter}
        onChangeFilter={(next) => {
          setFilter(next);
          args.onChangeFilter(next);
        }}
      />
    );
  },
  decorators: [
    (Story) => (
      <div data-size="M" className="flex w-[390px] flex-col gap-2.5 bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MatchesView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('radiogroup', { name: '필터' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: '진행 중' })).toBeInTheDocument();
    await expect(canvas.getByText('예비 2번')).toBeInTheDocument();
    // 매칭 완료 카드에만 장애학생 정보가 있다
    await expect(canvas.getByText('카톡 seoyeon_p')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: '10월 7일 (수) 12:00 매칭 취소하기' }),
    );
    await expect(args.onAction).toHaveBeenCalledWith('cancel', DATA.inProgress[0]);
    await expect(
      canvas.getByRole('button', { name: '10월 8일 (목) 18:00 예비 빠지기' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '10월 7일 (수) 17:00 승격 응답하기' }),
    ).toBeInTheDocument();
    // 지난 활동은 3건만 보이고 전체 보기로 펼친다
    await expect(canvas.getByText('같은 시간 다른 건에 매칭됨')).toBeInTheDocument();
    await expect(canvas.queryByText('봉사시간 1시간')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '전체 보기', expanded: false }));
    await expect(canvas.getByText('봉사시간 1시간')).toBeInTheDocument();
    await expect(canvas.getByText('질병·부상')).toBeInTheDocument();
    // 예비 필터는 예비 + 승격 응답 대기
    await userEvent.click(canvas.getByRole('radio', { name: '예비' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByText('2건 표시')).toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { data: { inProgress: [], past: [] } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '아직 지원한 건이 없어요' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: '요청 목록 보기' })).toHaveAttribute(
      'href',
      '/requests',
    );
  },
};
export const FilterEmpty: Story = {
  args: { data: { inProgress: [DATA.inProgress[0]], past: [] }, filter: 'WAITING' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '해당하는 건이 없어요' })).toBeVisible();
  },
};
export const WithNotice: Story = {
  args: { notice: '매칭을 취소했어요', error: '이미 상태가 바뀐 건이에요. 목록을 다시 불러올게요' },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
