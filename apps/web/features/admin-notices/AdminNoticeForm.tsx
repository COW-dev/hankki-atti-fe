'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@hankki/icons';
import {
  Button,
  ButtonLink,
  ChipGroup,
  ErrorNotice,
  Notice,
  OptionTile,
  TextField,
} from '@hankki/ui';
import { noticeSaveFailureMessage, type NoticeSaveRequest } from './api';
import {
  NOTICE_BODY_MAX_LENGTH,
  NOTICE_FIELDS,
  NOTICE_TITLE_MAX_LENGTH,
  noticeTargetOptions,
  validateNotice,
  type NoticeErrors,
  type NoticeField,
  type NoticeForm,
} from './notice-form';

/**
 * 공지 입력 폼 (A-12, Figma 14:2595). 작성 목업이 없어 수정 폼을 비워 함께 쓴다.
 * onDelete를 주면 왼쪽 끝에 삭제 버튼을 둔다 (Figma 14:2611)
 */
export function AdminNoticeForm({
  initial,
  onSubmit,
  onDelete,
}: {
  initial: NoticeForm;
  // 성공하면 부모가 다른 화면으로 넘긴다
  onSubmit: (request: NoticeSaveRequest) => Promise<void>;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<NoticeErrors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const targetLabelId = useId();
  const targetErrorId = useId();
  const savingId = useId();
  const targets = noticeTargetOptions(initial.target);

  const focusField = (field: NoticeField) => {
    const element =
      field === 'target'
        ? targetRef.current?.querySelector('button')
        : formRef.current?.elements.namedItem(field);
    if (element instanceof HTMLElement) element.focus();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const found = validateNotice(form);
    setErrors(found);
    const first = NOTICE_FIELDS.find((field) => found[field]);
    if (first || !form.target) {
      setAlert(`입력한 내용을 확인해 주세요 (${Object.keys(found).length}곳)`);
      if (first) focusField(first);
      return;
    }
    setAlert(null);
    setSubmitting(true);
    try {
      const { title, body, target, pinned } = form;
      await onSubmit({ title, body, target, pinned });
    } catch (cause) {
      setAlert(noticeSaveFailureMessage(cause));
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-3">
      {alert && <ErrorNotice message={alert} />}
      <p id={savingId} role="status" className="sr-only">
        {submitting && '공지를 저장하고 있어요'}
      </p>
      <div className="flex flex-col gap-5 rounded-(--radius-lg) bg-(--color-bg-default) px-8 py-7">
        <TextField
          label="제목 *"
          name="title"
          required
          readOnly={submitting}
          count={NOTICE_TITLE_MAX_LENGTH}
          value={form.title}
          error={errors.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
        <TextField
          multiline
          label="본문 *"
          name="body"
          rows={6}
          required
          readOnly={submitting}
          helper="이미지 대신 글로 써 주세요 — 스크린리더로 읽을 수 있어야 해요"
          count={NOTICE_BODY_MAX_LENGTH}
          value={form.body}
          error={errors.body}
          onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
        />
        <div ref={targetRef} className="flex flex-col gap-2">
          <p id={targetLabelId} className="typo-label text-(--color-text-primary)">
            대상 *
          </p>
          <div className="w-fit">
            <ChipGroup
              labelledBy={targetLabelId}
              columns={targets.length === 4 ? 4 : 3}
              options={targets.map((target) => ({
                ...target,
                inactive: submitting,
                describedBy: submitting ? savingId : errors.target ? targetErrorId : undefined,
              }))}
              value={form.target || null}
              onChange={(target) => setForm((prev) => ({ ...prev, target }))}
            />
          </div>
          {errors.target && (
            <p
              id={targetErrorId}
              role="alert"
              className="typo-caption flex items-center gap-(--space-2xs) text-(--color-text-danger)"
            >
              <Icon name="error" />
              {errors.target}
            </p>
          )}
        </div>
        <OptionTile
          className="w-105!"
          selected={form.pinned}
          inactive={submitting}
          aria-describedby={submitting ? savingId : undefined}
          onClick={() => setForm((prev) => ({ ...prev, pinned: !prev.pinned }))}
        >
          목록 맨 위에 고정
        </OptionTile>
        <Notice>게시하면 대상에게 알림이 가요. 수정은 알림을 다시 보내지 않아요</Notice>
      </div>
      <div className="flex items-center gap-2">
        {onDelete && (
          <Button
            variant="danger"
            inactive={submitting}
            aria-describedby={submitting ? savingId : undefined}
            onClick={onDelete}
          >
            삭제
          </Button>
        )}
        <div className="flex-1" />
        <ButtonLink href="/notices" variant="secondary">
          취소
        </ButtonLink>
        <Button
          type="submit"
          inactive={submitting}
          aria-describedby={submitting ? savingId : undefined}
        >
          저장
        </Button>
      </div>
    </form>
  );
}
