'use client';

import { useCallback, useState } from 'react';
import { Toast } from '@hankki/ui';
import { Logo } from '@/components/ui/Logo';

// 문서가 준비되면 링크로 바꾼다 (U-02, Toast 14:2868/2874)
const PENDING_DOC_MESSAGE = '준비 중인 문서예요';

/**
 * Figma Mockup / Footer (201:68). 비로그인 화면은 copyright를 켠다.
 * 탭바가 있는 화면은 withTabBar로 토스트를 탭바 위에 띄운다.
 */
export function Footer({
  copyright = false,
  withTabBar = false,
}: {
  copyright?: boolean;
  withTabBar?: boolean;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const showPending = () => setToast(PENDING_DOC_MESSAGE);

  return (
    <footer className="flex w-full flex-col items-center gap-(--space-xs) border-t border-(--color-border-default) bg-(--color-bg-subtle) px-(--space-lg) pt-(--space-lg) pb-(--space-xl)">
      <Logo variant="footer" />
      <div className="flex w-full flex-col items-center gap-0.5 text-center">
        <p className="typo-caption-strong w-full text-(--color-text-primary)">
          명지대학교 장애학생지원센터
        </p>
        <p className="typo-caption w-full text-(--color-text-secondary)">
          02-300-1529 · min9344@mju.ac.kr
        </p>
        <div className="typo-caption flex w-full flex-wrap justify-center gap-x-(--space-sm) text-(--color-text-secondary)">
          <button
            type="button"
            className="min-h-(--control-height) underline"
            onClick={showPending}
          >
            개인정보처리방침
          </button>
          <button
            type="button"
            className="min-h-(--control-height) underline"
            onClick={showPending}
          >
            이용약관
          </button>
        </div>
        {copyright && (
          <p className="typo-caption w-full text-(--color-text-secondary)">© 2026 한끼아띠</p>
        )}
      </div>
      <Toast message={toast} onClose={closeToast} withTabBar={withTabBar} />
    </footer>
  );
}
