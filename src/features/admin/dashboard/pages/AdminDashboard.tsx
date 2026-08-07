import AdminTopbar from '../../components/AdminTopbar';

/**
 * Stub Admin Dashboard — sẽ được bổ sung nội dung sau.
 * Tạm thời hiển thị placeholder để layout chạy đúng khi user navigate tới.
 */
export default function AdminDashboard() {
  // Không tự đặt `h-screen`/padding riêng: `<main>` của AdminLayout đã lo scroll
  // và padding responsive — lồng thêm sẽ tạo scroll đôi và thừa lề trên mobile.
  return (
    <div className="flex flex-col gap-6">
      <AdminTopbar />
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#06261D' }}>
          Dashboard
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#6F7B75' }}>
          Tổng quan hệ thống TrekSphere (placeholder — sẽ bổ sung sau).
        </p>
      </div>
    </div>
  );
}
