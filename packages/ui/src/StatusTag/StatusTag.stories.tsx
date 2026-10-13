import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusTag } from './StatusTag';

const meta = {
  title: '공용 UI/StatusTag',
  component: StatusTag,
  args: { type: 'success', children: '매칭 완료' },
} satisfies Meta<typeof StatusTag>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Progress: Story = { args: { type: 'progress', children: '모집 중' } };
export const Ended: Story = { args: { type: 'ended', children: '이용 완료' } };
export const Warning: Story = { args: { type: 'warning', children: '매칭 실패' } };
export const Error: Story = { args: { type: 'error', children: '발송 실패' } };
export const Info: Story = { args: { type: 'info', children: '고정' } };
export const Neutral: Story = { args: { type: 'neutral', children: '소속' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
