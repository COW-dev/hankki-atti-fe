import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ButtonLink } from "./Button";

const meta = {
  title: "공용 UI/ButtonLink",
  component: ButtonLink,
  args: { href: "/login", children: "로그인" },
} satisfies Meta<typeof ButtonLink>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  },
};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Small: Story = { args: { size: "small" } };
