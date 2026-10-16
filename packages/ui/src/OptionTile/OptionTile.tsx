'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '@hankki/icons';

type OptionTileProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'role' | 'aria-checked' | 'disabled'
> & {
  type?: 'checkbox' | 'radio';
  selected?: boolean;
  inactive?: boolean;
};

/** Figma OptionTile (1:1737). 조작 영역은 고정 높이 44 대신 크기 모드의 최소 높이를 따른다. */
export function OptionTile({
  type = 'checkbox',
  selected = false,
  inactive = false,
  children,
  className,
  onClick,
  ...props
}: OptionTileProps) {
  const look = inactive
    ? 'bg-(--color-bg-muted) text-(--color-text-disabled) cursor-not-allowed'
    : selected
      ? 'bg-(--color-bg-brand-selected) text-(--color-text-brand) cursor-pointer'
      : 'bg-(--color-bg-muted) text-(--color-text-primary) active:bg-(--color-bg-disabled) cursor-pointer';
  return (
    <button
      {...props}
      type="button"
      role={type}
      aria-checked={selected}
      aria-disabled={inactive || undefined}
      onClick={(event) => {
        if (inactive) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={`flex min-h-(--control-height) w-full items-center gap-(--space-xs) rounded-(--radius-control) px-(--space-sm) py-2.5 text-left ${selected ? 'typo-body-strong' : 'typo-body'} ${look} ${className ?? ''}`}
    >
      {selected && type === 'radio' ? (
        <Icon name="option-radio" size="var(--selection-mark-size)" />
      ) : (
        <span
          aria-hidden
          className={`flex size-(--selection-mark-size) shrink-0 items-center justify-center ${type === 'radio' ? 'rounded-(--radius-full)' : 'rounded-(--radius-mark)'} ${selected ? 'bg-(--color-bg-brand-strong)' : `border-(length:--stroke-mark) bg-(--color-bg-default) ${inactive ? 'border-(--color-border-default)' : 'border-(--color-icon-secondary)'}`}`}
        >
          {selected && <Icon name="option-check" size="var(--selection-check-size)" />}
        </span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

type Option = { value: string; label: ReactNode; inactive?: boolean; describedBy?: string };

/**
 * 단일 선택 묶음에 방향키 이동과 한 개의 Tab 진입점을 제공한다.
 * 기본은 Figma 설명대로 2열이고, 문구가 긴 목록(취소 사유 209:3672)은 columns=1로 전폭에 놓는다.
 */
export function OptionTileGroup({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
}) {
  const tabValue = options.find((option) => option.value === value)?.value ?? options[0]?.value;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`grid gap-(--space-xs) ${columns === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
      onKeyDown={(event) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
          return;
        event.preventDefault();
        const radios = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
        );
        const available = radios.filter((radio) => radio.getAttribute('aria-disabled') !== 'true');
        if (!available.length) return;
        let next =
          event.key === 'Home'
            ? available[0]
            : event.key === 'End'
              ? available[available.length - 1]
              : undefined;
        if (!next) {
          const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
          let index = radios.findIndex((radio) => radio === document.activeElement);
          if (index < 0) index = direction > 0 ? -1 : 0;
          for (let step = 0; step < radios.length; step++) {
            index = (index + direction + radios.length) % radios.length;
            if (radios[index].getAttribute('aria-disabled') !== 'true') {
              next = radios[index];
              break;
            }
          }
        }
        next?.focus();
        next?.click();
      }}
    >
      {options.map((option) => (
        <OptionTile
          key={option.value}
          type="radio"
          selected={value === option.value}
          inactive={option.inactive}
          aria-describedby={option.describedBy}
          tabIndex={tabValue === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </OptionTile>
      ))}
    </div>
  );
}
