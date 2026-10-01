import React, { useEffect, useState, useRef } from 'react';

/**
 * Ultra-fine scroll progress bar at the top of the viewport
 * Identité MAMAN+ : #9E2A2B
 */
export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const currentProgress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
            setScrollProgress(currentProgress);
          } else {
            setScrollProgress(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#8C2425] via-[#9E2A2B] to-[#B3393A] transition-[width] duration-150 ease-out origin-left shadow-[0_1px_3px_rgba(158,42,43,0.3)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

/**
 * ScrollReveal wrapper using IntersectionObserver for maximum performance
 * Opacity + translateY(14px) + subtle scale(0.988) -> Opacity 1, translateY(0), scale(1)
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delayMs = 0,
  className = '',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If reduced motion is preferred, show immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: '520ms',
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`transform-gpu transition-all ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-[0.988] pointer-events-none'
      } ${className}`}
    >
      {children}
    </div>
  );
};
