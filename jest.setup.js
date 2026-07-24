// Global Jest setup — chạy trước mỗi test file (xem `setupFiles` trong package.json).
//
// jsdom không tự có `TextEncoder`/`TextDecoder` (đây là global của Node/web
// platform, không thuộc DOM API mà jsdom implement) — nhưng react-router-dom
// v7 cần tới nó ngay khi import, nếu thiếu sẽ throw
// "ReferenceError: TextEncoder is not defined". Polyfill từ module `util`
// của Node.
const { TextEncoder, TextDecoder } = require('node:util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// jsdom không implement `window.matchMedia`, nhưng nhiều component (dark mode
// toggle, responsive hooks...) gọi tới nó — nếu thiếu sẽ throw
// "matchMedia is not a function" ngay khi render. Mock tối thiểu ở đây để
// mọi test render được bình thường.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
