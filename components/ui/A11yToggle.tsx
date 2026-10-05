"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";

const STORAGE_KEY = "hankki.textSize";

// 큰 글씨 설정은 이 기기(localStorage)에 저장한다. 같은 화면의 토글끼리 값을 공유하도록 작은 저장소로 감싼다
const listeners = new Set<() => void>();
const textSizeStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => localStorage.getItem(STORAGE_KEY) === "large",
  getServerSnapshot: () => false,
  set(large: boolean) {
    localStorage.setItem(STORAGE_KEY, large ? "large" : "default");
    listeners.forEach((listener) => listener());
  },
};

/**
 * 접근성 모드 토글 (Figma A11yToggle 70:86). 지금은 큰 글씨만 바꾼다 — 음성 읽기와 계정 저장은 백엔드 설정 API(BE-13) 후 붙인다.
 */
export function A11yToggle() {
  const pressed = useSyncExternalStore(
    textSizeStore.subscribe,
    textSizeStore.getSnapshot,
    textSizeStore.getServerSnapshot,
  );

  // 화면 전체를 크기 모드 "큰 글씨"로 바꾼다 (styles/tokens.css의 [data-text-size="large"])
  useEffect(() => {
    document.documentElement.dataset.textSize = pressed ? "large" : "default";
  }, [pressed]);

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label="큰 글씨와 음성 읽기"
      onClick={() => textSizeStore.set(!pressed)}
      className={`flex min-h-(--control-height-sm) shrink-0 cursor-pointer items-center justify-center gap-(--space-2xs) rounded-(--radius-control) px-(--space-sm) ${pressed ? "bg-(--color-bg-brand-selected)" : "bg-(--color-bg-muted)"}`}
    >
      <Icon name={pressed ? "text-size-on" : "text-size"} />
      <span
        className={`typo-body-strong whitespace-nowrap ${pressed ? "text-(--color-text-brand)" : "text-(--color-text-primary)"}`}
      >
        {pressed ? "큰 글씨 켬" : "큰 글씨"}
      </span>
    </button>
  );
}
