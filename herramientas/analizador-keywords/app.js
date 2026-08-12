/**
 * app.js — Analizador de Palabras Clave (básico, datos simulados)
 * Sin llamadas a API externas: usa un dataset local con volúmenes ficticios
 * pero realistas, más una heurística para keywords no listadas.
 */

const HISTORY_KEY = 'ct_keywords_historial';

/** Dataset simulado: volumen mensual estimado, dificultad, intención */
const KEYWORD_DATASET = {
  'marketing digital': { volumen: 40500, dificultad: 'alta', intencion: 'informacional' },
  'seo': { volumen: 60500, dificultad: 'alta', intencion: 'informacional' },
  'recetas veganas': { volumen: 27100, dificultad: 'media', intencion: 'informacional' },
  'comprar zapatillas running': { volumen: 8100, dificultad: 'media', intencion: 'transaccional' },
  'mejores portátiles 2026': { volumen: 12100, dificultad: 'media', intencion: 'transaccional' },
  'como bajar de peso': { volumen: 33100, dificultad: 'alta', intencion: 'informacional' },
  'plantas de interior': { volumen: 14800, dificultad: 'baja', intencion: 'informacional' },
  'aprender inglés online': { volumen: 22200, dificultad: 'media', intencion: 'informacional' },
  'facebook': { volumen: 550000, dificultad: 'alta', intencion: 'navegacional' },
  'gmail iniciar sesión': { volumen: 90500, dificultad: 'alta', intencion: 'navegacional' },
  'wordpress hosting barato': { volumen: 5400, dificultad: 'baja', intencion: 'transaccional' },
  'que es el seo': { volumen: 18100, dificultad: 'baja', intencion: 'informacional' },
  'diseño web': { volumen: 27100, dificultad: 'alta', intencion: 'informacional' },
  'redactor freelance': { volumen: 3600, dificultad: 'baja', intencion: 'transaccional' },
  'blog de viajes': { volumen: 9900, dificultad: 'baja', intencion: 'informacional' },
  'marketing de contenidos': { volumen: 18100, dificultad: 'media', intencion: 'informacional' },
  'email marketing': { volumen: 33100, dificultad: 'media', intencion: 'informacional' },
  'redes sociales para negocios': { volumen: 9900, dificultad: 'baja', intencion: 'informacional' },
  'como monetizar un blog': { volumen: 14800, dificultad: 'media', intencion: 'informacional' },
  'wordpress vs blogger': { volumen: 6600, dificultad: 'baja', intencion: 'informacional' },
  'mejores temas wordpress': { volumen: 8100, dificultad: 'media', intencion: 'transaccional' },
  'copywriting para blogs': { volumen: 4400, dificultad: 'baja', intencion: 'informacional' },
  'palabras clave long tail': { volumen: 5400, dificultad: 'baja', intencion: 'informacional' },
  'que es el copywriting': { volumen: 12100, dificultad: 'baja', intencion: 'informacional' },
  'herramientas seo gratis': { volumen: 22200, dificultad: 'media', intencion: 'informacional' },
  'como hacer un blog': { volumen: 49500, dificultad: 'media', intencion: 'informacional' },
  'trabajar como freelance': { volumen: 27100, dificultad: 'media', intencion: 'informacional' },
  'diseño de logotipos': { volumen: 18100, dificultad: 'media', intencion: 'transaccional' },
  'contratar redactor seo': { volumen: 2900, dificultad: 'baja', intencion: 'transaccional' },
  'estrategia de contenidos': { volumen: 8100, dificultad: 'media', intencion: 'informacional' },
  'comprar dominio web': { volumen: 14800, dificultad: 'media', intencion: 'transaccional' },
  'mejor hosting 2026': { volumen: 9900, dificultad: 'media', intencion: 'transaccional' },
  'que es el marketing de contenidos': { volumen: 6600, dificultad: 'baja', intencion: 'informacional' },
  'instagram para empresas': { volumen: 12100, dificultad: 'media', intencion: 'informacional' },
  'tiktok marketing': { volumen: 18100, dificultad: 'media', intencion: 'informacional' },
  'linkedin para negocios': { volumen: 8100, dificultad: 'baja', intencion: 'informacional' },
  'analitica web': { volumen: 9900, dificultad: 'media', intencion: 'informacional' },
  'google analytics tutorial': { volumen: 14800, dificultad: 'media', intencion: 'informacional' },
  'como crear una newsletter': { volumen: 6600, dificultad: 'baja', intencion: 'informacional' },
  'plantillas de contenido': { volumen: 3600, dificultad: 'baja', intencion: 'informacional' },
  'ideas para blog': { volumen: 9900, dificultad: 'baja', intencion: 'informacional' },
  'como escribir un ebook': { volumen: 5400, dificultad: 'baja', intencion: 'informacional' },
  'landing page efectiva': { volumen: 8100, dificultad: 'media', intencion: 'informacional' },
  'canva para redes sociales': { volumen: 12100, dificultad: 'baja', intencion: 'transaccional' },
  'photoshop online gratis': { volumen: 22200, dificultad: 'media', intencion: 'transaccional' },
  'como ganar dinero online': { volumen: 40500, dificultad: 'alta', intencion: 'informacional' },
  'ideas de negocio online': { volumen: 14800, dificultad: 'media', intencion: 'informacional' },
  'curso de marketing digital': { volumen: 18100, dificultad: 'media', intencion: 'transaccional' },
  'certificacion google ads': { volumen: 4400, dificultad: 'baja', intencion: 'informacional' },
  'google ads para principiantes': { volumen: 6600, dificultad: 'media', intencion: 'informacional' }
};

const RELATED_POOL = [
  'guía para principiantes', 'consejos prácticos', 'paso a paso', 'ejemplos reales',
  'errores comunes', 'herramientas gratis', 'comparativa 2026', 'ventajas y desventajas',
  'checklist', 'plantilla gratuita', 'tendencias', 'casos de éxito'
];

/** Genera una estimación determinista (basada en hash simple) para keywords no listadas */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const STOPWORDS = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'para', 'con', 'del', 'que', 'por', 'sobre', 'como', 'es', 'mi', 'tu', 'su']);

function significantTokens(str) {
  return str.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Busca la keyword del dataset con más palabras en común con la búsqueda del usuario */
function findClosestMatch(normalized) {
  const tokens = significantTokens(normalized);
  if (tokens.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const key of Object.keys(KEYWORD_DATASET)) {
    const keyTokens = significantTokens(key);
    const shared = keyTokens.filter((t) => tokens.includes(t)).length;
    if (shared === 0) continue;
    const score = shared / Math.max(tokens.length, keyTokens.length);
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }

  return bestScore >= 0.34 ? best : null;
}

function estimateKeyword(keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (KEYWORD_DATASET[normalized]) {
    return KEYWORD_DATASET[normalized];
  }

  const closest = findClosestMatch(normalized);
  if (closest) {
    return KEYWORD_DATASET[closest];
  }

  const hash = simpleHash(normalized);
  const volumen = 100 + (hash % 20000);
  const dificultadOpts = ['baja', 'media', 'alta'];
  const dificultad = dificultadOpts[hash % 3];

  let intencion = 'informacional';
  if (/comprar|precio|barato|oferta|contratar/.test(normalized)) intencion = 'transaccional';
  else if (/login|iniciar sesión|acceso|oficial/.test(normalized)) intencion = 'navegacional';

  return { volumen, dificultad, intencion };
}

function relatedKeywords(keyword) {
  const hash = simpleHash(keyword.toLowerCase());
  const shuffled = [...RELATED_POOL].sort((a, b) => (simpleHash(a + hash) - simpleHash(b + hash)));
  return shuffled.slice(0, 5).map((suffix) => `${keyword} ${suffix}`);
}

function difficultyBadgeClass(dificultad) {
  return { baja: 'badge-good', media: 'badge-warn', alta: 'badge-bad' }[dificultad] || 'badge';
}

function intentionLabel(intencion) {
  return { informacional: 'Informacional', transaccional: 'Transaccional', navegacional: 'Navegacional' }[intencion] || intencion;
}

/** Genera 6 puntos de una "tendencia" simulada de los últimos 6 meses, sin librerías externas */
function renderTrendChart(keyword, volumenBase) {
  const svgContainer = document.getElementById('trend-chart');
  const hash = simpleHash(keyword.toLowerCase());
  const points = [];
  for (let i = 0; i < 6; i++) {
    const variation = ((hash >> (i * 3)) % 40) - 20; // -20 a +20
    const value = Math.max(10, Math.round(volumenBase * (1 + variation / 100)));
    points.push(value);
  }
  const max = Math.max(...points);
  const width = 300;
  const height = 100;
  const stepX = width / (points.length - 1);

  const coords = points.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const months = ['Hace 6m', 'Hace 5m', 'Hace 4m', 'Hace 3m', 'Hace 2m', 'Mes actual'];

  svgContainer.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Tendencia de búsqueda estimada de los últimos 6 meses" style="width:100%;height:auto;">
      <polyline points="${coords.join(' ')}" fill="none" stroke="var(--color-accent, #0a8f5b)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${coords.map((c) => {
        const [x, y] = c.split(',');
        return `<circle cx="${x}" cy="${y}" r="3" fill="var(--color-accent-dark, #076b44)"></circle>`;
      }).join('')}
    </svg>
    <div class="tool-stats" style="margin-top:0.5rem;">
      ${months.map((m, i) => `<div class="stat-box"><span class="value" style="font-size:1rem;">${points[i]}</span><span class="label">${m}</span></div>`).join('')}
    </div>
  `;
}

function renderResults(keyword) {
  const data = estimateKeyword(keyword);
  const related = relatedKeywords(keyword);

  document.getElementById('kw-title').textContent = `Resultados para "${keyword}"`;
  document.getElementById('kw-volume').textContent = data.volumen.toLocaleString('es-ES');
  document.getElementById('kw-intent').textContent = intentionLabel(data.intencion);

  const diffEl = document.getElementById('kw-difficulty');
  diffEl.textContent = cap(data.dificultad);
  diffEl.className = `badge ${difficultyBadgeClass(data.dificultad)}`;

  const relatedList = document.getElementById('related-list');
  relatedList.innerHTML = '';
  related.forEach((kw) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `<div class="result-text">${kw}</div><div class="result-actions"><button type="button" class="icon-btn btn-copy" aria-label="Copiar palabra clave">📋</button></div>`;
    li.querySelector('.btn-copy').addEventListener('click', () => copyToClipboard(kw));
    relatedList.appendChild(li);
  });

  renderTrendChart(keyword, data.volumen);
  document.getElementById('results-section').hidden = false;
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function addToHistory(keyword) {
  let history = Storage.get(HISTORY_KEY, []);
  history = history.filter((k) => k.toLowerCase() !== keyword.toLowerCase());
  history.unshift(keyword);
  history = history.slice(0, 15);
  Storage.set(HISTORY_KEY, history);
  renderHistory();
}

function renderHistory() {
  const history = Storage.get(HISTORY_KEY, []);
  const section = document.getElementById('history-section');
  const list = document.getElementById('history-list');

  if (history.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  list.innerHTML = '';

  history.forEach((kw) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <div class="result-text">${kw}</div>
      <div class="result-actions">
        <button type="button" class="btn btn-sm btn-secondary btn-rerun">Analizar de nuevo</button>
        <button type="button" class="icon-btn btn-remove" aria-label="Eliminar del historial">🗑️</button>
      </div>
    `;
    li.querySelector('.btn-rerun').addEventListener('click', () => {
      document.getElementById('keyword-input').value = kw;
      renderResults(kw);
      addToHistory(kw);
      window.scrollTo({ top: document.getElementById('results-section').offsetTop - 20, behavior: 'smooth' });
    });
    li.querySelector('.btn-remove').addEventListener('click', () => {
      const updated = Storage.get(HISTORY_KEY, []).filter((k) => k !== kw);
      Storage.set(HISTORY_KEY, updated);
      renderHistory();
    });
    list.appendChild(li);
  });
}

function init() {
  const form = document.getElementById('keyword-form');
  const input = document.getElementById('keyword-input');
  const errorEl = document.getElementById('keyword-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (value.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = 'Escribe una palabra clave de al menos 2 caracteres.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');

    renderResults(value);
    addToHistory(value);
  });

  document.getElementById('clear-history').addEventListener('click', () => {
    Storage.remove(HISTORY_KEY);
    renderHistory();
    showToast('Historial eliminado');
  });

  renderHistory();
}

document.addEventListener('DOMContentLoaded', init);
