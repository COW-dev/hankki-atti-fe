// 서버가 가려 준 연락처를 스크린리더용 문장으로 바꾼다 — "별표 별표…"를 읽지 않게 한다 (A-03)
// 전화번호 "010-****-5678" → "끝자리 5678", 그 밖에는 가린 부분을 "가림"으로 읽는다
export function maskedReading(value: string): string {
  if (!value.includes('*')) return value;
  if (/^[\d*-]+$/.test(value)) {
    const last = /\d+$/.exec(value);
    return last ? `끝자리 ${last[0]}` : '가림';
  }
  return value.replace(/\*+/g, ', 가림, ').replace(/^, |, $/g, '');
}

// 등록 결과처럼 화면에서 이메일을 가려 보일 때 (Figma 14:1801 "2023****@mju.ac.kr") — 아이디 앞 4글자만 남긴다
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 0) return email;
  return `${email.slice(0, Math.min(4, at))}****${email.slice(at)}`;
}
