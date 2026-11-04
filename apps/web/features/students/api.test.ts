import { describe, expect, it, vi } from 'vitest';
import {
  createStudent,
  deactivateStudent,
  updateStudent,
  fetchHelpRequestSummary,
  fetchHelpRequests,
  fetchStudents,
  studentCreateFailureOf,
} from '@/features/students/api';
import { EMPTY_STUDENT_CREATE_FORM } from '@/features/students/create-form';
import { ApiError } from '@/lib/api/client';

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

describe('createStudent', () => {
  it('등록 요청을 POST로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await createStudent(authRequest, { ...EMPTY_STUDENT_CREATE_FORM, name: '김민지' });

    expect(authRequest).toHaveBeenCalledWith(
      '/api/admin/students',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ name: '김민지' }),
      }),
    );
  });
});

describe('studentCreateFailureOf', () => {
  it('학번 중복이면 학번 칸 오류다', () => {
    expect(
      studentCreateFailureOf(new ApiError(409, 'STUDENT_DUPLICATE_STUDENT_NO', '중복')),
    ).toEqual({ field: 'studentNo', message: '이미 등록된 학번이에요' });
  });

  it('그 밖의 오류는 칸 없이 화면 위 오류다', () => {
    expect(
      studentCreateFailureOf(new ApiError(409, 'STUDENT_REGISTRATION_CONFLICT', '충돌')),
    ).toEqual({ message: '학생을 등록하지 못했어요. 잠시 후 다시 시도해 주세요' });
  });
});

describe('updateStudent', () => {
  it('학번은 빼고 PATCH로 보내며, 빈 메모는 null로 보내 지운다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await updateStudent(authRequest, 7, {
      name: ' 김민지 ',
      studentNo: '20231234',
      phone: '010-1234-1234',
      kakaoId: 'min_k',
      schoolEmail: 'Min@MJU.ac.kr',
      disabilityType: 'VISUAL',
      specialNote: '  ',
    });

    expect(authRequest).toHaveBeenCalledWith('/api/admin/students/7', {
      method: 'PATCH',
      body: {
        name: '김민지',
        phone: '010-1234-1234',
        kakaoId: 'min_k',
        schoolEmail: 'min@mju.ac.kr',
        disabilityType: 'VISUAL',
        specialNote: null,
      },
    });
  });
});

describe('deactivateStudent', () => {
  it('학생 계정 비활성화를 POST로 보낸다', async () => {
    const authRequest = vi.fn().mockResolvedValue({});

    await deactivateStudent(authRequest, 7);

    expect(authRequest).toHaveBeenCalledWith('/api/admin/students/7/deactivate', {
      method: 'POST',
    });
  });
});
