// 화면 읽어 주기 (U-07, Figma 14:901). 브라우저 음성 합성(Web Speech API)으로 지금 화면을 읽는다.
// 읽는 범위는 화면 제목(h1) → 본문(main)이다 — 상단 바 버튼·탭바·푸터는 읽지 않는다. 모달이 열려 있으면 모달만 읽는다

export type ReadAloudState = 'unsupported' | 'idle' | 'reading';

// 이 요소들 안의 글자는 한 덩어리로 읽는다. 그 밖의 글자(상태 태그 등)는 바로 위 요소 단위로 끊는다
const BLOCK_TAGS = new Set([
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'P',
  'LI',
  'BUTTON',
  'A',
  'LABEL',
  'LEGEND',
  'DT',
  'DD',
  'TH',
  'TD',
]);

function isHidden(element: Element): boolean {
  if (element.closest('[aria-hidden="true"], [hidden]')) return true;
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (getComputedStyle(node).display === 'none') return true;
  }
  return false;
}

function readingRoots(doc: Document): Element[] {
  const dialog = doc.querySelector('[role="dialog"][aria-modal="true"]');
  if (dialog) return [dialog];
  return [doc.querySelector('h1'), doc.querySelector('main')].flatMap((root) =>
    root ? [root] : [],
  );
}

/**
 * 읽을 문장을 DOM 순서대로 모은다 (보이는 순서 = 읽는 순서 규칙이라 DOM 순서가 곧 읽기 순서).
 * 장식(aria-hidden)·숨긴 요소는 빼고, 화면에는 안 보이는 스크린리더용 안내(sr-only)는 넣는다 — 화면을 못 보는 사용자에게 필요한 정보라서.
 * 긴 글을 한 번에 읽으면 브라우저가 중간에 끊으므로 문단 단위로 나눈다.
 */
export function readableChunks(doc: Document = document): string[] {
  const chunks: string[] = [];
  let currentBlock: Element | null = null;

  for (const root of readingRoots(doc)) {
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      const text = node.textContent?.replace(/\s+/g, ' ').trim();
      if (!parent || !text || isHidden(parent)) continue;

      let block: Element = parent;
      for (
        let el: Element | null = parent;
        el && el !== root.parentElement;
        el = el.parentElement
      ) {
        if (BLOCK_TAGS.has(el.tagName)) {
          block = el;
          break;
        }
      }
      if (block === currentBlock) {
        chunks[chunks.length - 1] += ` ${text}`;
      } else {
        chunks.push(text);
        currentBlock = block;
      }
    }
  }
  return chunks;
}

const listeners = new Set<() => void>();
let state: ReadAloudState = 'idle';
// 읽기를 새로 시작하거나 멈출 때마다 올린다. 취소된 이전 문장의 end 이벤트가 늦게 와도 지금 상태를 바꾸지 않게 한다
let session = 0;

const isSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function setState(next: ReadAloudState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export const readAloudStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: (): ReadAloudState => (isSupported() ? state : 'unsupported'),
  getServerSnapshot: (): ReadAloudState => 'idle',
  // iOS Safari는 사용자 동작 안에서 시작해야 소리가 나므로 버튼 클릭에서 바로 부른다
  start() {
    if (!isSupported()) return;
    const mine = ++session;
    window.speechSynthesis.cancel();
    const chunks = readableChunks();
    if (chunks.length === 0) {
      setState('idle');
      return;
    }
    const finish = () => {
      if (mine === session) setState('idle');
    };
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = 'ko-KR';
      if (index === chunks.length - 1) utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    });
    setState('reading');
  },
  stop() {
    session += 1;
    if (isSupported()) window.speechSynthesis.cancel();
    if (state !== 'idle') setState('idle');
  },
};
