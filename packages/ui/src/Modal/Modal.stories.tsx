import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { Button } from '../Button';
import { Notice } from '../Notice';
import { Modal } from './Modal';

type Variant = 'apply' | 'noShow';

function Demo({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {variant === 'apply' ? '지원하기' : '도우미가 오지 않았나요?'}
      </Button>
      {variant === 'apply' ? (
        <Modal
          open={open}
          onClose={close}
          title="이 요청에 지원할까요?"
          description="10월 7일 (화) 12:00 · 배식 보조"
          actions={
            <>
              <Button variant="secondary" onClick={close}>
                닫기
              </Button>
              <Button onClick={close}>지원하기</Button>
            </>
          }
        >
          <Notice tone="warning">매칭 뒤 취소하거나 나오지 않으면 패널티가 있을 수 있어요</Notice>
        </Modal>
      ) : (
        <Modal
          open={open}
          onClose={close}
          title="도우미가 오지 않았나요?"
          description="10월 2일 (목) 12:30 · 도우미 김도움"
          dismissOnBackdrop={false}
          actions={
            <>
              <Button variant="secondary" onClick={close}>
                돌아가기
              </Button>
              <Button variant="danger" onClick={close}>
                신고하기
              </Button>
            </>
          }
        >
          <p className="typo-caption text-(--color-text-secondary)">
            이용 후 24시간까지 신고할 수 있어요
          </p>
          <Notice tone="warning">신고하면 노쇼로 기록되고 도우미 봉사시간에서 빠져요</Notice>
        </Modal>
      )}
    </>
  );
}

const meta = {
  title: '공용 UI/Modal',
  component: Demo,
  args: { variant: 'apply' },
  argTypes: { variant: { control: 'select', options: ['apply', 'noShow'] } },
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ApplyConfirm: Story = {};
export const NoShowReport: Story = { args: { variant: 'noShow' } };
export const KeyboardFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    const opener = canvas.getByRole('button', { name: '지원하기' });
    await userEvent.click(opener);
    // 모달은 top layer라 canvas 밖에서 찾는다
    const dialog = document.querySelector('dialog[open]');
    await expect(dialog).not.toBeNull();
    const title = dialog!.querySelector('h2');
    await expect(title).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(document.querySelector('dialog[open]')).toBeNull();
    await expect(opener).toHaveFocus();
  },
};
export const LargeText: Story = { args: { variant: 'noShow' }, globals: { textSize: 'large' } };
