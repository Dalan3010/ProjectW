import { useEffect, type RefObject } from "react";

const MAX_SHIFT = 18;
const MAX_ROTATION = 1.1;
const EASE = 0.09;
const SETTLE = 0.05;

export function useConstellationParallax(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let frameId: number | null = null;

    const write = (x: number, y: number) => {
      host.style.setProperty("--pointer-x", `${x}px`);
      host.style.setProperty("--pointer-y", `${y}px`);
      host.style.setProperty("--pointer-rot", `${(x / MAX_SHIFT) * MAX_ROTATION}deg`);
    };

    const tick = () => {
      frameId = null;
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      write(currentX, currentY);

      if (Math.abs(targetX - currentX) > SETTLE || Math.abs(targetY - currentY) > SETTLE) {
        schedule();
      }
    };

    function schedule() {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(tick);
    }

    const handlePointerMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      // Normalize the pointer position to [-1, 1] and invert it so the
      // background moves opposite to the pointer for a depth illusion.
      const normalizedX = (event.clientX / width) * 2 - 1;
      const normalizedY = (event.clientY / height) * 2 - 1;
      targetX = -normalizedX * MAX_SHIFT;
      targetY = -normalizedY * MAX_SHIFT;
      schedule();
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) reset();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("pointerout", handlePointerOut);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", reset);
      window.removeEventListener("pointerout", handlePointerOut);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      host.style.removeProperty("--pointer-x");
      host.style.removeProperty("--pointer-y");
      host.style.removeProperty("--pointer-rot");
    };
  }, [ref]);
}
