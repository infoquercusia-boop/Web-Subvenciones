/**
 * app.js — Calculadora de Tiempo de Lectura
 * Cálculo en tiempo real, 100% en cliente.
 */

const WPM = { tecnico: 150, general: 200, ficcion: 230 };

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countChars(text) {
  return text.length;
}

function estimateReadingTime(words, type) {
  const wpm = WPM[type] || WPM.general;
  const minutes = words / wpm;
  return Math.max(1, Math.ceil(minutes));
}

function formatReadingTime(minutes) {
  return `${minutes} min de lectura`;
}

function suggestion(words) {
  if (words === 0) return null;
  if (words < 300) {
    return { type: 'warn', text: `Tu texto tiene ${words} palabras: es muy corto para SEO. Considera ampliarlo a al menos 300 palabras para posicionar mejor.` };
  }
  if (words > 3000) {
    return { type: 'warn', text: `Tu texto tiene ${words} palabras: es muy largo. Considera dividirlo en varias secciones o en una serie de artículos para facilitar la lectura.` };
  }
  return { type: 'info', text: `Longitud óptima: ${words} palabras es un buen rango para artículos de blog.` };
}

function updateStats() {
  const textarea = document.getElementById('article-input');
  const type = document.getElementById('content-type').value;
  const text = textarea.value;

  const words = countWords(text);
  const chars = countChars(text);
  const minutes = words > 0 ? estimateReadingTime(words, type) : 0;

  document.getElementById('stat-words').textContent = words.toLocaleString('es-ES');
  document.getElementById('stat-chars').textContent = chars.toLocaleString('es-ES');
  document.getElementById('stat-minutes').textContent = words > 0 ? minutes : '—';
  document.getElementById('stat-sentences').textContent = countSentences(text);

  const alertBox = document.getElementById('suggestion-box');
  const suggestionData = suggestion(words);
  if (!suggestionData) {
    alertBox.hidden = true;
  } else {
    alertBox.hidden = false;
    alertBox.className = `alert ${suggestionData.type === 'warn' ? 'alert-warn' : 'alert-info'}`;
    alertBox.textContent = suggestionData.text;
  }

  document.getElementById('meta-output').value = words > 0
    ? `Tiempo de lectura: ${formatReadingTime(minutes)}`
    : '';
}

function countSentences(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?]+(\s|$)/g);
  return matches ? matches.length : 1;
}

function init() {
  const textarea = document.getElementById('article-input');
  const typeSelect = document.getElementById('content-type');

  textarea.addEventListener('input', updateStats);
  typeSelect.addEventListener('change', updateStats);

  document.getElementById('copy-meta').addEventListener('click', () => {
    const value = document.getElementById('meta-output').value;
    if (!value) {
      showToast('Escribe o pega texto primero', 'error');
      return;
    }
    copyToClipboard(value);
  });

  document.getElementById('clear-text').addEventListener('click', () => {
    textarea.value = '';
    updateStats();
    textarea.focus();
  });

  updateStats();
}

document.addEventListener('DOMContentLoaded', init);
