import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS, getNewsDetailPath, getTrekkerGroupDetailPath } from '@/constants/paths';
import { useAppStore } from '@/store/useAppStore';
import { getPublicProfileData } from '../data/publicProfileMock';
import type { UserMoment, UserPublicProfileData } from '../types';
import { FITNESS_LEVELS, PACE_STYLES, SKILL_OPTIONS, TERRAIN_OPTIONS } from '../types';

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.user);

  const targetUserId = userId || currentUser?.id || 'user-trekker-1';
  const isOwnProfile =
    targetUserId === 'me' || targetUserId === currentUser?.id || targetUserId === 'user-trekker-1';

  const [profileData, setProfileData] = useState<UserPublicProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'moments' | 'posts' | 'trips'>('overview');
  const [selectedMoment, setSelectedMoment] = useState<UserMoment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load public profile mock/data
    const data = getPublicProfileData(targetUserId, currentUser);
    setProfileData(data);
  }, [targetUserId, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép đường dẫn trang cá nhân vào khay nhớ tạm!');
    } else {
      showToast(`Đường dẫn trang cá nhân: ${window.location.href}`);
    }
  };

  const handleInviteToGroup = () => {
    showToast(`Đã gửi lời mời tham gia nhóm tới ${profileData?.fullName}!`);
  };

  if (!profileData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center font-mono">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">[ĐANG TẢI DỮ LIỆU TRANG CÁ NHÂN...]</p>
        </div>
      </div>
    );
  }

  const fitnessObj = FITNESS_LEVELS.find((f) => f.value === profileData.preferences?.fitnessLevel);
  const paceObj = PACE_STYLES.find((p) => p.value === profileData.preferences?.paceStyle);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl font-mono text-sm border border-gray-700 animate-fade-in flex items-center gap-3">
          <span className="text-emerald-400 font-bold">[THÔNG BÁO]</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gray-800 border-b border-gray-200">
        <img
          src={profileData.coverUrl}
          alt="Cover"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/20" />
        
        {/* Back navigation pill */}
        <div className="absolute top-4 left-4 sm:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 bg-gray-900/80 hover:bg-gray-900 text-white font-mono text-xs uppercase tracking-wider rounded border border-gray-700 transition"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-20 sm:-mt-24 mb-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
            {/* Avatar & User Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.fullName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover border-4 border-white shadow-md bg-gray-100"
                />
                {profileData.verifiedBadge && (
                  <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                    ✓ ĐÃ XÁC THỰC
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {profileData.fullName}
                  </h1>
                  <span className="font-mono text-xs text-gray-500 font-medium">
                    @{profileData.handle}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-block bg-gray-900 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider rounded">
                    [{profileData.role}]
                  </span>
                  <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded">
                    ★ {profileData.reputationScore} / 5 ({profileData.reviewCount} đánh giá)
                  </span>
                </div>

                <p className="text-xs font-mono text-gray-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  <span>Vị trí: <strong className="text-gray-700">{profileData.location}</strong></span>
                  <span>Thành viên từ: <strong className="text-gray-700">{profileData.joinedDate}</strong></span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate(PATHS.EDIT_PROFILE)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition shadow-sm text-center"
                >
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(PATHS.TREKKER_CHAT)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition text-center"
                  >
                    Gửi tin nhắn
                  </button>
                  <button
                    onClick={handleInviteToGroup}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-xs uppercase font-bold tracking-wider rounded transition text-center"
                  >
                    Mời vào nhóm
                  </button>
                </>
              )}
              <button
                onClick={handleShareProfile}
                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-mono text-xs uppercase font-bold tracking-wider rounded transition text-center"
                title="Chia sẻ trang cá nhân"
              >
                Chia sẻ
              </button>
            </div>
          </div>

          {/* User Bio */}
          <div className="pt-4">
            <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
              {profileData.bio}
            </p>
          </div>

          {/* Social Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="block text-2xl font-black text-gray-900 font-mono">
                {profileData.stats.tripsCount}
              </span>
              <span className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
                Chuyến đi
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="block text-2xl font-black text-gray-900 font-mono">
                {profileData.stats.postsCount}
              </span>
              <span className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
                Bài viết
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="block text-2xl font-black text-gray-900 font-mono">
                {profileData.stats.momentsCount}
              </span>
              <span className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
                Khoảnh khắc
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="block text-2xl font-black text-emerald-700 font-mono">
                {profileData.reputationScore} ★
              </span>
              <span className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
                Độ uy tín
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            [TỔNG QUAN HỒ SƠ]
          </button>
          <button
            onClick={() => setActiveTab('moments')}
            className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
              activeTab === 'moments'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            [KHOẢNH KHẮC ({profileData.moments.length})]
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            [BÀI ĐĂNG ({profileData.posts.length})]
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
              activeTab === 'trips'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            [CHUYẾN ĐI & NHÓM ({profileData.trips.length})]
          </button>
        </div>

        {/* TAB 1: OVERVIEW & TREKKING PROFILE */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Fitness & Pace Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-700 border-b border-gray-100 pb-3">
                [1. THỂ LỰC & PHONG CÁCH LEO NÚI]
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <span className="font-mono text-xs text-gray-500 uppercase font-semibold">Cấp độ thể lực</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900 uppercase">
                      [{fitnessObj?.label || profileData.preferences?.fitnessLevel || 'Nâng cao'}]
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {fitnessObj?.desc || 'Kinh nghiệm phong phú, chinh phục các mốc dốc cao.'}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <span className="font-mono text-xs text-gray-500 uppercase font-semibold">Tốc độ di chuyển</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900 uppercase">
                      [{paceObj?.label || 'Bền bỉ & Giữ khoảng cách'}]
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {paceObj?.desc || 'Đồng hành cùng nhóm, duy trì nhịp thở ổn định.'}
                  </p>
                </div>
              </div>

              {profileData.preferences?.planningNotes && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-800 uppercase">[KẾ HOẠCH & ĐỀ XUẤT GHÉP NHÓM]</span>
                  <p className="text-xs text-gray-800 leading-relaxed font-mono">
                    "{profileData.preferences.planningNotes}"
                  </p>
                </div>
              )}
            </div>

            {/* Skills & Terrains Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-700 border-b border-gray-100 pb-3">
                [2. KỸ NĂNG, TRANG BỊ & ĐỊA HÌNH YÊU THÍCH]
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-gray-500 uppercase font-semibold mb-2">Kỹ năng & Trang bị sở hữu:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferences?.skillsAndEquipment && profileData.preferences.skillsAndEquipment.length > 0 ? (
                      profileData.preferences.skillsAndEquipment.map((skillId) => {
                        const opt = SKILL_OPTIONS.find((s) => s.id === skillId);
                        return (
                          <span
                            key={skillId}
                            className="bg-gray-100 text-gray-800 border border-gray-300 font-mono text-xs px-3 py-1 rounded"
                          >
                            ✓ {opt?.label || skillId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="font-mono text-xs text-gray-400">Chưa cập nhật kỹ năng</span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-mono text-gray-500 uppercase font-semibold mb-2">Địa hình thường chinh phục:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferences?.preferredTerrains && profileData.preferences.preferredTerrains.length > 0 ? (
                      profileData.preferences.preferredTerrains.map((terrainId) => {
                        const opt = TERRAIN_OPTIONS.find((t) => t.id === terrainId);
                        return (
                          <span
                            key={terrainId}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs px-3 py-1 rounded font-semibold"
                          >
                            ▲ {opt?.label || terrainId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="font-mono text-xs text-gray-400">Chưa chọn địa hình</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Medical Statement */}
            <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-6 space-y-2">
              <h3 className="font-mono text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
                <span>[BẢO MẬT & DỮ LIỆU CẤP CỨU SOS]</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thông tin y tế riêng tư (Nhóm máu, Tiền sử bệnh, Dị ứng và Số điện thoại liên lạc người thân) của thành viên được mã hóa và bảo mật nghiêm ngặt. Thông tin chỉ tự động hiển thị cho Trưởng đoàn và Đội cứu hộ địa phương trong tình huống phát tín hiệu cấp cứu SOS khẩn cấp.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: MOMENTS */}
        {activeTab === 'moments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-700">
                [KHOẢNH KHẮC TREKKING CHECK-IN]
              </h2>
              <span className="text-xs font-mono text-gray-500">
                Tổng cộng: {profileData.moments.length} hình ảnh
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profileData.moments.map((moment) => (
                <div
                  key={moment.id}
                  onClick={() => setSelectedMoment(moment)}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-900">
                    <img
                      src={moment.imageUrl}
                      alt={moment.locationName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-gray-900/90 text-white font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded backdrop-blur">
                      [{moment.locationName} {moment.altitude ? `- ${moment.altitude}` : ''}]
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-800 line-clamp-2 font-medium">
                      "{moment.caption}"
                    </p>
                    <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-gray-500 border-t border-gray-100">
                      <span>{moment.createdAt}</span>
                      <div className="flex items-center gap-3">
                        <span>♥ {moment.likesCount}</span>
                        <span>💬 {moment.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-700">
                [BÀI VIẾT & KINH NGHIỆM CHIA SẺ]
              </h2>
              <span className="text-xs font-mono text-gray-500">
                {profileData.posts.length} bài đăng
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileData.posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(getNewsDetailPath(post.id))}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded">
                        [{post.category}]
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-500">
                    <span>Ngày đăng: {post.createdAt}</span>
                    <div className="flex items-center gap-3">
                      <span>👁 {post.viewCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TRIPS & GROUPS */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-700">
                [CHUYẾN ĐỊ & NHÓM ĐỒNG HÀNH]
              </h2>
              <span className="text-xs font-mono text-gray-500">
                {profileData.trips.length} nhóm
              </span>
            </div>

            <div className="space-y-4">
              {profileData.trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(getTrekkerGroupDetailPath(trip.id))}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-emerald-400 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-gray-900 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          [{trip.role === 'LEADER' ? 'TRƯỞNG NHÓM' : 'THÀNH VIÊN'}]
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            trip.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          [{trip.status === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH' : 'ĐANG TUYỂN THÀNH VIÊN'}]
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition">
                        {trip.title}
                      </h3>
                      <p className="text-xs font-mono text-gray-500">
                        Địa điểm: <strong className="text-gray-700">{trip.location}</strong> • Khởi hành: {trip.startDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <span className="font-mono text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                      👥 {trip.membersCount} thành viên
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">
                      Xem chi tiết →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOMENT LIGHTBOX MODAL */}
      {selectedMoment && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white border border-gray-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="relative h-96 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedMoment.imageUrl}
                alt={selectedMoment.locationName}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => setSelectedMoment(null)}
                className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-800 text-white font-mono text-sm px-3 py-1 rounded border border-gray-700"
              >
                ✕ ĐÓNG
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-emerald-400 uppercase">
                    [{selectedMoment.locationName} {selectedMoment.altitude ? `- ${selectedMoment.altitude}` : ''}]
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Chuyến đi: {selectedMoment.tripTitle} • Ngày: {selectedMoment.createdAt}
                  </p>
                </div>
                {selectedMoment.coordinates && (
                  <span className="font-mono text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded border border-gray-700">
                    📍 {selectedMoment.coordinates}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-200 leading-relaxed font-sans">
                "{selectedMoment.caption}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs font-mono text-gray-400">
                <button
                  onClick={() => {
                    selectedMoment.likesCount += 1;
                    setSelectedMoment({ ...selectedMoment });
                    showToast('Đã thả tim khoảnh khắc này!');
                  }}
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded font-bold transition"
                >
                  ♥ THẢ TIM ({selectedMoment.likesCount})
                </button>
                <span>Bình luận ({selectedMoment.commentsCount})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
