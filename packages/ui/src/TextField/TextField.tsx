'use client';

import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Icon } from '@hankki/icons';

type CommonProps = {
  label: string;
  error?: string;
  // 입력칸 아래 안내 (Figma helper: "로그인 아이디로 써요"). 오류가 있으면 오류 문구가 대신 보인다
  helper?: string;
  // 규칙 안내처럼 바깥에 있는 설명의 id (aria-describedby로 연결)
  describedBy?: string;
  // 최대 글자 수. 주면 "12 / 200자"를 보여 주고 넘으면 오류로 표시한다.
  // maxLength 속성은 쓰지 않는다 — 한글 조합 중에 잘리고, 최종 검증은 서버가 한다
  count?: number;
  className?: string;
};

export type SingleLineTextFieldProps = CommonProps & { multiline?: false } & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'className'
  >;
export type MultilineTextFieldProps = CommonProps & { multiline: true } & Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'id' | 'className'
  >;
export type TextFieldProps = SingleLineTextFieldProps | MultilineTextFieldProps;

const FIELD_CLASS =
  'typo-body w-full min-w-px flex-1 bg-transparent text-(--color-text-primary) outline-none placeholder:text-(--color-text-secondary) focus-visible:outline-none';

/**
 * Figma TextField (70:62): 테두리 없음 + bg/muted, 포커스는 border/focus, 오류는 border/danger + 아래 안내.
 * multiline이면 같은 모양의 textarea (F-01 메모).
 */
export function TextField(props: TextFieldProps) {
  const { label, error, helper, describedBy, count, className } = props;
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const countId = `${id}-count`;

  // 글자 수: 제어 컴포넌트면 value로, 아니면 입력할 때마다 센다
  const [typedLength, setTypedLength] = useState(String(props.defaultValue ?? '').length);
  const length = props.value !== undefined ? String(props.value).length : typedLength;
  const over = count !== undefined && length > count;
  const errorText = error ?? (over ? `${count}자까지 쓸 수 있어요` : undefined);
  const showHelper = helper !== undefined && errorText === undefined;

  const ariaInvalid = errorText ? true : undefined;
  const ariaDescribedBy =
    [
      errorText ? errorId : null,
      showHelper ? helperId : null,
      count !== undefined ? countId : null,
      describedBy,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  const ring = errorText
    ? 'shadow-[inset_0_0_0_var(--stroke-strong)_var(--color-border-danger)]'
    : 'focus-within:shadow-[inset_0_0_0_var(--stroke-strong)_var(--color-border-focus)]';

  let field: React.ReactNode;
  if (props.multiline) {
    const { multiline, onChange, rows = 3, ...textareaProps } = stripCommon(props);
    void multiline;
    field = (
      <textarea
        id={id}
        rows={rows}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={`${FIELD_CLASS} resize-none`}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          setTypedLength(event.target.value.length);
          onChange?.(event);
        }}
        {...textareaProps}
      />
    );
  } else {
    const { multiline, onChange, ...inputProps } = stripCommon(props);
    void multiline;
    field = (
      <input
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={FIELD_CLASS}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setTypedLength(event.target.value.length);
          onChange?.(event);
        }}
        {...inputProps}
      />
    );
  }

  return (
    <div className={`flex w-full flex-col items-start gap-(--space-xs) ${className ?? ''}`}>
      <label htmlFor={id} className="typo-body-strong w-full text-(--color-text-primary)">
        {label}
      </label>
      {/* 입력칸 자체의 포커스 표시는 이 테두리가 대신한다 (Figma State=Focus) */}
      <div
        className={`flex w-full rounded-(--radius-control) bg-(--color-bg-muted) px-(--space-md) ${
          props.multiline
            ? 'items-start py-(--space-sm)'
            : 'min-h-(--control-height) items-center py-(--space-xs)'
        } ${ring}`}
      >
        {field}
      </div>
      {(errorText || showHelper || count !== undefined) && (
        <div className="flex w-full items-start justify-between gap-(--space-xs)">
          {errorText ? (
            <p
              id={errorId}
              className="typo-caption flex min-w-px flex-1 items-center gap-(--space-2xs) text-(--color-text-danger)"
            >
              <Icon name="error" />
              {errorText}
            </p>
          ) : showHelper ? (
            <p id={helperId} className="typo-caption min-w-px flex-1 text-(--color-text-secondary)">
              {helper}
            </p>
          ) : (
            <span className="flex-1" />
          )}
          {count !== undefined && (
            <p
              id={countId}
              className={`typo-caption shrink-0 ${over ? 'text-(--color-text-danger)' : 'text-(--color-text-secondary)'}`}
            >
              {length} / {count}자
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// 공통 props를 떼어 내고 input·textarea에 그대로 넘길 것만 남긴다
function stripCommon<T extends TextFieldProps>(props: T) {
  const { label, error, helper, describedBy, count, className, ...rest } = props;
  void label;
  void error;
  void helper;
  void describedBy;
  void count;
  void className;
  return rest;
}
