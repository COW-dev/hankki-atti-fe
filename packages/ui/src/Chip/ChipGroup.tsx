'use client';

import { useRef, type KeyboardEvent } from 'react';
import { Chip } from './Chip';

export type ChipOption<T extends string> = { value: T; label: string; disabled?: boolean };

const COLUMNS_CLASS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const;

type ChipGroupProps<T extends string> = {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  // 그룹 이름. 보이는 제목이 있으면 labelledBy로 그 id를 준다
  label?: string;
  labelledBy?: string;
  // 한 줄에 놓는 개수 — Figma "한 줄 여러 개면 폭 균등"
  columns?: keyof typeof COLUMNS_CLASS;
  className?: string;
};

/**
 * Chip 단일 선택 묶음 (radiogroup). Tab은 그룹에 한 번만 들어오고(선택된 칩, 없으면 첫 칩),
 * 화살표로 이동하면 바로 선택된다 (표준 라디오 동작). Home/End로 처음·끝. disabled 칩은 건너뛴다.
 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  labelledBy,
  columns = 2,
  className,
}: ChipGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledIndexes = options.flatMap((option, index) => (option.disabled ? [] : [index]));
  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabbableIndex =
    selectedIndex >= 0 && !options[selectedIndex].disabled
      ? selectedIndex
      : (enabledIndexes[0] ?? -1);

  const select = (index: number) => {
    onChange(options[index].value);
    refs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const position = enabledIndexes.indexOf(index);
    if (position < 0) return;
    const last = enabledIndexes.length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = enabledIndexes[position === last ? 0 : position + 1];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = enabledIndexes[position === 0 ? last : position - 1];
        break;
      case 'Home':
        next = enabledIndexes[0];
        break;
      case 'End':
        next = enabledIndexes[last];
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={`grid w-full gap-(--space-xs) ${COLUMNS_CLASS[columns]} ${className ?? ''}`}
    >
      {options.map((option, index) => (
        <Chip
          key={option.value}
          ref={(element) => {
            refs.current[index] = element;
          }}
          selected={option.value === value}
          disabled={option.disabled}
          tabIndex={index === tabbableIndex ? 0 : -1}
          onClick={() => {
            if (!option.disabled) select(index);
          }}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}
