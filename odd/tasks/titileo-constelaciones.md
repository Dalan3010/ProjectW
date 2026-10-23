# Titileo constelaciones — jerarquía visual 4 niveles

## Objetivo
Aumentar el contraste visual del brillo de las estrellas (Anime.js) SIN fondo exageradamente brillante; las constelaciones deben leerse vivas pero no distraer del contenido ("De la idea al negocio" sigue siendo protagonista).

## Jerarquía visual objetivo
1. Estrellas destacadas/acento: destellos fuertes ocasionales (0.9–1.0).
2. Normales: brillo moderado (0.35–0.55 base; secundarias hasta 0.6–0.8).
3. Pequeñas: casi estáticas.
4. Líneas: muy sutiles (0.12–0.25 efectivo), glow discreto.

## Checklist (criterios de aceptación = requisitos del usuario)
- [x] Opacidad base de estrellas aumentada (normales ~0.35–0.55).
- [x] Algunas secundarias llegan ocasionalmente a 0.6–0.8.
- [x] Destellos puntuales hasta 0.9–1.0.
- [x] Glow morado/azulado más intenso durante el destello (vía opacidad compuesta) + intensidad aleatoria por estrella.
- [x] Destello corto y perceptible con transición suave (keyframes asimétricos: pausa → subida rápida → pico breve → caída).
- [x] No todas las estrellas alcanzan el mismo brillo (tiers por radio r + aleatorio).
- [x] Titileo 100% asíncrono: duración, delay, opacidad min/max, glow y escala distintos por estrella.
- [x] Líneas: opacidad ~0.12–0.25, poco o ningún titileo, glow muy discreto.
- [x] Contenedores: subir `--z-o/--z-o2` para que el rango de estrellas se aprecie (0.55–0.84 base).
- [x] Verificación: `node --check app.js` OK + prueba frames Firefox headless (9.338 px distintos, con `MOZ_WEBRENDER=0` por fallo SWGL de FF153).

## Alcance autorizado
- index.html: `--z-o/--z-o2` de 12 constelaciones + 6 lone stars.
- app.js: clasificación por r (≥3 acento, ≥1.4 destacada, ≥0.9 normal, resto pequeña), destello keyframes, glow aleatorio.
- styles.css: stroke de líneas 0.68 → 0.22 + glow sutil; rangos del fallback CSS alineados.

## Verificación (comandos)
- `node --check app.js`
- Firefox headless: `... --screenshot shot1.png` + `shot2.png` (espera 7s) + `compare -metric AE`