'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchMyProfile } from './api';
import type { MyProfile } from './types';

export type MyProfileState =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; profile: MyProfile };

function settle(promise: Promise<MyProfile>): Promise<MyProfileState> {
  return promise.then(
    (profile): MyProfileState => ({ status: 'ready', profile }),
    (): MyProfileState => ({ status: 'failed' }),
  );
}

/** F-05 내 정보. 저장 API가 바뀐 정보를 돌려주므로 다시 조회하지 않고 setProfile로 반영한다. */
export function useMyProfile() {
  const { authRequest } = useAuth();
  const [state, setState] = useState<MyProfileState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void settle(fetchMyProfile(authRequest)).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [authRequest]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    return settle(fetchMyProfile(authRequest)).then(setState);
  }, [authRequest]);

  const setProfile = useCallback(
    (profile: MyProfile) => setState({ status: 'ready', profile }),
    [],
  );

  return { state, reload, setProfile };
}
