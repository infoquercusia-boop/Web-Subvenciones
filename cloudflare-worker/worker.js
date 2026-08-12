/**
 * Cloudflare Worker — proxy para Google Gemini.
 *
 * Genera títulos SEO e ideas de artículos con IA real, a partir de un tema.
 * Existe porque una clave de API nunca debe ponerse directamente en el
 * código de un sitio estático público (cualquiera podría verla y usarla).
 * Este Worker la guarda como "secret" en Cloudflare y hace la llamada a
 * Gemini por ti; el navegador del visitante solo habla con este Worker.
 *
 * Requiere una variable de entorno secreta GEMINI_API_KEY, configurada
 * desde el panel de Cloudflare (Settings → Variables and Secrets).
 * Consigue una clave gratuita en https://aistudio.google.com/apikey
 *
 * Endpoint expuesto: GET /?topic=<tema>
 * Respuesta: { titulos: string[], ideas: [{ texto, formato }] }
 */

const ALLOWED_ORIGIN = '*'; // en producción, sustituye por tu dominio de GitHub Pages
const GEMINI_MODEL = 'gemini-2.0-flash';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function buildPrompt(topic) {
  return `Eres un asistente de marketing de contenidos para bloggers en español. Para el tema "${topic}", genera:
- 8 títulos de artículo de blog optimizados para SEO, cada uno entre 50 y 60 caracteres cuando sea posible, variados en estilo (listas, preguntas, guías, año 2026).
- 8 ideas de artículo distintas, cada una con un "formato" de entre: Listicle, Guía, Tutorial, Comparativa, FAQ, Caso de estudio, Opinión, Checklist, Mitos, Recursos, Entrevista.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional ni markdown, con esta forma exacta:
{"titulos": ["...", "..."], "ideas": [{"texto": "...", "formato": "..."}]}`;
}

async function callGemini(topic, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(topic) }] }],
      generationConfig: {
        temperature: 0.9,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini respondió ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Respuesta de Gemini sin contenido');

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.titulos) || !Array.isArray(parsed.ideas)) {
    throw new Error('Formato de respuesta inesperado');
  }
  return parsed;
}

async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const topic = (url.searchParams.get('topic') || '').trim();

  if (!topic) {
    return new Response(JSON.stringify({ error: 'Falta el parámetro topic' }), {
      status: 400,
      headers: corsHeaders()
    });
  }

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY no configurada en este Worker' }), {
      status: 500,
      headers: corsHeaders()
    });
  }

  try {
    const result = await callGemini(topic, env.GEMINI_API_KEY);
    return new Response(JSON.stringify(result), { headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err && err.message || err) }), {
      status: 502,
      headers: corsHeaders()
    });
  }
}

export default {
  fetch: handleRequest
};
