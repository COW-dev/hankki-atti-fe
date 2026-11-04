'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button,
  ButtonLink,
  ErrorNotice,
  Modal,
  None,
  Notice,
  StatusTag,
  TabNav,
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
import type { AdminMe } from '@/lib/auth/useSessionGuard';
import {
  formatDotDate,
  formatDotMonthDay,
  formatDotMonthDayWeekday,
  formatTime,
  parseLocalDateTime,
} from '@/lib/format/datetime';
import { adminRequestStatusTags } from '@/lib/labels/help-request';
import { ACCOUNT_STATUS_TAG, DISABILITY_TYPE_LABEL } from '@/lib/labels/student';
import {
  activateStudent,
  deactivateStudent,
  fetchStudentHelpRequests,
  fetchStudentHistories,
  fetchStudentInfo,
  previewStudentDeactivation,
  resendStudentCredentials,
} from './api';
import {
  HISTORY_TYPE_TAG,
  historyAfter,
  historyReason,
  historyTiming,
  promotionText,
} from './history';
import type {
  AdminStudentDeactivationPreview,
  AdminStudentHeader,
  AdminStudentHelpRequest,
  AdminStudentHistory,
  AdminStudentInfo,
  CredentialMailStatus,
} from './types';

export type StudentDetailTab = 'info' | 'requests' | 'histories';

type Loaded =
  | { tab: 'info'; info: AdminStudentInfo }
  | { tab: 'requests'; helpRequests: AdminStudentHelpRequest[] }
  | { tab: 'histories'; histories: AdminStudentHistory[] };

const CREDENTIAL_MAIL_LABEL: Record<CredentialMailStatus, string> = {
  PENDING: '발송 대기',
  SENT: '발송 완료',
  FAILED: '발송 실패',
};

const RETRY_MESSAGE = '학생 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요';

/**
 * AF-02 장애학생 상세 (A-06·A-07, Figma 14:1852 정보 · 14:1932 매칭현황 · 14:2041 취소·노쇼 이력).
 * 정보 탭·수정·재발송·비활성화는 전체 권한만 — 제한 권한이 정보 탭으로 오면 서버 403을 보고 매칭현황으로 보낸다.
 * 패널티는 센터가 이력을 보고 판단하며 자동으로 적용하는 기능은 두지 않는다
 */
export function StudentDetailScreen({
  accountId,
  tab,
}: {
  accountId: number;
  tab: StudentDetailTab;
}) {
  const { authRequest } = useAuth();
  const router = useRouter();
  const base = `/students/${accountId}`;
  const [header, setHeader] = useState<AdminStudentHeader | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failure, setFailure] = useState<'notFound' | 'error' | null>(null);
  const [reload, setReload] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let alive = true;
    const load = async (): Promise<{ header: AdminStudentHeader; loaded: Loaded }> => {
      if (tab === 'info') {
        const info = await fetchStudentInfo(authRequest, accountId);
        return { header: info, loaded: { tab, info } };
      }
      if (tab === 'requests') {
        const result = await fetchStudentHelpRequests(authRequest, accountId);
        return { header: result.student, loaded: { tab, helpRequests: result.helpRequests } };
      }
      const result = await fetchStudentHistories(authRequest, accountId);
      return { header: result.student, loaded: { tab, histories: result.histories } };
    };
    load().then(
      (result) => {
        if (!alive) return;
        setFailure(null);
        setHeader(result.header);
        setLoaded(result.loaded);
      },
      (cause: unknown) => {
        if (!alive) return;
        if (cause instanceof ApiError && cause.code === ErrorCode.ACCESS_DENIED) {
          router.replace(`${base}/requests`);
          return;
        }
        setLoaded(null);
        setFailure(
          cause instanceof ApiError && cause.code === ErrorCode.STUDENT_NOT_FOUND
            ? 'notFound'
            : 'error',
        );
      },
    );
    return () => {
      alive = false;
    };
  }, [authRequest, accountId, tab, reload, router, base]);

  const reloadAfter = (status: AdminStudentHeader['status'], message: string) => {
    setHeader((current) => current && { ...current, status });
    setToast(message);
    // 비활성화로 취소된 신청·이력이 표에 보이게 다시 불러온다
    setReload((count) => count + 1);
  };

  return (
    <AdminShell
      active="/students"
      title={header?.name ?? '학생 상세'}
      back={{ href: '/students', label: '학생 목록' }}
      meta={() => header && <HeaderTags header={header} />}
      action={(me) =>
        me.grade === 'FULL' &&
        header && (
          <StudentActions
            header={header}
            onResent={(status) => {
              setToast('계정정보를 다시 보냈어요');
              setLoaded((current) =>
                current?.tab === 'info'
                  ? { ...current, info: { ...current.info, credentialMailStatus: status } }
                  : current,
              );
            }}
            onStatusChanged={reloadAfter}
          />
        )
      }
    >
      {(me) => (
        <div className="mt-3 flex flex-col gap-3">
          <DetailTabs base={base} active={tab} me={me} />
          {failure === 'notFound' && <Notice>학생을 찾을 수 없어요</Notice>}
          {failure === 'error' && (
            <div className="flex flex-col items-start gap-2">
              <ErrorNotice message={RETRY_MESSAGE} />
              <Button
                variant="secondary"
                size="small"
                onClick={() => setReload((count) => count + 1)}
              >
                다시 시도
              </Button>
            </div>
          )}
          {loaded?.tab === 'info' && <InfoTab info={loaded.info} />}
          {loaded?.tab === 'requests' && <RequestsTab helpRequests={loaded.helpRequests} />}
          {loaded?.tab === 'histories' && <HistoriesTab histories={loaded.histories} />}
          <Toast message={toast} onClose={closeToast} />
        </div>
      )}
    </AdminShell>
  );
}

// Figma 14:1874 상태 · 14:1875 장애 유형 (전체 권한만 온다)
function HeaderTags({ header }: { header: AdminStudentHeader }) {
  const status = ACCOUNT_STATUS_TAG[header.status];
  return (
    <>
      <p className="typo-body text-(--color-text-secondary)">{header.studentNo}</p>
      <StatusTag tone={status.tone}>{status.label}</StatusTag>
      {header.disabilityType && (
        <StatusTag tone="neutral">{DISABILITY_TYPE_LABEL[header.disabilityType]}</StatusTag>
      )}
    </>
  );
}

const TABS: { tab: StudentDetailTab; path: string; label: string }[] = [
  { tab: 'info', path: '', label: '정보' },
  { tab: 'requests', path: '/requests', label: '매칭현황' },
  { tab: 'histories', path: '/histories', label: '취소·노쇼 이력' },
];

// Figma 14:1880 탭
function DetailTabs({ base, active, me }: { base: string; active: StudentDetailTab; me: AdminMe }) {
  const tabs = me.grade === 'FULL' ? TABS : TABS.filter((item) => item.tab !== 'info');
  return (
    <TabNav
      label="학생 상세 보기"
      items={tabs.map((item) => ({ href: `${base}${item.path}`, label: item.label }))}
      current={`${base}${TABS.find((item) => item.tab === active)?.path ?? ''}`}
    />
  );
}

// Figma 14:1877~14:1879. 비활성 계정은 비활성화 대신 다시 활성화를 둔다
function StudentActions({
  header,
  onResent,
  onStatusChanged,
}: {
  header: AdminStudentHeader;
  onResent: (status: CredentialMailStatus) => void;
  onStatusChanged: (status: AdminStudentHeader['status'], message: string) => void;
}) {
  const { authRequest } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const run = async (action: () => Promise<void>, fallback: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.code === ErrorCode.STUDENT_CREDENTIAL_MAIL_PENDING
          ? '계정정보를 보내고 있어요. 잠시 후 다시 시도해 주세요'
          : errorMessage(cause, fallback),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <ButtonLink href={`/students/${header.id}/edit`} variant="secondary" size="small">
          정보 수정
        </ButtonLink>
        <Button
          variant="secondary"
          size="small"
          inactive={busy}
          onClick={() =>
            run(async () => {
              const result = await resendStudentCredentials(authRequest, header.id);
              onResent(result.credentialMailStatus);
            }, '계정정보를 보내지 못했어요. 잠시 후 다시 시도해 주세요')
          }
        >
          계정정보 재발송
        </Button>
        {header.status === 'ACTIVE' ? (
          <Button
            variant="danger"
            size="small"
            inactive={busy}
            onClick={() => setDeactivating(true)}
          >
            계정 비활성화
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="small"
            inactive={busy}
            onClick={() =>
              run(async () => {
                const result = await activateStudent(authRequest, header.id);
                onStatusChanged(result.status, '계정을 다시 활성화했어요');
              }, '계정을 활성화하지 못했어요. 잠시 후 다시 시도해 주세요')
            }
          >
            다시 활성화
          </Button>
        )}
      </div>
      {error && <ErrorNotice message={error} />}
      {deactivating && (
        <DeactivateStudentModal
          header={header}
          onClose={() => setDeactivating(false)}
          onDone={(status, message) => {
            setDeactivating(false);
            onStatusChanged(status, message);
          }}
        />
      )}
    </div>
  );
}

/**
 * 비활성화 확인 (Figma 14:2805). 열리면 영향 건수를 미리 받는다. 파괴적 버튼에 자동 포커스하지 않는다 (Modal이 제목에 둔다).
 * 목업은 취소될 신청 목록까지 보이지만 미리보기 API가 건수만 줘 건수만 안내한다
 */
function DeactivateStudentModal({
  header,
  onClose,
  onDone,
}: {
  header: AdminStudentHeader;
  onClose: () => void;
  onDone: (status: AdminStudentHeader['status'], message: string) => void;
}) {
  const { authRequest } = useAuth();
  const [preview, setPreview] = useState<AdminStudentDeactivationPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 부모가 렌더마다 새 함수를 넘겨도 미리보기를 한 번만 부르게 최신 콜백만 기억한다
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    let alive = true;
    previewStudentDeactivation(authRequest, header.id).then(
      (result) => {
        if (!alive) return;
        // 다른 관리자가 먼저 비활성화했으면 확인할 것이 없다
        if (result.alreadyInactive) onDoneRef.current('INACTIVE', '이미 비활성화된 계정이에요');
        else setPreview(result);
      },
      (cause: unknown) => {
        if (alive)
          setError(errorMessage(cause, '영향을 확인하지 못했어요. 잠시 후 다시 시도해 주세요'));
      },
    );
    return () => {
      alive = false;
    };
  }, [authRequest, header.id]);

  const confirm = async () => {
    if (!preview || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await deactivateStudent(authRequest, header.id);
      onDone(result.status, '계정을 비활성화했어요');
    } catch (cause) {
      setError(errorMessage(cause, '계정을 비활성화하지 못했어요. 잠시 후 다시 시도해 주세요'));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`${header.name} 학생 계정을 비활성화할까요?`}
      description='로그인할 수 없고, 로그인하면 "사용이 중지된 계정" 안내가 나가요'
      onClose={onClose}
      className="max-w-120!"
      actions={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="small" onClick={onClose}>
            취소
          </Button>
          <Button variant="danger" size="small" inactive={!preview || submitting} onClick={confirm}>
            비활성화
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {preview && (
          <Notice tone="warning">
            {preview.activeRequestCount > 0
              ? `진행 중인 신청 ${preview.activeRequestCount}건이 취소돼요`
              : '취소될 진행 중인 신청은 없어요'}
          </Notice>
        )}
        {error && <ErrorNotice message={error} />}
        <p className="typo-caption">
          지원한 도우미에게는 &quot;학생 취소&quot;처럼 알림이 가요(패널티 없음). [다시 활성화]로
          되돌릴 수 있고 지난 이력은 남아요
        </p>
      </div>
    </Modal>
  );
}

// Figma 14:1887 정보 (dl, 2열)
function InfoTab({ info }: { info: AdminStudentInfo }) {
  const items: [string, ReactNode][] = [
    ['이름', info.name],
    ['학번', info.studentNo],
    ['장애 유형', DISABILITY_TYPE_LABEL[info.disabilityType]],
    ['전화번호', info.phone],
    ['카톡 ID', info.kakaoId],
    ['학교 이메일', info.schoolEmail],
    ['로그인 아이디', info.loginId],
    ['접근성 모드 기본값', info.accessibilityMode ? '켜짐 (큰 글씨 + 읽어 주기)' : '꺼짐'],
    ['등록일', formatDotDate(parseLocalDateTime(info.registeredAt))],
    ['계정정보', CREDENTIAL_MAIL_LABEL[info.credentialMailStatus]],
  ];
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-(--radius-lg) bg-(--color-bg-default)">
      {items.map(([term, value], index) => (
        <InfoItem key={term} term={term} first={index < 2}>
          {value}
        </InfoItem>
      ))}
      <InfoItem term="특이사항 메모" wide>
        {info.specialNote ?? <None />}
      </InfoItem>
    </dl>
  );
}

function InfoItem({
  term,
  first = false,
  wide = false,
  children,
}: {
  term: string;
  first?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-4 px-6 py-4 ${first ? '' : 'border-t border-(--color-border-default)'} ${wide ? 'col-span-2' : ''}`}
    >
      <dt className="typo-caption-strong w-35 shrink-0 text-(--color-text-secondary)">{term}</dt>
      <dd className="typo-body min-w-0 break-words text-(--color-text-primary)">{children}</dd>
    </div>
  );
}

function mealAt(value: string): string {
  const date = parseLocalDateTime(value);
  return `${formatDotMonthDayWeekday(date)} ${formatTime(date)}`;
}

function shortAt(value: string): string {
  const date = parseLocalDateTime(value);
  return `${formatDotMonthDay(date)} ${formatTime(date)}`;
}

function Cell({ value }: { value: string | null }) {
  return <>{value ?? <None />}</>;
}

// Figma 14:1967 매칭현황 표 (최근 식사부터, 조회 전용). 열 폭은 Figma 값
function RequestsTab({ helpRequests }: { helpRequests: AdminStudentHelpRequest[] }) {
  return (
    <>
      <Table
        caption="매칭현황"
        columns={
          <>
            <th scope="col" className="w-45 pl-5">
              식사 일시
            </th>
            <th scope="col" className="w-55">
              상태
            </th>
            <th scope="col" className="w-37.5">
              매칭된 도우미
            </th>
            <th scope="col" className="w-42.5">
              예비 승격
            </th>
            <th scope="col" className="w-37.5">
              신청 시각
            </th>
            <th scope="col" className="pr-5 text-right">
              매칭 시각
            </th>
          </>
        }
      >
        {helpRequests.map((request) => (
          <TableRow key={request.id}>
            <th scope="row" className="typo-body-strong pl-5">
              {mealAt(request.startAt)}
            </th>
            <td>
              <span className="flex gap-1">
                {adminRequestStatusTags(request).map((tag) => (
                  <StatusTag key={tag.label} tone={tag.tone}>
                    {tag.label}
                  </StatusTag>
                ))}
              </span>
            </td>
            <td className="truncate">
              <Cell value={request.helper?.name ?? null} />
            </td>
            <td>
              <Cell value={promotionText(request)} />
            </td>
            <td>{shortAt(request.requestedAt)}</td>
            <td className="pr-5 text-right">
              <Cell value={request.firstMatchedAt && shortAt(request.firstMatchedAt)} />
            </td>
          </TableRow>
        ))}
        {helpRequests.length === 0 && <TableEmpty colSpan={6}>신청이 없어요</TableEmpty>}
      </Table>
      <p className="typo-caption text-(--color-text-secondary)">
        조회 전용이에요. 상태는 아이콘 + 글자로 표시해요
      </p>
    </>
  );
}

// Figma 14:2076 취소·노쇼 이력 표. 열 폭은 Figma 값
function HistoriesTab({ histories }: { histories: AdminStudentHistory[] }) {
  return (
    <>
      <Table
        caption="취소·노쇼 이력"
        columns={
          <>
            <th scope="col" className="w-42.5 pl-5">
              식사 일시
            </th>
            <th scope="col" className="w-37.5">
              구분
            </th>
            <th scope="col" className="w-25">
              도우미
            </th>
            <th scope="col" className="w-70">
              사유
            </th>
            <th scope="col" className="w-32.5">
              취소 시점
            </th>
            <th scope="col" className="pr-5">
              이후 처리
            </th>
          </>
        }
      >
        {histories.map((history) => {
          const tag = HISTORY_TYPE_TAG[history.type];
          return (
            <TableRow key={`${history.type}-${history.helpRequestId}-${history.occurredAt}`}>
              <th scope="row" className="typo-body-strong pl-5">
                {mealAt(history.startAt)}
              </th>
              <td>
                <StatusTag tone={tag.tone}>{tag.label}</StatusTag>
              </td>
              <td className="truncate">
                <Cell value={history.helper?.name ?? null} />
              </td>
              <td className="truncate">
                <Cell value={historyReason(history)} />
              </td>
              <td>
                <Cell value={historyTiming(history)} />
              </td>
              <td className="pr-5">
                <Cell value={historyAfter(history)} />
              </td>
            </TableRow>
          );
        })}
        {histories.length === 0 && <TableEmpty colSpan={6}>취소·노쇼 이력이 없어요</TableEmpty>}
      </Table>
      <p className="typo-caption text-(--color-text-secondary)">
        패널티는 센터가 이 이력을 보고 판단해요 · 인정 사유 목록은 센터 확인 전 예시예요
      </p>
    </>
  );
}
