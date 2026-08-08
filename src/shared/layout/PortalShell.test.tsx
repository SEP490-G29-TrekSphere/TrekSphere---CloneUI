import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import PortalShell from './PortalShell';

/**
 * Drawer mobile là phần logic duy nhất `PortalShell` tự quản (phần còn lại chỉ
 * là class Tailwind). Test bám vào 4 hành vi mà hỏng cái nào cũng khiến người
 * dùng mobile mất điều hướng: mở được, tự đóng sau khi điều hướng, đóng bằng
 * Escape, đóng khi bấm lớp phủ.
 *
 * Sidebar luôn nằm trong DOM (đóng/mở bằng `translate-x`), nên trạng thái được
 * kiểm qua class chứ không qua việc element có tồn tại hay không.
 */
function renderShell() {
  const view = render(
    <MemoryRouter initialEntries={['/admin/accounts']}>
      <PortalShell
        brand={<span>TrekSphere</span>}
        nav={<Link to="/admin/vendors">Nhà cung cấp</Link>}
        userCard={<span>Admin User</span>}
        mobileTitle="TrekSphere Admin"
      >
        <Routes>
          <Route path="/admin/accounts" element={<p>Trang tài khoản</p>} />
          <Route path="/admin/vendors" element={<p>Trang nhà cung cấp</p>} />
        </Routes>
      </PortalShell>
    </MemoryRouter>
  );
  const aside = view.container.querySelector('aside');
  if (!aside) throw new Error('PortalShell phải render <aside>');
  return { ...view, aside };
}

/**
 * Đóng ⇔ có class `-translate-x-full`. Phải so khớp nguyên token: `<aside>` luôn
 * mang sẵn `md:translate-x-0` cho desktop, nên kiểm bằng `includes('translate-x-0')`
 * sẽ luôn ra "đang mở".
 */
const isOpen = (aside: Element) => !aside.className.split(/\s+/).includes('-translate-x-full');
const openMenu = () => fireEvent.click(screen.getByLabelText('Mở menu điều hướng'));

test('mặc định drawer đóng (trượt khỏi màn hình)', () => {
  const { aside } = renderShell();
  expect(isOpen(aside)).toBe(false);
});

test('bấm hamburger thì mở drawer', () => {
  const { aside } = renderShell();
  openMenu();
  expect(isOpen(aside)).toBe(true);
});

test('điều hướng sang trang khác thì drawer tự đóng', () => {
  const { aside } = renderShell();
  openMenu();
  fireEvent.click(screen.getByText('Nhà cung cấp'));
  expect(screen.getByText('Trang nhà cung cấp')).toBeDefined();
  expect(isOpen(aside)).toBe(false);
});

test('nhấn Escape thì đóng drawer', () => {
  const { aside } = renderShell();
  openMenu();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(isOpen(aside)).toBe(false);
});

test('bấm lớp phủ thì đóng drawer', () => {
  const { aside } = renderShell();
  openMenu();
  // Có 2 nút cùng nhãn: lớp phủ và nút X trong drawer — lớp phủ đứng trước.
  fireEvent.click(screen.getAllByLabelText('Đóng menu điều hướng')[0]);
  expect(isOpen(aside)).toBe(false);
});

test('khoá scroll nền khi drawer mở và trả lại khi đóng', () => {
  renderShell();
  openMenu();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(document.body.style.overflow).not.toBe('hidden');
});
