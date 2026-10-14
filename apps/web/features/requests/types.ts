import type { HelpRequestStatus, HelpType } from '@/lib/labels/help-request';

// GET /api/help-requests/me 항목 (백엔드 MyHelpRequestResponseDto). 블라인드는 서버 책임 — 받은 필드만 그린다
export type MyHelpRequest = {
  id: number;
  startAt: string;
  endAt: string;
  status: HelpRequestStatus;
  helpTypes: HelpType[];
  otherHelpText: string | null;
  memo: string | null;
  // 매칭 완료·이용 완료·노쇼일 때만 있다
  helper: { name: string; kakaoId: string } | null;
  helperChanged: boolean;
  noShowReportable: boolean;
  noShowDeadline: string | null;
};

export type MyHelpRequests = {
  // 모집 중·매칭 완료, 시작 시각이 가까운 순
  upcoming: MyHelpRequest[];
  // 매칭 실패·취소 완료·이용 완료·노쇼, 최근 순
  past: MyHelpRequest[];
};

// GET /api/help-requests/time-options 항목 — 오늘부터 7일, 주말·공휴일·지난 시각 제외. 날짜·시각 순
export type TimeOption = { startAt: string; endAt: string; meal: 'LUNCH' | 'DINNER' };
export type TimeOptionDate = { date: string; startTimes: TimeOption[] };

// POST /api/help-requests 본문
export type CreateHelpRequestBody = {
  startAt: string;
  helpTypes: HelpType[];
  otherHelpText?: string;
  memo?: string;
};

// POST /api/help-requests 응답 (백엔드 HelpRequestCreateResponseDto)
export type CreatedHelpRequest = {
  id: number;
  startAt: string;
  endAt: string;
  helpTypes: HelpType[];
  otherHelpText: string | null;
  memo: string | null;
  status: HelpRequestStatus;
};
