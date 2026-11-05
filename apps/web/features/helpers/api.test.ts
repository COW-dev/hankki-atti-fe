import { describe, expect, it, vi } from 'vitest';
import {
  fetchHelpers,
  updateVolunteerHours,
  volunteerHoursFailureMessage,
} from '@/features/helpers/api';
import { ApiError } from '@/lib/api/client';

describe('fetchHelpers', () => {
  it('빈 조건은 빼고 page만 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchHelpers(authRequest, { q: '  ', status: '', attiMember: '', page: 0 });

    expect(authRequest).toHaveBeenCalledWith('/api/admin/helpers?page=0');
  });

  it('아니오를 고른 아띠 소속도 조건으로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchHelpers(authRequest, {
      q: ' 윤태호 ',
      status: 'ACTIVE',
      attiMember: 'false',
      page: 1,
    });

    expect(authRequest).toHaveBeenCalledWith(
      `/api/admin/helpers?page=1&q=${encodeURIComponent('윤태호')}&status=ACTIVE&attiMember=false`,
    );
  });
});

describe('updateVolunteerHours', () => {
  it('사유의 앞뒤 공백을 지워 PATCH로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await updateVolunteerHours(authRequest, 31, 1.5, ' 30분 길었어요 ');

    expect(authRequest).toHaveBeenCalledWith('/api/admin/applications/31/volunteer-hours', {
      method: 'PATCH',
      body: { hours: 1.5, reason: '30분 길었어요' },
    });
  });
});

describe('volunteerHoursFailureMessage', () => {
  const failure = (status: number, code: string) => new ApiError(status, code, '서버 문구');

  it('값이 같다는 오류와 권한 오류는 전용 문구로 알린다', () => {
    expect(
      volunteerHoursFailureMessage(failure(422, 'APPLICATION_VOLUNTEER_HOURS_UNCHANGED')),
    ).toBe('지금 봉사시간과 같아요');
    expect(volunteerHoursFailureMessage(failure(403, 'AUTH_ACCESS_DENIED'))).toBe(
      '봉사시간 수정은 전체 권한만 할 수 있어요',
    );
  });

  it('그 밖의 오류는 서버 문구 대신 화면 문구로 알린다', () => {
    expect(volunteerHoursFailureMessage(failure(500, 'UNKNOWN'))).toBe(
      '봉사시간을 수정하지 못했어요. 잠시 후 다시 시도해 주세요',
    );
  });
});
