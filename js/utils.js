/**
 * utils.js — funciones compartidas por todo el sitio CreatorTools.
 * Sin dependencias externas.
 */

/* ---------- Toasts ---------- */
function ensureToastRegion() {
  let region = document.getElementById('toast-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  return region;
}

/**
 * Muestra una notificación toast breve.
 * @param {string} message
 * @param {'info'|'success'|'error'} type
 */
function showToast(message, type = 'info') {
  const region = ensureToastRegion();
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
  toast.textContent = message;
  region.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------- Portapapeles ---------- */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    showToast('Copiado al portapapeles', 'success');
    return true;
  } catch (err) {
    showToast('No se pudo copiar. Cópialo manualmente.', 'error');
    return false;
  }
}

/* ---------- LocalStorage helpers ---------- */
const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      showToast('No se pudo guardar (almacenamiento local no disponible)', 'error');
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* noop */ }
  }
};

/* ---------- Navegación móvil ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && window.innerWidth < 768) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Marca la página actual en la navegación ---------- */
function markCurrentNav() {
  const links = document.querySelectorAll('.main-nav a[href]');
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  links.forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/index\.html$/, '/');
    if (linkPath === path) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  markCurrentNav();
});
