'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import { TopBarView } from '@/components/layout/TopBarView';
import { NotificationPanel } from './NotificationPanel';
import { notificationPath } from './notification-target';
import type { AppNotification } from './types';
import { useNotifications } from './useNotifications';

/**
 * 벨이 있는 상단 바 (U-08·U-09, 명세 §2.3). 벨 → 비모달 알림 패널, 뒤 화면은 어둡게만 한다.
 * 패널을 열면 제목으로 포커스를 옮기고, Esc·바깥을 누르면 닫고 벨로 돌려보낸다.
 * 새 알림·모두 읽음 안내는 화면에 하나뿐인 이 polite 영역에서 읽는다.
 */
export function NotificationTopBar({
  title,
  back,
  logo,
}: {
  title: string;
  back?: boolean;
  logo?: boolean;
}) {
  const notifications = useNotifications(true);
  const { open, close } = notifications;
  const router = useRouter();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      buttonRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  // 포커스가 패널·벨 밖으로 나가면 닫는다. 패널 아래 본문은 덮여 있어 그대로 두면 포커스가 가려진다 (KWCAG 포커스 가림 방지).
  // 포커스는 사용자가 옮긴 곳에 둔다
  useEffect(() => {
    if (!open) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelAreaRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [open, close]);

  const closeAndReturn = () => {
    close();
    buttonRef.current?.focus();
  };

  const select = (item: AppNotification) => {
    notifications.markRead(item);
    const path = notificationPath(item);
    close();
    // 지금 보고 있는 화면이면 새로 그려 최신 상태를 받는다 (매칭 현황은 들어올 때 승격 모달을 연다)
    if (window.location.pathname === path) window.location.reload();
    else router.push(path);
  };

  return (
    <TopBarView
      title={title}
      back={back}
      logo={logo}
      bell
      unreadCount={notifications.unreadCount ?? 0}
      notificationExpanded={open}
      onNotificationClick={notifications.toggle}
      notificationButtonRef={buttonRef}
      notificationPanelId={panelId}
    >
      {open && (
        <div ref={panelAreaRef} className="absolute inset-x-0 top-full z-10">
          <div
            aria-hidden
            onClick={closeAndReturn}
            className="absolute inset-x-0 top-0 h-dvh bg-(--color-bg-overlay)/50"
          />
          <NotificationPanel
            id={panelId}
            headingRef={headingRef}
            list={notifications.list}
            now={notifications.listedAt}
            markingAll={notifications.markingAll}
            loadingMore={notifications.loadingMore}
            actionError={notifications.actionError}
            onReadAll={() => void notifications.markAllRead()}
            onRetry={() => void notifications.reload()}
            onLoadMore={() => void notifications.loadMore()}
            onSelect={select}
          />
        </div>
      )}
      <p role="status" className="sr-only">
        {notifications.announcement && (
          <span key={notifications.announcement.id}>{notifications.announcement.text}</span>
        )}
      </p>
    </TopBarView>
  );
}
