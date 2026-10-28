'use client';

import { Toast } from '@hankki/ui';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { ErrorCode } from '@/lib/api/error-codes';
import { useAuth } from '@/lib/auth/AuthProvider';
import { subdomainOf } from '@/lib/site';
import { loginEvents } from './login-event';
import { textSizeStore } from './text-size';

const SAVE_FAILED = '계정에 저장하지 못했어요. 이 기기에서만 바뀌어요';

function isPasswordChangeRequired(error: unknown): boolean {
  return error instanceof ApiError && error.code === ErrorCode.PASSWORD_CHANGE_REQUIRED;
}

/**
 * 접근성 모드 계정 동기화 (U-06, 명세 §2.2). 루트 레이아웃의 AuthProvider 안에 하나만 둔다.
 * - 로그인 전: 기기 설정만 (A11yToggle이 이미 적용)
 * - 로그인하면 계정 설정을 받아 우선 적용 → 다른 기기·관리자가 등록 때 켠 기본값이 반영된다
 * - 사용자가 토글을 바꾸면 로그인 중일 때 계정에도 저장한다. 실패하면 토스트로 알리고 기기 설정은 그대로 둔다
 * 첫 로그인(센터 발급 계정)은 비밀번호를 바꾸기 전까지 /api/me가 403이라, 계정 값을 적용할 때까지 화면이 바뀔 때마다 다시 받는다.
 * 관리자 도메인에는 토글이 없고 관리자 토큰은 /api/me를 쓸 수 없어 아무것도 하지 않는다.
 */
export function AccessibilitySync() {
  const { status, authRequest } = useAuth();
  const pathname = usePathname();
  const [toast, setToast] = useState<string | null>(null);
  // 로그인할 때마다 올라간다 — 계정이 바뀌면 처음부터 다시 맞춘다
  const [loginCount, setLoginCount] = useState(0);
  const closeToast = useCallback(() => setToast(null), []);
  // 콜백·구독 안에서 최신 값을 읽는다 (구독은 한 번만 건다)
  const latest = useRef({ status, authRequest });
  // 이번 로그인에서 계정 값을 받아 처리했는지
  const applied = useRef(false);
  // 이번 로그인에서 사용자가 토글을 바꿨으면 늦게 온 계정 값으로 덮지 않는다
  const userChanged = useRef(false);
  // 비밀번호 변경 전이라 계정에 저장하지 못한 토글 값이 있으면, 계정을 쓸 수 있게 됐을 때 기기 값을 저장한다
  const saveBlocked = useRef(false);
  // 계정 저장은 한 번에 하나만 보내고, 그사이 바뀐 값은 끝난 뒤 마지막 값만 보낸다 (응답 순서가 뒤집히지 않게)
  const saving = useRef<{ inFlight: boolean; wanted: boolean | null }>({
    inFlight: false,
    wanted: null,
  });

  useEffect(() => {
    latest.current = { status, authRequest };
  }, [status, authRequest]);

  useEffect(
    () =>
      loginEvents.subscribe(() => {
        applied.current = false;
        userChanged.current = false;
        saveBlocked.current = false;
        setLoginCount((count) => count + 1);
      }),
    [],
  );

  const save = useCallback(async () => {
    const state = saving.current;
    if (state.inFlight) return;
    state.inFlight = true;
    // 보내는 동안 바뀐 값이 있으면 끝난 뒤 그 마지막 값을 이어서 보낸다
    while (state.wanted !== null) {
      const value = state.wanted;
      state.wanted = null;
      try {
        await latest.current.authRequest('/api/me/settings', {
          method: 'PATCH',
          body: { accessibilityMode: value },
        });
      } catch (error) {
        // 비밀번호 변경 전 계정(S-PW 화면)은 계정에 저장할 수 없다 — 기기에 두고 나중에 맞춘다
        if (isPasswordChangeRequired(error)) saveBlocked.current = true;
        else setToast(SAVE_FAILED);
      }
    }
    state.inFlight = false;
  }, []);

  // 로그인 상태가 되면 계정 값을 적용한다. 토큰이 재발급돼도 다시 받지 않게 status·화면 이동·로그인 신호만 본다
  useEffect(() => {
    if (status !== 'authenticated') {
      applied.current = false;
      userChanged.current = false;
      saveBlocked.current = false;
      return;
    }
    if (applied.current || subdomainOf(window.location.host) === 'admin') return;
    let cancelled = false;
    latest.current
      .authRequest<{ accessibilityMode: boolean }>('/api/me')
      .then((me) => {
        if (cancelled) return;
        applied.current = true;
        if (!userChanged.current) {
          textSizeStore.applyAccount(me.accessibilityMode);
        } else if (saveBlocked.current) {
          // 비밀번호를 바꾸는 동안 고른 값을 이제 계정에 저장한다
          saveBlocked.current = false;
          saving.current.wanted = textSizeStore.getSnapshot();
          void save();
        }
      })
      .catch(() => {
        // 비밀번호 변경 필요(403)면 다음 화면 이동 때 다시 받는다. 로그인 만료는 화면 가드가 처리한다
      });
    return () => {
      cancelled = true;
    };
  }, [status, pathname, loginCount, save]);

  useEffect(
    () =>
      textSizeStore.onUserChange((large) => {
        userChanged.current = true;
        if (latest.current.status !== 'authenticated') return;
        if (subdomainOf(window.location.host) === 'admin') return;
        saving.current.wanted = large;
        void save();
      }),
    [save],
  );

  return <Toast message={toast} onClose={closeToast} withTabBar />;
}
