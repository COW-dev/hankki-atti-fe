'use client';

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';

type ModalProps = {
  open: boolean;
  // Esc·배경 클릭·닫기 버튼 모두 이걸 부른다. 열림 상태는 호출부가 가진다
  onClose: () => void;
  title: string;
  // 제목 아래 보조 설명 (aria-describedby)
  description?: ReactNode;
  children?: ReactNode;
  // 아래쪽 버튼 묶음. 자식은 폭을 균등하게 나눈다
  actions?: ReactNode;
  // 배경을 누르면 닫을지. 실수로 닫히면 안 되는 모달은 false
  dismissOnBackdrop?: boolean;
  className?: string;
};

/**
 * Figma Modal (70:152) — 확인 모달(지원 확인·취소 확인·노쇼 신고). 네이티브 dialog.showModal()을 써서
 * 포커스 가두기·배경 inert·닫힐 때 연 요소로 포커스 복귀를 브라우저가 한다.
 * 열리면 제목으로 포커스한다 (파괴적 버튼에 자동 포커스 금지). role=dialog + aria-modal은 dialog가 기본 제공.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  dismissOnBackdrop = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const descriptionId = `${titleId}-description`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      titleRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Esc: 브라우저가 닫기 전에 가로채 호출부 상태를 바꾼다 (상태와 dialog.open이 어긋나지 않게)
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };
  // 배경(::backdrop) 클릭은 dialog 자신이 target이다. 안쪽은 내용 div가 받는다
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (dismissOnBackdrop && event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
      onClick={handleClick}
      className={`m-auto max-h-[calc(100dvh-2*var(--space-xl))] w-[calc(100%-2*var(--space-xl))] max-w-[342px] overflow-y-auto rounded-(--radius-xl) bg-(--color-bg-default) p-0 text-(--color-text-primary) shadow-(--shadow-modal) backdrop:bg-(--color-bg-overlay)/50 ${className ?? ''}`}
    >
      <div className="flex w-full flex-col gap-(--space-md) p-(--space-xl)">
        <h2 id={titleId} ref={titleRef} tabIndex={-1} className="typo-title w-full">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="typo-body w-full text-(--color-text-secondary)">
            {description}
          </p>
        )}
        {children}
        {actions && <div className="flex w-full gap-(--space-xs) *:flex-1">{actions}</div>}
      </div>
    </dialog>
  );
}
