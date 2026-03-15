interface FloatingElementProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  opacity?: number;
}

export default function FloatingElement({
  src,
  alt = "",
  size = 60,
  className = "",
  opacity = 0.07,
}: FloatingElementProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`animate-float pointer-events-none select-none hidden sm:block ${className}`}
      style={{ opacity }}
      aria-hidden="true"
      loading="lazy"
    />
  );
}
