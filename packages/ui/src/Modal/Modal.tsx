'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../Button';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  confirmLabel: string;
  onConfirm: () => void;
  confirmInactive?: boolean;
  confirmDescribedBy?: string;
  destructive?: boolean;
};

/** Figma Modal (1:1346). native dialog의 top layer가 배경 inert와 포커스 가두기를 처리한다. */
export function Modal({
  open,
  title,
  children,
  onClose,
  confirmLabel,
  onConfirm,
  confirmInactive = false,
  confirmDescribedBy,
  destructive = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const bodyId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opener = document.activeElement;
    dialog.showModal();
    titleRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
          return;
        }
        if (event.key === 'Tab') {
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button, a[href], input, select, textarea, [tabindex]',
            ),
          ).filter(
            (element) =>
              element.tabIndex >= 0 &&
              !element.hasAttribute('disabled') &&
              element.getClientRects().length > 0,
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first || document.activeElement === titleRef.current)
          ) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh-var(--space-xl)*2)] w-[calc(100%-var(--space-md)*2)] max-w-[342px] overflow-y-auto rounded-(--radius-xl) border-0 bg-(--color-bg-default) p-(--space-xl) text-(--color-text-primary) shadow-(--shadow-modal) backdrop:bg-(--color-bg-overlay)/50"
    >
      <div className="flex flex-col items-start gap-(--space-md)">
        <h2 ref={titleRef} id={titleId} tabIndex={-1} className="typo-title w-full">
          {title}
        </h2>
        <div id={bodyId} className="typo-body w-full text-(--color-text-secondary)">
          {children}
        </div>
        <div className="flex w-full gap-(--space-xs)">
          <Button variant="secondary" className="min-w-0 flex-1" onClick={onClose}>
            닫기
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            className="min-w-0 flex-1"
            onClick={onConfirm}
            inactive={confirmInactive}
            aria-describedby={confirmDescribedBy}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
