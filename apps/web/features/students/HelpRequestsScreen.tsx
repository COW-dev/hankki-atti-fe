'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Button,
  ErrorNotice,
  InputCompact,
  None,
  Notice,
  StatusTag,
  Table,
  TableEmpty,
  TableRow,
  Toast,
} from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  addDays,
  formatDotMonthDay,
  formatDotMonthDayWeekday,
  formatIsoDate,
  formatTime,
  parseLocalDateTime,
} from '@/lib/format/datetime';
import {
  HELP_REQUEST_STATUS,
  adminRequestStatusTags,
  type HelpRequestStatus,
} from '@/lib/labels/help-request';
import { DISABILITY_TYPE_LABEL } from '@/lib/labels/student';
import { fetchHelpRequestSummary, fetchHelpRequests } from './api';
import { PENDING_SCREEN_MESSAGE } from './StudentsScreen';
import { StudentTabs } from './StudentTabs';
import type { AdminHelpRequest, AdminHelpRequestSummary, HelpRequestFilter } from './types';

const STATUS_OPTIONS = [
  { value: '', label: '상태: 전체' },
  ...(Object.keys(HELP_REQUEST_STATUS) as HelpRequestStatus[]).map((status) => ({
    value: status,
    label: `상태: ${HELP_REQUEST_STATUS[status].label}`,
  })),
];

// 서버 기본과 같은 오늘~7일 뒤 (식사 날짜 기준)
function initialFilter(): HelpRequestFilter {
  const today = new Date();
  return { from: formatIsoDate(today), to: formatIsoDate(addDays(today, 7)), status: '', q: '' };
}

type Result = { requests: AdminHelpRequest[]; summary: AdminHelpRequestSummary };

// Figma 14:1580~14:1592. 실패·노쇼 숫자만 색을 바꾼다 — 이름이 함께 있어 색만으로 구분하지 않는다
const SUMMARY_ITEMS: { key: keyof AdminHelpRequestSummary; label: string; color: string }[] = [
  { key: 'total', label: '신청', color: 'text-(--color-text-primary)' },
  { key: 'matched', label: '매칭 완료', color: 'text-(--color-text-primary)' },
  { key: 'recruiting', label: '모집 중', color: 'text-(--color-text-primary)' },
  { key: 'failed', label: '매칭 실패', color: 'text-(--color-text-warning)' },
  { key: 'noShow', label: '노쇼', color: 'text-(--color-text-danger)' },
];

/**
 * AF-02 전체 신청 현황 (A-04, Figma 14:1547). 조회만 하고 매칭은 바꾸지 않는다.
 * 제한 권한은 장애 유형 열이 없다 — 서버도 해당 필드를 주지 않는다 (목업은 전체 권한 1장)
 */
export function HelpRequestsScreen() {
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const showPending = () => setToast(PENDING_SCREEN_MESSAGE);

  return (
    <AdminShell
      active="/students"
      title="장애학생 관리"
      // 등록 화면(A-05)이 생기면 ButtonLink(/students/new)로 바꾼다
      action={(me) =>
        me.grade === 'FULL' && (
          <Button size="small" onClick={showPending}>
            + 학생 등록
          </Button>
        )
      }
    >
      {(me) => (
        <>
          <HelpRequestList full={me.grade === 'FULL'} onPending={showPending} />
          <Toast message={toast} onClose={closeToast} />
        </>
      )}
    </AdminShell>
  );
}

function HelpRequestList({ full, onPending }: { full: boolean; onPending: () => void }) {
  const { authRequest } = useAuth();
  const [filter, setFilter] = useState(initialFilter);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetchHelpRequests(authRequest, filter),
      fetchHelpRequestSummary(authRequest, filter.from, filter.to),
    ])
      .then(([requests, summary]) => {
        if (ignore) return;
        setResult({ requests, summary });
        setError(null);
      })
      .catch((cause) => {
        if (ignore) return;
        // 이전 조건의 결과를 새 조건 아래 남기지 않는다
        setResult(null);
        setError(
          cause instanceof ApiError && cause.code === ErrorCode.HELP_REQUEST_INVALID_DATE_RANGE
            ? '기간은 31일 안에서 골라 주세요'
            : errorMessage(cause, '신청 현황을 불러오지 못했어요'),
        );
      });
    return () => {
      ignore = true;
    };
  }, [authRequest, filter, retry]);

  // 날짜를 지우는 입력은 무시한다 — 기간은 늘 있어야 한다
  const changeDate = (key: 'from' | 'to', value: string) => {
    if (value) setFilter((current) => ({ ...current, [key]: value }));
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    setFilter((current) => ({ ...current, q: query }));
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <StudentTabs active="/students/requests" />

      {!full && <Notice>제한 권한이라 장애 유형 같은 민감 정보는 보이지 않아요</Notice>}

      <div className="flex items-center gap-2">
        <InputCompact
          type="date"
          label="시작 날짜"
          className="w-35"
          value={filter.from}
          onChange={(event) => changeDate('from', event.target.value)}
        />
        <InputCompact
          type="date"
          label="끝 날짜"
          className="w-35"
          min={filter.from}
          value={filter.to}
          onChange={(event) => changeDate('to', event.target.value)}
        />
        <InputCompact
          kind="select"
          label="상태"
          className="w-32.5"
          options={STATUS_OPTIONS}
          value={filter.status}
          onChange={(event) =>
            setFilter((current) => ({
              ...current,
              status: event.target.value as HelpRequestFilter['status'],
            }))
          }
        />
        <form role="search" onSubmit={search} className="w-60">
          <InputCompact
            label="학생 이름·학번 검색"
            type="search"
            enterKeyHint="search"
            placeholder="학생 이름·학번 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        <div className="flex-1" />
        <p className="typo-caption text-(--color-text-secondary)">
          조회 전용 · 매칭은 바꾸지 않아요
        </p>
        {/* 조건을 바꾸면 결과 건수를 정중하게 알린다 */}
        <p role="status" className="sr-only">
          {result && `${result.requests.length}건 표시`}
        </p>
      </div>

      {error && (
        <div className="flex flex-col items-start gap-2">
          <ErrorNotice message={error} />
          <Button variant="secondary" size="small" onClick={() => setRetry((count) => count + 1)}>
            다시 시도
          </Button>
        </div>
      )}

      {result && (
        <>
          <dl className="flex gap-3">
            {SUMMARY_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex flex-1 flex-col gap-1 rounded-(--radius-lg) bg-(--color-bg-default) px-5 py-4"
              >
                <dt className="typo-caption-strong text-(--color-text-secondary)">{item.label}</dt>
                <dd className={`typo-display ${item.color}`}>{result.summary[item.key]}건</dd>
              </div>
            ))}
          </dl>

          <Table
            caption="전체 신청 현황"
            columns={
              <>
                {/* 열 폭은 Figma 14:1596 값 */}
                <th scope="col" className="w-40 pl-5">
                  식사 일시
                </th>
                <th scope="col" className="w-25">
                  학생
                </th>
                {full && (
                  <th scope="col" className="w-27.5">
                    장애 유형
                  </th>
                )}
                <th scope="col" className="w-52.5">
                  상태
                </th>
                <th scope="col" className="w-30">
                  매칭된 도우미
                </th>
                <th scope="col" className="w-17.5">
                  예비
                </th>
                <th scope="col" className="w-32.5">
                  신청 시각
                </th>
                <th scope="col" className="pr-5 text-right">
                  매칭 시각
                </th>
              </>
            }
          >
            {result.requests.map((request) => (
              <RequestRow key={request.id} request={request} full={full} onPending={onPending} />
            ))}
            {result.requests.length === 0 && (
              <TableEmpty colSpan={full ? 8 : 7}>조건에 맞는 신청이 없어요</TableEmpty>
            )}
          </Table>

          <p className="typo-caption text-(--color-text-secondary)">
            행을 누르면 학생 상세 › 매칭현황으로 가요
          </p>
        </>
      )}
    </div>
  );
}

// 예비 인원은 지원을 받는 동안(모집 중·매칭 완료)에만 의미가 있다 (Figma 14:1625·14:1677)
const WAITING_SHOWN: HelpRequestStatus[] = ['RECRUITING', 'MATCHED'];

function RequestRow({
  request,
  full,
  onPending,
}: {
  request: AdminHelpRequest;
  full: boolean;
  onPending: () => void;
}) {
  const startAt = parseLocalDateTime(request.startAt);
  const mealAt = `${formatDotMonthDayWeekday(startAt)} ${formatTime(startAt)}`;
  const requestedAt = parseLocalDateTime(request.requestedAt);
  const matchedAt = request.firstMatchedAt ? parseLocalDateTime(request.firstMatchedAt) : null;
  return (
    <TableRow linked>
      <th scope="row" className="typo-body-strong pl-5">
        <button
          type="button"
          onClick={onPending}
          // 같은 학생이 여러 줄이라 식사 일시로 구분한다
          aria-label={`${request.student.name} ${mealAt} 상세`}
          className="text-left after:absolute after:inset-0 after:content-['']"
        >
          {mealAt}
        </button>
      </th>
      <td className="truncate">{request.student.name}</td>
      {full && (
        <td>
          {request.student.disabilityType
            ? DISABILITY_TYPE_LABEL[request.student.disabilityType]
            : ''}
        </td>
      )}
      <td>
        <span className="flex gap-1">
          {adminRequestStatusTags(request).map((tag) => (
            <StatusTag key={tag.label} tone={tag.tone}>
              {tag.label}
            </StatusTag>
          ))}
        </span>
      </td>
      <td className="truncate">{request.helper ? request.helper.name : <None />}</td>
      <td>{WAITING_SHOWN.includes(request.status) ? `${request.waitingCount}명` : <None />}</td>
      <td>{`${formatDotMonthDay(requestedAt)} ${formatTime(requestedAt)}`}</td>
      <td className="pr-5 text-right">
        {matchedAt ? (
          `${formatDotMonthDay(matchedAt)} ${formatTime(matchedAt)} (${request.minutesToMatch}분)`
        ) : (
          <None />
        )}
      </td>
    </TableRow>
  );
}
