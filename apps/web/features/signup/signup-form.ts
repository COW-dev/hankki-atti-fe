import { checkPassword, PASSWORD_MAX_LENGTH } from '@/lib/auth/password-policy';

// L-02 2단계 입력값. 규칙은 백엔드 HelperSignupRequestDto 검증과 같게 둬서 422가 나지 않게 한다
export type SignupForm = {
  name: string;
  studentNo: string;
  email: string;
  kakaoId: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  attiMember: boolean;
};

export const EMPTY_SIGNUP_FORM: SignupForm = {
  name: '',
  studentNo: '',
  email: '',
  kakaoId: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  attiMember: false,
};

export type SignupField = Exclude<keyof SignupForm, 'attiMember'>;
export type SignupErrors = Partial<Record<SignupField, string>>;

// 화면 순서 = 첫 오류 포커스 순서 (Figma 14:1032)
export const SIGNUP_FIELDS: SignupField[] = [
  'name',
  'studentNo',
  'email',
  'kakaoId',
  'phone',
  'password',
  'passwordConfirm',
];

const PHONE = /^01[016789]-?\d{3,4}-?\d{4}$/;
// 백엔드 HelperSignupRequestDto 이름 @Size(max = 50), KakaoId @Size(max = 50). 둘 다 UTF-16 길이라 JS length와 같다
const MAX_TEXT_LENGTH = 50;

// 문구는 목업에 없어 임시로 둔다
export function validateSignup(form: SignupForm): SignupErrors {
  const errors: SignupErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = '이름을 입력해 주세요';
  else if (name.length > MAX_TEXT_LENGTH) errors.name = '이름은 50자까지 쓸 수 있어요';
  if (!/^\d{8}$/.test(form.studentNo.trim()))
    errors.studentNo = '학번 8자리를 숫자로 입력해 주세요';
  if (!/^[^\s@]+@mju\.ac\.kr$/i.test(form.email.trim())) {
    errors.email = '학교 이메일(@mju.ac.kr)을 입력해 주세요';
  }
  if (!form.kakaoId) errors.kakaoId = '카톡 ID를 입력해 주세요';
  else if (/\s/.test(form.kakaoId)) errors.kakaoId = '카톡 ID에는 띄어쓰기를 쓸 수 없어요';
  else if (form.kakaoId.length > MAX_TEXT_LENGTH)
    errors.kakaoId = '카톡 ID는 50자까지 쓸 수 있어요';
  if (!PHONE.test(form.phone.trim())) errors.phone = '전화번호를 010-0000-0000처럼 입력해 주세요';
  if (
    form.password.length > PASSWORD_MAX_LENGTH ||
    checkPassword(form.password).some((rule) => !rule.passed)
  ) {
    errors.password = '비밀번호 조건을 모두 채워 주세요';
  }
  if (form.passwordConfirm !== form.password) {
    errors.passwordConfirm = '비밀번호와 같게 입력해 주세요';
  }
  return errors;
}

// 1단계를 다 읽어야 2단계로 오므로 guideConfirmed는 늘 true. 문자 수신 동의는 목업에 없어 보내지 않는다(서버 기본 false)
export function toSignupRequest(form: SignupForm) {
  return {
    name: form.name.trim(),
    studentNo: form.studentNo.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    kakaoId: form.kakaoId,
    password: form.password,
    attiMember: form.attiMember,
    guideConfirmed: true,
  };
}
