# CreatorTools

Sitio web estático con herramientas gratuitas de SEO para creadores de contenido y bloggers, listo para publicarse en **GitHub Pages**. Sin frameworks frontend, sin backend, sin base de datos.

## Herramientas incluidas

1. **[Generador de Contenido SEO](herramientas/generador-contenido/)** — genera títulos SEO e ideas de artículos a la vez a partir de un tema. Usa IA real (Gemini, vía un Cloudflare Worker propio) cuando está configurada, con generación local por plantillas como respaldo. Permite guardar títulos e ideas favoritos por separado en `localStorage`.
2. **[Calculadora de Tiempo de Lectura](herramientas/calculadora-lectura/)** — calcula minutos de lectura, palabras y caracteres en tiempo real, con sugerencias de longitud y exportación de texto para meta description.

## Stack técnico

- HTML5 semántico + Schema.org (`WebApplication`, `BlogPosting`, `WebSite`)
- CSS3 (Grid/Flexbox), variables CSS en [`css/variables.css`](css/variables.css)
- JavaScript vanilla ES6+, sin dependencias externas en tiempo de ejecución
- `localStorage` para favoritos, historial y datos de usuario (nunca se envían a un servidor)
- 100% contenido estático, compatible con GitHub Pages

## Estructura del proyecto

```
/
├── index.html
├── herramientas/
│   ├── generador-contenido/ (index.html, guia.html, app.js)
│   └── calculadora-lectura/ (index.html, guia.html, app.js)
├── blog/
│   ├── index.html
│   ├── como-escribir-titulos.html
│   ├── guia-seo-onpage.html
│   ├── estructura-articulo.html
│   └── como-investigar-palabras-clave.html
├── css/
│   ├── variables.css
│   └── main.css
├── js/
│   └── utils.js
├── sobre.html / privacidad.html / cookies.html / contacto.html
├── sitemap.xml
└── robots.txt
```

## Desplegar en GitHub Pages

1. Sube este repositorio a GitHub (o usa el repositorio existente).
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama que contiene el código (por ejemplo `main`) y la carpeta `/ (root)`.
5. Guarda. GitHub Pages publicará el sitio en `https://<usuario>.github.io/<repositorio>/`.

### Antes de publicar

- Actualiza las URLs canónicas (`<link rel="canonical">`), Open Graph (`og:url`) y `sitemap.xml`/`robots.txt` si tu URL final de GitHub Pages difiere de `https://infoquercusia-boop.github.io/web-tecnologia-ads/`.
- Sustituye el correo de ejemplo en [`contacto.html`](contacto.html) por tu dirección real, o integra un formulario de [Formspree](https://formspree.io) (plan gratuito).
- Si añades analítica (Google Analytics u otra), respeta la política descrita en [`privacidad.html`](privacidad.html) y [`cookies.html`](cookies.html): solo visitas agregadas, sin datos personales.

## Desarrollo local

No requiere build ni instalación de dependencias. Basta con servir los archivos estáticos, por ejemplo:

```bash
python3 -m http.server 8000
# o
npx serve .
```

Abre `http://localhost:8000` en tu navegador.

## Accesibilidad y rendimiento

- Diseño mobile-first, probado en 375px / 768px / 1200px.
- Contraste de color conforme a WCAG AA, navegación por teclado y foco visible.
- Sin dependencias externas de terceros en tiempo de ejecución (fuentes del sistema, sin frameworks CSS/JS pesados).
- Feedback visual mediante notificaciones *toast* accesibles (`aria-live`).
