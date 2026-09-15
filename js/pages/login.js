// BID — Controlador de login.html: login, registro, demo, estado de éxito y logout.

import { auth } from '../auth.js';
import { bindFakeLinks } from '../ui.js';

const form = document.getElementById('login-form');
const loginBody = document.getElementById('login-body');
const success = document.getElementById('login-success');
const successMessage = document.getElementById('success-message');
const demoBtn = document.getElementById('demo-btn');
const authError = document.getElementById('auth-error');
const authTitle = document.getElementById('login-title');
const authSubtitle = document.getElementById('login-subtitle');
const nameField = document.getElementById('name-field');
const nameInput = document.getElementById('name');
const submitBtn = document.getElementById('submit-btn');
const switchText = document.getElementById('auth-switch-text');
const switchLink = document.getElementById('auth-switch-link');
const logoutLink = document.getElementById('logout-link');

let mode = 'login';

function hideAuthError() {
  authError.hidden = true;
  authError.textContent = '';
}

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = false;
}

function showSuccess(viaDemo) {
  successMessage.textContent = viaDemo
    ? 'Has entrado con la cuenta demo. Esta es una simulación de acceso.'
    : 'Bienvenido de vuelta a BID. Esta es una simulación de acceso.';
  loginBody.classList.add('hidden');
  success.classList.remove('hidden');
}

// Cambiar entre login y registro actualiza títulos, botones y el campo nombre.
function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === 'register';

  authTitle.textContent = isRegister ? 'Crea tu cuenta' : 'Bienvenido de vuelta';
  authSubtitle.textContent = isRegister
    ? 'Regístrate gratis y empieza a trabajar en tus ideas.'
    : 'Inicia sesión para continuar con tus ideas de negocio.';
  submitBtn.textContent = isRegister ? 'Crear cuenta gratis' : 'Iniciar sesión';
  switchText.textContent = isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
  switchLink.textContent = isRegister ? 'Inicia sesión' : 'Regístrate gratis';

  nameField.classList.toggle('hidden', !isRegister);
  nameInput.required = isRegister;
  hideAuthError();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  hideAuthError();

  try {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (mode === 'register') {
      await auth.register({ name: nameInput.value, email, password });
    } else {
      await auth.login(email, password);
    }
    showSuccess(false);
  } catch (error) {
    showAuthError(error.message);
  }
}

function initDemo() {
  demoBtn.addEventListener('click', () => {
    auth.loginDemo();
    showSuccess(true);
  });
}

function initLogout() {
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    auth.logout();
    window.location.reload();
  });
}

// Si ya había sesión al abrir la página, pasamos directo al estado de éxito.
const session = auth.currentUser();

if (session) {
  showSuccess(session.isDemo);
} else {
  setMode('login');
  form.addEventListener('submit', handleSubmit);
  switchLink.addEventListener('click', (event) => {
    event.preventDefault();
    setMode(mode === 'login' ? 'register' : 'login');
  });
  initDemo();
}

initLogout();
bindFakeLinks();