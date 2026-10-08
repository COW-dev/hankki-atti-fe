'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'large' | 'small';

type ButtonLook = {
  // primary = 화면의 핵심 동작(화면당 1개) · secondary = 보조 · tertiary = 텍스트 버튼 · danger = 파괴적 동작
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonLook & {
    // 조건을 다 채우기 전: 포커스는 받되(이유를 읽어 줄 수 있게) 누를 수 없는 모양 (A11Y 공통 규칙)
    inactive?: boolean;
  };

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-(--color-bg-button-primary) text-(--color-text-on-brand) active:bg-(--color-bg-brand-pressed)',
  secondary: 'bg-(--color-bg-muted) text-(--color-text-primary) active:bg-(--color-bg-disabled)',
  tertiary: 'bg-transparent text-(--color-text-secondary) active:bg-(--color-bg-muted)',
  danger:
    'bg-(--color-bg-danger-subtle) text-(--color-text-danger) active:bg-(--color-bg-disabled)',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  large: 'min-h-(--control-height) min-w-(--control-height) px-(--control-padding-x)',
  small: 'min-h-(--control-height-sm) min-w-(--control-height-sm) px-(--space-md)',
};

const BASE_CLASS =
  'typo-body-strong flex items-center justify-center gap-(--space-xs) rounded-(--radius-control) py-(--space-xs)';

/**
 * Figma Button (68:73): Style 4종 × Size 2종. 높이는 크기 모드(control/height)를 따른다.
 * 비활성은 disabled 대신 inactive를 쓴다 — disabled는 포커스를 못 받아 스크린리더가 이유를 읽어 줄 수 없다.
 */
export function Button({
  variant = 'primary',
  size = 'large',
  inactive = false,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const look = inactive
    ? 'cursor-not-allowed bg-(--color-bg-disabled) text-(--color-text-disabled)'
    : `cursor-pointer ${VARIANT_CLASS[variant]}`;

  return (
    <button
      type={type}
      aria-disabled={inactive || undefined}
      onClick={(event) => {
        if (inactive) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={`${BASE_CLASS} ${SIZE_CLASS[size]} ${look} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * 버튼 모양의 화면 이동 링크. 이동은 <a>여야 스크린리더가 "링크"로 읽고 새 탭 열기도 된다.
 * 누르면 무언가를 처리하는 동작(제출·취소 등)에는 Button을 쓴다.
 */
export function ButtonLink({
  variant = 'primary',
  size = 'large',
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & ButtonLook) {
  return (
    <Link
      className={`${BASE_CLASS} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </Link>
  );
}
