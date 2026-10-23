'use client';

import { useEffect } from 'react';

// Figma 팝업·토스트 섹션 설명(14:2624): 토스트는 2초 뒤 자동으로 닫힘
export const TOAST_DURATION_MS = 2000;

/**
 * Figma Toast (14:2862 등 9종, real_page). 포커스를 옮기지 않고 polite로 알린다.
 * live 영역은 처음부터 있어야 스크린리더가 바뀐 문구를 읽으므로 message가 없어도 빈 영역을 둔다.
 * 탭바가 있는 화면은 탭바 위 20(14:2862), 없는 화면은 바닥에서 40(14:2865) 띄운다.
 */
export function Toast({
  message,
  onClose,
  withTabBar = false,
}: {
  message: string | null;
  onClose: () => void;
  withTabBar?: boolean;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div
      role="status"
      className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-(--space-md) ${withTabBar ? 'bottom-[calc(var(--tabbar-height)+var(--space-lg))]' : 'bottom-(--space-3xl)'}`}
    >
      {message && (
        <p className="typo-body-strong rounded-(--radius-md) bg-(--color-bg-inverse) px-4.5 py-3 text-center text-(--color-text-inverse)">
          {message}
        </p>
      )}
    </div>
  );
}
