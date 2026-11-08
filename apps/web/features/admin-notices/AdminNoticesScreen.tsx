'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonLink,
  ErrorNotice,
  None,
  Pagination,
  StatusTag,
  Table,
  TableEmpty,
  TableRow,
  Toast,
} from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { formatDotMonthDay, parseLocalDateTime } from '@/lib/format/datetime';
import { NOTICE_TARGET_LABEL } from '@/lib/labels/notice';
import { fetchAdminNotices } from './api';
import { DeleteNoticeModal } from './DeleteNoticeModal';
import type { AdminNoticePage, AdminNoticeSummary } from './types';

/**
 * AF-04 공지 목록 (A-12, Figma 14:2477). 조회는 모든 관리자가 하고,
 * 작성·수정·삭제는 서버가 전체 권한만 받아 제한 권한에는 동작을 그리지 않는다
 */
export function AdminNoticesScreen() {
  return (
    <AdminShell
      active="/notices"
      title="공지 관리"
      action={(me) =>
        me.grade === 'FULL' && (
          <ButtonLink href="/notices/new" size="small">
            + 새 공지
          </ButtonLink>
        )
      }
    >
      {(me) => <NoticeList canManage={me.grade === 'FULL'} />}
    </AdminShell>
  );
}

function NoticeList({ canManage }: { canManage: boolean }) {
  const { authRequest } = useAuth();
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<AdminNoticePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [deleting, setDeleting] = useState<AdminNoticeSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const tableRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const focusTable = useRef(false);

  useEffect(() => {
    let ignore = false;
    fetchAdminNotices(authRequest, page)
      .then((next) => {
        if (ignore) return;
        // 마지막 페이지의 마지막 공지가 지워지면 남은 마지막 페이지로 간다
        if (next.notices.length === 0 && next.totalPages > 0) {
          setPage(next.totalPages - 1);
          return;
        }
        setResult(next);
        setError(null);
      })
      .catch((cause) => {
        if (ignore) return;
        setResult(null);
        setError(errorMessage(cause, '공지 목록을 불러오지 못했어요'));
      });
    return () => {
      ignore = true;
    };
  }, [authRequest, page, reload]);

  // 삭제를 연 버튼이 행과 함께 사라지므로 포커스를 표로 옮긴다
  useEffect(() => {
    if ((!result && !error) || !focusTable.current) return;
    focusTable.current = false;
    if (error) errorRef.current?.querySelector('button')?.focus();
    else tableRef.current?.focus();
  }, [result, error]);

  return (
    <div className="mt-1.5 flex flex-col gap-3">
      <p className="typo-caption text-(--color-text-secondary)">고정 공지 먼저, 그다음 최신순</p>
      <p role="status" className="sr-only">
        {result && `총 ${result.totalCount}건`}
      </p>

      {error && (
        <div ref={errorRef} className="flex flex-col items-start gap-2">
          <ErrorNotice message={error} />
          <Button variant="secondary" size="small" onClick={() => setReload((count) => count + 1)}>
            다시 시도
          </Button>
        </div>
      )}

      <Table
        ref={tableRef}
        tabIndex={-1}
        hidden={!result}
        caption="공지 목록"
        columns={
          <>
            {/* 열 폭은 Figma 14:2499 값. 첫 열은 왼쪽 여백 20을 더했다 */}
            <th scope="col" className="w-110 pl-5">
              제목
            </th>
            <th scope="col" className="w-30">
              대상
            </th>
            <th scope="col" className="w-25">
              고정
            </th>
            <th scope="col" className="w-27.5">
              게시일
            </th>
            <th scope="col" className="w-27.5">
              수정일
            </th>
            {canManage && (
              <th scope="col">
                <span className="sr-only">동작</span>
              </th>
            )}
          </>
        }
      >
        {result?.notices.map((notice) => (
          <NoticeRow
            key={notice.noticeId}
            notice={notice}
            onDelete={canManage ? () => setDeleting(notice) : undefined}
          />
        ))}
        {result?.notices.length === 0 && (
          <TableEmpty colSpan={canManage ? 6 : 5}>등록된 공지가 없어요</TableEmpty>
        )}
      </Table>

      {result && result.totalPages > 0 && (
        <Pagination
          label="공지 목록 페이지"
          page={result.page}
          totalPages={result.totalPages}
          onChange={setPage}
        />
      )}

      {deleting && (
        <DeleteNoticeModal
          notice={deleting}
          onClose={() => setDeleting(null)}
          onDone={(message) => {
            setDeleting(null);
            setToast(message);
            focusTable.current = true;
            setReload((count) => count + 1);
          }}
        />
      )}
      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}

// 목업은 글자 링크지만 조작 영역은 크기 모드 높이를 지킨다
const ROW_ACTION_CLASS =
  'typo-caption-strong flex min-h-(--control-height) min-w-(--control-height) cursor-pointer items-center justify-center';

function NoticeRow({ notice, onDelete }: { notice: AdminNoticeSummary; onDelete?: () => void }) {
  return (
    <TableRow>
      <th scope="row" className="typo-body-strong truncate pl-5">
        {notice.title}
      </th>
      <td>{NOTICE_TARGET_LABEL[notice.target]}</td>
      <td>
        {notice.pinned ? <StatusTag tone="info">고정</StatusTag> : <None label="고정 안 함" />}
      </td>
      <td>{formatDotMonthDay(parseLocalDateTime(notice.publishedAt))}</td>
      <td>
        {notice.editedAt ? (
          formatDotMonthDay(parseLocalDateTime(notice.editedAt))
        ) : (
          <None label="수정 안 함" />
        )}
      </td>
      {onDelete && (
        <td className="pr-5">
          <div className="flex justify-end gap-1">
            <Link
              href={`/notices/${notice.noticeId}/edit`}
              aria-label={`${notice.title} 수정`}
              className={`${ROW_ACTION_CLASS} text-(--color-text-brand)`}
            >
              수정
            </Link>
            <button
              type="button"
              aria-label={`${notice.title} 삭제`}
              onClick={onDelete}
              className={`${ROW_ACTION_CLASS} text-(--color-text-danger)`}
            >
              삭제
            </button>
          </div>
        </td>
      )}
    </TableRow>
  );
}
