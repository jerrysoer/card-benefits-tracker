"use client";

interface SlideIndicatorProps {
  total: number;
  current: number;
  accentColor: string;
}

export default function SlideIndicator({
  total,
  current,
  accentColor,
}: SlideIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          className="rounded-full transition-all duration-200"
          style={{
            width: i === current ? 24 : 6,
            height: 6,
            backgroundColor: i === current ? accentColor : "#7A6E60",
          }}
        />
      ))}
    </div>
  );
}
