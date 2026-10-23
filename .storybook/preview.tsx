import type { Preview } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './preview.css';

const preview: Preview = {
  tags: ['autodocs'],
  initialGlobals: { sizeMode: 'L', textSize: 'default' },
  globalTypes: {
    sizeMode: {
      description: '크기 모드',
      toolbar: {
        icon: 'grow',
        items: [
          { value: 'L', title: 'L · 장애학생 / 비로그인' },
          { value: 'M', title: 'M · 도우미' },
        ],
      },
    },
    textSize: {
      description: '큰 글씨',
      toolbar: {
        icon: 'accessibility',
        items: [
          { value: 'default', title: '기본 글씨' },
          { value: 'large', title: '큰 글씨' },
        ],
      },
    },
  },
  beforeEach({ globals, viewMode }) {
    // Docs는 여러 스토리를 한 화면에 그리므로 html이 아니라 데코레이터의 감싼 요소로 고른다
    if (viewMode === 'docs') return;
    const previous = localStorage.getItem('hankki.textSize');
    const textSize = document.documentElement.dataset.textSize;
    const lang = document.documentElement.lang;
    localStorage.setItem('hankki.textSize', globals.textSize === 'large' ? 'large' : 'default');
    document.documentElement.dataset.textSize = globals.textSize === 'large' ? 'large' : 'default';
    document.documentElement.lang = 'ko';
    return () => {
      if (previous === null) localStorage.removeItem('hankki.textSize');
      else localStorage.setItem('hankki.textSize', previous);
      if (textSize === undefined) delete document.documentElement.dataset.textSize;
      else document.documentElement.dataset.textSize = textSize;
      document.documentElement.lang = lang;
    };
  },
  decorators: [
    function DesignSystem(Story, { globals, storyGlobals, viewMode }) {
      // Docs에서는 스토리에 적은 globals(예: LargeText)가 globals에 합쳐지지 않아 storyGlobals를 먼저 본다
      const textSize =
        (storyGlobals.textSize ?? globals.textSize) === 'large' ? 'large' : 'default';
      useEffect(() => {
        if (viewMode !== 'docs') document.documentElement.dataset.textSize = textSize;
      }, [textSize, viewMode]);
      return (
        <div
          data-text-size={textSize}
          data-size={storyGlobals.sizeMode ?? globals.sizeMode}
          className="font-sans antialiased"
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    nextjs: { appDirectory: true },
    a11y: { test: 'error' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};
export default preview;
