import { useEffect, type RefObject } from "react";
import { animate } from "animejs";

type AnimationHandle = { revert: () => void };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const applyCssTwinkle = (star: SVGCircleElement, dim: number) => {
  const soft = Math.random() < 0.7;
  star.style.opacity = "";
  star.style.transform = "";
  star.style.filter = "";
  star.classList.add(soft ? "cz-twinkle-soft" : "cz-twinkle-flash");
  star.style.setProperty("--tw-duration", rand(2.5, 6).toFixed(2) + "s");
  star.style.setProperty("--tw-delay", rand(-6, 6).toFixed(2) + "s");
  star.style.setProperty("--tw-base", (rand(0.35, 0.55) * dim).toFixed(2));
  star.style.setProperty("--tw-peak", ((soft ? rand(0.6, 0.8) : rand(0.9, 1)) * dim).toFixed(2));
};

export function useStarTwinkle(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const background = ref.current;
    if (!background) return;

    const stars: SVGCircleElement[] = [];
    background.querySelectorAll("svg circle").forEach((star) => {
      const host = star.closest(".constellation, .lone-star");
      if (host && getComputedStyle(host).display === "none") return;
      stars.push(star as SVGCircleElement);
    });
    if (!stars.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations: AnimationHandle[] = [];
    const cleanups: Array<() => void> = [];

    stars.forEach((star) => {
      const dim = parseFloat(star.getAttribute("opacity") ?? "") || 1;

      const r = parseFloat(star.getAttribute("r") ?? "") || 1;
      let floor: number;
      let ceiling: number;
      let cycle: number;
      let scaleTo: number;
      let flash = false;

      if (r >= 3) {
        flash = Math.random() < 0.7;
        floor = rand(0.35, 0.5);
        ceiling = flash ? rand(0.92, 1) : rand(0.7, 0.82);
        cycle = flash ? rand(5000, 6800) : rand(3400, 5200);
        scaleTo = flash ? rand(1.05, 1.14) : rand(1.01, 1.06);
      } else if (r >= 1.4) {
        flash = Math.random() < 0.5;
        floor = rand(0.35, 0.5);
        ceiling = flash ? rand(0.9, 1) : rand(0.68, 0.8);
        cycle = flash ? rand(4600, 6200) : rand(3000, 4800);
        scaleTo = flash ? rand(1.04, 1.12) : rand(1.01, 1.05);
      } else if (r >= 0.9) {
        flash = Math.random() < 0.25;
        floor = rand(0.35, 0.55);
        ceiling = flash ? rand(0.7, 0.8) : rand(0.5, 0.68);
        cycle = flash ? rand(4200, 5800) : rand(2800, 5000);
        scaleTo = flash ? rand(1.03, 1.08) : rand(1.005, 1.04);
      } else {
        floor = rand(0.3, 0.45);
        ceiling = rand(0.36, 0.55);
        cycle = rand(5000, 6500);
        scaleTo = rand(1.002, 1.025);
      }

      const delay = rand(0, 6000);
      star.style.opacity = String(floor);

      if (star.classList.contains("cz-glow-violet")) {
        star.style.filter = `drop-shadow(0 0 ${rand(3, 7).toFixed(2)}px rgba(139, 92, 246, ${rand(0.45, 0.95).toFixed(2)}))`;
      } else if (star.classList.contains("cz-glow-blue")) {
        star.style.filter = `drop-shadow(0 0 ${rand(2.5, 6.5).toFixed(2)}px rgba(147, 197, 253, ${rand(0.4, 0.9).toFixed(2)}))`;
      }

      try {
        if (flash) {
          const hold = cycle * 0.55;
          const rise = cycle * 0.15;
          const peak = cycle * 0.08;
          const fall = cycle * 0.22;

          animations.push(
            animate(star, {
              opacity: [
                { to: floor, duration: hold },
                { to: ceiling, duration: rise, ease: "inOutQuad" },
                { to: ceiling, duration: peak },
                { to: floor, duration: fall, ease: "inOutQuad" },
              ],
              duration: cycle,
              delay,
              loop: true,
            }),
          );
          animations.push(
            animate(star, {
              scale: { from: 1, to: scaleTo, ease: "inOutQuad" },
              duration: cycle,
              delay,
              alternate: true,
              loop: true,
            }),
          );
        } else {
          animations.push(
            animate(star, {
              opacity: { from: floor, to: ceiling, ease: "inOutQuad" },
              scale: { from: 1, to: scaleTo, ease: "inOutQuad" },
              duration: cycle,
              delay,
              alternate: true,
              loop: true,
            }),
          );
        }
      } catch {
        applyCssTwinkle(star, dim);
        cleanups.push(() => {
          star.classList.remove("cz-twinkle-soft", "cz-twinkle-flash");
        });
      }
    });

    return () => {
      animations.forEach((animation) => animation.revert());
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [ref]);
}
