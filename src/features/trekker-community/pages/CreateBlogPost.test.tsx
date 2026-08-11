import { fireEvent, render, screen } from '@testing-library/react';
import { PATHS } from '@/constants';
import { CreateBlogPost } from './CreateBlogPost';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

const mockUser: { id: string; name: string; roles: string[] } = {
  id: 'u1',
  name: 'Minh Tuấn',
  roles: ['trekker'],
};

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => selector({ user: mockUser }),
}));

jest.mock('@/store/useToastStore', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/shared/ui', () => ({
  AppSpinner: () => null,
}));

jest.mock('../hooks/useTrekkerBlog', () => ({
  useTrekkerBlogDetail: () => ({ data: undefined, isLoading: false }),
  useTrekkerBlogList: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('../hooks/useTrekkerBlogMutations', () => ({
  useTrekkerBlogMutations: () => ({
    createBlog: { mutate: jest.fn(), isPending: false },
    updateBlog: { mutate: jest.fn(), isPending: false },
  }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  mockUser.roles = ['trekker'];
});

test('Trekker bấm "Quay lại" thì về danh sách bài viết trong portal Trekker', () => {
  render(<CreateBlogPost />);
  fireEvent.click(screen.getByRole('button', { name: /Quay lại/ }));
  expect(mockNavigate).toHaveBeenCalledWith(PATHS.TREKKER_BLOG_LIST);
});

test('Vendor staff bấm "Quay lại" thì vẫn về portal Partner', () => {
  mockUser.roles = ['vendor_staff'];
  render(<CreateBlogPost />);
  fireEvent.click(screen.getByRole('button', { name: /Quay lại/ }));
  expect(mockNavigate).toHaveBeenCalledWith(PATHS.PARTNER);
});
