"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";

interface GradeStorySlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#6B8F71",
  A: "#6B8F71",
  "B+": "#C8963E",
  B: "#C8963E",
  "C+": "#C8963E",
  C: "#C8963E",
  D: "#C4717A",
  F: "#C4717A",
  FREE: "#2A7C6F",
};

const MONTH_ABBREV = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export default function GradeStorySlide({
  data,
  accentColor,
  animate,
}: GradeStorySlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR GRADE STORY
      </h2>

      {data.gradeStories.map((story, storyIdx) => (
        <div
          key={story.slug}
          className="animate-wrapped-enter w-full max-w-sm"
          style={{ animationDelay: `${(storyIdx + 1) * 150}ms` }}
        >
          <p className="mb-3 font-display text-lg text-text-primary">
            {story.name}
          </p>

          {/* Grade timeline */}
          <div className="flex items-center justify-center gap-1 overflow-x-auto">
            {story.grades.map((grade, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="font-mono-data text-xs font-bold"
                  style={{ color: GRADE_COLORS[grade] || "#A89C8E" }}
                >
                  {grade}
                </span>
                <span className="text-[9px] text-text-muted">
                  {MONTH_ABBREV[i] || ""}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <span className="text-text-muted">Started:</span>
            <span
              className="font-mono-data font-bold"
              style={{ color: GRADE_COLORS[story.startGrade] || "#A89C8E" }}
            >
              {story.startGrade}
            </span>
            <span className="text-text-muted">→</span>
            <span className="text-text-muted">Ended:</span>
            <span
              className="font-mono-data font-bold"
              style={{ color: GRADE_COLORS[story.endGrade] || "#A89C8E" }}
            >
              {story.endGrade}
            </span>
          </div>

          <p className="mt-2 text-sm italic text-text-secondary">
            &ldquo;{story.verdict}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}
