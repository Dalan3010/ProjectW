// BID — Login, registro, sesión y estado de navegación

const form = document.getElementById("login-form");
const loginBody = document.getElementById("login-body");
const success = document.getElementById("login-success");
const successMessage = document.getElementById("success-message");
const demoBtn = document.getElementById("demo-btn");
const authError = document.getElementById("auth-error");
const authTitle = document.getElementById("login-title");
const authSubtitle = document.getElementById("login-subtitle");
const nameField = document.getElementById("name-field");
const nameInput = document.getElementById("name");
const submitBtn = document.getElementById("submit-btn");
const switchLink = document.getElementById("auth-switch-link");
const switchText = document.getElementById("auth-switch-text");

let mode = "login";

function hideAuthError() {
  if (authError) {
    authError.hidden = true;
    authError.textContent = "";
  }
}

function showAuthError(message) {
  if (authError) {
    authError.textContent = message;
    authError.hidden = false;
  }
}

function showSuccess(viaDemo) {
  successMessage.textContent = viaDemo
    ? "Has entrado con la cuenta demo. Esta es una simulación de acceso."
    : "Bienvenido de vuelta a BID. Esta es una simulación de acceso.";
  loginBody.classList.add("hidden");
  success.classList.remove("hidden");
}

function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === "register";
  if (authTitle) {
    authTitle.textContent = isRegister ? "Crea tu cuenta" : "Bienvenido de vuelta";
  }
  if (authSubtitle) {
    authSubtitle.textContent = isRegister
      ? "Regístrate gratis y empieza a trabajar en tus ideas."
      : "Inicia sesión para continuar con tus ideas de negocio.";
  }
  if (submitBtn) {
    submitBtn.textContent = isRegister ? "Crear cuenta gratis" : "Iniciar sesión";
  }
  if (switchText) {
    switchText.textContent = isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
  }
  if (switchLink) {
    switchLink.textContent = isRegister ? "Inicia sesión" : "Regístrate gratis";
  }
  if (nameField) {
    nameField.classList.toggle("hidden", !isRegister);
  }
  if (nameInput) {
    nameInput.required = isRegister;
  }
  hideAuthError();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  hideAuthError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    if (mode === "register") {
      await BIDAuth.register({ name: nameInput ? nameInput.value : "", email, password });
    } else {
      await BIDAuth.login(email, password);
    }
    showSuccess(false);
  } catch (error) {
    showAuthError(error.message);
  }
}

function initAuthPage() {
  if (!form) return;
  const session = BIDAuth.currentUser();
  if (session) {
    showSuccess(session.isDemo);
    return;
  }
  setMode("login");
  form.addEventListener("submit", handleSubmit);
  if (switchLink) {
    switchLink.addEventListener("click", (event) => {
      event.preventDefault();
      setMode(mode === "login" ? "register" : "login");
    });
  }
}

function initDemo() {
  if (!demoBtn) return;
  demoBtn.addEventListener("click", () => {
    BIDAuth.loginDemo();
    showSuccess(true);
  });
}

function initLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  const logoutLink = document.getElementById("logout-link");
  const onLogout = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    BIDAuth.logout();
    window.location.reload();
  };
  if (logoutBtn) logoutBtn.addEventListener("click", onLogout);
  if (logoutLink) logoutLink.addEventListener("click", onLogout);
}

function initNavbar() {
  const navUser = document.getElementById("nav-user");
  const navGuest = document.getElementById("nav-guest");
  const usernameEl = document.getElementById("nav-username");
  const session = BIDAuth.currentUser();
  if (session && navUser && navGuest) {
    const firstName = (session.name || "").trim().split(/\s+/)[0];
    if (usernameEl) {
      usernameEl.textContent = `Hola, ${firstName || session.email}`;
    }
    navGuest.classList.add("hidden");
    navUser.classList.remove("hidden");
  }
}

initAuthPage();
initDemo();
initNavbar();
initLogout();

// Enlaces ficticios (Privacidad, Términos, Contacto)
document.querySelectorAll("[data-fake]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});