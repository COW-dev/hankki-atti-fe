'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { Icon } from '@hankki/icons';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  error?: string;
  helper?: string;
  // 규칙 안내처럼 입력칸 아래에 붙는 설명의 id (aria-describedby로 연결)
  describedBy?: string;
};

/**
 * Figma TextField (1:1181): 테두리 없음 + bg/muted, 포커스는 border/focus, 오류는 border/danger + 아래 안내.
 */
export function TextField({
  label,
  error,
  helper,
  describedBy,
  disabled = false,
  className,
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const text = disabled ? 'text-(--color-text-disabled)' : 'text-(--color-text-primary)';
  const ring = error
    ? 'shadow-[inset_0_0_0_var(--stroke-strong)_var(--color-border-danger)]'
    : 'focus-within:shadow-[inset_0_0_0_var(--stroke-strong)_var(--color-border-focus)]';

  return (
    <div className={`flex w-full flex-col items-start gap-(--space-xs) ${className ?? ''}`}>
      <label htmlFor={id} className={`typo-body-strong w-full ${text}`}>
        {label}
      </label>
      {/* 입력칸 자체의 포커스 표시는 이 테두리가 대신한다 (Figma State=Focus) */}
      <div
        className={`flex min-h-(--control-height) w-full items-center rounded-(--radius-control) px-(--space-md) py-(--space-xs) ${disabled ? 'bg-(--color-bg-disabled)' : 'bg-(--color-bg-muted)'} ${ring}`}
      >
        <input
          {...inputProps}
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [
              error ? errorId : helper ? helperId : null,
              describedBy,
              inputProps['aria-describedby'],
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={`typo-body w-full min-w-px flex-1 bg-transparent outline-none focus-visible:outline-none ${text} ${disabled ? 'placeholder:text-(--color-text-disabled)' : 'placeholder:text-(--color-text-secondary)'}`}
        />
      </div>
      {!error && helper && (
        <p id={helperId} className="typo-caption w-full text-(--color-text-secondary)">
          {helper}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="typo-caption flex w-full items-center gap-(--space-2xs) text-(--color-text-danger)"
        >
          <Icon name="error" />
          {error}
        </p>
      )}
    </div>
  );
}
