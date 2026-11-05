'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button, ButtonLink, ErrorNotice, TextField } from '@hankki/ui';
import { DISABILITY_TYPE_LABEL, type DisabilityType } from '@/lib/labels/student';
import type { StudentCreateFailure } from './api';
import {
  STUDENT_CREATE_FIELDS,
  validateStudentCreate,
  type StudentCreateErrors,
  type StudentCreateField,
  type StudentCreateForm,
} from './create-form';

const DISABILITY_OPTIONS = [
  { value: '', label: '선택하세요 (센터 분류 7개)' },
  ...(Object.keys(DISABILITY_TYPE_LABEL) as DisabilityType[]).map((type) => ({
    value: type,
    label: DISABILITY_TYPE_LABEL[type],
  })),
];

/**
 * 장애학생 입력 폼 (Figma 14:1723 기본 정보·장애 정보). 등록과 정보 수정이 같이 쓴다 — 수정 목업이 없어
 * 등록 폼을 그대로 쓰고, 학번(로그인 아이디)은 바꿀 수 없어 읽기 전용으로 둔다
 */
export function StudentForm({
  initial,
  focusFirst = false,
  studentNoLocked = false,
  submitLabel,
  cancelHref = '/students',
  onSubmit,
  failureOf,
}: {
  initial: StudentCreateForm;
  focusFirst?: boolean;
  studentNoLocked?: boolean;
  submitLabel: string;
  cancelHref?: string;
  // 성공하면 부모가 다른 화면으로 넘긴다
  onSubmit: (form: StudentCreateForm) => Promise<void>;
  failureOf: (error: unknown) => StudentCreateFailure;
}) {
  const [form, setForm] = useState<StudentCreateForm>(initial);
  const [errors, setErrors] = useState<StudentCreateErrors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [failure, setFailure] = useState<StudentCreateFailure | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const focusField = (field: StudentCreateField) => {
    const element = formRef.current?.elements.namedItem(field);
    if (element instanceof HTMLElement) element.focus();
  };

  useEffect(() => {
    if (focusFirst) focusField(STUDENT_CREATE_FIELDS[0]);
  }, [focusFirst]);

  useEffect(() => {
    if (failure?.field) focusField(failure.field);
  }, [failure]);

  const update = (field: StudentCreateField) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const errorOf = (field: StudentCreateField) =>
    errors[field] ?? (failure?.field === field ? failure.message : undefined);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const found = validateStudentCreate(form);
    setErrors(found);
    setFailure(null);
    const first = STUDENT_CREATE_FIELDS.find((field) => found[field]);
    if (first) {
      setSummary(`입력한 내용을 확인해 주세요 (${Object.keys(found).length}곳)`);
      focusField(first);
      return;
    }
    setSummary(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (cause) {
      setFailure(failureOf(cause));
      setSubmitting(false);
    }
  };

  const alert = summary ?? (failure && !failure.field ? failure.message : null);

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-3">
      {alert && <ErrorNotice message={alert} />}
      <div className="flex flex-col gap-6 rounded-(--radius-lg) bg-(--color-bg-default) px-8 py-7">
        <FormSection title="기본 정보">
          <TextField
            label="이름 *"
            name="name"
            placeholder="홍길동"
            required
            value={form.name}
            error={errorOf('name')}
            onChange={update('name')}
          />
          <TextField
            label="학번 *"
            name="studentNo"
            inputMode="numeric"
            placeholder="8자리 숫자"
            helper={studentNoLocked ? '로그인 아이디라 바꿀 수 없어요' : '로그인 아이디가 돼요'}
            readOnly={studentNoLocked}
            required
            value={form.studentNo}
            error={errorOf('studentNo')}
            onChange={update('studentNo')}
          />
          <TextField
            label="전화번호 *"
            name="phone"
            type="tel"
            placeholder="010-0000-0000"
            helper="센터만 봐요 (긴급 연락용)"
            required
            value={form.phone}
            error={errorOf('phone')}
            onChange={update('phone')}
          />
          <TextField
            label="카톡 ID *"
            name="kakaoId"
            autoCapitalize="none"
            placeholder="카톡 ID"
            helper="매칭된 도우미에게만 보여요"
            required
            value={form.kakaoId}
            error={errorOf('kakaoId')}
            onChange={update('kakaoId')}
          />
          <TextField
            label="학교 이메일 *"
            name="schoolEmail"
            type="email"
            placeholder="학번@mju.ac.kr"
            helper="계정정보와 급한 알림이 이 주소로 가요"
            required
            value={form.schoolEmail}
            error={errorOf('schoolEmail')}
            onChange={update('schoolEmail')}
          />
        </FormSection>
        <hr className="border-(--color-border-default)" />
        <FormSection title="장애 정보">
          <TextField
            label="장애 유형 *"
            name="disabilityType"
            options={DISABILITY_OPTIONS}
            required
            value={form.disabilityType}
            error={errorOf('disabilityType')}
            onChange={update('disabilityType')}
          />
          <TextField
            label="특이사항 메모 (권장)"
            name="specialNote"
            placeholder="예: 식판 운반, 메뉴 읽어 주기"
            value={form.specialNote}
            error={errorOf('specialNote')}
            onChange={update('specialNote')}
          />
        </FormSection>
      </div>
      <div className="flex justify-end gap-2">
        <ButtonLink href={cancelHref} variant="secondary">
          취소
        </ButtonLink>
        <Button type="submit" inactive={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// Figma 14:1746 섹션: 제목 + 2열 칸 (열 간격 20, 줄 간격 14)
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <h2 className="typo-label text-(--color-text-primary)">{title}</h2>
      <div className="grid grid-cols-2 items-start gap-x-5 gap-y-3.5">{children}</div>
    </section>
  );
}
