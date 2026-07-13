import AdminTopbar from '../../components/AdminTopbar';

/**
 * Stub Admin Dashboard — sẽ được bổ sung nội dung sau.
 * Tạm thời hiển thị placeholder để layout chạy đúng khi user navigate tới.
 */
export default function AdminDashboard() {
  return (
    <div className="flex h-screen flex-col">
      <AdminTopbar />
      <div className="flex-1 overflow-y-auto px-8 py-6">
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
