import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom에는 dialog.showModal/close가 없다. Modal 테스트용 최소 구현 (open 속성만 토글)
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
});
