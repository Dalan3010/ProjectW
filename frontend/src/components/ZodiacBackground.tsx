import { useRef } from "react";
import { constellations, LINE_STROKE } from "../data/constellations";
import { useStarTwinkle } from "../hooks/useStarTwinkle";

export function ZodiacBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  useStarTwinkle(backgroundRef);

  return (
    <div className="zodiac-background" aria-hidden="true" ref={backgroundRef}>
      {constellations.map((constellation) => (
        <div key={constellation.id} className={constellation.className} style={constellation.style}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {constellation.path ? (
              <path
                d={constellation.path}
                stroke={LINE_STROKE}
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {constellation.stars.map((star, index) => (
              <circle
                key={`${constellation.id}-star-${index}`}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill={star.fill}
                opacity={star.opacity}
                className={star.glow ? `cz-glow-${star.glow}` : undefined}
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}
