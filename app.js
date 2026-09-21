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
    const soft = Math.random() < 0.62;
    star.style.opacity = "";
    star.style.transform = "";
    star.style.filter = "";
    star.classList.add(soft ? "cz-twinkle-soft" : "cz-twinkle-flash");
    star.style.setProperty("--tw-duration", rand(2, 6).toFixed(2) + "s");
    star.style.setProperty("--tw-delay", rand(-6, 6).toFixed(2) + "s");
    star.style.setProperty("--tw-base", (rand(0.6, 0.85) * dim).toFixed(2));
    star.style.setProperty("--tw-peak", (rand(0.95, 1) * dim).toFixed(2));
  };

  const { animate } = window.anime || {};

  stars.forEach((star) => {
    // Atenuación original de la estrella (atributo opacity del SVG).
    const dim = parseFloat(star.getAttribute("opacity")) || 1;

    if (typeof animate !== "function") {
      applyCssTwinkle(star, dim);
      return;
    }

    // Personalidad: comportamiento, rango de opacidad, duración, escala y delay.
    const roll = Math.random();
    let floor;
    let spread;
    let duration;
    let scaleTo;

    if (roll < 0.5) {
      // Titileo suave y continuo, como un parpadeo tranquilo.
      floor = rand(0.55, 0.8) * dim;
      spread = rand(0.3, 0.45) * dim;
      duration = rand(2400, 5200);
      scaleTo = rand(1.02, 1.08);
    } else if (roll < 0.85) {
      // Destello más perceptible tras un periodo casi quieto.
      floor = rand(0.5, 0.74) * dim;
      spread = rand(0.4, 0.6) * dim;
      duration = rand(3600, 6000);
      scaleTo = rand(1.05, 1.14);
    } else {
      // Casi constante durante varios segundos: apenas cambia de intensidad.
      floor = rand(0.58, 0.75) * dim;
      spread = rand(0.1, 0.22) * dim;
      duration = rand(4800, 6000);
      scaleTo = rand(1.01, 1.04);
    }

    const ceiling = Math.min(1, floor + spread);
    // Anime.js v4 exige delay >= 0; el desfase se consigue inicializando cada
    // estrella en su propio estado y escalonando el arranque (0-6s).
    const delay = rand(0, 6000);

    // Estado inicial propio de la estrella: evita sincronización al cargar.
    star.style.opacity = String(floor);

    // Glow: intensidad propia por estrella, estática (barata) y solo en las
    // estrellas destacadas; el pulso visual nace de la opacidad animada.
    if (star.classList.contains("cz-glow-violet")) {
      star.style.filter = `drop-shadow(0 0 ${rand(2.5, 6).toFixed(2)}px rgba(139, 92, 246, ${rand(0.35, 0.9).toFixed(2)}))`;
    } else if (star.classList.contains("cz-glow-blue")) {
      star.style.filter = `drop-shadow(0 0 ${rand(2.5, 5.5).toFixed(2)}px rgba(147, 197, 253, ${rand(0.3, 0.85).toFixed(2)}))`;
    }

    // Ciclo continuo e independiente por estrella: alternate + loop con su
    // propia duración y delay. ease "inOutQuad" verificado en el bundle v4.
    try {
      animate(star, {
        opacity: { from: floor, to: ceiling, ease: "inOutQuad" },
        scale: { from: 1, to: scaleTo, ease: "inOutQuad" },
        duration,
        delay,
        alternate: true,
        loop: true
      });
    } catch (err) {
      // Adobe/edge: si anime falla con esta estrella, respaldo CSS en ella.
      applyCssTwinkle(star, dim);
    }
  });
})();