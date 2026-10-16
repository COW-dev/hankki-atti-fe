import type {
  CreateHelpRequestBody,
  CreatedHelpRequest,
  HelpRequestApplication,
  MyHelpRequest,
  MyHelpRequests,
  OpenHelpRequestDate,
  TimeOptionDate,
} from './types';

// useAuth().authRequest와 같은 모양. 인자로 받아 화면 밖에서도 테스트할 수 있게 한다
export type AuthRequest = <T>(
  path: string,
  options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown },
) => Promise<T>;

export function fetchMyRequests(authRequest: AuthRequest): Promise<MyHelpRequests> {
  return authRequest<MyHelpRequests>('/api/help-requests/me');
}

// 모집 중인 신청 철회 (명세: 확인 단계 없음). 응답은 취소 완료가 된 신청
export function withdrawRequest(authRequest: AuthRequest, id: number): Promise<MyHelpRequest> {
  return authRequest<MyHelpRequest>(`/api/help-requests/${id}/withdraw`, { method: 'POST' });
}

// 매칭 완료 신청 취소 (명세 "매칭 취소 (학생)": 사유·패널티 없음, 도우미에게 바로 알림). 응답은 취소 완료가 된 신청
export function cancelRequest(authRequest: AuthRequest, id: number): Promise<MyHelpRequest> {
  return authRequest<MyHelpRequest>(`/api/help-requests/${id}/cancel`, { method: 'POST' });
}

// 이용 완료 후 24시간 안에 노쇼 신고. 응답은 노쇼가 된 신청
export function reportNoShow(authRequest: AuthRequest, id: number): Promise<MyHelpRequest> {
  return authRequest<MyHelpRequest>(`/api/help-requests/${id}/no-show`, { method: 'POST' });
}

// 지금 고를 수 있는 날짜별 시작 시각
export function fetchTimeOptions(authRequest: AuthRequest): Promise<TimeOptionDate[]> {
  return authRequest<TimeOptionDate[]>('/api/help-requests/time-options');
}

// 도우미 신청. 응답은 모집 중으로 만들어진 신청
export function createRequest(
  authRequest: AuthRequest,
  body: CreateHelpRequestBody,
): Promise<CreatedHelpRequest> {
  return authRequest<CreatedHelpRequest>('/api/help-requests', { method: 'POST', body });
}

// 도우미가 지원할 수 있는 모집 중 신청, 날짜별 (from·to는 "YYYY-MM-DD", to 포함, 최대 31일)
export function fetchOpenRequests(
  authRequest: AuthRequest,
  from: string,
  to: string,
): Promise<OpenHelpRequestDate[]> {
  return authRequest<OpenHelpRequestDate[]>(`/api/help-requests/open?from=${from}&to=${to}`);
}

// 도우미 지원 (본문 없음). 첫 지원자면 MATCHED + student, 아니면 WAITING + waitingOrder
export function applyToRequest(
  authRequest: AuthRequest,
  id: number,
): Promise<HelpRequestApplication> {
  return authRequest<HelpRequestApplication>(`/api/help-requests/${id}/applications`, {
    method: 'POST',
  });
}
