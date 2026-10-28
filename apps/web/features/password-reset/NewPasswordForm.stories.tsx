import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { NewPasswordForm } from './NewPasswordForm';

const meta = {
  title: '비밀번호 재설정/NewPasswordForm',
  component: NewPasswordForm,
  args: { submitting: false, notice: null, onSubmit: fn() },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div data-size="L" className="mx-auto max-w-[480px] bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewPasswordForm>;
export default meta;
type Story = StoryObj<typeof meta>;

// 목업 204:875: 특수문자만 남은 상태
export const RuleMissing: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.type(canvas.getByLabelText('새 비밀번호'), 'hankki2026');
    await expect(canvas.getByText('특수문자 포함 — 아직 없어요')).toBeVisible();
    const submit = canvas.getByRole('button', { name: '비밀번호 바꾸기' });
    // 특수문자 + 확인 칸 = 조건 2개
    await expect(submit).toHaveAccessibleDescription('조건 2개 남음');
    await userEvent.click(submit);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Ready: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.type(canvas.getByLabelText('새 비밀번호'), 'hankki!2026');
    await userEvent.type(canvas.getByLabelText('새 비밀번호 확인'), 'hankki!2026');
    await userEvent.click(canvas.getByRole('button', { name: '비밀번호 바꾸기' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('hankki!2026');
  },
};

export const SameAsCurrent: Story = {
  args: { passwordError: '지금 쓰는 비밀번호와 다르게 만들어 주세요' },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('새 비밀번호')).toHaveFocus();
  },
};

export const LargeText: Story = { globals: { textSize: 'large' } };
