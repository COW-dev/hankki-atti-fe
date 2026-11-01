// GET /api/me (백엔드 MeResponseDto). 장애 유형·특이사항은 관리자 API에만 있어 여기 없다
export type MyProfile = {
  accountId: number;
  // 장애학생은 학번, 도우미는 이메일
  loginId: string;
  role: 'STUDENT' | 'HELPER';
  name: string;
  studentNo: string;
  phone: string;
  kakaoId: string;
  smsConsent: boolean;
  // 도우미만 있다
  helper: { attiMember: boolean; volunteerHours: number } | null;
};
