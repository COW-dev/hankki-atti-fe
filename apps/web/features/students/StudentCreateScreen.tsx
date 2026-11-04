'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@hankki/icons';
import { Button, ButtonLink, ErrorNotice, Notice } from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createStudent, resendStudentCredentials, studentCreateFailureOf } from './api';
import { EMPTY_STUDENT_CREATE_FORM } from './create-form';
import { maskEmail, maskedReading } from './masked';
import { StudentForm } from './StudentForm';
import type { AdminStudentCreated, CredentialMailStatus } from './types';

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
  const { authRequest } = useAuth();
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
  return (
    <StudentForm
      initial={EMPTY_STUDENT_CREATE_FORM}
      focusFirst={again}
      submitLabel="등록하고 계정정보 보내기"
      onSubmit={async (form) => setCreated(await createStudent(authRequest, form))}
      failureOf={studentCreateFailureOf}
    />
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
