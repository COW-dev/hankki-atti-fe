import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Notice } from './Notice';

const meta = {
  title: '공용 UI/Notice',
  component: Notice,
  args: { tone: 'info', children: '10월 7일 12:00 ~ 13:00 · 1시간' },
  argTypes: { tone: { control: 'select', options: ['info', 'success', 'error', 'warning'] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = {
  args: { tone: 'success', live: true, children: '신청 완료! 도우미를 찾고 있어요' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('신청 완료! 도우미를 찾고 있어요');
  },
};
export const Error: Story = {
  args: { tone: 'error', children: '아이디 또는 비밀번호를 확인해 주세요' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      '아이디 또는 비밀번호를 확인해 주세요',
    );
  },
};
export const Warning: Story = {
  args: { tone: 'warning', children: '신고하면 노쇼로 기록되고 도우미 봉사시간에서 빠져요' },
};
export const LongMessage: Story = {
  args: {
    tone: 'error',
    children:
      '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요. 계속 문제가 발생하면 장애학생지원센터에 문의해 주세요.',
  },
};
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
