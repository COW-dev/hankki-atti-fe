import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { OptionGroup } from './OptionGroup';
import { OptionTile } from './OptionTile';

const HELP_TYPES = [
  ['SERVING', '배식 보조'],
  ['SEATING', '좌석 안내'],
  ['MOVING', '이동·운반 보조'],
  ['OTHER', '기타'],
] as const;

function Checkboxes({ columns, disabledLast = false }: { columns: 1 | 2; disabledLast?: boolean }) {
  const [selected, setSelected] = useState<string[]>(['SERVING']);
  return (
    <OptionGroup legend="필요한 도움" columns={columns}>
      {HELP_TYPES.map(([value, label], index) => (
        <OptionTile
          key={value}
          type="checkbox"
          name="helpTypes"
          value={value}
          checked={selected.includes(value)}
          disabled={disabledLast && index === HELP_TYPES.length - 1}
          onChange={(event) =>
            setSelected((current) =>
              event.target.checked ? [...current, value] : current.filter((item) => item !== value),
            )
          }
        >
          {label}
        </OptionTile>
      ))}
    </OptionGroup>
  );
}

function Radios() {
  const [reason, setReason] = useState('SCHEDULE');
  return (
    <OptionGroup legend="취소 사유" columns={2}>
      {[
        ['SCHEDULE', '일정이 생겨서'],
        ['SICK', '아파서'],
        ['OTHER', '기타'],
      ].map(([value, label]) => (
        <OptionTile
          key={value}
          type="radio"
          name="reason"
          value={value}
          checked={reason === value}
          onChange={() => setReason(value)}
        >
          {label}
        </OptionTile>
      ))}
    </OptionGroup>
  );
}

const meta = {
  title: '공용 UI/OptionTile',
  component: Checkboxes,
  args: { columns: 1 },
  decorators: [
    (Story) => (
      <div className="w-[358px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkboxes>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxList: Story = {};
export const CheckboxGrid: Story = { args: { columns: 2 } };
export const WithDisabled: Story = { args: { disabledLast: true } };
export const Radio: Story = { render: () => <Radios /> };
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const serving = canvas.getByRole('checkbox', { name: '배식 보조' });
    await expect(serving).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(serving).not.toBeChecked();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: '좌석 안내' })).toBeChecked();
  },
};
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
