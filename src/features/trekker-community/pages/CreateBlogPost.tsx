import { ImageIcon, Link, List, ListOrdered, Quote, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { getMockBlogById, updateMockBlog } from '../data/mockBlogs';

/** Chỉ cho phép URL http(s), data: hoặc blob: — chặn các scheme nguy hiểm như javascript: */
function getSafeImageUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    // blob: URL từ URL.createObjectURL luôn an toàn
    if (url.startsWith('blob:')) return url;

    const parsed = new URL(url, window.location.origin);
    const allowedProtocols = ['http:', 'https:', 'data:'];
    if (allowedProtocols.includes(parsed.protocol)) {
      return url;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/** Các chuyên mục có sẵn */
const CATEGORIES = [
  { id: 'experience', label: 'Kinh nghiệm' },
  { id: 'review', label: 'Review Tour' },
  { id: 'guide', label: 'Cẩm nang' },
  { id: 'equipment', label: 'Thiết bị' },
] as const;

/** Toolbar format icons */
const TOOLBAR_ITEMS = [
  { icon: B, label: 'Bold', action: 'bold' },
  { icon: I, label: 'Italic', action: 'italic' },
  { icon: List, label: 'Danh sách không thứ tự', action: 'ul' },
  { icon: ListOrdered, label: 'Danh sách có thứ tự', action: 'ol' },
  { icon: Link, label: 'Liên kết', action: 'link' },
  { icon: ImageIcon, label: 'Chèn ảnh', action: 'image' },
  { icon: Video, label: 'Chèn video', action: 'video' },
  { icon: MapPin, label: 'Chèn địa điểm', action: 'location' },
  { icon: Quote, label: 'Trích dẫn', action: 'quote' },
];

/** Temporary inline SVG components to avoid imports */
function B({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function I({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function CreateBlogPost({ editMode = false }: { editMode?: boolean }) {
  const navigate = useNavigate();
  const params = useParams();
  const blogId = params.blogId;

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('experience');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(editMode);

  // Load existing blog data when in edit mode
  useEffect(() => {
    if (!editMode || !blogId) return;

    const loadBlog = async () => {
      setIsLoadingBlog(true);
      try {
        // Simulate loading delay
        await new Promise((r) => setTimeout(r, 300));

        // Get blog from mock data
        const blog = getMockBlogById(blogId);

        if (blog) {
          setTitle(blog.title);
          setContent(blog.excerpt);
          setCoverImage(blog.coverImageUrl);
          setTags(blog.tags);
          setAllowComments(true);
          setIsFeatured(false);
          setIsPrivate(false);
        } else {
          toast.error('Không tìm thấy bài viết.');
        }
      } catch {
        toast.error('Không thể tải bài viết. Vui lòng thử lại.');
      } finally {
        setIsLoadingBlog(false);
      }
    };

    loadBlog();
  }, [editMode, blogId]);

  // Show loading state while fetching blog data
  if (isLoadingBlog) {
    return (
      <div className="flex h-64 items-center justify-center" style={{ backgroundColor: '#FAF8F1' }}>
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh tối đa 5MB.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setCoverImage(previewUrl);
    }
  };

  const handleToolbarAction = (action: string) => {
    // TODO: implement rich text formatting
    console.log('Toolbar action:', action);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 500));

      // Update mock data if in edit mode
      if (editMode && blogId) {
        updateMockBlog(blogId, {
          title,
          excerpt: content,
          coverImageUrl: coverImage,
          tags,
          status: 'DRAFT',
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success('Đã lưu bài viết vào nháp!');
    } catch {
      toast.error('Lưu nháp thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 500));

      // Update mock data if in edit mode
      if (editMode && blogId) {
        updateMockBlog(blogId, {
          title,
          excerpt: content,
          coverImageUrl: coverImage,
          tags,
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success('Bài viết đã được đăng thành công!');
      navigate('/blog');
    } catch {
      toast.error('Đăng bài thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/blog');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F1' }}>
      {/* Topbar Action - Transparent, blends with page background */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Left: Back button */}
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

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="rounded-full border-[#6F7B75] px-4 py-2 text-xs font-medium text-[#06261D] hover:bg-[#F0EEE6]"
          >
            Lưu nháp
          </Button>

          <Button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="rounded-full px-4 py-2 text-xs font-medium"
            style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng bài'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold" style={{ color: '#06261D' }}>
            {editMode ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
          </h2>
          <p className="mt-2 max-w-lg text-sm" style={{ color: '#6F7B75' }}>
            Lưu giữ những khoảnh khắc và kinh nghiệm trên cung đường bạn đi.
          </p>
        </div>

        {/* 2-column layout: Editor (65%) + Sidebar (35%) */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Column: Editor Area (65%) */}
          <div className="w-full lg:w-[65%]">
            {/* Cover Image Placeholder */}
            <div className="relative mb-6">
              <button
                type="button"
                className="flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#C5C0B0] bg-[#F8F6EF] transition-colors hover:bg-[#F0EEE6] sm:h-64"
                style={{
                  borderStyle: coverImage ? 'none' : 'dashed',
                  backgroundColor: coverImage ? 'transparent' : '#F8F6EF',
                }}
                onClick={() => {
                  if (!coverImage) {
                    document.getElementById('cover-image-input')?.click();
                  }
                }}
              >
                {coverImage ? (
                  <>
                    <img
                      src={getSafeImageUrl(coverImage)}
                      alt="Cover"
                      className="h-full w-full rounded-3xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImage(null);
                      }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
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
            <div className="mb-4">
              <input
                type="text"
                placeholder="Nhập tiêu đề bài viết tại đây..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-full border px-6 py-4 text-lg font-semibold outline-none transition-colors focus:border-[#06261D]"
                style={{
                  borderColor: '#E6E2D1',
                  backgroundColor: '#FFFFFF',
                  color: '#06261D',
                }}
              />
            </div>

            {/* Toolbar */}
            <div
              className="mb-4 flex flex-wrap items-center gap-1 rounded-full border px-3 py-2"
              style={{ borderColor: '#E6E2D1', backgroundColor: '#FFFFFF' }}
            >
              {TOOLBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.action}
                    type="button"
                    onClick={() => handleToolbarAction(item.action)}
                    title={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F0EEE6]"
                    style={{ color: '#6F7B75' }}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>

            {/* Content Editor */}
            <div
              className="rounded-3xl border"
              style={{ borderColor: '#E6E2D1', backgroundColor: '#FFFFFF' }}
            >
              <Textarea
                placeholder="Bắt đầu chia sẻ hành trình của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-none rounded-3xl border-0 p-6 text-base placeholder:text-[#9E9A92] focus-visible:ring-0"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
          </div>

          {/* Right Column: Sidebar Settings (35%) */}
          <div className="w-full space-y-4 lg:w-[35%]">
            {/* Categories Card */}
            <div
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#F8F6EF', border: '1px solid #E6E2D1' }}
            >
              <h3
                className="mb-4 flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#06261D' }}
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
                  <path d="M3 3h6l6 18h6" />
                  <path d="M14 3h7" />
                </svg>
                Chuyên mục
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                      style={
                        isActive
                          ? { backgroundColor: '#A2EBD2', color: '#06261D' }
                          : {
                              backgroundColor: '#FFFFFF',
                              color: '#6F7B75',
                              border: '1px solid #E6E2D1',
                            }
                      }
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Card */}
            <div
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#F8F6EF', border: '1px solid #E6E2D1' }}
            >
              <h3
                className="mb-4 flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#06261D' }}
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
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                  <path d="M7 7h.01" />
                </svg>
                Thẻ (Tags)
              </h3>

              {/* Add tag input */}
              <div className="mb-3 flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="+ Thêm thẻ mới..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="h-9 rounded-full border-[#E6E2D1] bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#06261D' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Tags list */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Display Options Card */}
            <div
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#F8F6EF', border: '1px solid #E6E2D1' }}
            >
              <h3
                className="mb-4 flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#06261D' }}
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                Tùy chọn hiển thị
              </h3>

              <div className="space-y-4">
                {/* Allow comments */}
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm" style={{ color: '#6F7B75' }}>
                    Cho phép bình luận
                  </span>
                  <button
                    type="button"
                    onClick={() => setAllowComments(!allowComments)}
                    className="relative flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: allowComments ? '#06261D' : '#C5C0B0' }}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: allowComments ? 'translateX(24px)' : 'translateX(4px)' }}
                    />
                  </button>
                </label>

                {/* Featured */}
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm" style={{ color: '#6F7B75' }}>
                    Đặt làm nổi bật
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className="relative flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: isFeatured ? '#06261D' : '#C5C0B0' }}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: isFeatured ? 'translateX(24px)' : 'translateX(4px)' }}
                    />
                  </button>
                </label>

                {/* Private */}
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm" style={{ color: '#6F7B75' }}>
                    Bài viết riêng tư
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="relative flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: isPrivate ? '#06261D' : '#C5C0B0' }}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: isPrivate ? 'translateX(24px)' : 'translateX(4px)' }}
                    />
                  </button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateBlogPost;
