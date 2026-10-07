import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Footer } from './Footer';

const meta = { title: '앱/Footer', component: Footer } satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Copyright: Story = { args: { copyright: true } };
export const LargeText: Story = { globals: { textSize: 'large' } };
