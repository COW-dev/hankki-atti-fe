'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@hankki/ui';
import { readAloudStore } from '@/lib/accessibility/read-aloud';
import { textSizeStore } from '@/lib/accessibility/text-size';

const UNSUPPORTED_ID = 'read-aloud-unsupported';

/**
 * 화면 읽어 주기 바 (U-07, Figma 14:901). 접근성 모드("큰 글씨와 음성 읽기")일 때만 상단 바 아래에 보인다.
 * 켜도 바로 읽지 않는다 — 스크린리더와 소리가 겹치지 않도록 사용자가 직접 시작한다.
 * 화면 이동·접근성 모드 끔·화면을 떠날 때 읽던 것을 멈춘다.
 */
export function ReadAloudBar() {
  const pathname = usePathname();
  const modeOn = useSyncExternalStore(
    textSizeStore.subscribe,
    textSizeStore.getSnapshot,
    textSizeStore.getServerSnapshot,
  );
  const state = useSyncExternalStore(
    readAloudStore.subscribe,
    readAloudStore.getSnapshot,
    readAloudStore.getServerSnapshot,
  );

  useEffect(() => () => readAloudStore.stop(), [pathname]);
  useEffect(() => {
    if (!modeOn) readAloudStore.stop();
  }, [modeOn]);

  if (!modeOn) return null;
  const unsupported = state === 'unsupported';

  return (
    <div
      role="region"
      aria-label="화면 읽어 주기"
      className="flex w-full items-center gap-2.5 border-b border-(--color-border-default) bg-(--color-bg-default) px-5 py-2.5"
    >
      <button
        type="button"
        aria-disabled={unsupported || undefined}
        aria-describedby={unsupported ? UNSUPPORTED_ID : undefined}
        onClick={() => readAloudStore.start()}
        className={`typo-label min-h-(--control-height) min-w-px flex-1 text-left ${unsupported ? 'cursor-not-allowed text-(--color-text-disabled)' : 'cursor-pointer text-(--color-text-brand)'}`}
      >
        <span aria-hidden>▶ </span>화면 읽어 주기
      </button>
      {/* 문구는 목업에 없어 임시로 둔다 */}
      {unsupported && (
        <span id={UNSUPPORTED_ID} className="sr-only">
          이 기기에서는 읽어 주기를 쓸 수 없어요
        </span>
      )}
      <Button
        variant="secondary"
        size="small"
        inactive={state !== 'reading'}
        onClick={() => readAloudStore.stop()}
      >
        정지
      </Button>
      <p role="status" className="sr-only">
        {state === 'reading' ? '읽는 중이에요' : ''}
      </p>
    </div>
  );
}
