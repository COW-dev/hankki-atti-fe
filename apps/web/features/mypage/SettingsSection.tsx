'use client';

import { Block, Toggle } from '@hankki/ui';
import { Icon } from '@hankki/icons';
import Link from 'next/link';
import { useId, useState, useSyncExternalStore } from 'react';
import { textSizeStore } from '@/lib/accessibility/text-size';
import { useAuth } from '@/lib/auth/AuthProvider';
import { updateSmsConsent } from './api';
import type { MyProfile } from './types';

const ROW = 'flex w-full items-center gap-3 border-t border-(--color-border-default)';

/**
 * F-05 설정 (Figma 14:973).
 * 접근성 모드는 상단 토글과 같은 값이다 — 기기 저장은 textSizeStore, 계정 저장은 AccessibilitySync가 맡는다.
 * 문자 알림은 목업에 없지만 문자가 주 알림 채널이고 동의를 바꿀 곳이 여기뿐이라 넣었다. 문구는 임시다.
 */
export function SettingsSection({
  profile,
  onProfileChange,
  onToast,
}: {
  profile: MyProfile;
  onProfileChange: (profile: MyProfile) => void;
  onToast: (message: string) => void;
}) {
  const { authRequest } = useAuth();
  const accessibilityMode = useSyncExternalStore(
    textSizeStore.subscribe,
    textSizeStore.getSnapshot,
    textSizeStore.getServerSnapshot,
  );
  const [savingSms, setSavingSms] = useState(false);
  const smsGuideId = useId();

  const handleSmsChange = async (consent: boolean) => {
    setSavingSms(true);
    try {
      onProfileChange(await updateSmsConsent(authRequest, consent));
      onToast(consent ? '문자 알림을 켰어요' : '문자 알림을 껐어요');
    } catch {
      onToast('저장하지 못했어요. 잠시 후 다시 시도해 주세요');
    } finally {
      setSavingSms(false);
    }
  };

  return (
    <Block>
      <div className="flex w-full flex-col">
        <div className="flex min-h-14 w-full items-center gap-3 py-1">
          <p className="typo-body min-w-px flex-1 text-(--color-text-primary)">접근성 모드</p>
          <Toggle
            label="접근성 모드"
            checked={accessibilityMode}
            onChange={(next) => textSizeStore.setByUser(next)}
          />
        </div>
        <div className={`${ROW} min-h-14 py-1`}>
          <div className="flex min-w-px flex-1 flex-col">
            <p className="typo-body text-(--color-text-primary)">문자 알림</p>
            <p id={smsGuideId} className="typo-caption text-(--color-text-secondary)">
              끄면 메일과 앱 알림으로만 받아요
            </p>
          </div>
          <Toggle
            label="문자 알림"
            aria-describedby={smsGuideId}
            checked={profile.smsConsent}
            inactive={savingSms}
            onChange={(next) => void handleSmsChange(next)}
          />
        </div>
        <Link href="/mypage/password" className={`${ROW} min-h-(--control-height) py-3.5`}>
          <span className="typo-body min-w-px flex-1 text-(--color-text-primary)">
            비밀번호 변경
          </span>
          <Icon name="chevron-right" />
        </Link>
      </div>
    </Block>
  );
}
