import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { CancelMatchModal } from './CancelMatchModal';
import type { MyApplication } from './types';

const MATCHED: MyApplication = {
  applicationId: 1,
  helpRequestId: 10,
  status: 'MATCHED',
  startAt: '2026-10-07T12:00:00',
  endAt: '2026-10-07T13:00:00',
  helpTypes: ['SERVING', 'SEATING'],
  student: { name: '박서연', kakaoId: 'seoyeon_p' },
};

// M-취소 사유 선택 (도우미) 209:3662
const meta = {
  title: '화면/F-07 매칭 현황/취소 사유 모달',
  component: CancelMatchModal,
  args: {
    application: MATCHED,
    submitting: false,
    error: null,
    onClose: fn(),
    onSubmit: fn(),
  },
  decorators: [
    (Story) => (
      <div data-size="M">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CancelMatchModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ userEvent, args }) => {
    // dialog는 top layer라 document에서 찾는다
    const dialog = within(document.body).getByRole('dialog', { name: '매칭을 취소할까요?' });
    await expect(dialog).toHaveAccessibleDescription('10월 7일 (수) 12:00 · 장애학생 박서연');
    const submit = within(dialog).getByRole('button', { name: '취소하기' });
    // 사유를 고르기 전에는 못 누르고 이유를 읽어 준다
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    await expect(submit).toHaveAccessibleDescription('취소 사유를 골라 주세요');
    await userEvent.click(within(dialog).getByRole('radio', { name: '기타 (직접 입력)' }));
    await expect(submit).toHaveAccessibleDescription('기타 사유를 적어 주세요');
    await userEvent.type(within(dialog).getByRole('textbox', { name: '기타 사유' }), '시험');
    await expect(submit).not.toHaveAttribute('aria-disabled');
    await userEvent.click(submit);
    await expect(args.onSubmit).toHaveBeenCalledWith({ reason: 'OTHER', reasonDetail: '시험' });
  },
};
export const WithError: Story = { args: { error: '기타 사유를 적어 주세요' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
