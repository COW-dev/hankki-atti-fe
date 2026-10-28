// 공지 본문 조각. 본문은 일반 텍스트라 URL만 링크로 바꾼다 (명세 F-03 "URL 자동 링크")
export type NoticeBodySegment = { type: 'text'; text: string } | { type: 'link'; href: string };

// http(s) 주소에 쓰는 ASCII 문자까지만 — 주소 바로 뒤에 붙은 한글("…/a에서")은 주소에 넣지 않는다
const URL_PATTERN = /https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/g;
// 문장 끝 문장부호는 주소가 아니라 문장의 것이다
const TRAILING_PUNCTUATION = /[.,!?;:'"]+$/;

/** 본문을 텍스트·링크 조각으로 나눈다. 닫는 괄호는 주소 안에 여는 괄호가 있을 때만 주소로 본다. */
export function splitNoticeBody(body: string): NoticeBodySegment[] {
  const segments: NoticeBodySegment[] = [];
  let last = 0;
  for (const match of body.matchAll(URL_PATTERN)) {
    const href = trimUrl(match[0]);
    const start = match.index;
    if (start > last) segments.push({ type: 'text', text: body.slice(last, start) });
    segments.push({ type: 'link', href });
    last = start + href.length;
  }
  if (last < body.length) segments.push({ type: 'text', text: body.slice(last) });
  return segments;
}

function trimUrl(raw: string): string {
  let url = raw;
  for (;;) {
    const trimmed = url.replace(TRAILING_PUNCTUATION, '');
    const unbalanced =
      trimmed.endsWith(')') && count(trimmed, '(') < count(trimmed, ')')
        ? trimmed.slice(0, -1)
        : trimmed;
    if (unbalanced === url) return url;
    url = unbalanced;
  }
}

function count(text: string, char: string): number {
  return text.split(char).length - 1;
}
