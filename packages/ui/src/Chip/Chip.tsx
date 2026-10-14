'use client';

import type { ButtonHTMLAttributes } from 'react';

type ChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'role' | 'aria-checked'
> & {
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

type ChipOption = { value: string; label: string; inactive?: boolean; describedBy?: string };

export function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const tabValue = options.find((option) => option.value === value)?.value ?? options[0]?.value;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-(--space-xs)"
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
        <Chip
          key={option.value}
          selected={value === option.value}
          inactive={option.inactive}
          aria-describedby={option.describedBy}
          tabIndex={option.value === tabValue ? 0 : -1}
          className="flex-1"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}
