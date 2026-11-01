import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ReadAloudBar } from './ReadAloudBar';

const meta = {
  title: '앱/ReadAloudBar',
  component: ReadAloudBar,
  // 읽을 대상(h1·main)이 있는 화면처럼 그린다
  render: () => (
    <div>
      <ReadAloudBar />
      <h1 className="typo-title px-5 pt-4">내 신청</h1>
      <main className="px-5 py-2">
        <p className="typo-body">아직 신청한 건이 없어요</p>
      </main>
    </div>
  ),
} satisfies Meta<typeof ReadAloudBar>;
export default meta;
type Story = StoryObj<typeof meta>;

// 접근성 모드(큰 글씨) — Figma 14:901
export const ModeOn: Story = {
  globals: { textSize: 'large' },
  play: async ({ canvas }) => {
    const region = canvas.getByRole('region', { name: '화면 읽어 주기' });
    await expect(region).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '화면 읽어 주기' })).toBeInTheDocument();
    // 읽기 전에는 정지를 누를 수 없다 (포커스는 받는다)
    await expect(canvas.getByRole('button', { name: '정지' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

// 접근성 모드가 아니면 바가 없다
export const ModeOff: Story = {
  globals: { textSize: 'default' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('region', { name: '화면 읽어 주기' })).toBeNull();
  },
};
