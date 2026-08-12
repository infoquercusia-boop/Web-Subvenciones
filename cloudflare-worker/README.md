# Conectar IA real (Gemini) al Generador de Contenido

Esta guía usa **solo el navegador**: nada de terminal, nada de instalar programas. Son 2 registros gratuitos (Google y Cloudflare) y copiar/pegar unos textos. Unos 10 minutos.

## Por qué hace falta esto

El Generador de Contenido puede usar IA real (Gemini) para generar títulos e ideas mucho mejores que las plantillas locales. Pero la clave de la API de Gemini es secreta: si la pusiéramos directamente en el código de la web, cualquier visitante podría verla y usarla a tu costa. Por eso hace falta un intermediario (un "Worker" de Cloudflare) que guarde la clave de forma segura y hable con Gemini por ti. Tu web pública nunca ve la clave, solo habla con el Worker.

## Paso 1 — Consigue una clave de Gemini (gratis)

1. Ve a **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**.
2. Inicia sesión con tu cuenta de Google.
3. Pulsa **"Create API key"** (o "Crear clave de API").
4. Copia la clave que te da (empieza por `AIza...`). Guárdala en algún sitio temporal, la necesitarás en el paso 3. **No la pegues en ningún archivo del repositorio ni la compartas en el chat.**

Gemini tiene un nivel gratuito con límite de peticiones diarias, suficiente para una herramienta de este tipo.

## Paso 2 — Crea una cuenta gratuita de Cloudflare

1. Ve a **[dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)** y regístrate con tu correo.
2. No hace falta añadir ningún dominio propio ni tarjeta de crédito para esto.

## Paso 3 — Crea el Worker desde el panel (sin terminal)

1. En el panel de Cloudflare, ve a **Workers & Pages** (menú lateral) → **Create** (o "Crear aplicación").
2. Elige **Create Worker**, ponle un nombre (por ejemplo `creatortools-ai-proxy`) y pulsa **Deploy**. Esto crea un Worker de ejemplo ("Hello World").
3. Pulsa **Edit code** (o "Editar código") para abrir el editor online.
4. Borra todo el código de ejemplo y pega el contenido completo del archivo [`worker.js`](worker.js) de esta carpeta.
5. Pulsa **Deploy** (o el botón de guardar/publicar) en la esquina superior derecha del editor.
6. Copia la URL de tu Worker, que aparece arriba del todo — algo como `https://creatortools-ai-proxy.tu-usuario.workers.dev`.

## Paso 4 — Añade tu clave de Gemini como secreto

1. Vuelve a la página de tu Worker (fuera del editor de código) y ve a la pestaña **Settings** → **Variables and Secrets** (o "Variables").
2. Pulsa **Add** (o "Añadir variable").
3. Nombre: `GEMINI_API_KEY`. Valor: pega tu clave del paso 1. Marca el tipo como **Secret** / **Encrypt** para que quede oculta.
4. Guarda. Si te pide volver a desplegar, hazlo.

## Paso 5 — Conecta la URL con la web

1. Abre `herramientas/generador-contenido/app.js` en este repositorio.
2. Busca la línea:
   ```js
   const AI_API_URL = '';
   ```
3. Pega tu URL del Worker entre las comillas:
   ```js
   const AI_API_URL = 'https://creatortools-ai-proxy.tu-usuario.workers.dev';
   ```
4. Guarda, haz commit y push. En cuanto se despliegue en GitHub Pages, el generador empezará a usar IA real, mostrando la etiqueta "Generado con IA (Gemini)".

## Verificar que funciona

Visita directamente en tu navegador (sustituyendo por tu URL real):

```
https://creatortools-ai-proxy.tu-usuario.workers.dev/?topic=marketing digital
```

Deberías ver una respuesta JSON con `titulos` e `ideas`. Si ves un error, revisa que el secreto `GEMINI_API_KEY` esté bien guardado (Paso 4).

## Si algo falla

La herramienta nunca se rompe: si el Worker no está configurado, tarda demasiado o da error, el sitio cae automáticamente a la generación local por plantillas — así que puedes intentar este proceso con calma, sin miedo a dejar la web caída.
