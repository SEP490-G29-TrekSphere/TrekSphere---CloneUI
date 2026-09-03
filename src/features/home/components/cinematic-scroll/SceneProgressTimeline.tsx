import { SCENE_TARGETS } from '../../constants/cinematic-scroll';

const SCENES = [
  { id: 1, label: 'Giới thiệu', target: SCENE_TARGETS[0] },
  { id: 2, label: 'Kết nối', target: SCENE_TARGETS[1] },
  { id: 3, label: 'Cộng đồng', target: SCENE_TARGETS[2] },
  { id: 4, label: 'Tour nổi bật', target: SCENE_TARGETS[3] },
  { id: 5, label: 'Câu chuyện', target: SCENE_TARGETS[4] },
];

interface SceneProgressTimelineProps {
  onSelectScene?: (targetPx: number) => void;
}

/**
 * Thanh Timeline định vị dọc bên phải màn hình — cho biết vị trí Scene hiện tại,
 * hiển thị tiến trình cuộn mượt mà và hỗ trợ click để chuyển nhanh đến Scene tương ứng.
 */
export function SceneProgressTimeline({ onSelectScene }: SceneProgressTimelineProps) {
  const handleDotClick = (targetPx: number) => {
    if (onSelectScene) {
      onSelectScene(targetPx);
    } else {
      const cinemaEl = document.getElementById('cinema');
      if (cinemaEl) {
        const top = cinemaEl.getBoundingClientRect().top + window.scrollY + targetPx;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="cinema-timeline" aria-label="Cinematic Timeline Navigation">
      <div className="timeline-track">
        <div className="timeline-progress-bar" />
      </div>
      <div className="timeline-dots">
        {SCENES.map((scene) => (
          <button
            key={scene.id}
            type="button"
            className={`timeline-dot-item scene-dot-${scene.id}`}
            onClick={() => handleDotClick(scene.target)}
            aria-label={`Chuyển sang Scene ${scene.id}: ${scene.label}`}
          >
            <span className="timeline-dot-label">{scene.label}</span>
            <span className="timeline-dot-indicator" />
          </button>
        ))}
      </div>
    </nav>
  );
}
