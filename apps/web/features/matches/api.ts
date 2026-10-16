import type { AuthRequest } from '@/features/requests/api';
import type { CancelApplicationBody, MyApplication, MyApplications } from './types';

// 매칭 현황. 필터는 화면에서 거르므로 항상 ALL(기본값)로 받는다
export function fetchMyApplications(authRequest: AuthRequest): Promise<MyApplications> {
  return authRequest<MyApplications>('/api/applications/me');
}

// 매칭 취소 (사유 필수). 응답은 취소된 지원 — 카드와 같은 필드에 canceledAt이 더 있다
export function cancelApplication(
  authRequest: AuthRequest,
  id: number,
  body: CancelApplicationBody,
): Promise<MyApplication> {
  return authRequest<MyApplication>(`/api/applications/${id}/cancel`, { method: 'POST', body });
}

// 예비 빠지기 (본문 없음, 패널티 없음). 응답은 WITHDRAWN 카드
export function leaveApplication(authRequest: AuthRequest, id: number): Promise<MyApplication> {
  return authRequest<MyApplication>(`/api/applications/${id}/leave`, { method: 'POST' });
}

// 승격 수락 (갈게요). 응답은 MATCHED 카드 + student
export function acceptPromotion(authRequest: AuthRequest, id: number): Promise<MyApplication> {
  return authRequest<MyApplication>(`/api/applications/${id}/promotion/accept`, {
    method: 'POST',
  });
}

// 승격 거절 (이번엔 어려워요). 응답은 PROMOTION_DECLINED 카드, student 없음
export function declinePromotion(authRequest: AuthRequest, id: number): Promise<MyApplication> {
  return authRequest<MyApplication>(`/api/applications/${id}/promotion/decline`, {
    method: 'POST',
  });
}
