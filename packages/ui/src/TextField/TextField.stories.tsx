import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TextField, type SingleLineTextFieldProps } from './TextField';

const meta = {
  title: '공용 UI/TextField',
  component: TextField,
  args: { label: '아이디', placeholder: '아이디를 입력해 주세요' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<SingleLineTextFieldProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'atti' } };
export const KeyboardFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const input = canvas.getByRole('textbox', { name: '아이디' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'atti');
    await expect(input).toHaveValue('atti');
  },
};
export const Error: Story = {
  args: { error: '아이디를 확인해 주세요' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: '아이디' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('아이디를 확인해 주세요');
  },
};
export const WithDescription: Story = {
  args: { describedBy: 'id-description', error: '아이디를 확인해 주세요' },
  render: (args) => (
    <>
      <TextField {...args} />
      <p id="id-description" className="typo-caption">
        센터에서 발급받은 아이디를 입력해 주세요
      </p>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: '아이디' })).toHaveAccessibleDescription(
      '아이디를 확인해 주세요 센터에서 발급받은 아이디를 입력해 주세요',
    );
  },
};
export const Password: Story = {
  args: {
    label: '비밀번호',
    type: 'password',
    autoComplete: 'current-password',
    placeholder: '비밀번호를 입력해 주세요',
  },
};
export const LongError: Story = {
  args: {
    error: '입력한 아이디를 찾을 수 없어요. 센터에서 발급받은 아이디가 맞는지 다시 확인해 주세요.',
  },
};
export const Helper: Story = {
  args: { label: '학번', placeholder: '예: 60221234', helper: '로그인 아이디로 써요' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: '학번' })).toHaveAccessibleDescription(
      '로그인 아이디로 써요',
    );
  },
};
export const LargeText: Story = { globals: { textSize: 'large' } };
