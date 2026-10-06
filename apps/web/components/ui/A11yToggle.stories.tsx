import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { A11yToggle } from "./A11yToggle";

const meta = { title: "앱/A11yToggle", component: A11yToggle } satisfies Meta<typeof A11yToggle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  globals: { textSize: "default" },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "큰 글씨와 음성 읽기" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(document.documentElement).toHaveAttribute("data-text-size", "large");
    await expect(localStorage.getItem("hankki.textSize")).toBe("large");
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};
export const Pressed: Story = { globals: { textSize: "large" } };
export const SharedState: Story = {
  globals: { textSize: "default" },
  render: () => (
    <div className="flex gap-(--space-md)">
      <A11yToggle />
      <A11yToggle />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const [first, second] = canvas.getAllByRole("button", { name: "큰 글씨와 음성 읽기" });
    await userEvent.click(first);
    await expect(second).toHaveAttribute("aria-pressed", "true");
  },
};
