import { kakaoIdError, phoneError } from '@/features/signup/signup-form';
import type { DisabilityType } from '@/lib/labels/student';

// AF-01 장애학생 등록 입력값. 규칙은 백엔드 AdminStudentCreateRequestDto 검증과 같게 둬서 400이 나지 않게 한다
export type StudentCreateForm = {
  name: string;
  studentNo: string;
  phone: string;
  kakaoId: string;
  schoolEmail: string;
  disabilityType: DisabilityType | '';
  specialNote: string;
};

export const EMPTY_STUDENT_CREATE_FORM: StudentCreateForm = {
  name: '',
  studentNo: '',
  phone: '',
  kakaoId: '',
  schoolEmail: '',
  disabilityType: '',
  specialNote: '',
};

export type StudentCreateField = keyof StudentCreateForm;
export type StudentCreateErrors = Partial<Record<StudentCreateField, string>>;

// 화면 순서 = 첫 오류 포커스 순서 (Figma 14:1745)
export const STUDENT_CREATE_FIELDS: StudentCreateField[] = [
  'name',
  'studentNo',
  'phone',
  'kakaoId',
  'schoolEmail',
  'disabilityType',
  'specialNote',
];

// 백엔드 @Size: 이름 50, 이메일 100, 특이사항 1000
export const SPECIAL_NOTE_MAX_LENGTH = 1000;

// 문구는 목업에 없어 도우미 회원가입과 같은 말투로 둔다
export function validateStudentCreate(form: StudentCreateForm): StudentCreateErrors {
  const errors: StudentCreateErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = '이름을 입력해 주세요';
  else if (name.length > 50) errors.name = '이름은 50자까지 쓸 수 있어요';
  if (!/^\d{8}$/.test(form.studentNo.trim())) {
    errors.studentNo = '학번 8자리를 숫자로 입력해 주세요';
  }
  const phone = phoneError(form.phone);
  if (phone) errors.phone = phone;
  const kakaoId = kakaoIdError(form.kakaoId);
  if (kakaoId) errors.kakaoId = kakaoId;
  const email = form.schoolEmail.trim();
  if (!/^[^\s@]+@mju\.ac\.kr$/i.test(email) || email.length > 100) {
    errors.schoolEmail = '학교 이메일(@mju.ac.kr)을 입력해 주세요';
  }
  if (!form.disabilityType) errors.disabilityType = '장애 유형을 골라 주세요';
  if (form.specialNote.trim().length > SPECIAL_NOTE_MAX_LENGTH) {
    errors.specialNote = `특이사항은 ${SPECIAL_NOTE_MAX_LENGTH}자까지 쓸 수 있어요`;
  }
  return errors;
}

// 검증을 통과한 입력값만 받는다. 빈 메모는 보내지 않는다.
// 문자 수신 동의는 목업에 없어 보내지 않는다 (서버 기본 false, 학생이 마이페이지에서 켠다)
export function toStudentCreateRequest(form: StudentCreateForm) {
  const specialNote = form.specialNote.trim();
  return {
    name: form.name.trim(),
    studentNo: form.studentNo.trim(),
    phone: form.phone.trim(),
    kakaoId: form.kakaoId.trim(),
    schoolEmail: form.schoolEmail.trim().toLowerCase(),
    disabilityType: form.disabilityType,
    ...(specialNote && { specialNote }),
  };
}

// 정보 수정 (PATCH /api/admin/students/{id}). 빈 메모는 null로 보내 지운다.
// 문자 수신 동의는 보내지 않아 지금 상태를 그대로 둔다
export function toStudentUpdateRequest(form: StudentCreateForm) {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    kakaoId: form.kakaoId.trim(),
    schoolEmail: form.schoolEmail.trim().toLowerCase(),
    disabilityType: form.disabilityType,
    specialNote: form.specialNote.trim() || null,
  };
}
