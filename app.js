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

// Enlaces ficticios (Privacidad, Términos, Contacto, Regístrate gratis)
document.querySelectorAll("[data-fake]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});