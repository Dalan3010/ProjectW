// BID — Simulación de login (sin backend, sin autenticación real)

const form = document.getElementById("login-form");
const loginBody = document.getElementById("login-body");
const success = document.getElementById("login-success");
const successMessage = document.getElementById("success-message");
const demoBtn = document.getElementById("demo-btn");

function showSuccess(viaDemo) {
  successMessage.textContent = viaDemo
    ? "Has entrado con la cuenta demo. Esta es una simulación de acceso."
    : "Bienvenido de vuelta a BID. Esta es una simulación de acceso.";
  loginBody.classList.add("hidden");
  success.classList.remove("hidden");
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    showSuccess(false);
  });
}

if (demoBtn) {
  demoBtn.addEventListener("click", () => showSuccess(true));
}

// Acceso directo a la demo: "Comenzar gratis" → login.html?demo=1
const params = new URLSearchParams(window.location.search);
if (params.get("demo") === "1") {
  showSuccess(true);
}

// Enlaces ficticios (Privacidad, Términos, Contacto, Regístrate gratis)
document.querySelectorAll("[data-fake]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});

// Titileo de estrellas del fondo del zodíaco.
// Vía principal: Anime.js v4 (cada estrella con su propia animación y
// parámetros pseudoaleatorios generados UNA vez al iniciar).
// Fallback: si Anime.js no está disponible (CDN offline/bloqueada) o
// animate() falla, se aplica el titileo CSS por estrella (mismo concepto).
// Las líneas (<path>) no participan: solo respiran con el contenedor.
(function () {
  const background = document.querySelector(".zodiac-background");
  if (!background) return;

  const rand = (min, max) => min + Math.random() * (max - min);

  // Solo estrellas visibles (las constelaciones ocultas en móvil se omiten).
  const stars = [];
  background.querySelectorAll("svg circle").forEach((star) => {
    const host = star.closest(".constellation, .lone-star");
    if (host && getComputedStyle(host).display === "none") return;
    stars.push(star);
  });
  if (!stars.length) return;

  // prefers-reduced-motion: sin animaciones JS; el CSS global apaga las CSS.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Titileo CSS de respaldo para UNA estrella.
  const applyCssTwinkle = (star, dim) => {
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

  const { animate } = window.anime || {};

  stars.forEach((star) => {
    // Atenuación original de la estrella (atributo opacity del SVG).
    const dim = parseFloat(star.getAttribute("opacity")) || 1;

    if (typeof animate !== "function") {
      applyCssTwinkle(star, dim);
      return;
    }

    // Personalidad por JERARQUÍA VISUAL, según el radio r del SVG:
    //   r >= 3    → acentos (lone stars): destellos fuertes ocasionales.
    //   1.4-<3    → estrellas destacadas: destello ocasional o brillo vivo.
    //   0.9-<1.4  → normales (base 0.35-0.55, secundarias hasta 0.6-0.8).
    //   < 0.9     → pequeñas casi estáticas: variación mínima.
    let floor;
    let ceiling;
    let cycle;
    let scaleTo;
    let flash = false;
    const r = parseFloat(star.getAttribute("r")) || 1;

    if (r >= 3) {
      // Acentos: destello fuerte ocasional (hasta 0.9-1.0) tras un reposo.
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
      // Normales: base 0.35-0.55; ~25% "secundarias" suben a 0.6-0.8.
      flash = Math.random() < 0.25;
      floor = rand(0.35, 0.55);
      ceiling = flash ? rand(0.7, 0.8) : rand(0.5, 0.68);
      cycle = flash ? rand(4200, 5800) : rand(2800, 5000);
      scaleTo = flash ? rand(1.03, 1.08) : rand(1.005, 1.04);
    } else {
      // Pequeñas casi estáticas: apenas cambian, se mantienen tenues.
      floor = rand(0.3, 0.45);
      ceiling = rand(0.36, 0.55);
      cycle = rand(5000, 6500);
      scaleTo = rand(1.002, 1.025);
    }

    const delay = rand(0, 6000);
    // Anime.js v4 exige delay >= 0; el desfase se consigue inicializando cada
    // estrella en su propio estado y escalonando el arranque (0-6s).
    star.style.opacity = String(floor);

    // Glow: intensidad aleatoria propia por estrella (estática y barata, solo
    // en las destacadas). El destello de opacidad compone el drop-shadow: el
    // glow se percibe más intenso en el pico sin animar `filter`.
    if (star.classList.contains("cz-glow-violet")) {
      star.style.filter = `drop-shadow(0 0 ${rand(3, 7).toFixed(2)}px rgba(139, 92, 246, ${rand(0.45, 0.95).toFixed(2)}))`;
    } else if (star.classList.contains("cz-glow-blue")) {
      star.style.filter = `drop-shadow(0 0 ${rand(2.5, 6.5).toFixed(2)}px rgba(147, 197, 253, ${rand(0.4, 0.9).toFixed(2)}))`;
    }

    try {
      if (flash) {
        // Destello corto y perceptible con transición suave: keyframes
        // asimétricos — reposo (55%), subida rápida (15%), pico breve (8%),
        // caída suave (22%). Solo unas pocas estrellas siguen este ciclo.
        const hold = cycle * 0.55;
        const rise = cycle * 0.15;
        const peak = cycle * 0.08;
        const fall = cycle * 0.22;
        // Tween 1: opacidad con destello (no alterna: tras la caída se queda
        // en reposo hasta el siguiente ciclo).
        animate(star, {
          opacity: [
            { to: floor, duration: hold },
            { to: ceiling, duration: rise, ease: "inOutQuad" },
            { to: ceiling, duration: peak },
            { to: floor, duration: fall, ease: "inOutQuad" }
          ],
          duration: cycle,
          delay,
          loop: true
        });
        // Tween 2: escala independiente y suave (alterna: sin saltos).
        animate(star, {
          scale: { from: 1, to: scaleTo, ease: "inOutQuad" },
          duration: cycle,
          delay,
          alternate: true,
          loop: true
        });
      } else {
        // Titileo suave continuo, totalmente asíncrono por estrella.
        animate(star, {
          opacity: { from: floor, to: ceiling, ease: "inOutQuad" },
          scale: { from: 1, to: scaleTo, ease: "inOutQuad" },
          duration: cycle,
          delay,
          alternate: true,
          loop: true
        });
      }
    } catch (err) {
      // Si anime falla con esta estrella, respaldo CSS en ella.
      applyCssTwinkle(star, dim);
    }
  });
})();