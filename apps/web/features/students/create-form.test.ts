import { describe, expect, it } from 'vitest';
import {
  toStudentCreateRequest,
  validateStudentCreate,
  type StudentCreateForm,
} from '@/features/students/create-form';

const VALID: StudentCreateForm = {
  name: '김민지',
  studentNo: '60231234',
  phone: '010-1234-5678',
  kakaoId: 'minji_k',
  schoolEmail: '60231234@mju.ac.kr',
  disabilityType: 'VISUAL',
  specialNote: '',
};

describe('validateStudentCreate', () => {
  it('필수 칸이 모두 규칙에 맞으면 메모 없이도 오류가 없다', () => {
    expect(validateStudentCreate(VALID)).toEqual({});
  });

  it.each([
    ['name', { name: ' ' }],
    ['studentNo', { studentNo: '6023123' }],
    ['phone', { phone: '02-300-1529' }],
    ['kakaoId', { kakaoId: 'minji k' }],
    ['schoolEmail', { schoolEmail: 'minji@gmail.com' }],
    ['disabilityType', { disabilityType: '' }],
    ['specialNote', { specialNote: '가'.repeat(1001) }],
  ] as const)('%s 규칙을 어기면 그 칸만 오류다 (%o)', (field, change) => {
    expect(Object.keys(validateStudentCreate({ ...VALID, ...change }))).toEqual([field]);
  });
});

describe('toStudentCreateRequest', () => {
  it('앞뒤 공백을 지우고 이메일은 소문자로, 빈 메모는 빼고 보낸다', () => {
    expect(
      toStudentCreateRequest({ ...VALID, name: ' 김민지 ', schoolEmail: ' A@MJU.ac.kr ' }),
    ).toEqual({
      name: '김민지',
      studentNo: '60231234',
      phone: '010-1234-5678',
      kakaoId: 'minji_k',
      schoolEmail: 'a@mju.ac.kr',
      disabilityType: 'VISUAL',
    });
  });

  it('메모가 있으면 공백을 지워 보낸다', () => {
    expect(toStudentCreateRequest({ ...VALID, specialNote: ' 식판 운반 ' }).specialNote).toBe(
      '식판 운반',
    );
  });
});
