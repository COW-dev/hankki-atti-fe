'use client';

import { NotificationTopBar } from '@/features/notifications/NotificationTopBar';
import { TopBarView, type TopBarViewProps } from './TopBarView';

type TopBarProps = Pick<
  TopBarViewProps,
  | 'title'
  | 'back'
  | 'logo'
  | 'bell'
  | 'unreadCount'
  | 'notificationExpanded'
  | 'onNotificationClick'
>;

/**
 * 상단 바. 벨이 있으면 서버 알림(개수·패널)에 연결한다.
 * unreadCount를 직접 넘기면(Storybook 등) 연결하지 않고 그 값으로 그린다.
 */
export function TopBar(props: TopBarProps) {
  if (props.bell && props.unreadCount === undefined) {
    return <NotificationTopBar title={props.title} back={props.back} logo={props.logo} />;
  }
  return <TopBarView {...props} />;
}
