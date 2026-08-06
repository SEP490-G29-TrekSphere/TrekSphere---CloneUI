import { fireEvent, render, screen } from '@testing-library/react';
import { PATHS } from '@/constants';
import type { TrekkerBlogItem } from '../types';
import MyBlogList from './MyBlogList';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => selector({ user: { id: 'u1' } }),
}));

jest.mock('@/store/useToastStore', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/shared/ui', () => ({
  AppSpinner: () => null,
  ConfirmActionDialog: () => null,
}));

const blog: TrekkerBlogItem = {
  blogId: 'b1',
  title: 'Cung đường Tà Xùa',
  coverImageUrl: null,
  status: 'PUBLISHED',
  viewCount: 10,
  authorId: 'u1',
  authorName: 'Minh Tuấn',
  authorAvatarUrl: null,
  totalComments: 0,
  createdAt: '2026-07-28T00:00:00Z',
};

jest.mock('../hooks/useTrekkerBlog', () => ({
  useTrekkerBlogList: () => ({
    data: {
      items: [
        {
          blogId: 'b1',
          title: 'Cung đường Tà Xùa',
          coverImageUrl: null,
          status: 'PUBLISHED',
          viewCount: 10,
          authorId: 'u1',
          authorName: 'Minh Tuấn',
          authorAvatarUrl: null,
          totalComments: 0,
          createdAt: '2026-07-28T00:00:00Z',
        },
      ],
      meta: { pageNumber: 1, pageSize: 8, totalElements: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
  }),
}));

jest.mock('../hooks/useTrekkerBlogMutations', () => ({
  useTrekkerBlogMutations: () => ({
    toggleVisibility: { mutate: jest.fn(), isPending: false },
    deleteBlog: { mutate: jest.fn(), isPending: false },
  }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

test('nút "Viết bài mới" điều hướng trong portal Trekker (giữ nguyên sidebar)', () => {
  render(<MyBlogList />);
  fireEvent.click(screen.getByRole('button', { name: /Viết bài mới/ }));
  expect(mockNavigate).toHaveBeenCalledWith(PATHS.TREKKER_BLOG_CREATE);
});

test('nút Sửa điều hướng sang trang sửa trong portal Trekker', () => {
  render(<MyBlogList />);
  fireEvent.click(screen.getByTitle('Sửa bài viết'));
  expect(mockNavigate).toHaveBeenCalledWith(`/trekker/blog/edit/${blog.blogId}`);
});
