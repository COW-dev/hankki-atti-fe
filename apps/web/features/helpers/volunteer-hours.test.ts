import { describe, expect, it } from 'vitest';
import { clampVolunteerHours, volunteerHoursBlockReason } from '@/features/helpers/volunteer-hours';

describe('clampVolunteerHours', () => {
  it('0~10시간 밖으로 나가지 않는다', () => {
    expect(clampVolunteerHours(-0.5)).toBe(0);
    expect(clampVolunteerHours(10.5)).toBe(10);
    expect(clampVolunteerHours(1.5)).toBe(1.5);
  });
});

describe('volunteerHoursBlockReason', () => {
  it('값이 그대로면 사유가 있어도 저장할 수 없다', () => {
    expect(volunteerHoursBlockReason(1, 1, '사유')).toBe('봉사시간을 바꿔 주세요');
  });

  it('사유가 공백뿐이면 저장할 수 없다', () => {
    expect(volunteerHoursBlockReason(1.5, 1, '   ')).toBe('수정 사유를 입력해 주세요');
  });

  it('사유가 200자를 넘으면 저장할 수 없고 200자는 저장할 수 있다', () => {
    expect(volunteerHoursBlockReason(1.5, 1, '가'.repeat(201))).toBe(
      '수정 사유는 200자까지 쓸 수 있어요',
    );
    expect(volunteerHoursBlockReason(1.5, 1, '가'.repeat(200))).toBeNull();
  });
});
