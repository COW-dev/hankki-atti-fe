import type {
  CreateHelpRequestBody,
  CreatedHelpRequest,
  MyHelpRequest,
  MyHelpRequests,
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
