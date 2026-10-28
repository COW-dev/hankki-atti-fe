import { describe, expect, it } from 'vitest';
import { splitNoticeBody } from '@/features/notices/notice-body';

describe('splitNoticeBody', () => {
  it('URL이 없으면 본문 한 조각이다', () => {
    expect(splitNoticeBody('운영 시간이 바뀌어요.\n주말 운영 없음')).toEqual([
      { type: 'text', text: '운영 시간이 바뀌어요.\n주말 운영 없음' },
    ]);
  });

  it('URL 앞뒤 텍스트를 나누고 주소만 링크로 만든다', () => {
    expect(splitNoticeBody('자세한 내용: https://mju.ac.kr/notice?id=3 참고해 주세요')).toEqual([
      { type: 'text', text: '자세한 내용: ' },
      { type: 'link', href: 'https://mju.ac.kr/notice?id=3' },
      { type: 'text', text: ' 참고해 주세요' },
    ]);
  });

  it('문장 끝 마침표와 주소 뒤에 붙은 한글은 주소에 넣지 않는다', () => {
    expect(splitNoticeBody('https://a.kr/x. http://b.kr에서 확인')).toEqual([
      { type: 'link', href: 'https://a.kr/x' },
      { type: 'text', text: '. ' },
      { type: 'link', href: 'http://b.kr' },
      { type: 'text', text: '에서 확인' },
    ]);
  });

  it('주소를 감싼 괄호는 빼고, 주소 안 괄호 짝은 남긴다', () => {
    expect(splitNoticeBody('(https://a.kr/x) https://w.org/A_(b)')).toEqual([
      { type: 'text', text: '(' },
      { type: 'link', href: 'https://a.kr/x' },
      { type: 'text', text: ') ' },
      { type: 'link', href: 'https://w.org/A_(b)' },
    ]);
  });

  it('http·https가 아닌 주소는 링크로 만들지 않는다', () => {
    expect(splitNoticeBody('javascript:alert(1) ftp://a.kr')).toEqual([
      { type: 'text', text: 'javascript:alert(1) ftp://a.kr' },
    ]);
  });
});
