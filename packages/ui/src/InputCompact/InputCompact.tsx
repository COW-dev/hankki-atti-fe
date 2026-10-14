'use client';

import { useId, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { Icon } from '@hankki/icons';

type InputCompactProps = { label: string; className?: string } & (
  | ({ kind?: 'text' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>)
  | ({ kind: 'select'; options: readonly { value: string; label: string }[] } & Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      'id' | 'className' | 'children'
    >)
);

/** Figma InputCompact (1:1783). 보이는 라벨이 없어도 입력 이름은 필수다. */
export function InputCompact({ label, className, ...props }: InputCompactProps) {
  const id = useId();
  const fieldClass =
    'typo-body min-h-(--control-height) w-full min-w-0 rounded-(--radius-control) bg-(--color-bg-muted) px-(--space-sm) text-(--color-text-primary) outline-none focus-visible:outline-none focus:shadow-[inset_0_0_0_var(--stroke-default)_var(--color-border-focus)] disabled:bg-(--color-bg-disabled) disabled:text-(--color-text-disabled)';
  let field;
  if (props.kind === 'select') {
    const { kind, options, ...selectProps } = props;
    void kind;
    field = (
      <>
        <select
          {...selectProps}
          id={id}
          className={`${fieldClass} appearance-none pr-(--space-3xl)`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="compact-chevron"
          size="var(--space-md)"
          className="pointer-events-none absolute right-(--space-sm) top-1/2 -translate-y-1/2 rotate-90"
        />
      </>
    );
  } else {
    const { kind, ...inputProps } = props;
    void kind;
    field = (
      <input
        {...inputProps}
        id={id}
        className={`${fieldClass} placeholder:text-(--color-text-secondary)`}
      />
    );
  }
  return (
    <div className={`relative ${className ?? ''}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {field}
    </div>
  );
}
