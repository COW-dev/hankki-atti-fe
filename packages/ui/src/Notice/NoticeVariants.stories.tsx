import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Notice } from './Notice';
const meta = {
  title: '공용 UI/Notice',
  component: Notice,
  args: { type: 'info', message: '신청 완료! 도우미를 찾고 있어요' },
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Info: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent(args.message ?? '');
  },
};
export const Success: Story = { args: { type: 'success' } };
export const Warning: Story = { args: { type: 'warning', message: '신청 시간을 확인해 주세요' } };
export const Error: Story = { args: { type: 'error', message: '요청을 처리하지 못했어요' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
