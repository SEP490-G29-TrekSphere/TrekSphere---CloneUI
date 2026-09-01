interface SkipIntroButtonProps {
  onSkip: () => void;
}

/**
 * Nút "Bỏ qua giới thiệu" — người dùng quay lại trang không phải cuộn lại toàn
 * bộ phần cinematic mỗi lần. Ẩn/hiện qua `--skip-opacity`/`--skip-visibility`
 * do `useCinematicScrollEngine` điều khiển (hiện ở scene 1-3, mờ dần khi Scene 4
 * tiếp quản).
 */
export function SkipIntroButton({ onSkip }: SkipIntroButtonProps) {
  return (
    <button type="button" className="skip-intro" onClick={onSkip}>
      <span>Bỏ qua giới thiệu</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
