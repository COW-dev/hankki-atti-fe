import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Icon } from '@hankki/icons';
import { Button } from '../Button';
import { Modal } from './Modal';
const meta = {
  title: '공용 UI/Modal',
  tags: ['!autodocs'],
  component: Modal,
  args: {
    open: false,
    title: '이 요청에 지원할까요?',
    children:
      '지원하면 바로 매칭될 수 있어요. 매칭 뒤 취소하거나 나오지 않으면 패널티가 있을 수 있어요.',
    confirmLabel: '지원하기',
    onClose: () => {},
    onConfirm: () => {},
  },
  render: function Example(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <>
        <Button onClick={() => setOpen(true)}>지원 확인 열기</Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: '지원 확인 열기' });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole('dialog', { name: '이 요청에 지원할까요?' });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(
      within(dialog).getByRole('heading', { name: '이 요청에 지원할까요?' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', { name: '닫기' })).toHaveFocus();
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', { name: '지원하기' })).toHaveFocus();
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toHaveFocus();
  },
};
export const Open: Story = { args: { open: true } };
export const Destructive: Story = {
  args: {
    open: true,
    destructive: true,
    title: '신청을 취소할까요?',
    confirmLabel: '취소하기',
    children: '취소하면 다시 신청해야 해요.',
  },
};
// 결과 모달 (목업 209:3514): 제목 위 아이콘 원. 의미는 제목이 전달하고 아이콘은 장식이다
export const WithIcon: Story = {
  args: {
    open: true,
    icon: <Icon name="check" />,
    title: '매칭됐어요!',
    description: '10월 7일 (화) 12:00 ~ 13:00 · 배식 보조',
    children: '못 가게 되면 매칭 현황에서 취소해 주세요',
    confirmLabel: '확인',
  },
  play: async ({ canvas }) => {
    const dialog = canvas.getByRole('dialog', { name: '매칭됐어요!' });
    await expect(within(dialog).getByRole('heading', { name: '매칭됐어요!' })).toHaveFocus();
    await expect(within(dialog).queryByRole('img')).not.toBeInTheDocument();
  },
};
export const LargeText: Story = { args: { open: true }, globals: { textSize: 'large' } };
