'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Icon } from '@hankki/icons';
import { ButtonLink, ErrorNotice, InputCompact, Notice, StatusTag } from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAuth } from '@/lib/auth/AuthProvider';
import { errorMessage } from '@/lib/api/error-message';
import { formatDotMonthDay, formatTime, parseLocalDateTime } from '@/lib/format/datetime';
import type { AdminGrade } from '@/lib/labels/admin';
import {
  ACCOUNT_STATUS_TAG,
  DISABILITY_TYPE_LABEL,
  type AccountStatus,
  type DisabilityType,
} from '@/lib/labels/student';
import { fetchStudents } from './api';
import { maskedReading } from './masked';
import type { AdminStudentPage, AdminStudentSummary, StudentFilter } from './types';

const STATUS_OPTIONS = [
  { value: '', label: '상태: 전체' },
  ...(Object.keys(ACCOUNT_STATUS_TAG) as AccountStatus[]).map((status) => ({
    value: status,
    label: `상태: ${ACCOUNT_STATUS_TAG[status].label}`,
  })),
];

const DISABILITY_OPTIONS = [
  { value: '', label: '장애 유형: 전체' },
  ...(Object.keys(DISABILITY_TYPE_LABEL) as DisabilityType[]).map((type) => ({
    value: type,
    label: `장애 유형: ${DISABILITY_TYPE_LABEL[type]}`,
  })),
];

const INITIAL_FILTER: StudentFilter = { q: '', status: '', disabilityType: '', page: 0 };

/**
 * AF-02 장애학생 목록 (A-03, Figma 14:1274 전체 권한 · 14:1435 제한 권한).
 * 제한 권한은 장애 유형 필터·열과 연락처 열, 등록 버튼이 없다 — 서버도 해당 필드를 주지 않는다.
 */
export function StudentsScreen() {
  return (
    <AdminShell
      active="/students"
      title="장애학생 관리"
      // 등록 화면은 A-05
      action={(me) =>
        me.grade === 'FULL' && (
          <ButtonLink href="/students/new" size="small">
            + 학생 등록
          </ButtonLink>
        )
      }
    >
      {(me) => <StudentList grade={me.grade} />}
    </AdminShell>
  );
}

function StudentList({ grade }: { grade: AdminGrade }) {
  const { authRequest } = useAuth();
  const full = grade === 'FULL';
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AdminStudentPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchStudents(authRequest, filter)
      .then((page) => {
        if (ignore) return;
        setResult(page);
        setError(null);
      })
      .catch((cause) => {
        if (!ignore) setError(errorMessage(cause, '학생 목록을 불러오지 못했어요'));
      });
    return () => {
      ignore = true;
    };
  }, [authRequest, filter]);

  // 조건이 바뀌면 첫 페이지부터 본다
  const changeFilter = (next: Partial<StudentFilter>) =>
    setFilter((current) => ({ ...current, ...next, page: 0 }));

  const search = (event: FormEvent) => {
    event.preventDefault();
    changeFilter({ q: query });
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <nav
        aria-label="장애학생 관리 보기"
        className="flex gap-6 border-b border-(--color-border-default)"
      >
        {/* 전체 신청 현황은 A-04에서 화면을 만든다 */}
        <TabLink href="/students" current>
          학생 목록
        </TabLink>
        <TabLink href="/students/requests">전체 신청 현황</TabLink>
      </nav>

      {!full && <Notice>제한 권한이라 장애 유형·연락처 같은 민감 정보는 보이지 않아요</Notice>}

      <div className="flex items-center gap-2">
        <form role="search" onSubmit={search} className="w-65">
          <InputCompact
            label="이름·학번 검색"
            type="search"
            enterKeyHint="search"
            placeholder="이름·학번 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        {full && (
          <InputCompact
            kind="select"
            label="장애 유형"
            className="w-42.5"
            options={DISABILITY_OPTIONS}
            value={filter.disabilityType}
            onChange={(event) =>
              changeFilter({
                disabilityType: event.target.value as StudentFilter['disabilityType'],
              })
            }
          />
        )}
        <InputCompact
          kind="select"
          label="상태"
          className="w-32.5"
          options={STATUS_OPTIONS}
          value={filter.status}
          onChange={(event) =>
            changeFilter({ status: event.target.value as StudentFilter['status'] })
          }
        />
        <div className="flex-1" />
        {/* 조건을 바꾸면 결과 인원을 정중하게 알린다 */}
        <p role="status" className="typo-caption text-(--color-text-secondary)">
          {result && `총 ${result.totalCount}명`}
        </p>
      </div>

      {error && <ErrorNotice message={error} />}

      <div className="overflow-hidden rounded-(--radius-lg) bg-(--color-bg-default)">
        <table className="w-full table-fixed text-left">
          <caption className="sr-only">장애학생 목록</caption>
          <thead className="typo-caption-strong bg-(--color-bg-muted) text-(--color-text-secondary)">
            <tr className="h-11 border-b border-(--color-border-default)">
              {/* 열 폭은 Figma 값 (전체 권한 14:1306 · 제한 권한 14:1466) */}
              <th scope="col" className={`pl-5 ${full ? 'w-30' : 'w-50'}`}>
                이름
              </th>
              <th scope="col" className={full ? 'w-25' : 'w-45'}>
                학번
              </th>
              {full && (
                <>
                  <th scope="col" className="w-27.5">
                    장애 유형
                  </th>
                  <th scope="col" className="w-47.5">
                    학교 이메일
                  </th>
                  <th scope="col" className="w-32.5">
                    전화번호
                  </th>
                  <th scope="col" className="w-27.5">
                    카톡 ID
                  </th>
                </>
              )}
              <th scope="col" className={full ? 'w-42.5' : 'w-55'}>
                상태
              </th>
              <th scope="col" className={full ? 'w-25' : 'w-45'}>
                최근 신청
              </th>
              <td aria-hidden />
            </tr>
          </thead>
          <tbody className="typo-body text-(--color-text-primary)">
            {result?.students.map((student) => (
              <StudentRow key={student.accountId} student={student} full={full} />
            ))}
            {result?.students.length === 0 && (
              <tr>
                <td colSpan={full ? 9 : 5} className="h-13.5 px-5 text-(--color-text-secondary)">
                  조건에 맞는 학생이 없어요
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result && result.totalPages > 0 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          onChange={(page) => setFilter((current) => ({ ...current, page }))}
        />
      )}
    </div>
  );
}

function TabLink({
  href,
  current = false,
  children,
}: {
  href: string;
  current?: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`typo-label -mb-px flex min-h-(--control-height) items-end px-0.5 pb-2.5 ${
        current
          ? 'border-b-2 border-(--color-bg-brand-strong) text-(--color-text-brand)'
          : 'text-(--color-text-secondary)'
      }`}
    >
      {children}
    </Link>
  );
}

function StudentRow({ student, full }: { student: AdminStudentSummary; full: boolean }) {
  const status = ACCOUNT_STATUS_TAG[student.status];
  const recent = student.recentRequestAt ? parseLocalDateTime(student.recentRequestAt) : null;
  return (
    // 행 전체를 누를 수 있게 이름 링크를 행 위로 넓힌다. 링크는 하나만 둬 Tab이 행마다 한 번 멈춘다
    <tr className="relative h-13.5 border-b border-(--color-border-default) last:border-b-0 hover:bg-(--color-bg-subtle)">
      <th scope="row" className="typo-body-strong pl-5">
        <Link
          href={`/students/${student.accountId}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {student.name}
          <span className="sr-only"> 상세</span>
        </Link>
      </th>
      <td>{student.studentNo}</td>
      {full && (
        <>
          <td>{student.disabilityType ? DISABILITY_TYPE_LABEL[student.disabilityType] : ''}</td>
          <MaskedCell value={student.schoolEmail} />
          <MaskedCell value={student.phone} />
          <MaskedCell value={student.kakaoId} />
        </>
      )}
      <td>
        <StatusTag tone={status.tone}>{status.label}</StatusTag>
      </td>
      <td>
        {recent ? (
          `${formatDotMonthDay(recent)} ${formatTime(recent)}`
        ) : (
          <>
            <span aria-hidden>–</span>
            <span className="sr-only">신청 없음</span>
          </>
        )}
      </td>
      <td aria-hidden className="pr-5">
        <span className="typo-caption-strong flex items-center justify-end gap-1 text-(--color-text-brand)">
          상세
          <Icon name="detail-chevron" size={4.5} />
        </span>
      </td>
    </tr>
  );
}

// 가린 연락처는 "별표"를 읽지 않게 보이는 글자를 숨기고 읽을 문장을 따로 둔다
function MaskedCell({ value }: { value?: string }) {
  if (!value) return <td />;
  return (
    <td className="truncate">
      <span aria-hidden>{value}</span>
      <span className="sr-only">{maskedReading(value)}</span>
    </td>
  );
}

// Figma 14:1424. 누르는 영역은 크기 모드 높이를 지킨다 (목업 현재 페이지 32 → control/height)
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const arrow =
    'typo-body flex size-(--control-height) items-center justify-center text-(--color-text-secondary) aria-disabled:text-(--color-text-disabled)';
  const move = (next: number) => {
    if (next >= 0 && next < totalPages && next !== page) onChange(next);
  };
  return (
    <nav aria-label="학생 목록 페이지" className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="이전 페이지"
        aria-disabled={page === 0 || undefined}
        onClick={() => move(page - 1)}
        className={arrow}
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1}페이지`}
          aria-current={index === page ? 'page' : undefined}
          onClick={() => move(index)}
          className={`typo-caption-strong flex size-(--control-height) items-center justify-center rounded-(--radius-sm) ${
            index === page
              ? 'bg-(--color-bg-brand-selected) text-(--color-text-brand)'
              : 'text-(--color-text-secondary)'
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        aria-disabled={page === totalPages - 1 || undefined}
        onClick={() => move(page + 1)}
        className={arrow}
      >
        ›
      </button>
    </nav>
  );
}
