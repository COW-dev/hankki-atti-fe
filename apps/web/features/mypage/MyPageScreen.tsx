'use client';

import { Block, Button, Notice, Toast } from '@hankki/ui';
import { useCallback, useEffect, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { PageShell } from '@/components/layout/PageShell';
import { HelperTabBar, StudentTabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { passwordChanged } from '@/features/auth/password-changed';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ContactSection } from './ContactSection';
import { ProfileSection } from './ProfileSection';
import { SettingsSection } from './SettingsSection';
import type { MyProfile } from './types';
import { useMyProfile } from './useMyProfile';

export type MyPageReader = 'STUDENT' | 'HELPER';

// F-05 마이페이지. 장애학생(L, Figma 14:954)은 조회만, 도우미(M, Figma 14:1192)는 연락 정보를 고칠 수 있다
export function MyPageScreen({ reader }: { reader: MyPageReader }) {
  const { logout } = useAuth();
  const { state, reload, setProfile } = useMyProfile();
  const [toast, setToast] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);
  // 처음 그릴 때 한 번만 읽는다 — 표시를 지운 뒤 다시 그려져도 토스트 타이머가 취소되지 않게
  const [hasPasswordChanged] = useState(() => passwordChanged.peek());

  useEffect(() => {
    if (!hasPasswordChanged) return;
    passwordChanged.clear();
    // live 영역이 먼저 그려진 뒤 문구를 넣어야 스크린리더가 읽는다. 문구는 목업에 없어 임시로 둔다
    const timer = setTimeout(() => setToast('비밀번호를 바꿨어요'));
    return () => clearTimeout(timer);
  }, [hasPasswordChanged]);

  const handleContactSaved = (profile: MyProfile) => {
    setProfile(profile);
    setToast('저장했어요');
  };

  const handleLogout = async () => {
    setLeaving(true);
    await logout();
    // router로 옮기면 로그아웃을 본 화면 가드의 /login 이동과 겹친다. 메모리의 로그인 상태도 함께 비우도록 새로 연다
    window.location.replace('/');
  };

  return (
    <PageShell
      size={reader === 'STUDENT' ? 'L' : 'M'}
      topBar={<TopBar title="마이페이지" logo bell />}
      footer={<Footer withTabBar />}
      tabBar={
        reader === 'STUDENT' ? (
          <StudentTabBar active="/mypage" />
        ) : (
          <HelperTabBar active="/mypage" />
        )
      }
    >
      <div className="flex flex-col gap-2.5">
        {state.status === 'failed' && (
          <Block gap="md">
            <Notice type="error" message="내 정보를 불러오지 못했어요" />
            <Button variant="secondary" onClick={() => void reload()} className="w-full">
              다시 시도
            </Button>
          </Block>
        )}
        {state.status === 'ready' && (
          <>
            <ProfileSection profile={state.profile} />
            {state.profile.helper && (
              <ContactSection profile={state.profile} onSaved={handleContactSaved} />
            )}
            <SettingsSection
              profile={state.profile}
              onProfileChange={setProfile}
              onToast={setToast}
            />
          </>
        )}
        {state.status !== 'loading' && (
          <Block>
            <div className="flex w-full justify-center">
              <Button
                variant="secondary"
                size="small"
                inactive={leaving}
                onClick={() => void handleLogout()}
              >
                로그아웃
              </Button>
            </div>
          </Block>
        )}
      </div>
      <Toast message={toast} onClose={closeToast} withTabBar />
    </PageShell>
  );
}
