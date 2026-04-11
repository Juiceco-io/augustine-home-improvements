"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Animation variant */
  variant?: "fade-up" | "fade-in" | "fade-left" | "fade-right";
  /** Stagger delay in milliseconds (applied inline) */
  delay?: number;
  /** Root margin for IntersectionObserver — defaults to a slight pre-trigger */
  rootMargin?: string;
}

/**
 * Lightweight scroll-reveal wrapper.
 * Uses IntersectionObserver — no library, no runtime overhead.
 * Falls back gracefully when JS is disabled or prefers-reduced-motion is set.
 */
export default function ScrollReveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  rootMargin = "-60px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion preference at runtime
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.classList.add("sr-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("sr-visible");
            observer.unobserve(el);
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`sr-root sr-${variant} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
