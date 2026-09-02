import type { ReactNode } from 'react';

interface StoryPanelProps {
  variant: 'bridge' | 'bazaar';
  ariaLabel: string;
  children: ReactNode;
}

/**
 * Panel dùng chung cho Scene 2 (cầu) và Scene 3 (cộng đồng) — chỉ khác class
 * biến thể để CSS định vị/animate riêng (`--panel2-*` / `--panel3-*`), nội dung
 * bên trong (heading, facts, CTA...) truyền qua `children` thay vì flag prop,
 * theo đúng composition thay vì nhồi nhiều prop điều kiện vào 1 component.
 */
export function StoryPanel({ variant, ariaLabel, children }: StoryPanelProps) {
  return (
    <section className={`story-panel story-panel-${variant}`} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
