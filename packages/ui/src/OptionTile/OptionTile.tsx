'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@hankki/icons';

type OptionTileProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'id' | 'className' | 'children' | 'checked'
> & {
  type: 'checkbox' | 'radio';
  checked: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Figma OptionTile (228:180) — 체크박스/라디오 목록 대체. 진짜 input을 숨기고 label 전체를 타일로 그린다.
 * 미선택 bg/muted + 빈 표시(icon/secondary 외곽선), 선택 bg/brand-selected + bg/brand-strong 표시 + text/brand.
 * 높이는 control/height(Figma 44 = M. L·큰 글씨에서는 조작 영역 규칙대로 커진다), radius 10.
 */
export function OptionTile({
  type,
  checked,
  disabled = false,
  className,
  children,
  ...inputProps
}: OptionTileProps) {
  const id = useId();
  const look = checked
    ? 'bg-(--color-bg-brand-selected) text-(--color-text-brand)'
    : disabled
      ? 'bg-(--color-bg-muted) text-(--color-text-disabled)'
      : 'bg-(--color-bg-muted) text-(--color-text-primary) active:bg-(--color-bg-disabled)';
  const shape = type === 'radio' ? 'rounded-(--radius-full)' : 'rounded-[6px]';

  return (
    <label
      htmlFor={id}
      className={`flex min-h-(--control-height) w-full items-center gap-(--space-xs) rounded-(--radius-control) px-(--space-sm) py-(--space-xs) ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--color-border-focus) ${look} ${className ?? ''}`}
    >
      {/* 입력은 스크린리더·키보드용으로만 남기고 모양은 label이 그린다 */}
      <input
        id={id}
        type={type}
        checked={checked}
        disabled={disabled}
        className="sr-only"
        {...inputProps}
      />
      {/* 표시(mark) 20 — Figma 고정값 */}
      {checked ? (
        type === 'radio' ? (
          <Icon name="option-radio-selected" size={20} />
        ) : (
          <span
            aria-hidden
            className={`flex size-5 shrink-0 items-center justify-center bg-(--color-bg-brand-strong) ${shape}`}
          >
            <Icon name="option-check" size={14} />
          </span>
        )
      ) : (
        <span
          aria-hidden
          className={`size-5 shrink-0 border-[1.5px] bg-(--color-bg-default) ${shape} ${
            disabled ? 'border-(--color-border-default)' : 'border-(--color-icon-secondary)'
          }`}
        />
      )}
      <span className={`min-w-px flex-1 ${checked ? 'typo-body-strong' : 'typo-body'}`}>
        {children}
      </span>
    </label>
  );
}
