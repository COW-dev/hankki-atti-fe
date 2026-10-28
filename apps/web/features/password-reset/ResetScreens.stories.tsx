import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { Button, ButtonLink } from '@hankki/ui';
import { BackToLogin } from './BackToLogin';
import { ResetRequestForm } from './ResetRequestForm';
import { ResetResult } from './ResetResult';
import { ResetSent } from './ResetSent';

// L-03의 요청·보냄·완료·만료 블록. 실제 화면은 PasswordResetScreen이 상태에 따라 고른다
const meta = {
  title: '비밀번호 재설정/결과 블록',
  component: ResetResult,
  args: {
    badge: 'done',
    title: '비밀번호를 바꿨어요',
    description: '새 비밀번호로 로그인해 주세요',
    caption: '다른 기기에서는 로그아웃됐어요',
    children: (
      <ButtonLink href="/login" className="w-full">
        로그인하러 가기
      </ButtonLink>
    ),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div data-size="L" className="mx-auto max-w-[480px] bg-(--color-bg-subtle) py-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResetResult>;
export default meta;
type Story = StoryObj<typeof meta>;

// 204:601
export const Request: Story = {
  render: () => <ResetRequestForm onSent={fn()} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '재설정 메일 받기' }));
    await expect(canvas.getByLabelText('아이디')).toHaveAccessibleDescription(
      '아이디를 입력해 주세요',
    );
    await expect(canvas.getByLabelText('아이디')).toHaveFocus();
  },
};

// 204:738
export const Sent: Story = {
  render: () => <ResetSent loginId="60231234" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '메일을 확인해 주세요' })).toHaveFocus();
    await expect(canvas.getByRole('link', { name: '로그인으로 돌아가기' })).toHaveAttribute(
      'href',
      '/login',
    );
  },
};

// 204:1033
export const Done: Story = {};

// 204:1167
export const Expired: Story = {
  args: {
    badge: 'warning',
    title: '링크가 만료됐어요',
    description: '링크는 30분 동안 한 번만 쓸 수 있어요',
    caption: undefined,
    children: <Button className="w-full">다시 요청하기</Button>,
    footnote: <BackToLogin />,
  },
};

export const LargeText: Story = { globals: { textSize: 'large' } };
