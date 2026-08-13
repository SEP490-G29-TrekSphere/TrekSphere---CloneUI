import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import { Button } from '@/components/ui/button';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { getSafeImageUrl, stripHtml } from '@/utils/sanitize';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { BlogPreviewModal } from '../components/BlogPreviewModal';
import { MyBlogPagination } from '../components/MyBlogPagination';
import { MyBlogTable } from '../components/MyBlogTable';
import { useTrekkerBlogDetail, useTrekkerBlogList } from '../hooks/useTrekkerBlog';
import { useTrekkerBlogMutations } from '../hooks/useTrekkerBlogMutations';

const STAFF_POSTS_PAGE_SIZE = 5;

/** ~200 từ/phút — ước tính đơn giản, tính hoàn toàn phía client. */
function computeReadStats(content: string) {
  const words = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
  return { words, minutes };
}

const blogFormSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề bài viết.'),
  content: z.string().trim().min(1, 'Vui lòng nhập nội dung bài viết.'),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export function CreateBlogPost({ editMode = false }: { editMode?: boolean }) {
  const navigate = useNavigate();
  const params = useParams();
  const blogId = params.blogId;

  const user = useAppStore((state) => state.user);
  const isStaff = getPrimaryRole(user?.roles) === ROLES.VENDOR_STAFF;

  const { data: existingBlog, isLoading: isLoadingBlog } = useTrekkerBlogDetail(
    editMode ? blogId : undefined
  );
  const { createBlog, updateBlog } = useTrekkerBlogMutations();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [staffPostsPage, setStaffPostsPage] = useState(1);

  // Staff không có màn "Bài viết của tôi" riêng — hiển thị luôn danh sách bài
  // đã đăng ngay dưới khung soạn thảo trên trang Viết Blog.
  const showStaffPostList = isStaff && !editMode;
  const staffPosts = useTrekkerBlogList(
    {
      authorId: user?.id,
      page: staffPostsPage,
      size: STAFF_POSTS_PAGE_SIZE,
      sortBy: 'createdAt',
      sortDir: 'desc',
    },
    { enabled: showStaffPostList }
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: { title: '', content: '' },
  });

  const title = watch('title');
  const content = watch('content');

  // Nạp dữ liệu bài viết khi ở chế độ Sửa
  useEffect(() => {
    if (!existingBlog) return;
    reset({ title: existingBlog.title, content: existingBlog.content });
    setCoverPreview(existingBlog.coverImageUrl ?? null);
  }, [existingBlog, reset]);

  // Dọn dẹp blob preview khi đổi ảnh hoặc unmount
  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB.');
      return;
    }
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    // Ở chế độ Sửa, bỏ file vừa chọn = quay lại ảnh bìa đang lưu trên server.
    // BE không có trường nào để XOÁ ảnh bìa (`UpdateBlogRequest` chỉ có
    // title/content + part `coverImage`), nên nút xoá chỉ hiện khi user vừa
    // chọn file mới — xem `canRemoveCover`.
    setCoverPreview(editMode ? (existingBlog?.coverImageUrl ?? null) : null);
  };

  const isSubmitting = createBlog.isPending || updateBlog.isPending;

  // Ảnh bìa đi kèm luôn trong multipart của POST/PUT /blogs (part `coverImage`),
  // BE tự lưu file và trả về `coverImageUrl` — không upload trước qua /files/upload.
  const onSubmit = (values: BlogFormValues) => {
    if (editMode && blogId) {
      updateBlog.mutate(
        {
          blogId,
          payload: {
            title: values.title,
            content: values.content,
            ...(coverFile ? { coverImage: coverFile } : {}),
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã lưu thay đổi.');
            navigate(PATHS.TREKKER_BLOG_LIST);
          },
          onError: (err: unknown) =>
            toast.error(err instanceof Error ? err.message : 'Không thể lưu thay đổi.'),
        }
      );
      return;
    }

    createBlog.mutate(
      {
        title: values.title,
        content: values.content,
        ...(coverFile ? { coverImage: coverFile } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Bài viết đã được đăng thành công!');
          if (isStaff) {
            // Staff không có trang danh sách riêng — ở lại đây, reset form để
            // viết bài tiếp theo, bài vừa đăng sẽ tự xuất hiện trong danh sách bên dưới.
            reset({ title: '', content: '' });
            handleRemoveCover();
            setStaffPostsPage(1);
          } else {
            navigate(PATHS.TREKKER_BLOG_LIST);
          }
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Đăng bài thất bại.'),
      }
    );
  };

  const handleBack = () => navigate(isStaff ? PATHS.PARTNER : PATHS.TREKKER_BLOG_LIST);

  if (editMode && isLoadingBlog) {
    return (
      <div className="flex h-64 items-center justify-center" style={{ backgroundColor: '#FAF8F1' }}>
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  // Remove HTML tags for word counting
  const plainTextContent = stripHtml(content ?? '');
  const readStats = computeReadStats(plainTextContent);
  const safeCoverPreview = getSafeImageUrl(coverPreview);
  // Chỉ cho gỡ ảnh khi ảnh đó do user vừa chọn ở phiên này. Ảnh bìa đã lưu trên
  // server thì BE chưa hỗ trợ xoá, nếu vẫn hiện nút X thì user bấm xong tưởng
  // đã xoá nhưng bài viết vẫn giữ nguyên ảnh cũ.
  const canRemoveCover = !editMode || coverFile !== null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F1' }}>
      {/* Topbar Action */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{ backgroundColor: 'transparent' }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
          style={{ color: '#6F7B75' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay lại
        </button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="rounded-full border-[#6F7B75] px-4 py-2 text-xs font-medium text-[#06261D] hover:bg-[#F0EEE6]"
          >
            Xem trước
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-full px-4 py-2 text-xs font-medium"
            style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
          >
            {isSubmitting ? 'Đang xử lý...' : editMode ? 'Lưu thay đổi' : 'Đăng bài'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-none w-full px-4 pb-16 sm:px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold" style={{ color: '#06261D' }}>
            {editMode ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
          </h2>
          <p className="mt-2 max-w-lg text-sm" style={{ color: '#6F7B75' }}>
            Lưu giữ những khoảnh khắc và kinh nghiệm trên cung đường bạn đi.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Column: Editor Area (65%) */}
          <div className="w-full lg:w-[65%]">
            {/* Cover Image */}
            <div className="relative mb-6">
              <button
                type="button"
                className="flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#C5C0B0] bg-[#F8F6EF] transition-colors hover:bg-[#F0EEE6] sm:h-64"
                style={{
                  borderStyle: safeCoverPreview ? 'none' : 'dashed',
                  backgroundColor: safeCoverPreview ? 'transparent' : '#F8F6EF',
                }}
                // Bấm vào khung để chọn ảnh, kể cả khi đã có ảnh — đây là cách
                // duy nhất để đổi ảnh bìa ở chế độ Sửa (nút X không hiện với
                // ảnh đã lưu trên server).
                onClick={() => document.getElementById('cover-image-input')?.click()}
              >
                {safeCoverPreview ? (
                  <>
                    <img
                      src={safeCoverPreview}
                      alt="Cover"
                      className="h-full w-full rounded-3xl object-cover"
                    />
                    {canRemoveCover && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCover();
                        }}
                        aria-label="Gỡ ảnh bìa"
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: '#E6E2D1' }}
                    >
                      <ImageIcon className="h-6 w-6" style={{ color: '#6F7B75' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#6F7B75' }}>
                      Nhấn để tải ảnh bìa lên
                    </p>
                    <p className="mt-1 text-xs" style={{ color: '#9E9A92' }}>
                      Kéo thả hoặc chọn file (tối đa 5MB)
                    </p>
                  </>
                )}
              </button>
              <input
                id="cover-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageUpload}
              />
            </div>

            {/* Title Input */}
            <div className="mb-1">
              <input
                type="text"
                placeholder="Nhập tiêu đề bài viết tại đây..."
                {...register('title')}
                className="w-full rounded-full border px-6 py-4 text-lg font-semibold outline-none transition-colors focus:border-[#06261D]"
                style={{
                  borderColor: errors.title ? '#EF4444' : '#E6E2D1',
                  backgroundColor: '#FFFFFF',
                  color: '#06261D',
                }}
              />
              {errors.title && (
                <p className="mt-1 px-2 text-xs font-medium" style={{ color: '#EF4444' }}>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content Editor */}
            <div
              className="mt-4 rounded-3xl border overflow-hidden [&_.quill]:flex [&_.quill]:flex-col [&_.quill]:h-[400px] lg:[&_.quill]:h-[500px] [&_.quill]:border-none [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-container]:!border-none [&_.ql-container]:text-base [&_.ql-container]:font-inherit [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-[#E6E2D1] [&_.ql-editor.ql-blank::before]:text-[#9E9A92] [&_.ql-editor.ql-blank::before]:not-italic"
              style={{
                borderColor: errors.content ? '#EF4444' : '#E6E2D1',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        [{ font: [] }],
                        [{ size: [] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [
                          { list: 'ordered' },
                          { list: 'bullet' },
                          { indent: '-1' },
                          { indent: '+1' },
                        ],
                        [{ align: [] }],
                        ['link', 'image', 'video'],
                        ['clean'],
                      ],
                    }}
                    placeholder="Bắt đầu chia sẻ hành trình của bạn..."
                  />
                )}
              />
            </div>
            {errors.content && (
              <p className="mt-1 px-2 text-xs font-medium" style={{ color: '#EF4444' }}>
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Right Column: Sidebar (35%) */}
          <div className="w-full space-y-4 lg:w-[35%]">
            {/* Read Time Card */}
            <div
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#F8F6EF', border: '1px solid #E6E2D1' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: '#06261D' }}>
                  Số lượng từ
                </h3>
                <span className="text-sm font-bold" style={{ color: '#06261D' }}>
                  {readStats.words} từ
                </span>
              </div>
            </div>

            {/* Publish Info Card */}
            <div
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#F8F6EF', border: '1px solid #E6E2D1' }}
            >
              <h3 className="mb-3 text-sm font-semibold" style={{ color: '#06261D' }}>
                Tác giả
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: '#06261D' }}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{(user?.name ?? '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
                  {user?.name ?? 'Bạn'}
                </p>
              </div>
              <p className="mt-3 text-xs" style={{ color: '#6F7B75' }}>
                {editMode
                  ? 'Thay đổi sẽ được cập nhật ngay trên bài viết đã đăng.'
                  : 'Bài viết sẽ hiển thị công khai với cộng đồng TrekSphere ngay sau khi đăng.'}
              </p>
            </div>
          </div>
        </div>

        {showStaffPostList && (
          <div className="mt-10">
            <h3 className="mb-4 text-lg font-bold" style={{ color: '#06261D' }}>
              Bài viết đã đăng
            </h3>

            {staffPosts.isLoading ? (
              <div
                className="flex items-center justify-center rounded-2xl py-16"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
              >
                <AppSpinner size="default" className="text-primary" />
              </div>
            ) : (
              <>
                <MyBlogTable blogs={staffPosts.data?.items ?? []} />
                {(staffPosts.data?.meta.totalElements ?? 0) > 0 && (
                  <div
                    className="overflow-hidden rounded-b-3xl"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderTop: '1px solid #E6E2D1',
                      borderRadius: '0 0 24px 24px',
                    }}
                  >
                    <MyBlogPagination
                      currentPage={staffPostsPage}
                      totalPages={Math.max(1, staffPosts.data?.meta.totalPages ?? 1)}
                      onPageChange={setStaffPostsPage}
                      totalCount={staffPosts.data?.meta.totalElements ?? 0}
                      pageSize={STAFF_POSTS_PAGE_SIZE}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {showPreview && (
        <BlogPreviewModal
          title={title || 'Tiêu đề bài viết'}
          content={content || ''}
          coverPreview={safeCoverPreview}
          authorName={user?.name ?? 'Bạn'}
          authorAvatarUrl={user?.avatarUrl}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default CreateBlogPost;
