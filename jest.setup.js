// Global Jest setup — chạy trước mỗi test file (xem `setupFiles` trong package.json).
//
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
