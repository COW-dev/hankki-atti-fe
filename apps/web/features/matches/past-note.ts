import { CANCEL_REASON_LABEL } from '@/lib/labels/application';
import type { MyApplication } from './types';

// "1시간" · "0.5시간" · "0시간" (서버는 0.5 단위)
export function formatVolunteerHours(hours: number): string {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}시간`;
}

/**
 * 지난 활동 행의 부가 문구 (Figma 208:3424~3447 · 명세 F-07 표, plan 확인 필요 4).
 * 태그 문구만으로 부족한 뜻(왜 빠졌는지, 패널티 여부, 봉사시간)을 채운다. 없는 상태는 null.
 */
export function pastActivityNote(application: MyApplication): string | null {
  switch (application.status) {
    case 'COMPLETED':
      return application.volunteerHours !== undefined
        ? `봉사시간 ${formatVolunteerHours(application.volunteerHours)}`
        : null;
    case 'STUDENT_CANCELED':
      return '장애학생 사정 · 패널티 없어요';
    case 'HELPER_CANCELED':
      // 목록 응답에는 기타 내용이 없어 "기타 (직접 입력)" 대신 "기타 사유"로 적는다
      if (application.cancelReason === 'OTHER') return '기타 사유';
      return application.cancelReason ? CANCEL_REASON_LABEL[application.cancelReason] : null;
    case 'EXCLUDED':
      return '같은 시간 다른 건에 매칭됨';
    case 'PROMOTION_DECLINED':
      return '패널티 없어요';
    default:
      return null;
  }
}
