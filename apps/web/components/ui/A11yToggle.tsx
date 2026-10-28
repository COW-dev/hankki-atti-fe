'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Icon } from '@hankki/icons';
import { textSizeStore } from '@/lib/accessibility/text-size';

/**
 * 접근성 모드 토글 (Figma A11yToggle 1:1220). 지금은 큰 글씨만 바꾼다 — 음성 읽기는 U-07.
 * 기기에 바로 저장하고, 로그인 중이면 AccessibilitySync가 계정에도 저장한다 (명세 §2.2).
 */
export function A11yToggle() {
  const pressed = useSyncExternalStore(
    textSizeStore.subscribe,
    textSizeStore.getSnapshot,
    textSizeStore.getServerSnapshot,
  );

  // 화면 전체를 크기 모드 "큰 글씨"로 바꾼다 (packages/tokens/src/tokens.css의 [data-text-size="large"])
  useEffect(() => {
    document.documentElement.dataset.textSize = pressed ? 'large' : 'default';
  }, [pressed]);

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label="큰 글씨와 음성 읽기"
      onClick={() => textSizeStore.setByUser(!pressed)}
      className={`flex min-h-(--control-height) shrink-0 cursor-pointer items-center justify-center gap-(--space-2xs) rounded-(--radius-control) px-(--space-sm) ${pressed ? 'bg-(--color-bg-brand-selected)' : 'bg-(--color-bg-muted)'}`}
    >
      <Icon name={pressed ? 'text-size-on' : 'text-size'} />
      <span
        className={`typo-body-strong whitespace-nowrap ${pressed ? 'text-(--color-text-brand)' : 'text-(--color-text-primary)'}`}
      >
        {pressed ? '큰 글씨 켬' : '큰 글씨'}
      </span>
    </button>
  );
}
