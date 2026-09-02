/**
 * Điểm tin cậy (Trust Score) & số chuyến đã hoàn thành — nguồn tính DUY NHẤT dùng chung cho mọi
 * màn hình hiển thị dữ liệu này của cùng 1 user trong toàn app: bảng thành viên nhóm
 * (companion-groups), modal xem hồ sơ người xin gia nhập, và trang cá nhân công khai (profile).
 *
 * MỘT THANG ĐIỂM DUY NHẤT (0-100) — không dùng thang 5 sao ở bất kỳ đâu để hiển thị Trust Score.
 * Peer Review (MODULE 6) vẫn cho người dùng CHẤM 1-5 sao theo từng tiêu chí (đúng thiết kế input
 * UX), nhưng kết quả tổng hợp luôn quy đổi và cộng dồn vào MỘT điểm 0-100 duy nhất qua
 * `addTrustScoreBonus`, để không tồn tại 2 con số khác thang cho cùng 1 khái niệm "điểm tin cậy"
 * ở 2 màn khác nhau.
 *
 * Bonus được lưu trong 1 store dùng chung theo `userId` (không tách theo từng nhóm) — mọi nơi
 * đọc điểm đều gọi `computeTrustScore(userId)`, không tự lưu/tính lại hay mutate bản sao cục bộ.
 */

/** Điểm gốc demo — hash ổn định theo userId, không phụ thuộc vị trí trong mảng/nhóm nào. */
function baseTrustScore(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) % 1000;
  }
  return 70 + (hash % 30); // 70-99
}

/** Store cộng dồn điểm thưởng từ Peer Review — theo userId, dùng chung cho MỌI nhóm mà user đó
 * từng tham gia (không phải "điểm riêng cho từng chuyến"), khớp đúng MODULE 6: "cộng trực tiếp
 * vào Trust Score hiển thị công khai trên Hồ sơ cá nhân". */
const trustScoreBonusByUserId: Record<string, number> = {};

export function computeTrustScore(userId: string): number {
  const bonus = trustScoreBonusByUserId[userId] ?? 0;
  return Math.max(0, Math.min(100, baseTrustScore(userId) + bonus));
}

/** Gọi khi có 1 Peer Review mới được chấm cho `userId` — cộng dồn vào điểm chung, không tạo bản
 * sao trustScore riêng ở nơi gọi (tránh lệch khỏi `computeTrustScore`). */
export function addTrustScoreBonus(userId: string, bonus: number): void {
  trustScoreBonusByUserId[userId] = (trustScoreBonusByUserId[userId] ?? 0) + bonus;
}

/** Số chuyến trekking đã hoàn thành demo — cùng nguyên tắc: hash ổn định theo userId, KHÔNG dùng
 * vị trí (index) trong mảng thành viên như trước (khiến cùng 1 người hiện số chuyến khác nhau
 * tuỳ nhóm/thứ tự tham gia). */
export function computeCompletedTrips(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 17 + userId.charCodeAt(i)) % 100;
  }
  return hash % 12; // 0-11 chuyến
}
