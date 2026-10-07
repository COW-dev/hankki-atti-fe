import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Block } from '@hankki/ui';
import { PageShell } from './PageShell';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { StudentTabBar } from './TabBar';

const meta = {
  title: '앱/PageShell',
  component: PageShell,
  parameters: { layout: 'fullscreen' },
  args: {
    size: 'L',
    topBar: <TopBar title="내 신청" logo />,
    footer: <Footer />,
    children: (
      <Block>
        <p className="typo-body">아직 신청이 없어요</p>
      </Block>
    ),
  },
  render: (args, { globals }) => (
    <PageShell {...args} size={globals.sizeMode === 'M' ? 'M' : 'L'} />
  ),
} satisfies Meta<typeof PageShell>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithTabBar: Story = { args: { tabBar: <StudentTabBar active="/requests" /> } };
export const Helper: Story = {
  globals: { sizeMode: 'M' },
  args: { topBar: <TopBar title="매칭 현황" logo /> },
};
export const LargeText: Story = {
  globals: { textSize: 'large' },
  args: { tabBar: <StudentTabBar active="/requests" /> },
};
