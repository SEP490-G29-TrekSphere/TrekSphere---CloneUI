import type { ApiDifficulty } from '../types';

const DIFFICULTY_STYLES: Record<ApiDifficulty, { label: string; bg: string; color: string }> = {
  EASY: { label: 'Dễ', bg: '#D6F2EA', color: '#0E7C6B' },
  BEGINNER: { label: 'Dễ', bg: '#D6F2EA', color: '#0E7C6B' },
  MODERATE: { label: 'Trung bình', bg: '#DEF4E1', color: '#2F9E5B' },
  HARD: { label: 'Khó', bg: '#FBE3DE', color: '#C0392B' },
  EXPERT: { label: 'Khó', bg: '#FBE3DE', color: '#C0392B' },
};

interface TourDifficultyBadgeProps {
  difficulty: ApiDifficulty;
}

export function TourDifficultyBadge({ difficulty }: TourDifficultyBadgeProps) {
  const style = DIFFICULTY_STYLES[difficulty];

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
