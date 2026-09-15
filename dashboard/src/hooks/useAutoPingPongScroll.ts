import { useEffect, type RefObject } from 'react';

interface AutoPingPongScrollOptions {
  speed?: number;
  pauseDurationMs?: number;
  initialDelayMs?: number;
}

export function useAutoPingPongScroll(
  containerRef: RefObject<HTMLElement | null>,
  dependencies: any[] = [],
  options: AutoPingPongScrollOptions = {}
) {
  const { speed = 0.4, pauseDurationMs = 2500, initialDelayMs = 2000 } = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animId: number;
    let direction: 'down' | 'up' = 'down';
    let isPaused = false;
    let isHovered = false;
    let pauseTimeout: number | undefined;
    let scrollPos = el.scrollTop;

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      scrollPos = el.scrollTop;
    };

    const handleScroll = () => {
      if (isHovered) {
        scrollPos = el.scrollTop;
      }
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('touchstart', handleMouseEnter, { passive: true });
    el.addEventListener('touchend', handleMouseLeave, { passive: true });
    el.addEventListener('scroll', handleScroll, { passive: true });

    const step = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;

      if (maxScroll > 5 && !isPaused && !isHovered) {
        if (direction === 'down') {
          scrollPos += speed;
          if (scrollPos >= maxScroll) {
            scrollPos = maxScroll;
            el.scrollTop = maxScroll;
            isPaused = true;
            direction = 'up';
            pauseTimeout = window.setTimeout(() => {
              isPaused = false;
            }, pauseDurationMs);
          } else {
            el.scrollTop = scrollPos;
          }
        } else {
          scrollPos -= speed;
          if (scrollPos <= 0) {
            scrollPos = 0;
            el.scrollTop = 0;
            isPaused = true;
            direction = 'down';
            pauseTimeout = window.setTimeout(() => {
              isPaused = false;
            }, pauseDurationMs);
          } else {
            el.scrollTop = scrollPos;
          }
        }
      }

      animId = requestAnimationFrame(step);
    };

    pauseTimeout = window.setTimeout(() => {
      animId = requestAnimationFrame(step);
    }, initialDelayMs);

    return () => {
      cancelAnimationFrame(animId);
      if (pauseTimeout) clearTimeout(pauseTimeout);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('touchstart', handleMouseEnter);
      el.removeEventListener('touchend', handleMouseLeave);
      el.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, speed, pauseDurationMs, initialDelayMs, ...dependencies]);
}

