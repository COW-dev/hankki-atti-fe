import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusTag } from './StatusTag';

const meta = {
  title: '공용 UI/StatusTag',
  component: StatusTag,
  args: { tone: 'success', children: '매칭 완료' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['success', 'progress', 'ended', 'warning', 'error', 'info', 'neutral'],
    },
  },
} satisfies Meta<typeof StatusTag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Progress: Story = { args: { tone: 'progress', children: '모집 중' } };
export const Ended: Story = { args: { tone: 'ended', children: '이용 완료' } };
export const Warning: Story = { args: { tone: 'warning', children: '매칭 실패' } };
export const Error: Story = { args: { tone: 'error', children: '노쇼' } };
export const Info: Story = { args: { tone: 'info', children: '고정' } };
export const Neutral: Story = { args: { tone: 'neutral', children: '도우미 바뀜' } };
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-xs)">
      <StatusTag tone="success">매칭 완료</StatusTag>
      <StatusTag tone="progress">모집 중</StatusTag>
      <StatusTag tone="ended">이용 완료</StatusTag>
      <StatusTag tone="warning">매칭 실패</StatusTag>
      <StatusTag tone="error">노쇼</StatusTag>
      <StatusTag tone="info">고정</StatusTag>
      <StatusTag tone="neutral">도우미 바뀜</StatusTag>
    </div>
  ),
};
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
