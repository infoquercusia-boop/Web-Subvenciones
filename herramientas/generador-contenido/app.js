/**
 * app.js — Generador de Contenido SEO (títulos + ideas de artículos)
 *
 * Intenta generar resultados con IA real (Gemini) a través de un Cloudflare
 * Worker propio (ver /cloudflare-worker/README.md para desplegarlo). Si
 * AI_API_URL no está configurada, o la petición falla/tarda demasiado, cae
 * automáticamente a una generación local por plantillas, para que la
 * herramienta nunca deje de funcionar.
 */

// Pega aquí la URL de tu Worker tras desplegarlo (ver cloudflare-worker/README.md).
// Ejemplo: 'https://creatortools-ai-proxy.tu-usuario.workers.dev'
const AI_API_URL = '';
const AI_FETCH_TIMEOUT_MS = 12000;

const TITLES_STORAGE_KEY = 'ct_contenido_titulos_favoritos';
const IDEAS_STORAGE_KEY = 'ct_contenido_ideas_favoritas';

/* ---------- Generación local (respaldo, sin IA) ---------- */

const POWER_WORDS = ['Definitiva', 'Esencial', 'Probada', 'Sorprendente', 'Rápida', 'Sencilla', 'Secreta', 'Infalible'];
const NUMBERS = [5, 7, 9, 10, 12, 15];

const IDEA_TEMPLATES = [
  { formato: 'Listicle', texto: (t) => `${pickNumber()} formas de mejorar tu ${t}` },
  { formato: 'Listicle', texto: (t) => `${pickNumber()} errores comunes sobre ${t} (y cómo evitarlos)` },
  { formato: 'Listicle', texto: (t) => `${pickNumber()} herramientas gratuitas para ${t}` },
  { formato: 'Guía', texto: (t) => `Guía completa de ${t} para principiantes` },
  { formato: 'Guía', texto: (t) => `Todo lo que necesitas saber sobre ${t} en ${year()}` },
  { formato: 'Tutorial', texto: (t) => `Cómo empezar con ${t} paso a paso` },
  { formato: 'Comparativa', texto: (t) => `${cap(t)}: comparativa de las mejores opciones` },
  { formato: 'FAQ', texto: (t) => `Preguntas frecuentes sobre ${t}` },
  { formato: 'Caso de estudio', texto: (t) => `Cómo logré resultados reales usando ${t}: mi caso de estudio` },
  { formato: 'Caso de estudio', texto: (t) => `Lo que aprendí después de un año usando ${t}` },
  { formato: 'Opinión', texto: (t) => `El futuro de ${t}: tendencias para ${year()}` },
  { formato: 'Checklist', texto: (t) => `Checklist definitivo antes de empezar con ${t}` },
  { formato: 'Mitos', texto: (t) => `Mitos y verdades sobre ${t}` },
  { formato: 'Recursos', texto: (t) => `Los mejores recursos gratuitos para aprender ${t}` },
  { formato: 'Entrevista', texto: (t) => `Expertos en ${t} responden a las dudas más comunes` }
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

function extractKeywords(input) {
  const stopwords = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'para', 'con', 'del', 'que', 'por', 'sobre']);
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

function generateLocalTitles(topic) {
  const clean = topic.trim();
  const capTopic = cap(clean);
  const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  const power = POWER_WORDS[Math.floor(Math.random() * POWER_WORDS.length)];
  const y = year();

  const templates = [
    `${num} formas de ${clean} que debes conocer`,
    `Cómo ${clean}: guía ${power.toLowerCase()} paso a paso`,
    `${capTopic}: la guía ${power.toLowerCase()} (${y})`,
    `¿Por qué ${clean} es más importante de lo que crees?`,
    `${num} errores comunes al ${clean}`,
    `La guía definitiva para ${clean} en ${y}`,
    `${capTopic} en 5 minutos: lo que nadie te cuenta`,
    `Todo lo que necesitas saber sobre ${clean}`,
    `${num} secretos para ${clean} como un experto`,
    `${capTopic}: consejos prácticos que funcionan`
  ];

  const shuffled = templates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8);
}

function generateLocalIdeas(topic) {
  const clean = topic.trim();
  const shuffled = [...IDEA_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8).map((tpl) => ({ texto: tpl.texto(clean), formato: tpl.formato }));
}

/* ---------- Generación con IA (Gemini vía Cloudflare Worker) ---------- */

async function fetchAIContent(topic) {
  if (!AI_API_URL) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT_MS);

  try {
    const url = `${AI_API_URL.replace(/\/$/, '')}/?topic=${encodeURIComponent(topic)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.titulos) || !Array.isArray(data.ideas)) return null;
    return data;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ---------- Renderizado ---------- */

function lengthBadge(len) {
  if (len >= 50 && len <= 60) return { text: `${len} caracteres · Óptimo`, cls: 'badge-good' };
  if (len < 50) return { text: `${len} caracteres · Corto`, cls: 'badge-warn' };
  return { text: `${len} caracteres · Largo`, cls: 'badge-bad' };
}

function formatBadgeClass(formato) {
  const map = {
    'Listicle': 'badge-good', 'Caso de estudio': 'badge-good', 'Checklist': 'badge-good',
    'Comparativa': 'badge-warn', 'Opinión': 'badge-warn', 'Mitos': 'badge-warn'
  };
  return map[formato] || 'badge';
}

function renderTitles(titles, keywords) {
  const list = document.getElementById('titles-list');
  const favorites = Storage.get(TITLES_STORAGE_KEY, []);
  list.innerHTML = '';

  titles.forEach((title) => {
    const len = title.length;
    const badge = lengthBadge(len);
    const matchedKw = keywords.filter((kw) => title.toLowerCase().includes(kw));
    const isFav = favorites.includes(title);

    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${title}</div>
      <div class="result-meta">
        <span class="badge ${badge.cls}">${badge.text}</span>
        ${matchedKw.length ? `<span class="badge">Keywords: ${matchedKw.join(', ')}</span>` : ''}
      </div>
      <div class="result-actions">
        <button type="button" class="icon-btn btn-copy" aria-label="Copiar título">📋</button>
        <button type="button" class="icon-btn btn-fav" aria-label="Guardar como favorito" aria-pressed="${isFav}">${isFav ? '★' : '☆'}</button>
      </div>
    `;
    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(title));
    li.querySelector('.btn-fav').addEventListener('click', (e) => toggleTitleFavorite(title, e.currentTarget));
    list.appendChild(li);
  });
}

function toggleTitleFavorite(title, btn) {
  const favorites = Storage.get(TITLES_STORAGE_KEY, []);
  const index = favorites.indexOf(title);
  if (index === -1) {
    favorites.push(title);
    btn.textContent = '★';
    btn.setAttribute('aria-pressed', 'true');
    showToast('Título guardado en favoritos', 'success');
  } else {
    favorites.splice(index, 1);
    btn.textContent = '☆';
    btn.setAttribute('aria-pressed', 'false');
    showToast('Título eliminado de favoritos');
  }
  Storage.set(TITLES_STORAGE_KEY, favorites);
  renderTitleFavorites();
}

function renderTitleFavorites() {
  const favorites = Storage.get(TITLES_STORAGE_KEY, []);
  const container = document.getElementById('title-favorites-list');
  const section = document.getElementById('title-favorites-section');
  if (favorites.length === 0) { section.hidden = true; return; }
  section.hidden = false;
  container.innerHTML = '';
  favorites.forEach((title) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${title}</div>
      <div class="result-actions">
        <button type="button" class="icon-btn btn-copy" aria-label="Copiar título">📋</button>
        <button type="button" class="icon-btn btn-remove" aria-label="Quitar de favoritos">🗑️</button>
      </div>
    `;
    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(title));
    li.querySelector('.btn-remove').addEventListener('click', () => {
      Storage.set(TITLES_STORAGE_KEY, Storage.get(TITLES_STORAGE_KEY, []).filter((t) => t !== title));
      renderTitleFavorites();
    });
    container.appendChild(li);
  });
}

function renderIdeas(ideas) {
  const list = document.getElementById('ideas-list');
  const favorites = Storage.get(IDEAS_STORAGE_KEY, []);
  list.innerHTML = '';

  ideas.forEach((idea) => {
    const isFav = favorites.some((f) => f.texto === idea.texto);
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${idea.texto}</div>
      <div class="result-meta"><span class="badge ${formatBadgeClass(idea.formato)}">${idea.formato}</span></div>
      <div class="result-actions">
        <button type="button" class="icon-btn btn-copy" aria-label="Copiar idea">📋</button>
        <button type="button" class="icon-btn btn-fav" aria-label="Guardar como favorita" aria-pressed="${isFav}">${isFav ? '★' : '☆'}</button>
      </div>
    `;
    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(idea.texto));
    li.querySelector('.btn-fav').addEventListener('click', (e) => toggleIdeaFavorite(idea, e.currentTarget));
    list.appendChild(li);
  });
}

function toggleIdeaFavorite(idea, btn) {
  const favorites = Storage.get(IDEAS_STORAGE_KEY, []);
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
  Storage.set(IDEAS_STORAGE_KEY, favorites);
  renderIdeaFavorites();
}

function renderIdeaFavorites() {
  const favorites = Storage.get(IDEAS_STORAGE_KEY, []);
  const container = document.getElementById('idea-favorites-list');
  const section = document.getElementById('idea-favorites-section');
  if (favorites.length === 0) { section.hidden = true; return; }
  section.hidden = false;
  container.innerHTML = '';
  favorites.forEach((idea) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${idea.texto}</div>
      <div class="result-meta"><span class="badge ${formatBadgeClass(idea.formato)}">${idea.formato}</span></div>
      <div class="result-actions">
        <button type="button" class="icon-btn btn-copy" aria-label="Copiar idea">📋</button>
        <button type="button" class="icon-btn btn-remove" aria-label="Quitar de favoritas">🗑️</button>
      </div>
    `;
    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(idea.texto));
    li.querySelector('.btn-remove').addEventListener('click', () => {
      Storage.set(IDEAS_STORAGE_KEY, Storage.get(IDEAS_STORAGE_KEY, []).filter((f) => f.texto !== idea.texto));
      renderIdeaFavorites();
    });
    container.appendChild(li);
  });
}

async function generateContent(topic) {
  const sourceBadge = document.getElementById('source-badge');
  const ai = await fetchAIContent(topic);
  const keywords = extractKeywords(topic);

  if (ai) {
    sourceBadge.textContent = 'Generado con IA (Gemini)';
    sourceBadge.className = 'badge badge-good';
    renderTitles(ai.titulos, keywords);
    renderIdeas(ai.ideas);
  } else {
    sourceBadge.textContent = 'Generado localmente (plantillas)';
    sourceBadge.className = 'badge badge-warn';
    renderTitles(generateLocalTitles(topic), keywords);
    renderIdeas(generateLocalIdeas(topic));
  }

  document.getElementById('results-section').hidden = false;
}

function init() {
  const form = document.getElementById('content-form');
  const input = document.getElementById('topic-input');
  const errorEl = document.getElementById('topic-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (value.length < 3) {
      errorEl.hidden = false;
      errorEl.textContent = 'Escribe al menos 3 caracteres para generar contenido.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Generando…';
    try {
      await generateContent(value);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Generar contenido';
    }
  });

  renderTitleFavorites();
  renderIdeaFavorites();
}

document.addEventListener('DOMContentLoaded', init);
