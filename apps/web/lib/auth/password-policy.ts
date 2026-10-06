// 백엔드 @Password 규칙과 같다: 8~64자, 영문·숫자·특수문자 각 1개 이상
export const PASSWORD_MAX_LENGTH = 64;

export const PASSWORD_RULES = [
  { label: "8자 이상", test: (value: string) => value.length >= 8 },
  { label: "영문 포함", test: (value: string) => /[A-Za-z]/.test(value) },
  { label: "숫자 포함", test: (value: string) => /\d/.test(value) },
  { label: "특수문자 포함", test: (value: string) => /[^A-Za-z\d\s]/.test(value) },
] as const;

export function checkPassword(value: string) {
  return PASSWORD_RULES.map((rule) => ({ label: rule.label, passed: rule.test(value) }));
}
