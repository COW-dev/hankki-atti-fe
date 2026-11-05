'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ErrorNotice,
  None,
  Notice,
  StatusTag,
  Table,
  TableEmpty,
  TableRow,
  Toast,
} from '@hankki/ui';
import { AdminShell } from '@/components/layout/AdminShell';
import { formatVolunteerHours } from '@/features/matches/past-note';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { errorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/AuthProvider';
import { formatDotDate, parseLocalDateTime } from '@/lib/format/datetime';
import { ACCOUNT_STATUS_TAG } from '@/lib/labels/student';
import {
  activityAfter,
  activityHours,
  activityReason,
  activityTag,
  activityTiming,
  mealAt,
} from './activity';
import {
  activateHelper,
  fetchHelper,
  fetchHelperActivities,
  issueHelperTemporaryPassword,
  previewHelperDeactivation,
} from './api';
import { DeactivateHelperModal } from './DeactivateHelperModal';
import type { AdminHelperActivity, AdminHelperDetail } from './types';
import { VolunteerHoursModal } from './VolunteerHoursModal';

const RETRY_MESSAGE = '도우미 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요';

/**
 * AF-03 도우미 상세 (A-09~A-11, Figma 14:2316). 연락 정보는 도우미 본인만 고친다.
 * 임시 비밀번호·비활성화는 서버가 권한을 나누지 않아 두 권한 모두 보이고(D-07), 봉사시간 수정만 전체 권한이다.
 * 패널티는 센터가 이력을 보고 판단하며 자동으로 적용하는 기능은 두지 않는다
 */
export function HelperDetailScreen({ helperId }: { helperId: number }) {
  const { authRequest } = useAuth();
  const [helper, setHelper] = useState<AdminHelperDetail | null>(null);
  const [activities, setActivities] = useState<AdminHelperActivity[]>([]);
  // 비활성화 때 처리되지 못하고 남은 매칭·예비 건수. 확인에 실패하면 null — 0으로 두면 없는 것처럼 보인다
  const [remaining, setRemaining] = useState<number | null>(0);
  const [failure, setFailure] = useState<'notFound' | 'error' | null>(null);
  const [reload, setReload] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const refresh = useCallback(() => setReload((count) => count + 1), []);
  const editing = activities.find((activity) => activity.applicationId === editingId);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [detail, list] = await Promise.all([
        fetchHelper(authRequest, helperId),
        fetchHelperActivities(authRequest, helperId),
      ]);
      if (detail.status === 'ACTIVE') return { detail, list, left: 0 };
      const left = await previewHelperDeactivation(authRequest, helperId).then(
        (preview) => preview.targets.length,
        () => null,
      );
      return { detail, list, left };
    };
    load().then(
      ({ detail, list, left }) => {
        if (!alive) return;
        setFailure(null);
        setHelper(detail);
        setActivities(list);
        setRemaining(left);
      },
      (cause: unknown) => {
        if (!alive) return;
        setHelper(null);
        setFailure(
          cause instanceof ApiError && cause.code === ErrorCode.HELPER_NOT_FOUND
            ? 'notFound'
            : 'error',
        );
      },
    );
    return () => {
      alive = false;
    };
  }, [authRequest, helperId, reload]);

  // 표를 지우지 않고 값만 바꾼다 — 모달을 닫으면 포커스가 표의 "수정" 버튼으로 돌아와야 한다
  const reloadAfter = (message: string) => {
    setToast(message);
    refresh();
  };

  return (
    <AdminShell
      active="/helpers"
      title={helper?.name ?? '도우미 상세'}
      back={{ href: '/helpers', label: '도우미 목록' }}
      meta={() => helper && <HeaderTags helper={helper} />}
      action={() =>
        helper && (
          <HelperActions
            helper={helper}
            remaining={remaining ?? 0}
            onToast={setToast}
            onChanged={reloadAfter}
            onStale={refresh}
          />
        )
      }
    >
      {(me) => (
        <div className="mt-1.5 flex flex-col gap-3">
          {failure === 'notFound' && <Notice>도우미를 찾을 수 없어요</Notice>}
          {failure === 'error' && (
            <div className="flex flex-col items-start gap-2">
              <ErrorNotice message={RETRY_MESSAGE} />
              <Button variant="secondary" size="small" onClick={refresh}>
                다시 시도
              </Button>
            </div>
          )}
          {helper && (
            <>
              <p className="typo-caption text-(--color-text-secondary)">
                {helper.email} · 카톡 {helper.kakaoId} · {helper.phone} · 가입일{' '}
                {formatDotDate(parseLocalDateTime(helper.joinedAt))} · 연락 정보는 도우미가 직접
                고쳐요
              </p>
              {/* 남겨 두면 비활성 도우미가 매칭된 채 식사 시간이 온다. 목업에 없어 문구는 2026-11-05 사용자 확인 문구 */}
              {remaining !== null && remaining > 0 && (
                <Notice tone="warning">처리하지 못한 매칭·예비 {remaining}건이 남아 있어요</Notice>
              )}
              {remaining === null && (
                <div className="flex flex-col items-start gap-2">
                  <ErrorNotice message="남은 매칭·예비를 확인하지 못했어요. 잠시 후 다시 시도해 주세요" />
                  <Button variant="secondary" size="small" onClick={refresh}>
                    다시 확인
                  </Button>
                </div>
              )}
              <Summary summary={helper.summary} />
              <h2 className="typo-title text-(--color-text-primary)">활동 이력</h2>
              <ActivityTable
                activities={activities}
                editable={me.grade === 'FULL'}
                onEdit={setEditingId}
              />
              <p className="typo-caption text-(--color-text-secondary)">
                봉사시간 수정은 전체 권한만 할 수 있어요 · 패널티 적용 기능은 없어요(센터가 사후
                판단)
              </p>
            </>
          )}
          {editing && (
            <VolunteerHoursModal
              activity={editing}
              onClose={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                reloadAfter('봉사시간을 수정했어요');
              }}
              onStale={refresh}
            />
          )}
          <Toast message={toast} onClose={closeToast} />
        </div>
      )}
    </AdminShell>
  );
}

// Figma 14:2337 학번 · 14:2338 상태 · 14:2339 아띠
function HeaderTags({ helper }: { helper: AdminHelperDetail }) {
  const status = ACCOUNT_STATUS_TAG[helper.status];
  return (
    <>
      <p className="typo-body text-(--color-text-secondary)">{helper.studentNo}</p>
      <StatusTag tone={status.tone}>{status.label}</StatusTag>
      {helper.attiMember && <StatusTag tone="neutral">아띠 (자기신고)</StatusTag>}
    </>
  );
}

// Figma 14:2341·14:2342. 비활성 계정은 임시 비밀번호를 써도 로그인이 막혀 있어 다시 활성화만 둔다
function HelperActions({
  helper,
  remaining,
  onToast,
  onChanged,
  onStale,
}: {
  helper: AdminHelperDetail;
  remaining: number;
  onToast: (message: string) => void;
  onChanged: (message: string) => void;
  onStale: () => void;
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
      const code = cause instanceof ApiError ? cause.code : null;
      if (code === ErrorCode.HELPER_ALREADY_ACTIVE) {
        onChanged('이미 활성 상태인 계정이에요');
      } else if (code === ErrorCode.HELPER_INACTIVE) {
        // 다른 관리자가 먼저 비활성화했다
        setError('비활성화된 도우미예요. 다시 활성화한 뒤 보내 주세요');
        onStale();
      } else {
        setError(errorMessage(cause, fallback));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {helper.status === 'ACTIVE' ? (
          <>
            <Button
              variant="secondary"
              size="small"
              inactive={busy}
              onClick={() =>
                run(async () => {
                  await issueHelperTemporaryPassword(authRequest, helper.helperId);
                  onToast('임시 비밀번호를 보냈어요');
                }, '임시 비밀번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요')
              }
            >
              임시 비밀번호 발송
            </Button>
            <Button
              variant="danger"
              size="small"
              inactive={busy}
              onClick={() => setDeactivating(true)}
            >
              계정 비활성화
            </Button>
          </>
        ) : (
          <>
            {remaining > 0 && (
              <Button
                variant="danger"
                size="small"
                inactive={busy}
                onClick={() => setDeactivating(true)}
              >
                남은 {remaining}건 정리
              </Button>
            )}
            <Button
              variant="secondary"
              size="small"
              inactive={busy}
              onClick={() =>
                run(async () => {
                  await activateHelper(authRequest, helper.helperId);
                  onChanged('계정을 다시 활성화했어요');
                }, '계정을 활성화하지 못했어요. 잠시 후 다시 시도해 주세요')
              }
            >
              다시 활성화
            </Button>
          </>
        )}
      </div>
      {error && <ErrorNotice message={error} />}
      {deactivating && (
        <DeactivateHelperModal
          helper={helper}
          onClose={() => setDeactivating(false)}
          onDone={(message) => {
            setDeactivating(false);
            onChanged(message);
          }}
          onPartial={onStale}
        />
      )}
    </div>
  );
}

// Figma 14:2344 요약 숫자. 색은 보조이고 뜻은 라벨이 전달한다
function Summary({ summary }: { summary: AdminHelperDetail['summary'] }) {
  const items = [
    { label: '매칭', value: `${summary.matchedCount}건`, color: 'text-(--color-text-primary)' },
    {
      label: '이용 완료',
      value: `${summary.completedCount}건`,
      color: 'text-(--color-text-primary)',
    },
    {
      label: '봉사시간 합계',
      value: formatVolunteerHours(summary.volunteerHours),
      color: 'text-(--color-text-primary)',
    },
    { label: '취소', value: `${summary.canceledCount}건`, color: 'text-(--color-text-warning)' },
    { label: '노쇼 신고', value: `${summary.noShowCount}건`, color: 'text-(--color-text-danger)' },
  ];
  return (
    <dl className="flex gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-1 flex-col gap-1 rounded-(--radius-lg) bg-(--color-bg-default) px-5 py-4"
        >
          <dt className="typo-caption-strong text-(--color-text-secondary)">{item.label}</dt>
          <dd className={`typo-display ${item.color}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Cell({ value }: { value: string | null }) {
  return <>{value ?? <None />}</>;
}

// Figma 14:2361 활동 이력 표 (최근 식사부터). 열 폭은 Figma 값
function ActivityTable({
  activities,
  editable,
  onEdit,
}: {
  activities: AdminHelperActivity[];
  editable: boolean;
  onEdit: (applicationId: number) => void;
}) {
  return (
    <Table
      caption="활동 이력"
      columns={
        <>
          <th scope="col" className="w-40 pl-5">
            식사 일시
          </th>
          <th scope="col" className="w-20">
            학생
          </th>
          <th scope="col" className="w-37.5">
            결과
          </th>
          <th scope="col" className="w-50">
            봉사시간
          </th>
          <th scope="col" className="w-55">
            사유
          </th>
          <th scope="col" className="w-30">
            취소 시점
          </th>
          <th scope="col" className="pr-5">
            이후 처리
          </th>
        </>
      }
    >
      {activities.map((activity) => {
        const tag = activityTag(activity.status);
        return (
          <TableRow key={activity.applicationId}>
            <th scope="row" className="typo-body-strong pl-5">
              {mealAt(activity.startAt)}
            </th>
            <td className="truncate">{activity.studentName}</td>
            <td>
              <StatusTag tone={tag.tone}>{tag.label}</StatusTag>
            </td>
            <td>
              <div className="flex items-center gap-1.5">
                <Cell value={activityHours(activity)} />
                {activity.volunteerHourChanges.length > 0 && (
                  <span className="typo-caption text-(--color-text-secondary)">수정됨</span>
                )}
                {/* 목업은 이용 완료 행에만 둔다. 서버는 상태를 막지 않아 화면이 막는다 */}
                {editable && activity.status === 'COMPLETED' && (
                  <button
                    type="button"
                    aria-label={`${mealAt(activity.startAt)} ${activity.studentName} 봉사시간 수정`}
                    onClick={() => onEdit(activity.applicationId)}
                    className="typo-caption-strong min-h-(--control-height) text-(--color-text-brand) underline"
                  >
                    수정
                  </button>
                )}
              </div>
            </td>
            <td className="truncate">
              <Cell value={activityReason(activity)} />
            </td>
            <td>
              <Cell value={activityTiming(activity)} />
            </td>
            <td className="pr-5">
              <Cell value={activityAfter(activity)} />
            </td>
          </TableRow>
        );
      })}
      {activities.length === 0 && <TableEmpty colSpan={7}>활동 이력이 없어요</TableEmpty>}
    </Table>
  );
}
