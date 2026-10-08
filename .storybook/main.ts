import type { StorybookConfig } from '@storybook/nextjs-vite';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  stories: [
    '../packages/**/*.stories.tsx',
    '../apps/web/components/**/*.stories.tsx',
    '../apps/web/features/**/*.stories.tsx',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      nextConfigPath: fileURLToPath(new URL('../apps/web/next.config.ts', import.meta.url)),
    },
  },
  staticDirs: ['../apps/web/public'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      resolve: { alias: { '@': fileURLToPath(new URL('../apps/web', import.meta.url)) } },
      css: { postcss: { plugins: [(await import('@tailwindcss/postcss')).default()] } },
    });
  },
};
export default config;
