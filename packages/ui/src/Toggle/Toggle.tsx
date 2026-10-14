'use client';

import type { ButtonHTMLAttributes } from 'react';

type ToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled' | 'role' | 'aria-checked' | 'onChange' | 'onClick'
> & {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  inactive?: boolean;
};

/** Figma Toggle (1:1770). 원본 SVG의 48×28 크기를 유지하고 바깥 버튼으로 최소 조작 영역을 확보한다. */
export function Toggle({
  label,
  checked,
  onChange,
  inactive = false,
  className,
  ...props
}: ToggleProps) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      aria-disabled={inactive || undefined}
      onClick={() => {
        if (!inactive) onChange(!checked);
      }}
      className={`flex min-h-(--control-height) min-w-(--control-height) items-center justify-center ${inactive ? 'cursor-not-allowed' : 'cursor-pointer'} ${className ?? ''}`}
    >
      {/* 손잡이만 이동할 수 있도록 Figma 원본 SVG의 track·knob 도형을 인라인으로 유지한다. */}
      <svg
        className={inactive && checked ? 'opacity-50' : undefined}
        aria-hidden
        focusable="false"
        viewBox="0 0 48 28"
        width={48}
        height={28}
      >
        <rect
          x={checked ? 0 : 0.5}
          y={checked ? 0 : 0.5}
          width={checked ? 48 : 47}
          height={checked ? 28 : 27}
          rx={checked ? 14 : 13.5}
          strokeWidth={checked ? 0 : 1}
          className={`transition-[fill,stroke] duration-200 ease-in-out motion-reduce:transition-none ${checked ? 'fill-(--color-bg-brand-strong) stroke-(--color-bg-brand-strong)' : `fill-(--color-bg-disabled) ${inactive ? 'stroke-(--color-border-default)' : 'stroke-(--color-border-strong)'}`}`}
        />
        <circle
          cx={14}
          cy={14}
          r={checked ? 11 : 10.5}
          strokeWidth={checked ? 0 : 1}
          style={{ transform: `translateX(${checked ? 20 : 0}px)` }}
          className={`fill-(--color-bg-default) transition-[transform,stroke,r] duration-200 ease-in-out motion-reduce:transition-none ${checked ? 'stroke-(--color-bg-default)' : inactive ? 'stroke-(--color-border-default)' : 'stroke-(--color-border-strong)'}`}
        />
      </svg>
    </button>
  );
}
