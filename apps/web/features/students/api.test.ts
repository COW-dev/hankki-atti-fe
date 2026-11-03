import { describe, expect, it, vi } from 'vitest';
import { fetchStudents } from '@/features/students/api';

describe('fetchStudents', () => {
  it('빈 조건은 빼고 page만 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchStudents(authRequest, { q: '  ', status: '', disabilityType: '', page: 0 });

    expect(authRequest).toHaveBeenCalledWith('/api/admin/students?page=0');
  });

  it('검색어는 앞뒤 공백을 지우고 조건을 모두 쿼리로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchStudents(authRequest, {
      q: ' 김민지 ',
      status: 'INACTIVE',
      disabilityType: 'VISUAL',
      page: 2,
    });

    expect(authRequest).toHaveBeenCalledWith(
      `/api/admin/students?page=2&q=${encodeURIComponent('김민지')}&status=INACTIVE&disabilityType=VISUAL`,
    );
  });
});
