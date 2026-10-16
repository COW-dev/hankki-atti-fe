import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { CancelRequestModal } from './CancelRequestModal';
import type { MyHelpRequest } from './types';

const MATCHED: MyHelpRequest = {
  id: 2,
  startAt: '2026-10-07T12:00:00',
  endAt: '2026-10-07T13:00:00',
  status: 'MATCHED',
  helpTypes: ['SERVING', 'SEATING'],
  otherHelpText: null,
  memo: null,
  helper: { name: '이도움', kakaoId: 'dowoom_lee' },
  helperChanged: false,
  noShowReportable: false,
  noShowDeadline: null,
};

// M-취소 확인 (장애학생) 207:1856
const meta = {
  title: '화면/F-02 내 신청/취소 확인 모달',
  component: CancelRequestModal,
  args: {
    request: MATCHED,
    submitting: false,
    error: null,
    onClose: fn(),
    onSubmit: fn(),
  },
  decorators: [
    (Story) => (
      <div data-size="L">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CancelRequestModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ userEvent, args }) => {
    // dialog는 top layer라 document에서 찾는다
    const dialog = within(document.body).getByRole('dialog', { name: '매칭을 취소할까요?' });
    await expect(dialog).toHaveAccessibleDescription('10월 7일 (수) 12:00 · 도우미 이도움');
    await expect(within(dialog).getByText('취소하면 도우미에게 바로 알려요')).toBeInTheDocument();
    // 파괴적 동작이라 열릴 때 제목에 포커스
    await expect(within(dialog).getByRole('heading', { name: '매칭을 취소할까요?' })).toHaveFocus();
    await userEvent.click(within(dialog).getByRole('button', { name: '취소하기' }));
    await expect(args.onSubmit).toHaveBeenCalledWith(MATCHED);
    await userEvent.click(within(dialog).getByRole('button', { name: '돌아가기' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const Submitting: Story = {
  args: { submitting: true },
  play: async () => {
    const dialog = within(document.body).getByRole('dialog', { name: '매칭을 취소할까요?' });
    await expect(within(dialog).getByRole('button', { name: '취소하기' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};
export const WithError: Story = { args: { error: '잠시 후 다시 시도해 주세요' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
