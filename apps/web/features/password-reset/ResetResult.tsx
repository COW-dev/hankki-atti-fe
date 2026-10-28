'use client';

import { Block } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { useEffect, useRef, type ReactNode } from 'react';

const BADGE = {
  done: { icon: 'check', background: 'bg-(--color-bg-muted)' },
  warning: { icon: 'notice-warning', background: 'bg-(--color-bg-warning-subtle)' },
} as const;

/**
 * L-03 결과 블록 (Figma 보냄 204:738 · 완료 204:1033 · 만료 204:1167): 원 아이콘 → 제목 → 안내 → 버튼.
 * 같은 화면에서 바뀌므로 제목으로 포커스해 읽어 준다 (F-01 완료 화면과 같은 방식).
 */
export function ResetResult({
  badge,
  title,
  description,
  caption,
  children,
  footnote,
}: {
  badge: keyof typeof BADGE;
  title: string;
  description: string;
  caption?: string;
  children: ReactNode;
  footnote?: ReactNode;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Block gap="md">
      <div className="flex w-full flex-col items-center gap-2.5 pt-6">
        <div
          className={`flex size-14 items-center justify-center rounded-full ${BADGE[badge].background}`}
        >
          <Icon name={BADGE[badge].icon} />
        </div>
        <div className="h-0.5" />
        <h2 ref={titleRef} tabIndex={-1} className="typo-title w-full text-center">
          {title}
        </h2>
        <p className="typo-body w-full text-center text-(--color-text-secondary)">{description}</p>
        {caption && (
          <p className="typo-caption w-full text-center text-(--color-text-secondary)">{caption}</p>
        )}
      </div>
      <div className="flex w-full flex-col gap-(--space-sm)">{children}</div>
      {footnote}
    </Block>
  );
}
