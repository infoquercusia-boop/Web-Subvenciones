/**
 * app.js — Generador de Ideas de Contenido
 * Lógica 100% en cliente. Sin llamadas a API externas.
 */

const STORAGE_KEY = 'ct_ideas_favoritas';

/** Cada plantilla genera un título de idea y lleva asociado un formato de contenido */
const TEMPLATES = [
  { formato: 'Listicle', texto: (t) => `${pickNumber()} formas de mejorar tu ${t}` },
  { formato: 'Listicle', texto: (t) => `${pickNumber()} errores comunes sobre ${t} (y cómo evitarlos)` },
  { formato: 'Listicle', texto: (t) => `${pickNumber()} herramientas gratuitas para ${t}` },
  { formato: 'Guía', texto: (t) => `Guía completa de ${t} para principiantes` },
  { formato: 'Guía', texto: (t) => `Todo lo que necesitas saber sobre ${t} en ${year()}` },
  { formato: 'Tutorial', texto: (t) => `Cómo empezar con ${t} paso a paso` },
  { formato: 'Tutorial', texto: (t) => `Cómo mejorar tu ${t} en una semana` },
  { formato: 'Comparativa', texto: (t) => `${cap(t)}: comparativa de las mejores opciones` },
  { formato: 'Comparativa', texto: (t) => `Antes y después: cómo cambió mi ${t}` },
  { formato: 'FAQ', texto: (t) => `Preguntas frecuentes sobre ${t}` },
  { formato: 'FAQ', texto: (t) => `¿Qué es ${t} y por qué debería importarte?` },
  { formato: 'Caso de estudio', texto: (t) => `Cómo logré resultados reales con ${t}: mi caso de estudio` },
  { formato: 'Caso de estudio', texto: (t) => `Lo que aprendí después de un año trabajando en ${t}` },
  { formato: 'Opinión', texto: (t) => `El futuro de ${t}: tendencias para ${year()}` },
  { formato: 'Opinión', texto: (t) => `Por qué ${t} está cambiando más rápido de lo que crees` },
  { formato: 'Checklist', texto: (t) => `Checklist definitivo antes de empezar con ${t}` },
  { formato: 'Mitos', texto: (t) => `Mitos y verdades sobre ${t}` },
  { formato: 'Recursos', texto: (t) => `Los mejores recursos gratuitos para aprender ${t}` },
  { formato: 'Entrevista', texto: (t) => `Expertos en ${t} responden a las dudas más comunes` },
  { formato: 'Historia personal', texto: (t) => `Mi experiencia con ${t}: lo que haría diferente` }
];

function pickNumber() {
  const options = [5, 7, 9, 10, 12, 15];
  return options[Math.floor(Math.random() * options.length)];
}

function year() {
  return new Date().getFullYear();
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Genera entre 15 y 20 ideas únicas a partir del tema */
function generateIdeas(topic) {
  const clean = topic.trim();
  const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
  const count = 15 + Math.floor(Math.random() * 6); // 15-20
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((tpl) => ({
    texto: tpl.texto(clean),
    formato: tpl.formato
  }));
}

function formatBadgeClass(formato) {
  const map = {
    'Listicle': 'badge-good',
    'Guía': 'badge',
    'Tutorial': 'badge',
    'Comparativa': 'badge-warn',
    'FAQ': 'badge',
    'Caso de estudio': 'badge-good',
    'Opinión': 'badge-warn',
    'Checklist': 'badge-good',
    'Mitos': 'badge-warn',
    'Recursos': 'badge',
    'Entrevista': 'badge',
    'Historia personal': 'badge'
  };
  return map[formato] || 'badge';
}

function render(ideas) {
  const list = document.getElementById('results-list');
  const favorites = Storage.get(STORAGE_KEY, []);
  list.innerHTML = '';

  if (ideas.length === 0) {
    document.getElementById('results-empty').hidden = false;
    return;
  }
  document.getElementById('results-empty').hidden = true;

  ideas.forEach((idea) => {
    const isFav = favorites.some((f) => f.texto === idea.texto);

    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${idea.texto}</div>
      <div class="result-meta">
        <span class="badge ${formatBadgeClass(idea.formato)}">${idea.formato}</span>
      </div>
      <div class="result-actions">
        <button type="button" class="icon-btn btn-copy" aria-label="Copiar idea">📋</button>
        <button type="button" class="icon-btn btn-fav" aria-label="Guardar como favorita" aria-pressed="${isFav}">${isFav ? '★' : '☆'}</button>
      </div>
    `;

    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(idea.texto));
    li.querySelector('.btn-fav').addEventListener('click', (e) => toggleFavorite(idea, e.currentTarget));

    list.appendChild(li);
  });
}

function toggleFavorite(idea, btn) {
  const favorites = Storage.get(STORAGE_KEY, []);
  const index = favorites.findIndex((f) => f.texto === idea.texto);

  if (index === -1) {
    favorites.push(idea);
    btn.textContent = '★';
    btn.setAttribute('aria-pressed', 'true');
    showToast('Idea guardada en favoritas', 'success');
  } else {
    favorites.splice(index, 1);
    btn.textContent = '☆';
    btn.setAttribute('aria-pressed', 'false');
    showToast('Idea eliminada de favoritas');
  }

  Storage.set(STORAGE_KEY, favorites);
  renderFavorites();
}

function renderFavorites() {
  const favorites = Storage.get(STORAGE_KEY, []);
  const container = document.getElementById('favorites-list');
  const section = document.getElementById('favorites-section');

  if (favorites.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  container.innerHTML = '';

  favorites.forEach((idea) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${idea.texto}</div>
      <div class="result-meta">
        <span class="badge ${formatBadgeClass(idea.formato)}">${idea.formato}</span>
      </div>
      <div class="result-actions">
        <button type="button" class="icon-btn btn-copy" aria-label="Copiar idea">📋</button>
        <button type="button" class="icon-btn btn-remove" aria-label="Quitar de favoritas">🗑️</button>
      </div>
    `;
    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(idea.texto));
    li.querySelector('.btn-remove').addEventListener('click', () => {
      const updated = Storage.get(STORAGE_KEY, []).filter((f) => f.texto !== idea.texto);
      Storage.set(STORAGE_KEY, updated);
      renderFavorites();
      showToast('Idea eliminada de favoritas');
    });
    container.appendChild(li);
  });
}

function init() {
  const form = document.getElementById('idea-form');
  const input = document.getElementById('topic-input');
  const errorEl = document.getElementById('topic-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (value.length < 3) {
      errorEl.hidden = false;
      errorEl.textContent = 'Escribe al menos 3 caracteres para generar ideas.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');

    const ideas = generateIdeas(value);
    render(ideas);
    document.getElementById('results-section').hidden = false;
  });

  renderFavorites();
}

document.addEventListener('DOMContentLoaded', init);
