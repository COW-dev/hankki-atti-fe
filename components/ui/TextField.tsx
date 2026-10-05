import { useId, type InputHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  // 규칙 안내처럼 입력칸 아래에 붙는 설명의 id (aria-describedby로 연결)
  describedBy?: string;
};

/**
 * Figma TextField (70:62): 테두리 없음 + bg/muted, 포커스는 border/focus, 오류는 border/danger + 아래 안내.
 */
export function TextField({ label, error, describedBy, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const ring = error
    ? "shadow-[inset_0_0_0_var(--stroke-strong)_var(--color-border-danger)]"
    : "focus-within:shadow-[inset_0_0_0_var(--stroke-strong)_var(--color-border-focus)]";

  return (
    <div className={`flex w-full flex-col items-start gap-(--space-xs) ${className ?? ""}`}>
      <label htmlFor={id} className="typo-body-strong w-full text-(--color-text-primary)">
        {label}
      </label>
      {/* 입력칸 자체의 포커스 표시는 이 테두리가 대신한다 (Figma State=Focus) */}
      <div
        className={`flex min-h-(--control-height) w-full items-center rounded-(--radius-control) bg-(--color-bg-muted) px-(--space-md) py-(--space-xs) ${ring}`}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined}
          className="typo-body w-full min-w-px flex-1 bg-transparent text-(--color-text-primary) outline-none placeholder:text-(--color-text-secondary) focus-visible:outline-none"
          {...inputProps}
        />
      </div>
      {error && (
        <p id={errorId} className="typo-caption flex w-full items-center gap-(--space-2xs) text-(--color-text-danger)">
          <Icon name="error" />
          {error}
        </p>
      )}
    </div>
  );
}
