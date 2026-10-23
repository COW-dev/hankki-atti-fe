import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { Button } from '../Button';
import { Toast } from './Toast';

const meta = {
  title: '공용 UI/Toast',
  component: Toast,
  args: { message: '신청을 철회했어요', onClose: () => {} },
  decorators: [
    // Toast는 fixed라 문서 페이지에서 칸 밖으로 빠져나간다. transform으로 휴대폰 틀(390, real_page 프레임 폭) 안에 가둔다.
    (Story) => (
      <div className="relative h-80 w-full max-w-[390px] bg-(--color-bg-subtle) [transform:translateZ(0)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('신청을 철회했어요');
  },
};
export const WithoutTabBar: Story = { args: { message: '메일을 다시 보냈어요' } };
export const WithTabBar: Story = { args: { message: '연락 정보를 저장했어요', withTabBar: true } };
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };

/** 버튼을 누르면 뜨고 2초 뒤 닫힌다. */
export const AutoClose: Story = {
  render: function Render() {
    const [message, setMessage] = useState<string | null>(null);
    return (
      <>
        <Button onClick={() => setMessage('준비 중인 문서예요')}>개인정보처리방침</Button>
        <Toast message={message} onClose={() => setMessage(null)} />
      </>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '개인정보처리방침' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('준비 중인 문서예요');
  },
};
