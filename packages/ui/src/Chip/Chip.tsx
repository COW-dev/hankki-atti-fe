'use client';

import type { ButtonHTMLAttributes, Ref } from 'react';

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'role' | 'className'> & {
  selected: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

/**
 * Figma Chip (68:99) — 날짜·시각·필터처럼 나란히 놓는 단일 선택 항목. ChipGroup 안에서 role="radio"로 쓴다.
 * 미선택 bg/default + border/default, 선택 bg/brand-selected + text/brand(Medium), 테두리는 배경과 같은 색.
 * 높이 control/height-sm. 포커스 표시는 전역 링.
 */
export function Chip({ selected, disabled = false, className, children, ...props }: ChipProps) {
  const look = selected
    ? 'typo-body-strong border-(--color-bg-brand-selected) bg-(--color-bg-brand-selected) text-(--color-text-brand)'
    : disabled
      ? 'typo-body cursor-not-allowed border-(--color-border-default) bg-(--color-bg-default) text-(--color-text-disabled)'
      : 'typo-body cursor-pointer border-(--color-border-default) bg-(--color-bg-default) text-(--color-text-primary) active:bg-(--color-bg-muted)';
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      className={`flex min-h-(--control-height-sm) items-center justify-center gap-(--space-2xs) rounded-(--radius-control) border-(length:--stroke-default) px-(--space-sm) py-(--space-xs) ${look} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
