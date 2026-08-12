/**
 * app.js — Generador de Títulos SEO
 * Lógica 100% en cliente. Sin llamadas a API externas.
 */

const STORAGE_KEY = 'ct_titulos_favoritos';
const RATINGS_KEY = 'ct_titulos_ratings';

const POWER_WORDS = ['Definitiva', 'Esencial', 'Probada', 'Sorprendente', 'Rápida', 'Sencilla', 'Secreta', 'Infalible'];
const NUMBERS = [5, 7, 9, 10, 12, 15];

/** Capitaliza la primera letra de una cadena */
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Extrae palabras clave simples del texto de entrada (elimina stopwords cortas) */
function extractKeywords(input) {
  const stopwords = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'para', 'con', 'del', 'que', 'por', 'sobre']);
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

/** Genera variaciones de títulos usando templates */
function generateTitles(topic) {
  const clean = topic.trim();
  const capTopic = cap(clean);
  const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  const power = POWER_WORDS[Math.floor(Math.random() * POWER_WORDS.length)];
  const year = new Date().getFullYear();

  const templates = [
    `${num} formas de ${clean} que debes conocer`,
    `Cómo ${clean}: guía ${power.toLowerCase()} paso a paso`,
    `${capTopic}: la guía ${power.toLowerCase()} (${year})`,
    `¿Por qué ${clean} es más importante de lo que crees?`,
    `${num} errores comunes al ${clean}`,
    `La guía definitiva para ${clean} en ${year}`,
    `${capTopic} en 5 minutos: lo que nadie te cuenta`,
    `Todo lo que necesitas saber sobre ${clean}`,
    `${num} secretos para ${clean} como un experto`,
    `${capTopic}: consejos prácticos que funcionan`
  ];

  // Selección aleatoria sin repetición de 8-10 variaciones
  const shuffled = templates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8 + Math.floor(Math.random() * 3));
}

/** Devuelve badge de longitud según recomendación SEO 50-60 caracteres */
function lengthBadge(len) {
  if (len >= 50 && len <= 60) return { text: `${len} caracteres · Óptimo`, cls: 'badge-good' };
  if (len < 50) return { text: `${len} caracteres · Corto`, cls: 'badge-warn' };
  return { text: `${len} caracteres · Largo`, cls: 'badge-bad' };
}

function render(titles, keywords) {
  const list = document.getElementById('results-list');
  const ratings = Storage.get(RATINGS_KEY, {});
  list.innerHTML = '';

  if (titles.length === 0) {
    document.getElementById('results-empty').hidden = false;
    return;
  }
  document.getElementById('results-empty').hidden = true;

  titles.forEach((title) => {
    const len = title.length;
    const badge = lengthBadge(len);
    const matchedKw = keywords.filter((kw) => title.toLowerCase().includes(kw));

    const li = document.createElement('li');
    li.className = 'result-item';
    const isFav = ratings[title] === true;

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
    li.querySelector('.btn-fav').addEventListener('click', (e) => toggleFavorite(title, e.currentTarget));

    list.appendChild(li);
  });
}

function toggleFavorite(title, btn) {
  const favorites = Storage.get(STORAGE_KEY, []);
  const ratings = Storage.get(RATINGS_KEY, {});
  const index = favorites.indexOf(title);

  if (index === -1) {
    favorites.push(title);
    ratings[title] = true;
    btn.textContent = '★';
    btn.setAttribute('aria-pressed', 'true');
    showToast('Título guardado en favoritos', 'success');
  } else {
    favorites.splice(index, 1);
    delete ratings[title];
    btn.textContent = '☆';
    btn.setAttribute('aria-pressed', 'false');
    showToast('Título eliminado de favoritos');
  }

  Storage.set(STORAGE_KEY, favorites);
  Storage.set(RATINGS_KEY, ratings);
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
      const updated = Storage.get(STORAGE_KEY, []).filter((t) => t !== title);
      Storage.set(STORAGE_KEY, updated);
      const ratings = Storage.get(RATINGS_KEY, {});
      delete ratings[title];
      Storage.set(RATINGS_KEY, ratings);
      renderFavorites();
      showToast('Título eliminado de favoritos');
    });
    container.appendChild(li);
  });
}

function init() {
  const form = document.getElementById('title-form');
  const input = document.getElementById('topic-input');
  const errorEl = document.getElementById('topic-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (value.length < 3) {
      errorEl.hidden = false;
      errorEl.textContent = 'Escribe al menos 3 caracteres para generar títulos.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');

    const titles = generateTitles(value);
    const keywords = extractKeywords(value);
    render(titles, keywords);
    document.getElementById('results-section').hidden = false;
  });

  renderFavorites();
}

document.addEventListener('DOMContentLoaded', init);
