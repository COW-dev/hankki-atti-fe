'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, ErrorNotice, Notice } from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchStudentInfo, updateStudent } from './api';
import type { StudentCreateForm } from './create-form';
import { StudentForm } from './StudentForm';

/**
 * AF-02 장애학생 정보 수정 (A-06). 목업이 없어 등록 입력 폼(Figma 14:1723)을 그대로 쓴다 (2026-11-04 사용자 확인).
 * 전체 권한만 쓴다. 저장하면 상세 정보 탭으로 돌아간다
 */
export function StudentEditScreen({ accountId }: { accountId: number }) {
  const back = `/students/${accountId}`;
  return (
    <AdminShell active="/students" title="학생 정보 수정" back={{ href: back, label: '학생 상세' }}>
      {(me) =>
        me.grade === 'FULL' ? (
          <StudentEdit accountId={accountId} back={back} />
        ) : (
          <div className="mt-3">
            <Notice>전체 권한 관리자만 학생 정보를 수정할 수 있어요</Notice>
          </div>
        )
      }
    </AdminShell>
  );
}

function StudentEdit({ accountId, back }: { accountId: number; back: string }) {
  const { authRequest } = useAuth();
  const router = useRouter();
  const [initial, setInitial] = useState<StudentCreateForm | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchStudentInfo(authRequest, accountId).then(
      (info) => {
        if (!alive) return;
        setFailure(null);
        setInitial({
          name: info.name,
          studentNo: info.studentNo,
          phone: info.phone,
          kakaoId: info.kakaoId,
          schoolEmail: info.schoolEmail,
          disabilityType: info.disabilityType,
          specialNote: info.specialNote ?? '',
        });
      },
      (cause: unknown) => {
        if (!alive) return;
        setFailure(
          cause instanceof ApiError && cause.code === ErrorCode.STUDENT_NOT_FOUND
            ? '학생을 찾을 수 없어요'
            : errorMessage(cause, '학생 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요'),
        );
      },
    );
    return () => {
      alive = false;
    };
  }, [authRequest, accountId, retry]);

  if (failure) {
    return (
      <div className="mt-3 flex flex-col items-start gap-2">
        <ErrorNotice message={failure} />
        <Button variant="secondary" size="small" onClick={() => setRetry((count) => count + 1)}>
          다시 시도
        </Button>
      </div>
    );
  }
  if (!initial) return null;
  return (
    <StudentForm
      initial={initial}
      studentNoLocked
      submitLabel="저장"
      cancelHref={back}
      onSubmit={async (form) => {
        await updateStudent(authRequest, accountId, form);
        router.push(back);
      }}
      failureOf={(cause) => ({
        message: errorMessage(cause, '정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요'),
      })}
    />
  );
}
