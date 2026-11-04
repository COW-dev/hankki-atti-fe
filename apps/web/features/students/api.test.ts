import { describe, expect, it, vi } from 'vitest';
import { fetchHelpRequestSummary, fetchHelpRequests, fetchStudents } from '@/features/students/api';

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

describe('fetchHelpRequests', () => {
  it('기간은 늘 보내고 빈 상태·공백 검색어는 뺀다', async () => {
    const authRequest = vi.fn().mockResolvedValue([]);

    await fetchHelpRequests(authRequest, {
      from: '2026-11-03',
      to: '2026-11-10',
      status: '',
      q: ' ',
    });

    expect(authRequest).toHaveBeenCalledWith(
      '/api/admin/help-requests?from=2026-11-03&to=2026-11-10',
    );
  });

  it('상태와 앞뒤 공백을 지운 검색어를 쿼리로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue([]);

    await fetchHelpRequests(authRequest, {
      from: '2026-11-03',
      to: '2026-11-10',
      status: 'NO_SHOW',
      q: ' 6023 ',
    });

    expect(authRequest).toHaveBeenCalledWith(
      '/api/admin/help-requests?from=2026-11-03&to=2026-11-10&status=NO_SHOW&q=6023',
    );
  });
});

describe('fetchHelpRequestSummary', () => {
  it('기간만 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await fetchHelpRequestSummary(authRequest, '2026-11-03', '2026-11-10');

    expect(authRequest).toHaveBeenCalledWith(
      '/api/admin/help-requests/summary?from=2026-11-03&to=2026-11-10',
    );
  });
});
