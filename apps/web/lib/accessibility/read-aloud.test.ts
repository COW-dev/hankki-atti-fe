import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readableChunks, readAloudStore } from '@/lib/accessibility/read-aloud';

// jsdom에는 음성 합성이 없어 speak·cancel만 흉내 낸다
class FakeUtterance {
  lang = '';
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

function stubSpeech() {
  const spoken: FakeUtterance[] = [];
  const synth = {
    speak: vi.fn((utterance: FakeUtterance) => spoken.push(utterance)),
    cancel: vi.fn(),
  };
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return { synth, spoken };
}

describe('readableChunks', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('화면 제목 다음 본문을 DOM 순서대로 모으고 상단 바 버튼·푸터는 읽지 않는다', () => {
    // given
    document.body.innerHTML = `
      <header><h1>내 신청</h1><button>큰 글씨</button></header>
      <main>
        <h2>다가오는 신청</h2>
        <p>10월 6일 <strong>저녁</strong> 신청</p>
        <span>모집 중</span>
      </main>
      <footer><p>명지대학교 장애학생지원센터</p></footer>
      <nav><a href="/">내 신청</a></nav>`;

    // when
    const chunks = readableChunks();

    // then
    expect(chunks).toEqual(['내 신청', '다가오는 신청', '10월 6일 저녁 신청', '모집 중']);
  });

  it('장식(aria-hidden)·숨긴 요소는 빼고 스크린리더용 안내(sr-only)는 넣는다', () => {
    // given
    document.body.innerHTML = `
      <h1>로그인</h1>
      <main>
        <p><span aria-hidden="true">▶</span> 안내</p>
        <p hidden>숨김</p>
        <p style="display: none">안 보임</p>
        <button><span class="sr-only">조건 2개 남음.</span> 로그인</button>
      </main>`;

    // when
    const chunks = readableChunks();

    // then
    expect(chunks).toEqual(['로그인', '안내', '조건 2개 남음. 로그인']);
  });

  it('모달이 열려 있으면 모달 내용만 읽는다', () => {
    // given
    document.body.innerHTML = `
      <h1>내 신청</h1>
      <main><p>목록</p></main>
      <div role="dialog" aria-modal="true"><h2>매칭을 취소할까요?</h2><p>도우미에게 알려요</p></div>`;

    // when
    const chunks = readableChunks();

    // then
    expect(chunks).toEqual(['매칭을 취소할까요?', '도우미에게 알려요']);
  });
});

describe('readAloudStore', () => {
  beforeEach(() => {
    document.body.innerHTML = '<h1>공지사항</h1><main><p>운영 시간 안내</p></main>';
  });
  afterEach(() => {
    readAloudStore.stop();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('시작하면 문장을 한국어로 차례로 읽고, 마지막 문장이 끝나면 읽기를 마친다', () => {
    // given
    const { spoken } = stubSpeech();
    const onChange = vi.fn();
    const unsubscribe = readAloudStore.subscribe(onChange);

    // when
    readAloudStore.start();

    // then
    expect(spoken.map((utterance) => utterance.text)).toEqual(['공지사항', '운영 시간 안내']);
    expect(spoken.every((utterance) => utterance.lang === 'ko-KR')).toBe(true);
    expect(readAloudStore.getSnapshot()).toBe('reading');
    expect(onChange).toHaveBeenCalled();

    spoken[1].onend?.();
    expect(readAloudStore.getSnapshot()).toBe('idle');
    unsubscribe();
  });

  it('정지하면 읽기를 취소하고, 취소된 문장의 끝 이벤트가 늦게 와도 다시 시작한 읽기를 끝내지 않는다', () => {
    // given
    const { synth, spoken } = stubSpeech();
    readAloudStore.start();
    const stale = spoken[1];

    // when
    readAloudStore.stop();

    // then
    expect(synth.cancel).toHaveBeenCalled();
    expect(readAloudStore.getSnapshot()).toBe('idle');

    readAloudStore.start();
    stale.onend?.();
    expect(readAloudStore.getSnapshot()).toBe('reading');
  });

  it('음성 합성을 지원하지 않으면 미지원 상태이고 시작해도 아무것도 하지 않는다', () => {
    // given: jsdom에는 speechSynthesis가 없다
    expect('speechSynthesis' in window).toBe(false);

    // when
    readAloudStore.start();

    // then
    expect(readAloudStore.getSnapshot()).toBe('unsupported');
  });
});
