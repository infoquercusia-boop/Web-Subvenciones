# Proxy de Google Trends (Cloudflare Worker)

Este Worker permite que el **Analizador de Palabras Clave** de CreatorTools consulte datos reales de Google Trends. Es necesario porque el navegador no puede llamar directamente a Google Trends (bloqueo CORS); el Worker actúa de intermediario.

⚠️ **Importante**: esto usa endpoints internos y no oficiales de Google Trends (el mismo mecanismo que usa la librería `pytrends`). No hay garantía de que siga funcionando siempre — Google puede cambiar el formato de respuesta o bloquear peticiones repetidas. Por eso el sitio sigue funcionando con datos simulados si el Worker falla o no está desplegado.

## Requisitos

- Una cuenta gratuita de Cloudflare (no requiere tarjeta de crédito para este uso).
- Node.js instalado en tu ordenador (para usar la herramienta `wrangler`).

## Paso a paso

### 1. Crea una cuenta gratuita de Cloudflare

Ve a [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) y regístrate con tu correo. No hace falta añadir ningún dominio propio: el Worker se publica en un subdominio gratuito tipo `tu-worker.tu-usuario.workers.dev`.

### 2. Instala Wrangler (la CLI de Cloudflare)

Desde una terminal, dentro de la carpeta `cloudflare-worker/` de este proyecto:

```bash
cd cloudflare-worker
npm install -g wrangler
```

### 3. Inicia sesión

```bash
wrangler login
```

Se abrirá tu navegador para autorizar el acceso. Autoriza y vuelve a la terminal.

### 4. Despliega el Worker

```bash
wrangler deploy
```

Al terminar, Wrangler te mostrará una URL como:

```
https://creatortools-trends-proxy.tu-usuario.workers.dev
```

**Copia esa URL.**

### 5. Conecta la URL con la web

Abre `herramientas/analizador-keywords/app.js` en este repositorio y busca esta línea cerca del principio del archivo:

```js
const TRENDS_API_URL = ''; // <- pega aquí tu URL del Worker, ej: 'https://creatortools-trends-proxy.tu-usuario.workers.dev'
```

Pega tu URL entre las comillas, guarda el archivo, haz commit y push. En cuanto se despliegue en GitHub Pages, el analizador empezará a usar datos reales de Google Trends automáticamente, con el dataset simulado como respaldo si la petición falla.

### 6. Verifica que funciona

Visita tu Worker directamente en el navegador con una palabra clave de prueba:

```
https://creatortools-trends-proxy.tu-usuario.workers.dev/?q=marketing digital
```

Deberías ver una respuesta JSON con `interest`, `timeline` y `related`. Si ves un error, revisa los logs con:

```bash
wrangler tail
```

## Límites del plan gratuito

El plan gratuito de Cloudflare Workers incluye 100.000 peticiones al día, más que suficiente para una herramienta de este tipo.
