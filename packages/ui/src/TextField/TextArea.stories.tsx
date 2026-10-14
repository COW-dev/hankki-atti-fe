import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TextField, type MultilineTextFieldProps } from './TextField';

// F-01 메모처럼 여러 줄 입력 (TextField multiline)
const meta = {
  title: '공용 UI/TextField (multiline)',
  component: TextField,
  args: { multiline: true, label: '메모 (선택)', placeholder: '도우미에게 알려 줄 내용' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<MultilineTextFieldProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCount: Story = {
  args: { count: 200, defaultValue: '출입구에서 기다릴게요' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: '메모 (선택)' })).toHaveAccessibleDescription(
      '11 / 200자',
    );
  },
};
export const CountExceeded: Story = {
  args: { count: 20, defaultValue: '출입구에서 기다릴게요. 휠체어라 넓은 자리가 필요해요' },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: '메모 (선택)' });
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    await expect(textarea).toHaveAccessibleDescription('20자까지 쓸 수 있어요 29 / 20자');
  },
};
export const Typing: Story = {
  args: { count: 200 },
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: '메모 (선택)' });
    await userEvent.type(textarea, '식판 반납');
    await expect(canvas.getByText('5 / 200자')).toBeInTheDocument();
  },
};
export const LargeText: Story = { args: { count: 200 }, globals: { textSize: 'large' } };
