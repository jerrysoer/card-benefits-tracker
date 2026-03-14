"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SlideIndicator from "./SlideIndicator";

export interface SlideConfig {
  id: string;
  component: React.ReactNode;
  shouldShow: boolean;
}

interface SlideShowProps {
  slides: SlideConfig[];
  accentColor: string;
  title: string;
  onComplete?: () => void;
  onSlideChange?: (index: number) => void;
}

export default function SlideShow({
  slides,
  accentColor,
  title,
  onComplete,
  onSlideChange,
}: SlideShowProps) {
  const visibleSlides = slides.filter((s) => s.shouldShow);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLastSlide = activeIndex === visibleSlides.length - 1;

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, visibleSlides.length - 1));
      setActiveIndex(clamped);
      onSlideChange?.(clamped);
      if (clamped === visibleSlides.length - 1) {
        onComplete?.();
      }
    },
    [visibleSlides.length, onComplete, onSlideChange]
  );

  const goNext = useCallback(() => {
    if (!isLastSlide) goTo(activeIndex + 1);
  }, [activeIndex, isLastSlide, goTo]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Touch swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only register horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (deltaX < 0) goNext();
    else goPrev();
  }

  if (visibleSlides.length === 0) return null;

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Header */}
      <div className="py-4 text-center">
        <span
          className="font-display text-xs tracking-widest"
          style={{ color: accentColor }}
        >
          {title}
        </span>
      </div>

      {/* Slide container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Click zones for desktop navigation */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-0 z-10 h-full w-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Previous slide"
          disabled={activeIndex === 0}
        >
          <div className="flex h-full items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              className="opacity-50"
            >
              <polyline points="13 4 7 10 13 16" />
            </svg>
          </div>
        </button>
        <button
          onClick={goNext}
          className="absolute right-0 top-0 z-10 h-full w-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next slide"
          disabled={isLastSlide}
        >
          <div className="flex h-full items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              className="opacity-50"
            >
              <polyline points="7 4 13 10 7 16" />
            </svg>
          </div>
        </button>

        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {visibleSlides.map((slide, i) => (
            <div
              key={slide.id}
              className="min-w-full px-4"
              style={{ flex: "0 0 100%" }}
            >
              <div
                className={
                  i === activeIndex ? "animate-wrapped-enter" : "opacity-0"
                }
                key={`${slide.id}-${i === activeIndex}`}
              >
                {slide.component}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <SlideIndicator
        total={visibleSlides.length}
        current={activeIndex}
        accentColor={accentColor}
      />

      {/* Navigation hint */}
      <p className="pb-4 text-center text-xs text-text-muted">
        {isLastSlide
          ? "End of recap"
          : "Swipe or use arrow keys to navigate"}
      </p>
    </div>
  );
}
