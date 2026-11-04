'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from '@hankki/icons';
import { Button, ButtonLink, ErrorNotice, Notice, TextField } from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { DISABILITY_TYPE_LABEL, type DisabilityType } from '@/lib/labels/student';
import {
  createStudent,
  resendStudentCredentials,
  studentCreateFailureOf,
  type StudentCreateFailure,
} from './api';
import {
  EMPTY_STUDENT_CREATE_FORM,
  STUDENT_CREATE_FIELDS,
  validateStudentCreate,
  type StudentCreateErrors,
  type StudentCreateField,
  type StudentCreateForm,
} from './create-form';
import { maskEmail, maskedReading } from './masked';
import type { AdminStudentCreated, CredentialMailStatus } from './types';

const DISABILITY_OPTIONS = [
  { value: '', label: '선택하세요 (센터 분류 7개)' },
  ...(Object.keys(DISABILITY_TYPE_LABEL) as DisabilityType[]).map((type) => ({
    value: type,
    label: DISABILITY_TYPE_LABEL[type],
  })),
];

/**
 * AF-01 장애학생 등록 (A-05, Figma 14:1723 입력 · 14:1774 완료 · 14:1812 발송 실패). 전체 권한만 쓴다.
 * 초기 비밀번호는 서버가 학교 이메일로만 보내고 화면에는 오지 않는다.
 * 접근성 모드 기본값(목업 "계정" 칸)은 등록 API가 받지 않아 두지 않는다 (COW-dev/hankki-atti-be#61)
 */
export function StudentCreateScreen() {
  return (
    <AdminShell
      active="/students"
      title="장애학생 등록"
      back={{ href: '/students', label: '학생 목록' }}
    >
      {(me) =>
        me.grade === 'FULL' ? (
          <StudentCreate />
        ) : (
          <div className="mt-3">
            <Notice>전체 권한 관리자만 학생을 등록할 수 있어요</Notice>
          </div>
        )
      }
    </AdminShell>
  );
}

function StudentCreate() {
  const [created, setCreated] = useState<AdminStudentCreated | null>(null);
  // "다른 학생 등록"으로 돌아오면 제목 대신 첫 칸부터 입력한다
  const [again, setAgain] = useState(false);

  if (created) {
    return (
      <CreatedResult
        student={created}
        onMailStatus={(credentialMailStatus) =>
          setCreated((current) => current && { ...current, credentialMailStatus })
        }
        onAgain={() => {
          setCreated(null);
          setAgain(true);
        }}
      />
    );
  }
  return <CreateForm focusFirst={again} onCreated={setCreated} />;
}

function CreateForm({
  focusFirst,
  onCreated,
}: {
  focusFirst: boolean;
  onCreated: (student: AdminStudentCreated) => void;
}) {
  const { authRequest } = useAuth();
  const [form, setForm] = useState<StudentCreateForm>(EMPTY_STUDENT_CREATE_FORM);
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
      onCreated(await createStudent(authRequest, form));
    } catch (cause) {
      setFailure(studentCreateFailureOf(cause));
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
            helper="로그인 아이디가 돼요"
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
        <ButtonLink href="/students" variant="secondary">
          취소
        </ButtonLink>
        <Button type="submit" inactive={submitting}>
          등록하고 계정정보 보내기
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

/**
 * 등록 결과 (Figma 14:1796 완료 · 14:1834 발송 실패). 결과가 보이면 결과 제목으로 포커스를 옮긴다.
 * 메일은 서버가 따로 보내 등록 직후는 보통 발송 대기(PENDING)이고, 실패는 나중에 학생 상세에서 보인다
 */
function CreatedResult({
  student,
  onMailStatus,
  onAgain,
}: {
  student: AdminStudentCreated;
  onMailStatus: (status: CredentialMailStatus) => void;
  onAgain: () => void;
}) {
  const { authRequest } = useAuth();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const failed = student.credentialMailStatus === 'FAILED';
  const email = maskEmail(student.schoolEmail);

  useEffect(() => {
    titleRef.current?.focus();
  }, [failed]);

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setResendError(null);
    try {
      const result = await resendStudentCredentials(authRequest, student.accountId);
      onMailStatus(result.credentialMailStatus);
    } catch (cause) {
      setResendError(
        cause instanceof ApiError && cause.code === ErrorCode.STUDENT_CREDENTIAL_MAIL_PENDING
          ? '계정정보를 보내고 있어요. 잠시 후 다시 시도해 주세요'
          : errorMessage(cause, '계정정보를 보내지 못했어요. 잠시 후 다시 시도해 주세요'),
      );
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = (
    <>
      <span aria-hidden>{email}</span>
      <span className="sr-only">{maskedReading(email)}</span>
    </>
  );

  return (
    <section className="mt-3 flex flex-col items-center gap-3 rounded-(--radius-lg) bg-(--color-bg-default) px-10 pt-12 pb-10">
      <span
        className={`mb-1 flex size-14 items-center justify-center rounded-full ${failed ? 'bg-(--color-bg-warning-subtle)' : 'bg-(--color-bg-muted)'}`}
      >
        <Icon name={failed ? 'result-warning' : 'result-success'} size={19.845} />
      </span>
      <h2 ref={titleRef} tabIndex={-1} className="typo-title text-(--color-text-primary)">
        {failed ? '등록은 됐지만 메일을 보내지 못했어요' : `${student.name} 학생을 등록했어요`}
      </h2>
      {failed ? (
        <>
          <p className="typo-body text-(--color-text-secondary)">
            이메일 주소를 확인하고 다시 보내 주세요
          </p>
          <Notice tone="warning" className="w-105">
            발송 실패 · {maskedEmail}
          </Notice>
        </>
      ) : (
        <p className="typo-body text-(--color-text-secondary)">
          {maskedEmail}로 계정정보를 보냈어요
        </p>
      )}
      {resendError && (
        <div className="w-105">
          <ErrorNotice message={resendError} />
        </div>
      )}
      <div className="mt-2 flex gap-2">
        {failed ? (
          // 목업의 "정보 수정"은 학생 상세(A-06)가 생기면 그 화면 링크로 붙인다
          <Button onClick={resend} inactive={resending}>
            계정정보 다시 보내기
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onAgain}>
              다른 학생 등록
            </Button>
            <ButtonLink href="/students">학생 목록으로</ButtonLink>
          </>
        )}
      </div>
      {failed && (
        <p className="typo-caption text-(--color-text-secondary)">
          나중에는 학생 상세에서 [계정정보 재발송]을 누르세요
        </p>
      )}
    </section>
  );
}
