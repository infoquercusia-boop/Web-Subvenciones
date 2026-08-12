/**
 * Cloudflare Worker — proxy para Google Trends.
 *
 * Google Trends no ofrece una API pública oficial. Este worker replica el
 * flujo que usan herramientas como "pytrends": llama a los endpoints
 * internos de trends.google.com (explore -> widgetdata) desde el servidor,
 * evitando así el bloqueo CORS que impide llamarlos directamente desde el
 * navegador. Es un uso NO oficial y puede romperse si Google cambia el
 * formato de respuesta, o bloquear peticiones repetidas desde la misma IP.
 *
 * Endpoint expuesto: GET /?q=<palabra clave>&geo=ES
 * Respuesta: { keyword, interest, timeline: [...], related: [...] }
 */

const ALLOWED_ORIGIN = '*'; // en producción, sustituye por tu dominio de GitHub Pages

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

/** Google antepone ")]}'," (o similar) a sus respuestas JSON para evitar hijacking. Lo quitamos. */
function stripJsonSafetyPrefix(text) {
  const start = text.indexOf('{');
  return start >= 0 ? text.slice(start) : text;
}

async function fetchTrendsJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9'
    }
  });
  if (!res.ok) {
    throw new Error(`Google Trends respondió ${res.status}`);
  }
  const text = await res.text();
  return JSON.parse(stripJsonSafetyPrefix(text));
}

async function getExploreWidgets(keyword, geo) {
  const req = {
    comparisonItem: [{ keyword, geo: geo || '', time: 'today 12-m' }],
    category: 0,
    property: ''
  };
  const url = `https://trends.google.com/trends/api/explore?hl=es&tz=-60&req=${encodeURIComponent(JSON.stringify(req))}`;
  const data = await fetchTrendsJson(url);
  return data.widgets || [];
}

async function getTimelineData(widget) {
  const url = `https://trends.google.com/trends/api/widgetdata/multiline?hl=es&tz=-60&req=${encodeURIComponent(JSON.stringify(widget.request))}&token=${widget.token}`;
  const data = await fetchTrendsJson(url);
  const points = (data.default && data.default.timelineData) || [];
  return points.map((p) => ({
    time: p.formattedAxisTime || p.formattedTime,
    value: Array.isArray(p.value) ? p.value[0] : 0
  }));
}

async function getRelatedQueries(widget) {
  const url = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=es&tz=-60&req=${encodeURIComponent(JSON.stringify(widget.request))}&token=${widget.token}`;
  const data = await fetchTrendsJson(url);
  const rankedLists = (data.default && data.default.rankedList) || [];
  const queries = [];
  for (const list of rankedLists) {
    for (const item of list.rankedKeyword || []) {
      if (item.query) queries.push(item.query);
    }
  }
  return [...new Set(queries)].slice(0, 8);
}

async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const keyword = (url.searchParams.get('q') || '').trim();
  const geo = url.searchParams.get('geo') || '';

  if (!keyword) {
    return new Response(JSON.stringify({ error: 'Falta el parámetro q' }), {
      status: 400,
      headers: corsHeaders()
    });
  }

  try {
    const widgets = await getExploreWidgets(keyword, geo);
    const timelineWidget = widgets.find((w) => w.id === 'TIMESERIES');
    const relatedWidget = widgets.find((w) => w.id === 'RELATED_QUERIES');

    const [timeline, related] = await Promise.all([
      timelineWidget ? getTimelineData(timelineWidget) : Promise.resolve([]),
      relatedWidget ? getRelatedQueries(relatedWidget) : Promise.resolve([])
    ]);

    const interest = timeline.length ? timeline[timeline.length - 1].value : 0;

    return new Response(
      JSON.stringify({ keyword, interest, timeline, related, source: 'google-trends' }),
      { headers: corsHeaders() }
    );
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
