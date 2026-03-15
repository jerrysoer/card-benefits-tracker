type Character = "optimizer" | "hoarder" | "newbie" | "roaster" | "coach";

interface CharacterSpotProps {
  character: Character;
  size?: number;
  className?: string;
  opacity?: number;
}

const CHARACTER_FILES: Record<Character, string> = {
  optimizer: "/illustrations/character/optimizer.png",
  hoarder: "/illustrations/character/hoarder.png",
  newbie: "/illustrations/character/newbie.png",
  roaster: "/illustrations/character/roaster.png",
  coach: "/illustrations/character/coach.png",
};

export default function CharacterSpot({
  character,
  size = 80,
  className = "",
  opacity = 0.75,
}: CharacterSpotProps) {
  return (
    <img
      src={CHARACTER_FILES[character]}
      alt={`${character} character`}
      width={size}
      height={size * 1.5}
      className={`pointer-events-none select-none shrink-0 ${className}`}
      style={{ opacity }}
      loading="lazy"
    />
  );
}
