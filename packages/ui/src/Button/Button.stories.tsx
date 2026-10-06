import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "공용 UI/Button",
  component: Button,
  args: { children: "도우미 신청하기", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "tertiary", "danger"] },
    size: { control: "select", options: ["large", "small"] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Tertiary: Story = { args: { variant: "tertiary" } };
export const Danger: Story = { args: { variant: "danger", children: "신청 취소하기" } };
export const Small: Story = { args: { size: "small" } };
export const Inactive: Story = {
  args: { inactive: true },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "도우미 신청하기" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "도우미 신청하기" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const LongLabel: Story = { args: { children: "선택한 날짜와 시간으로 도우미 신청하기" } };
export const HelperSize: Story = { globals: { sizeMode: "M" } };
export const LargeText: Story = { globals: { textSize: "large" } };
