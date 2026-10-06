import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "./Logo";

const meta = { title: "앱/Logo", component: Logo, args: { variant: "large" } } satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Large: Story = {};
export const Hero: Story = { args: { variant: "hero" } };
export const TopBar: Story = { args: { variant: "topbar" } };
export const Footer: Story = { args: { variant: "footer" } };
