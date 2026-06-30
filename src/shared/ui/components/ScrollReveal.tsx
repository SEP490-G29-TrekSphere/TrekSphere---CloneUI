import type { CSSProperties, ElementType, Key, ReactNode, RefObject } from 'react';
import { Children, isValidElement, useEffect, useRef, useState } from 'react';

export type ScrollRevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-in'
  | 'zoom-in'
  | 'zoom-out';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
}

const DEFAULT_OPTIONS: Required<Omit<ScrollRevealOptions, 'triggerOnce'>> = {
  threshold: 0.15,
  rootMargin: '0px 0px -60px 0px',
  delay: 0,
  duration: 600,
};

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold,
    rootMargin,
    triggerOnce = true,
    delay,
    duration,
  } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: ref as RefObject<HTMLElement>, isVisible, delay, duration };
}

const VARIANT_STYLES: Record<
  ScrollRevealVariant,
  { hidden: CSSProperties; visible: CSSProperties }
> = {
  'fade-up': {
    hidden: { opacity: 0, transform: 'translateY(40px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-down': {
    hidden: { opacity: 0, transform: 'translateY(-40px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-left': {
    hidden: { opacity: 0, transform: 'translateX(-40px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  'fade-right': {
    hidden: { opacity: 0, transform: 'translateX(40px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'zoom-in': {
    hidden: { opacity: 0, transform: 'scale(0.88)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
  'zoom-out': {
    hidden: { opacity: 0, transform: 'scale(1.12)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
};

export interface ScrollRevealProps {
  children: ReactNode;
  variant?: ScrollRevealVariant;
  className?: string;
  /** Extra delay (ms) added on top of the observer delay */
  delay?: number;
  /** Duration of the transition in ms */
  duration?: number;
  /** When true, animate each direct child with a stagger (ms between children) */
  stagger?: number;
  /** Options passed to useScrollReveal */
  scrollOptions?: ScrollRevealOptions;
  as?: ElementType;
}

function buildStyle(
  variant: ScrollRevealVariant,
  isVisible: boolean,
  delay: number,
  duration: number
): CSSProperties {
  return {
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    ...(isVisible ? VARIANT_STYLES[variant].visible : VARIANT_STYLES[variant].hidden),
  };
}

function getChildKey(child: ReactNode, idx: number): Key {
  if (isValidElement(child) && child.key != null) return child.key;
  return `scroll-reveal-${idx}`;
}

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  className = '',
  delay = 0,
  duration = 600,
  stagger = 0,
  scrollOptions,
  as: Tag = 'div',
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ ...scrollOptions, delay, duration });

  if (stagger > 0) {
    return (
      <Tag ref={ref} className={className}>
        {Children.toArray(children).map((child, idx) => (
          <div
            key={getChildKey(child, idx)}
            style={buildStyle(variant, isVisible, idx * stagger, duration)}
          >
            {child}
          </div>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} style={buildStyle(variant, isVisible, 0, duration)}>
      {children}
    </Tag>
  );
}
