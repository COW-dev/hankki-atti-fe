import { kakaoIdError, phoneError } from '@/features/signup/signup-form';

// 도우미 연락 정보 입력값. 규칙은 회원가입과 같다 (백엔드 @KakaoId·@PhoneNumber)
export type ContactForm = { kakaoId: string; phone: string };
export type ContactField = keyof ContactForm;
export type ContactErrors = Partial<Record<ContactField, string>>;

// 화면 순서 = 첫 오류 포커스 순서 (Figma 14:1212)
export const CONTACT_FIELDS: ContactField[] = ['kakaoId', 'phone'];

export function validateContact(form: ContactForm): ContactErrors {
  const errors: ContactErrors = {};
  const kakaoId = kakaoIdError(form.kakaoId);
  const phone = phoneError(form.phone);
  if (kakaoId) errors.kakaoId = kakaoId;
  if (phone) errors.phone = phone;
  return errors;
}
