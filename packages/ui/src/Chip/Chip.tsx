'use client';

import type { ButtonHTMLAttributes, Ref } from 'react';

type ChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'role' | 'aria-checked'
> & {
  ref?: Ref<HTMLButtonElement>;
  selected?: boolean;
  inactive?: boolean;
};

/** Figma Chip (1:1161). 단일 선택은 ChipGroup으로 묶어 키보드 이동을 제공한다. */
export function Chip({
  selected = false,
  inactive = false,
  className,
  onClick,
  children,
  ...props
}: ChipProps) {
  const look = inactive
    ? 'typo-body border-(--color-border-default) bg-(--color-bg-default) text-(--color-text-disabled) cursor-not-allowed'
    : selected
      ? 'typo-body-strong border-(--color-bg-brand-selected) bg-(--color-bg-brand-selected) text-(--color-text-brand)'
      : 'typo-body border-(--color-border-default) bg-(--color-bg-default) text-(--color-text-primary) active:bg-(--color-bg-muted)';
  return (
    <button
      {...props}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={inactive || undefined}
      onClick={(event) => {
        if (inactive) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={`flex min-h-(--control-height) items-center justify-center rounded-(--radius-control) border-(length:--stroke-default) px-(--space-sm) py-(--space-xs) ${look} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
