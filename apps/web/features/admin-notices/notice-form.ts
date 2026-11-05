import { NOTICE_TARGET_LABEL, type NoticeTarget } from '@/lib/labels/notice';

// AF-04 공지 입력값. 규칙은 백엔드 AdminNoticeSaveRequestDto 검증과 같게 둔다
export type NoticeForm = {
  title: string;
  body: string;
  target: NoticeTarget | '';
  pinned: boolean;
};

export const EMPTY_NOTICE_FORM: NoticeForm = { title: '', body: '', target: '', pinned: false };

export const NOTICE_TITLE_MAX_LENGTH = 100;
export const NOTICE_BODY_MAX_LENGTH = 5000;

export type NoticeField = 'title' | 'body' | 'target';
export type NoticeErrors = Partial<Record<NoticeField, string>>;

// 화면 순서 = 첫 오류 포커스 순서 (Figma 14:2595)
export const NOTICE_FIELDS: NoticeField[] = ['title', 'body', 'target'];

export function validateNotice(form: NoticeForm): NoticeErrors {
  const errors: NoticeErrors = {};
  if (!form.title.trim()) errors.title = '제목을 입력해 주세요';
  else if (form.title.length > NOTICE_TITLE_MAX_LENGTH) {
    errors.title = `${NOTICE_TITLE_MAX_LENGTH}자까지 쓸 수 있어요`;
  }
  if (!form.body.trim()) errors.body = '본문을 입력해 주세요';
  else if (form.body.length > NOTICE_BODY_MAX_LENGTH) {
    errors.body = `${NOTICE_BODY_MAX_LENGTH}자까지 쓸 수 있어요`;
  }
  if (!form.target) errors.target = '대상을 골라 주세요';
  return errors;
}

// 목업의 대상은 3개다. 아띠로 게시된 공지를 고칠 때만 아띠를 보여 저장해도 대상이 바뀌지 않게 한다
export function noticeTargetOptions(initial: NoticeForm['target']) {
  const targets: NoticeTarget[] = ['ALL', 'STUDENT', 'HELPER'];
  if (initial === 'ATTI') targets.push('ATTI');
  return targets.map((value) => ({ value, label: NOTICE_TARGET_LABEL[value] }));
}
