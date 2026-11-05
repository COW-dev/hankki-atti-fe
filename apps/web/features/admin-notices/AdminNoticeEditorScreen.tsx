'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, ButtonLink, ErrorNotice, Notice } from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAuth } from '@/lib/auth/AuthProvider';
import { AdminNoticeForm } from './AdminNoticeForm';
import {
  createNotice,
  fetchAdminNotice,
  isNoticeGone,
  noticeLoadFailureMessage,
  updateNotice,
} from './api';
import { DeleteNoticeModal } from './DeleteNoticeModal';
import { EMPTY_NOTICE_FORM } from './notice-form';
import type { AdminNoticeDetail } from './types';

/**
 * AF-04 공지 작성·수정 (A-12, Figma 14:2573). 서버가 전체 권한만 받아 제한 권한에는 안내만 보인다.
 * 저장·삭제하면 목록으로 돌아간다
 */
export function AdminNoticeEditorScreen({ noticeId }: { noticeId?: number }) {
  return (
    <AdminShell
      active="/notices"
      title={noticeId === undefined ? '공지 작성' : '공지 수정'}
      back={{ href: '/notices', label: '공지 목록' }}
    >
      {(me) =>
        me.grade !== 'FULL' ? (
          <div className="mt-3">
            <Notice>전체 권한 관리자만 공지를 쓰고 고칠 수 있어요</Notice>
          </div>
        ) : noticeId === undefined ? (
          <NoticeCreate />
        ) : (
          <NoticeEdit noticeId={noticeId} />
        )
      }
    </AdminShell>
  );
}

function NoticeCreate() {
  const { authRequest } = useAuth();
  const router = useRouter();
  return (
    <AdminNoticeForm
      initial={EMPTY_NOTICE_FORM}
      onSubmit={async (request) => {
        await createNotice(authRequest, request);
        router.push('/notices');
      }}
    />
  );
}

function NoticeEdit({ noticeId }: { noticeId: number }) {
  const { authRequest } = useAuth();
  const router = useRouter();
  const [notice, setNotice] = useState<AdminNoticeDetail | null>(null);
  const [failure, setFailure] = useState<{ message: string; gone: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAdminNotice(authRequest, noticeId).then(
      (detail) => {
        if (!alive) return;
        setFailure(null);
        setNotice(detail);
      },
      (cause: unknown) => {
        if (alive) {
          setFailure({ message: noticeLoadFailureMessage(cause), gone: isNoticeGone(cause) });
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [authRequest, noticeId, retry]);

  if (failure) {
    return (
      <div className="mt-3 flex flex-col items-start gap-2">
        <ErrorNotice message={failure.message} />
        {failure.gone ? (
          <ButtonLink href="/notices" variant="secondary" size="small">
            공지 목록으로
          </ButtonLink>
        ) : (
          <Button variant="secondary" size="small" onClick={() => setRetry((count) => count + 1)}>
            다시 시도
          </Button>
        )}
      </div>
    );
  }
  if (!notice) return null;
  return (
    <>
      <AdminNoticeForm
        initial={notice}
        onSubmit={async (request) => {
          await updateNotice(authRequest, noticeId, request);
          router.push('/notices');
        }}
        onDelete={() => setDeleting(true)}
      />
      {deleting && (
        <DeleteNoticeModal
          notice={notice}
          onClose={() => setDeleting(false)}
          onDone={() => router.push('/notices')}
        />
      )}
    </>
  );
}
