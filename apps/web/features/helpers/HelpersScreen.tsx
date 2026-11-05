'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@hankki/icons';
import {
  Button,
  ErrorNotice,
  InputCompact,
  Pagination,
  StatusTag,
  Table,
  TableEmpty,
  TableRow,
  TableRowLink,
} from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { maskedReading } from '@/features/students/masked';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { formatDotMonthDay, parseLocalDateTime } from '@/lib/format/datetime';
import { ACCOUNT_STATUS_TAG, type AccountStatus } from '@/lib/labels/student';
import { fetchHelpers } from './api';
import type { AdminHelperPage, AdminHelperSummary, HelperFilter } from './types';

const STATUS_OPTIONS = [
  { value: '', label: '상태: 전체' },
  ...(Object.keys(ACCOUNT_STATUS_TAG) as AccountStatus[]).map((status) => ({
    value: status,
    label: `상태: ${ACCOUNT_STATUS_TAG[status].label}`,
  })),
];

const ATTI_OPTIONS = [
  { value: '', label: '아띠 소속: 전체' },
  { value: 'true', label: '아띠 소속: 예' },
  { value: 'false', label: '아띠 소속: 아니오' },
];

const INITIAL_FILTER: HelperFilter = { q: '', status: '', attiMember: '', page: 0 };

/**
 * AF-03 도우미 목록 (A-08, Figma 14:2149). 도우미는 직접 가입해 바로 쓰므로 등록·승인 동작을 두지 않는다.
 * 전체·제한 권한의 응답이 같아 권한별 분기가 없다.
 */
export function HelpersScreen() {
  return (
    <AdminShell active="/helpers" title="도우미 관리">
      <HelperList />
    </AdminShell>
  );
}

function HelperList() {
  const { authRequest } = useAuth();
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AdminHelperPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchHelpers(authRequest, filter)
      .then((page) => {
        if (ignore) return;
        setResult(page);
        setError(null);
      })
      .catch((cause) => {
        if (ignore) return;
        // 이전 조건의 결과를 새 조건 아래 남기지 않는다
        setResult(null);
        setError(errorMessage(cause, '도우미 목록을 불러오지 못했어요'));
      });
    return () => {
      ignore = true;
    };
  }, [authRequest, filter, retry]);

  // 조건이 바뀌면 첫 페이지부터 본다
  const changeFilter = (next: Partial<HelperFilter>) =>
    setFilter((current) => ({ ...current, ...next, page: 0 }));

  const search = (event: FormEvent) => {
    event.preventDefault();
    changeFilter({ q: query });
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
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
        <InputCompact
          kind="select"
          label="상태"
          className="w-32.5"
          options={STATUS_OPTIONS}
          value={filter.status}
          onChange={(event) =>
            changeFilter({ status: event.target.value as HelperFilter['status'] })
          }
        />
        <InputCompact
          kind="select"
          label="아띠 소속"
          className="w-37.5"
          options={ATTI_OPTIONS}
          value={filter.attiMember}
          onChange={(event) =>
            changeFilter({ attiMember: event.target.value as HelperFilter['attiMember'] })
          }
        />
        <div className="flex-1" />
        {/* 조건을 바꾸면 결과 인원을 정중하게 알린다 */}
        <p role="status" className="typo-caption text-(--color-text-secondary)">
          {result && `가입 승인 없이 바로 이용 · 총 ${result.totalCount}명`}
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

      <Table
        hidden={!result}
        caption="도우미 목록"
        columns={
          <>
            {/* 열 폭은 Figma 14:2175 값 */}
            <th scope="col" className="w-30 pl-5">
              이름
            </th>
            <th scope="col" className="w-27.5">
              학번
            </th>
            <th scope="col" className="w-42.5">
              이메일
            </th>
            <th scope="col" className="w-32.5">
              전화번호
            </th>
            <th scope="col" className="w-30">
              카톡 ID
            </th>
            <th scope="col" className="w-30">
              아띠 소속
            </th>
            <th scope="col" className="w-20">
              가입일
            </th>
            <th scope="col" className="w-22.5">
              상태
            </th>
            {/* 목업은 봉사시간이지만 목록 API는 이용 완료 건수만 준다. 건수를 시간으로 보이면 수정된 시간과 어긋난다 */}
            <th scope="col" className="w-22.5">
              이용 완료
            </th>
            <td aria-hidden />
          </>
        }
      >
        {result?.helpers.map((helper) => (
          <HelperRow key={helper.helperId} helper={helper} />
        ))}
        {result?.helpers.length === 0 && (
          <TableEmpty colSpan={10}>조건에 맞는 도우미가 없어요</TableEmpty>
        )}
      </Table>

      {result && result.totalPages > 0 && (
        <Pagination
          label="도우미 목록 페이지"
          page={result.page}
          totalPages={result.totalPages}
          onChange={(page) => setFilter((current) => ({ ...current, page }))}
        />
      )}
    </div>
  );
}

function HelperRow({ helper }: { helper: AdminHelperSummary }) {
  const status = ACCOUNT_STATUS_TAG[helper.status];
  return (
    <TableRow linked>
      <th scope="row" className="typo-body-strong pl-5">
        <TableRowLink href={`/helpers/${helper.helperId}`} aria-label={`${helper.name} 상세`}>
          {helper.name}
        </TableRowLink>
      </th>
      <td>{helper.studentNo}</td>
      <MaskedCell value={helper.maskedEmail} />
      <MaskedCell value={helper.maskedPhone} />
      <MaskedCell value={helper.maskedKakaoId} />
      <td>{helper.attiMember ? '예 (자기신고)' : '아니오'}</td>
      <td>{formatDotMonthDay(parseLocalDateTime(helper.joinedAt))}</td>
      <td>
        <StatusTag tone={status.tone}>{status.label}</StatusTag>
      </td>
      <td>{helper.completedCount}건</td>
      <td aria-hidden className="pr-5">
        <span className="typo-caption-strong flex items-center justify-end gap-1 text-(--color-text-brand)">
          상세
          <Icon name="detail-chevron" size={4.5} />
        </span>
      </td>
    </TableRow>
  );
}

// 가린 연락처는 "별표"를 읽지 않게 보이는 글자를 숨기고 읽을 문장을 따로 둔다
function MaskedCell({ value }: { value: string }) {
  return (
    <td className="truncate">
      <span aria-hidden>{value}</span>
      <span className="sr-only">{maskedReading(value)}</span>
    </td>
  );
}
