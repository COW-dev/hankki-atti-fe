'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Block, Button, Notice } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { StudentTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth } from '@/lib/auth/AuthProvider';
import { cancelRequest, reportNoShow, withdrawRequest } from './api';
import { CancelRequestModal } from './CancelRequestModal';
import { MyRequestsView } from './MyRequestsView';
import { NoShowReportModal } from './NoShowReportModal';
import type { MyHelpRequest } from './types';
import { useMyRequests } from './useMyRequests';

// 이미 상태가 바뀐 신청에 철회·취소·신고하면 목록을 다시 받는다 (매칭 취소는 식사 시작도 INVALID_STATUS로 온다)
function actionErrorMessage(error: unknown): { message: string; reload: boolean } {
  if (error instanceof ApiError) {
    if (error.code === ErrorCode.HELP_REQUEST_NOT_FOUND) {
      return { message: '신청을 찾을 수 없어요. 목록을 다시 불러올게요', reload: true };
    }
    if (error.code === ErrorCode.HELP_REQUEST_INVALID_STATUS) {
      return { message: '이미 상태가 바뀐 신청이에요. 목록을 다시 불러올게요', reload: true };
    }
    if (error.code === ErrorCode.HELP_REQUEST_NO_SHOW_PERIOD_EXPIRED) {
      return { message: '신고할 수 있는 기간(이용 후 24시간)이 지났어요', reload: false };
    }
    return { message: error.message, reload: false };
  }
  return { message: '잠시 후 다시 시도해 주세요', reload: false };
}

/**
 * F-02 내 신청 — 빈 상태 206:1281 · 목록 204:2804 · 취소 확인 모달 207:1856 · 노쇼 신고 모달 207:1921.
 * 역할 확인은 /requests 라우트가 하고, 여기는 장애학생으로 확인된 뒤에만 그린다.
 */
export function MyRequestsScreen() {
  const router = useRouter();
  const { authRequest } = useAuth();
  const { state, reload, replace } = useMyRequests(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MyHelpRequest | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  // 취소로 카드가 사라진 뒤 포커스를 섹션 제목으로 보낼 때마다 올린다
  const [focusKey, setFocusKey] = useState(0);
  const [noShowTarget, setNoShowTarget] = useState<MyHelpRequest | null>(null);
  const [noShowSubmitting, setNoShowSubmitting] = useState(false);
  const [noShowError, setNoShowError] = useState<string | null>(null);

  // 명세: 신청 철회는 확인 단계 없이 바로
  const handleWithdraw = async (request: MyHelpRequest) => {
    setWithdrawingId(request.id);
    setNotice(null);
    setError(null);
    try {
      replace(await withdrawRequest(authRequest, request.id));
      setNotice('신청을 철회했어요');
    } catch (caught) {
      const { message, reload: shouldReload } = actionErrorMessage(caught);
      setError(message);
      if (shouldReload) void reload();
    } finally {
      setWithdrawingId(null);
    }
  };

  const openCancel = (request: MyHelpRequest) => {
    setCancelError(null);
    setCancelTarget(request);
  };

  // 명세 "매칭 취소 (학생)": 확인 모달 뒤 바로 취소, 사유·패널티 없음. 404·409면 모달을 닫고 목록을 다시 받는다
  const handleCancel = async (request: MyHelpRequest) => {
    setCancelSubmitting(true);
    setCancelError(null);
    setNotice(null);
    setError(null);
    try {
      replace(await cancelRequest(authRequest, request.id));
      setCancelTarget(null);
      setNotice('취소됐어요. 도우미에게 알렸어요');
      setFocusKey((key) => key + 1);
    } catch (caught) {
      const { message, reload: shouldReload } = actionErrorMessage(caught);
      if (shouldReload) {
        setCancelTarget(null);
        setError(message);
        void reload();
      } else {
        setCancelError(message);
      }
    } finally {
      setCancelSubmitting(false);
    }
  };

  const openNoShow = (request: MyHelpRequest) => {
    setNoShowError(null);
    setNoShowTarget(request);
  };

  const handleReportNoShow = async (request: MyHelpRequest) => {
    setNoShowSubmitting(true);
    setNoShowError(null);
    try {
      replace(await reportNoShow(authRequest, request.id));
      setNoShowTarget(null);
      setNotice('노쇼로 신고했어요');
    } catch (caught) {
      const { message, reload: shouldReload } = actionErrorMessage(caught);
      setNoShowError(message);
      if (shouldReload) {
        setNoShowTarget(null);
        void reload();
      }
    } finally {
      setNoShowSubmitting(false);
    }
  };

  const isEmpty =
    state.status === 'ready' && state.data.upcoming.length === 0 && state.data.past.length === 0;

  return (
    <PageShell
      size="L"
      topBar={<TopBar title="내 신청" logo bell />}
      footer={<Footer withTabBar />}
      tabBar={<StudentTabBar active="/requests" />}
    >
      {state.status === 'error' && (
        <Block gap="md">
          <Notice tone="error">{state.message}</Notice>
          <Button variant="secondary" onClick={() => void reload()} className="w-full">
            다시 시도
          </Button>
        </Block>
      )}

      {isEmpty && (
        // F-02 내 신청 · 빈 상태 (Figma 206:1281)
        <Block>
          <div className="flex w-full flex-col items-center gap-2.5 pt-6 pb-2">
            <div className="flex size-14 items-center justify-center rounded-full bg-(--color-bg-muted)">
              <Icon name="list" />
            </div>
            <div className="h-0.5" />
            <h2 className="typo-title w-full text-center">아직 신청한 건이 없어요</h2>
            <p className="typo-body w-full text-center text-(--color-text-secondary)">
              날짜와 시간을 고르면 도우미가 지원해요
            </p>
          </div>
          <Button onClick={() => router.push('/requests/new')} className="w-full">
            + 도우미 신청하기
          </Button>
        </Block>
      )}

      {state.status === 'ready' && !isEmpty && (
        <MyRequestsView
          data={state.data}
          now={new Date()}
          notice={notice}
          error={error}
          withdrawingId={withdrawingId}
          cancelingId={cancelTarget && cancelSubmitting ? cancelTarget.id : null}
          focusKey={focusKey}
          onWithdraw={handleWithdraw}
          onCancel={openCancel}
          onReportNoShow={openNoShow}
        />
      )}

      <CancelRequestModal
        request={cancelTarget}
        submitting={cancelSubmitting}
        error={cancelError}
        onClose={() => setCancelTarget(null)}
        onSubmit={handleCancel}
      />

      <NoShowReportModal
        request={noShowTarget}
        submitting={noShowSubmitting}
        error={noShowError}
        onClose={() => setNoShowTarget(null)}
        onSubmit={handleReportNoShow}
      />
    </PageShell>
  );
}
