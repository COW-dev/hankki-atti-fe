import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { passwordChanged } from '@/features/auth/password-changed';
import { MyPageScreen } from '@/features/mypage/MyPageScreen';
import type { MyProfile } from '@/features/mypage/types';
import { ApiError } from '@/lib/api/client';

const authRequest = vi.fn();
const logout = vi.fn();
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => ({ authRequest, logout }),
}));

// 상단 바의 알림 연결은 이 테스트 대상이 아니다
vi.mock('@/components/layout/TopBar', () => ({
  TopBar: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

// 테스트 환경의 Node localStorage가 jsdom 것을 가려서 저장소를 바꿔 둔다
const textSize = vi.hoisted(() => ({ large: false, setByUser: vi.fn() }));
vi.mock('@/lib/accessibility/text-size', () => ({
  textSizeStore: {
    subscribe: () => () => undefined,
    getSnapshot: () => textSize.large,
    getServerSnapshot: () => false,
    setByUser: textSize.setByUser,
  },
}));

const STUDENT: MyProfile = {
  accountId: 1,
  loginId: '20260000',
  role: 'STUDENT',
  name: '박서연',
  studentNo: '20260000',
  phone: '010-1234-5678',
  kakaoId: 'seoyeon_p',
  smsConsent: false,
  helper: null,
};

const HELPER: MyProfile = {
  accountId: 2,
  loginId: 'helper@mju.ac.kr',
  role: 'HELPER',
  name: '김도움',
  studentNo: '20240000',
  phone: '010-0000-0000',
  kakaoId: 'dowoom_kim',
  smsConsent: true,
  helper: { attiMember: true, volunteerHours: 2.5 },
};

function row(label: string) {
  return screen.getByText(label).nextElementSibling;
}

describe('MyPageScreen', () => {
  beforeEach(() => {
    authRequest.mockReset();
    logout.mockReset();
    textSize.large = false;
    textSize.setByUser.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    passwordChanged.clear();
  });

  it('장애학생은 정보를 조회만 하고 센터 요청 안내를 본다', async () => {
    // given
    authRequest.mockResolvedValueOnce(STUDENT);

    // when
    render(<MyPageScreen reader="STUDENT" />);

    // then
    expect(await screen.findByRole('heading', { name: '박서연' })).toBeInTheDocument();
    expect(screen.getByText('장애학생')).toBeInTheDocument();
    expect(row('학번')).toHaveTextContent('20260000');
    expect(row('카톡 ID')).toHaveTextContent('seoyeon_p');
    expect(row('전화번호')).toHaveTextContent('010-1234-5678');
    expect(screen.getByText('정보 수정은 센터에 요청해 주세요')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '저장' })).not.toBeInTheDocument();
  });

  it('도우미는 아띠 소속·이메일·누적 봉사시간을 보고 연락 정보 칸이 현재 값으로 채워진다', async () => {
    // given
    authRequest.mockResolvedValueOnce(HELPER);

    // when
    render(<MyPageScreen reader="HELPER" />);

    // then
    expect(await screen.findByRole('heading', { name: '김도움' })).toBeInTheDocument();
    expect(screen.getByText('아띠 (자기신고)')).toBeInTheDocument();
    expect(row('이메일 (아이디)')).toHaveTextContent('helper@mju.ac.kr');
    expect(row('봉사시간')).toHaveTextContent('누적 2.5시간');
    expect(screen.getByRole('textbox', { name: '카톡 ID' })).toHaveValue('dowoom_kim');
    expect(screen.getByRole('textbox', { name: '전화번호' })).toHaveValue('010-0000-0000');
  });

  it('아띠 소속이 아닌 도우미에게는 아띠 태그가 없다', async () => {
    authRequest.mockResolvedValueOnce({
      ...HELPER,
      helper: { attiMember: false, volunteerHours: 0 },
    });

    render(<MyPageScreen reader="HELPER" />);

    expect(await screen.findByText('도우미')).toBeInTheDocument();
    expect(screen.queryByText('아띠 (자기신고)')).not.toBeInTheDocument();
    expect(row('봉사시간')).toHaveTextContent('누적 0시간');
  });

  it('연락 정보를 저장하면 서버가 맞춘 값으로 칸을 바꾸고 토스트로 알린다', async () => {
    // given
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(HELPER);
    render(<MyPageScreen reader="HELPER" />);
    const phone = await screen.findByRole('textbox', { name: '전화번호' });
    authRequest.mockResolvedValueOnce({ ...HELPER, phone: '010-9999-8888' });

    // when
    await user.clear(phone);
    await user.type(phone, '01099998888');
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    expect(authRequest).toHaveBeenLastCalledWith('/api/me/contact', {
      method: 'PATCH',
      body: { kakaoId: 'dowoom_kim', phone: '01099998888' },
    });
    expect(await screen.findByText('저장했어요')).toBeInTheDocument();
    expect(phone).toHaveValue('010-9999-8888');
  });

  it('연락 정보가 규칙에 안 맞으면 서버에 보내지 않고 첫 오류 칸으로 포커스한다', async () => {
    // given
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(HELPER);
    render(<MyPageScreen reader="HELPER" />);
    const kakaoId = await screen.findByRole('textbox', { name: '카톡 ID' });
    authRequest.mockClear();

    // when
    await user.clear(kakaoId);
    await user.type(kakaoId, 'has space');
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    expect(authRequest).not.toHaveBeenCalled();
    expect(kakaoId).toHaveFocus();
    expect(kakaoId).toHaveAccessibleDescription('카톡 ID에는 띄어쓰기를 쓸 수 없어요');
  });

  it('연락 정보 저장이 실패하면 입력값을 두고 오류를 보인다', async () => {
    // given
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(HELPER);
    render(<MyPageScreen reader="HELPER" />);
    const kakaoId = await screen.findByRole('textbox', { name: '카톡 ID' });
    authRequest.mockRejectedValueOnce(new ApiError(500, 'COMMON_ERROR', '서버 오류예요'));

    // when
    await user.type(kakaoId, '2');
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    expect(await screen.findByRole('alert')).toHaveTextContent('잠시 후 다시 시도해 주세요');
    expect(kakaoId).toHaveValue('dowoom_kim2');
  });

  it('문자 알림을 켜면 동의를 저장하고 스위치와 토스트에 반영한다', async () => {
    // given
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(STUDENT);
    render(<MyPageScreen reader="STUDENT" />);
    const sms = await screen.findByRole('switch', { name: '문자 알림' });
    expect(sms).toHaveAttribute('aria-checked', 'false');
    authRequest.mockResolvedValueOnce({ ...STUDENT, smsConsent: true });

    // when
    await user.click(sms);

    // then
    expect(authRequest).toHaveBeenLastCalledWith('/api/me/sms-consent', {
      method: 'PATCH',
      body: { consent: true },
    });
    expect(await screen.findByText('문자 알림을 켰어요')).toBeInTheDocument();
    expect(sms).toHaveAttribute('aria-checked', 'true');
  });

  it('문자 알림 저장이 실패하면 스위치를 그대로 두고 토스트로 알린다', async () => {
    // given
    const user = userEvent.setup();
    authRequest.mockResolvedValueOnce(HELPER);
    render(<MyPageScreen reader="HELPER" />);
    const sms = await screen.findByRole('switch', { name: '문자 알림' });
    authRequest.mockRejectedValueOnce(new ApiError(500, 'COMMON_ERROR', '서버 오류예요'));

    // when
    await user.click(sms);

    // then
    expect(
      await screen.findByText('저장하지 못했어요. 잠시 후 다시 시도해 주세요'),
    ).toBeInTheDocument();
    expect(sms).toHaveAttribute('aria-checked', 'true');
  });

  it('접근성 모드 스위치는 상단 토글과 같은 저장소를 바꾼다', async () => {
    // given
    const user = userEvent.setup();
    textSize.large = true;
    authRequest.mockResolvedValueOnce(STUDENT);
    render(<MyPageScreen reader="STUDENT" />);
    const accessibility = await screen.findByRole('switch', { name: '접근성 모드' });
    expect(accessibility).toHaveAttribute('aria-checked', 'true');

    // when
    await user.click(accessibility);

    // then
    expect(textSize.setByUser).toHaveBeenCalledWith(false);
  });

  it('비밀번호 변경 링크는 마이페이지의 변경 화면으로 간다', async () => {
    authRequest.mockResolvedValueOnce(STUDENT);

    render(<MyPageScreen reader="STUDENT" />);

    expect(await screen.findByRole('link', { name: '비밀번호 변경' })).toHaveAttribute(
      'href',
      '/mypage/password',
    );
  });

  it('탭바의 현재 탭이 마이페이지다', async () => {
    authRequest.mockResolvedValueOnce(HELPER);

    render(<MyPageScreen reader="HELPER" />);

    await screen.findByRole('heading', { name: '김도움' });
    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('비밀번호를 바꾸고 돌아오면 완료 토스트를 한 번 보인다', async () => {
    // given
    passwordChanged.mark();
    authRequest.mockResolvedValueOnce(STUDENT);

    // when
    render(<MyPageScreen reader="STUDENT" />);

    // then
    expect(await screen.findByText('비밀번호를 바꿨어요')).toBeInTheDocument();
    expect(passwordChanged.peek()).toBe(false);
  });

  it('조회에 실패하면 다시 시도할 수 있고 로그아웃도 할 수 있다', async () => {
    // given
    const user = userEvent.setup();
    authRequest.mockRejectedValueOnce(new ApiError(500, 'COMMON_ERROR', '서버 오류예요'));
    render(<MyPageScreen reader="STUDENT" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('내 정보를 불러오지 못했어요');
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
    authRequest.mockResolvedValueOnce(STUDENT);

    // when
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    // then
    expect(await screen.findByRole('heading', { name: '박서연' })).toBeInTheDocument();
  });

  it('로그아웃하면 서버 로그아웃 뒤 첫 화면을 새로 연다', async () => {
    // given
    const user = userEvent.setup();
    const replace = vi.fn();
    vi.stubGlobal('location', { ...window.location, replace });
    authRequest.mockResolvedValueOnce(STUDENT);
    logout.mockResolvedValueOnce(undefined);
    render(<MyPageScreen reader="STUDENT" />);

    // when
    await user.click(await screen.findByRole('button', { name: '로그아웃' }));

    // then
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
