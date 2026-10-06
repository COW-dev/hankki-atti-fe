import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Block } from "./Block";

const meta = {
  title: "공용 UI/Block",
  component: Block,
  args: {
    children: (
      <>
        <h2 className="typo-title">안내</h2>
        <p className="typo-body">도움이 필요한 시간을 신청해 주세요.</p>
      </>
    ),
  },
} satisfies Meta<typeof Block>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const MediumGap: Story = { args: { gap: "md" } };
export const LargeText: Story = { globals: { textSize: "large" } };
