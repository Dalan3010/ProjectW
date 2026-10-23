# Constelaciones en movimiento

## Objetivo
Hacer el fondo zodiacal más vivo e interactivo con una deriva continua lenta y un parallax sutil al mover el puntero, sin que el fondo compita con el contenido ni afecte al scroll.

## Alcance autorizado
- `frontend/src/data/constellations.ts`: parámetros de deriva y profundidad por constelación.
- `frontend/src/styles/global.css`: keyframes de deriva y composición con el parallax.
- `frontend/src/hooks/useConstellationParallax.ts`: nuevo hook de parallax.
- `frontend/src/components/ZodiacBackground.tsx`: conectar el hook.

## Decisiones
- La animación de respiración existente (`zodiac-breathe`) se conserva intacta.
- La deriva usa `transform` en el contenedor (`.constellation`, `.lone-star`); el titileo de Anime.js sigue actuando solo sobre cada `<circle>`.
- El parallax se expone como custom properties (`--pointer-x`, `--pointer-y`, `--pointer-rot`) en `.zodiac-background`, y cada elemento lo escala según `--depth`. Sin listeners por elemento.
- `prefers-reduced-motion: reduce` desactiva deriva (ya cubierto por el reset global) y el hook no registra eventos.
- Puntero táctil (`pointer: coarse`) no activa parallax.

## Checklist
- [x] T1: Migrar `animationDuration`/`animationDelay` inline a `--z-dur`/`--z-delay` y añadir `--drift-x`, `--drift-y`, `--drift-rot`, `--drift-dur`, `--drift-delay`, `--depth` por constelación.
- [x] T2: Implementar `@keyframes zodiac-drift` y las dos animaciones coexistentes en `.constellation, .lone-star`.
- [x] T3: Crear `useConstellationParallax` (pointermove + lerp + rAF, reset en blur/pointerleave) y conectarlo en `ZodiacBackground`.
- [x] T4: Verificar `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`.

## Criterios de aceptación
- Se siguen renderizando 12 constelaciones y 6 estrellas sueltas.
- Todas las constelaciones se desplazan lentamente en direcciones distintas y vuelven con suavidad (alternate).
- El parallax responde al puntero con desplazamiento pequeño y retorno suave al salir.
- Con movimiento reducido no hay deriva ni parallax.
- Sin cambios de layout, overflow ni interacción con el contenido (`pointer-events: none` se mantiene).

## Verificación (comandos)
- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`
- `cd frontend && npm test -- --run`
- `cd frontend && npm run build`

## Ruta y progreso
- Ruta: delegada (writer único) por tocar 2+ archivos no triviales.
- Estado: completado y verificado.

## Evidencia de verificación
- `cd frontend && npm run typecheck` -> PASS (`tsc -b`, sin errores).
- `cd frontend && npm run lint` -> PASS (`oxlint`, sin hallazgos).
- `cd frontend && npm test -- --run` -> PASS (6 archivos, 16 tests; incluye nuevo test de parallax).
- `cd frontend && npm run build` -> PASS (`tsc -b && vite build`, 101 módulos).
- Firefox 153 headless vía WebDriver BiDi sobre el dev server:
  - 12 `.constellation` y 6 `.lone-star` presentes.
  - 18 animaciones `zodiac-drift` y 18 `zodiac-breathe` en estado `running`.
  - `transform` de la primera constelación cambió entre dos lecturas separadas ~1.2 s.
  - `pointermove` sintético escribió `--pointer-x`, `--pointer-y` y `--pointer-rot` en `.zodiac-background`.
- Commit: `16d35e7` feat(landing): drift zodiac constellations and add pointer parallax.

