import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './Icon';

const names = [
  'icon-check',
  'back',
  'chevron-right',
  'bell',
  'close',
  'info',
  'alert',
  'clock',
  'minus',
  'icon-text-size',
  'plus',
  'icon-list',
  'megaphone',
  'user',
  'users',
];
const meta = {
  title: '공용 UI/Icon',
  component: Icon,
  args: { name: 'icon-check' },
  argTypes: { name: { control: 'select', options: names } },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Gallery: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-(--space-lg)">
      {names.map((name) => (
        <li key={name} className="flex items-center gap-(--space-xs)">
          <Icon name={name} />
          <span className="typo-caption">{name}</span>
        </li>
      ))}
    </ul>
  ),
};
export const HelperSize: Story = { globals: { sizeMode: 'M' } };
export const LargeText: Story = { globals: { textSize: 'large' } };
