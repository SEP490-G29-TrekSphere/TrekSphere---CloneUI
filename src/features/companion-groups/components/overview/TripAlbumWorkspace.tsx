import {
  Award,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Images,
  Link2,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface PhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'summit' | 'cloud' | 'camping' | 'team';
  uploader: string;
  uploaderAvatar: string;
  date: string;
  likes: number;
}

interface BadgeItem {
  id: string;
  name: string;
  category: string;
  altitude?: string;
  description: string;
  iconColor: string;
  issuedDate: string;
  recipientsCount: number;
  claimed: boolean;
}

export const TripAlbumWorkspace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [driveUrl, setDriveUrl] = useState<string>(
    'https://drive.google.com/drive/folders/treksphere-laothan-2026-hq-photos'
  );
  const [isEditingDrive, setIsEditingDrive] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'summit' | 'cloud' | 'camping' | 'team'>(
    'summit'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock Photo list
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      id: 'p-1',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      title: 'Bình minh rực rỡ trên đỉnh Lảo Thẩn 2.860m',
      category: 'summit',
      uploader: 'Hoàng Nam (Leader)',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      date: '20/10/2026 - 06:15',
      likes: 12,
    },
    {
      id: 'p-2',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      title: 'Biển mây bồng bềnh tại Sống Lưng Lèo Lao',
      category: 'cloud',
      uploader: 'Hương Trà',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      date: '19/10/2026 - 16:40',
      likes: 9,
    },
    {
      id: 'p-3',
      url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      title: 'Đêm cắm trại bên bếp lửa lán Lèo Lao',
      category: 'camping',
      uploader: 'Việt Dũng',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      date: '19/10/2026 - 20:30',
      likes: 15,
    },
    {
      id: 'p-4',
      url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
      title: 'Cả đoàn chốt chặng Bến xe Mỹ Đình xuất phát',
      category: 'team',
      uploader: 'Hoàng Nam (Leader)',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      date: '18/10/2026 - 22:00',
      likes: 8,
    },
    {
      id: 'p-5',
      url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
      title: 'Cột mốc Đỉnh Lảo Thẩn chứng nhận C2C TrekSphere',
      category: 'summit',
      uploader: 'Minh Thuận',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      date: '20/10/2026 - 07:05',
      likes: 18,
    },
    {
      id: 'p-6',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      title: 'Hoàng hôn rực rỡ tại Y Tý Lào Cai',
      category: 'cloud',
      uploader: 'Hương Trà',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      date: '19/10/2026 - 17:50',
      likes: 11,
    },
  ]);

  // Badges list
  const [badges, setBadges] = useState<BadgeItem[]>([
    {
      id: 'b-1',
      name: 'Chinh Phục Đỉnh Lảo Thẩn',
      altitude: '2.860m',
      category: 'Cột mốc độ cao',
      description:
        'Huy chương xác nhận hoàn thành cung trekking Lảo Thẩn (Y Tý, Lào Cai) qua hệ thống TrekSphere.',
      iconColor: 'bg-emerald-500 text-white',
      issuedDate: '20/10/2026',
      recipientsCount: 5,
      claimed: true,
    },
    {
      id: 'b-2',
      name: 'Thợ Săn Mây Ngoại Hạng',
      category: 'Kỷ niệm khoảnh khắc',
      description:
        'Ghi nhận khoảnh khắc bắt trọn biển mây bồng bềnh tại độ cao trên 2.500m cùng nhóm C2C.',
      iconColor: 'bg-blue-500 text-white',
      issuedDate: '20/10/2026',
      recipientsCount: 5,
      claimed: false,
    },
    {
      id: 'b-3',
      name: 'Đồng Đội Uy Tín 5 Sao',
      category: 'Điểm Trust Score',
      description:
        'Đạt danh hiệu thành viên có tinh thần đồng đội & trách nhiệm xuất sắc qua bình chọn Peer Review.',
      iconColor: 'bg-amber-500 text-white',
      issuedDate: '20/10/2026',
      recipientsCount: 3,
      claimed: false,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopiedLink(true);
    showToast('Đã sao chép link Google Drive lưu trữ ảnh gốc!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLikePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  const handleClaimBadge = (badgeId: string) => {
    setBadges((prev) => prev.map((b) => (b.id === badgeId ? { ...b, claimed: true } : b)));
    const badge = badges.find((b) => b.id === badgeId);
    showToast(`Đã gắn huy chương "${badge?.name}" vào Hồ sơ Hiking Profile!`);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) return;

    const newPhoto: PhotoItem = {
      id: `p-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      title: newPhotoTitle,
      category: newPhotoCategory,
      uploader: 'Bạn (Trekker)',
      uploaderAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      date: 'Hôm nay',
      likes: 1,
    };

    setPhotos([newPhoto, ...photos]);
    setNewPhotoTitle('');
    setIsUploadModalOpen(false);
    showToast('Đã tải ảnh mới lên album kỷ niệm thành công!');
  };

  const filteredPhotos =
    activeCategory === 'all' ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6 text-slate-800">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>Kỷ Niệm & Thành Tích Chuyến Đi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Album Ảnh Trekking & Huy Chương Chinh Phục
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Kho lưu trữ khoảnh khắc quý giá cùng đồng đội tại cung đường Lảo Thẩn (2.860m). Cùng
              chia sẻ ảnh 4K chất lượng cao và ghi nhận thành tích cá nhân.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Tải ảnh lên Album</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: SHARED DRIVE LINK STORAGE */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Kho Ảnh Gốc Dung Lượng Cao (Drive / Cloud)</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Dung lượng: 3.2 GB
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Đăng bởi Trưởng nhóm Hoàng Nam · Cập nhật 20/10/2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã chép link</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Google Drive</span>
            </a>
          </div>
        </div>

        {isEditingDrive ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập đường link Google Drive / OneDrive..."
            />
            <button
              type="button"
              onClick={() => {
                setIsEditingDrive(false);
                showToast('Đã lưu đường link kho ảnh thành công!');
              }}
              className="text-xs font-semibold bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"
            >
              Lưu link
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-600 truncate">
            <span className="truncate">{driveUrl}</span>
            <button
              type="button"
              onClick={() => setIsEditingDrive(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-sans font-medium underline ml-2 shrink-0"
            >
              Sửa link
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: CONQUEST BADGES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Huy Chương Thành Tích Của Nhóm</h3>
              <p className="text-xs text-slate-500">
                Danh hiệu & chứng nhận hoàn thành được cấp tự động bởi hệ thống TrekSphere C2C.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md ${badge.iconColor}`}
                    >
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {badge.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {badge.name}
                      </h4>
                      {badge.altitude && (
                        <span className="text-xs font-extrabold text-emerald-600">
                          Độ cao: {badge.altitude}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Cấp ngày: {badge.issuedDate}</span>
                  <span>{badge.recipientsCount} thành viên nhận</span>
                </div>
              </div>

              <div className="pt-2">
                {badge.claimed ? (
                  <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã gắn vào Hiking Profile</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaimBadge(badge.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm active:scale-95"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Gắn Huy Chương Về Hồ Sơ</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: PHOTO GRID ALBUM */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Bộ Sưu Tập Khoảnh Khắc ({filteredPhotos.length})
              </h3>
              <p className="text-xs text-slate-500">
                Hình ảnh tương tác trực tiếp được tải lên bởi các thành viên trong đoàn.
              </p>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'summit', label: 'Đỉnh Lảo Thẩn' },
              { id: 'cloud', label: 'Săn mây' },
              { id: 'camping', label: 'Cắm trại' },
              { id: 'team', label: 'Đồng đội' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* PHOTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPhoto(photo)}
              onKeyUp={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPhoto(photo);
                }
              }}
              className="text-left group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between w-full"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/70 text-white backdrop-blur-md border border-white/20">
                    {photo.category === 'summit'
                      ? '🏔️ Cột mốc Đỉnh'
                      : photo.category === 'cloud'
                        ? '☁️ Săn mây'
                        : photo.category === 'camping'
                          ? '🏕️ Cắm trại'
                          : '👥 Đồng đội'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-bold text-sm leading-snug drop-shadow-md line-clamp-2">
                    {photo.title}
                  </h4>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs text-slate-500 bg-white">
                <div className="flex items-center gap-2">
                  <img
                    src={photo.uploaderAvatar}
                    alt={photo.uploader}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">
                    {photo.uploader}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleLikePhoto(photo.id, e)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{photo.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PREVIEW ENLARGED PHOTO */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-2/3 bg-black flex items-center justify-center p-2 relative">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="md:w-1/3 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {selectedPhoto.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-bold text-lg leading-snug">{selectedPhoto.title}</h3>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <img
                    src={selectedPhoto.uploaderAvatar}
                    alt={selectedPhoto.uploader}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{selectedPhoto.uploader}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{selectedPhoto.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Yêu thích:</span>
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    {selectedPhoto.likes} lượt thích
                  </span>
                </div>

                <a
                  href={selectedPhoto.url}
                  target="_blank"
                  download
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors"
                  rel="noopener"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Ảnh Gốc Chuẩn HD</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPLOAD NEW PHOTO */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <span>Tải Ảnh Mới Lên Album</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả bức ảnh / Tiêu đề khoảnh khắc *
                </label>
                <input
                  type="text"
                  required
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="Ví dụ: Chụp ảnh kỷ niệm tại lán Lèo Lao..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danh mục khoảnh khắc
                </label>
                <select
                  value={newPhotoCategory}
                  onChange={(e) =>
                    setNewPhotoCategory(e.target.value as 'summit' | 'cloud' | 'camping' | 'team')
                  }
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="summit">🏔️ Cột mốc Đỉnh Núi</option>
                  <option value="cloud">☁️ Biển Mây Bồng Bềnh</option>
                  <option value="camping">🏕️ Đêm Cắm Trại / Sinh Hoạt</option>
                  <option value="team">👥 Ảnh Tập Thể Đồng Đội</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 space-y-2 hover:bg-slate-100/80 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  Kéo thả tệp ảnh vào đây hoặc nhấp để chọn
                </div>
                <div className="text-[11px] text-slate-400">
                  Hỗ trợ JPG, PNG, WEBP tối đa 25MB/ảnh
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  Tải lên ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
