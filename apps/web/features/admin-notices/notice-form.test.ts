import { describe, expect, it } from 'vitest';
import {
  NOTICE_BODY_MAX_LENGTH,
  NOTICE_TITLE_MAX_LENGTH,
  noticeTargetOptions,
  validateNotice,
  type NoticeForm,
} from '@/features/admin-notices/notice-form';

const valid: NoticeForm = { title: '운영 시간', body: '바뀌어요', target: 'ALL', pinned: false };

describe('validateNotice', () => {
  it('제목·본문·대상을 채우면 오류가 없다', () => {
    expect(validateNotice(valid)).toEqual({});
  });

  it('공백뿐인 제목·본문과 고르지 않은 대상은 오류다', () => {
    expect(validateNotice({ ...valid, title: '  ', body: '\n', target: '' })).toEqual({
      title: '제목을 입력해 주세요',
      body: '본문을 입력해 주세요',
      target: '대상을 골라 주세요',
    });
  });

  it('최대 글자 수까지는 받고 넘으면 오류다', () => {
    const title = '가'.repeat(NOTICE_TITLE_MAX_LENGTH);
    const body = '가'.repeat(NOTICE_BODY_MAX_LENGTH);

    expect(validateNotice({ ...valid, title, body })).toEqual({});
    expect(validateNotice({ ...valid, title: `${title}가`, body: `${body}가` })).toEqual({
      title: '100자까지 쓸 수 있어요',
      body: '5000자까지 쓸 수 있어요',
    });
  });
});

describe('noticeTargetOptions', () => {
  it('기본은 목업의 대상 3개다', () => {
    expect(noticeTargetOptions('').map((option) => option.label)).toEqual([
      '전체',
      '장애학생',
      '도우미',
    ]);
  });

  it('아띠 공지를 고칠 때는 아띠를 함께 보여 준다', () => {
    expect(noticeTargetOptions('ATTI').map((option) => option.value)).toContain('ATTI');
  });
});
