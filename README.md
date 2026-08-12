# Subvenciones Jóvenes 2026-2027

Sitio web estático con guías paso a paso, herramientas interactivas y un directorio filtrable de subvenciones para jóvenes en España, listo para publicarse en **GitHub Pages**. Sin frameworks frontend, sin backend, sin base de datos.

## Contenido

- **Guías paso a paso** (`/guias/`): emprendimiento, educación, vivienda y movilidad, cada una con 4-5 páginas de paso extensas y datos actualizados a 2026-2027.
- **Herramientas interactivas** (`/herramientas/`):
  1. **Checklist de documentación** — genera una lista de documentos por tipo de subvención con checkboxes, progreso guardado en `localStorage` y exportación a PDF/texto.
  2. **Calculadora de elegibilidad** — responde 5 preguntas y comprueba al instante si cumples los requisitos, con sugerencias de alternativas.
  3. **Rastreador de solicitud** — calcula automáticamente tu timeline de cierre de plazo, resolución y pago.
- **Directorio filtrable** (`/directorio/`): más de 30 subvenciones 2026-2027 con filtros por tipo, comunidad autónoma, edad, estado y cuantía, búsqueda por palabra clave y ordenación — todo client-side (`data.json` + `search.js`).
- **Blog** (`/blog/`): 5 artículos sobre errores comunes, fechas clave, requisitos, cómo redactar un proyecto y preguntas frecuentes.

## Stack técnico

- HTML5 semántico + Schema.org (`WebSite`, `WebApplication`, `HowTo`, `BlogPosting`, `FAQPage`, `ItemList`)
- CSS3 (Grid/Flexbox), variables CSS en [`css/variables.css`](css/variables.css) y estilos globales en [`css/main.css`](css/main.css)
- JavaScript vanilla ES6+, sin dependencias externas en tiempo de ejecución
- `localStorage` para checklist, perfiles de elegibilidad y avisos del rastreador (nunca se envían a un servidor)
- 100% contenido estático, compatible con GitHub Pages

## Estructura del proyecto

```
/
├── index.html
├── guias/
│   ├── index.html
│   ├── emprendimiento/ (index + paso-1 a paso-5)
│   ├── educacion/ (index + paso-1 a paso-4)
│   ├── vivienda/ (index + paso-1 a paso-4)
│   └── movilidad/ (index + paso-1 a paso-4)
├── herramientas/
│   ├── index.html
│   ├── checklist-documentos/ (index.html, guia.html, app.js)
│   ├── calculadora-elegibilidad/ (index.html, guia.html, app.js)
│   └── rastreador-solicitud/ (index.html, guia.html, app.js)
├── directorio/
│   ├── index.html
│   ├── data.json
│   └── search.js
├── blog/
│   ├── index.html
│   └── 5 artículos
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

1. Sube este repositorio a GitHub.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch** (o usa el workflow incluido en `.github/workflows/pages.yml`, que despliega automáticamente en cada push a la rama configurada).
4. El sitio se publica en `https://<usuario>.github.io/<repositorio>/`.

### Importante: rutas absolutas

Todas las páginas usan rutas absolutas con el prefijo `/Web-Subvenciones/` (por ejemplo `/Web-Subvenciones/css/main.css`) porque el sitio se publica en un *project page* de GitHub Pages (`usuario.github.io/Web-Subvenciones/`), no en un dominio raíz. **Si cambias el nombre del repositorio o usas un dominio propio**, actualiza ese prefijo en todos los archivos HTML/JS y en `sitemap.xml`/`robots.txt`.

### Antes de publicar

- Sustituye el correo de ejemplo `hola@subvencionesjovenes.es` por tu dirección real, o integra un formulario de [Formspree](https://formspree.io).
- Revisa que las URLs oficiales enlazadas en las guías y en `directorio/data.json` sean correctas y estén vigentes.
- Actualiza fechas, cuantías y requisitos cuando se publiquen las convocatorias reales de cada año.

## Desarrollo local

No requiere build ni instalación de dependencias. Sirve los archivos estáticos con un servidor HTTP (necesario para que `fetch('data.json')` funcione en el directorio):

```bash
python3 -m http.server 8000
# o
npx serve .
```

Abre `http://localhost:8000/Web-Subvenciones/` si replicas la estructura de subcarpeta, o ajusta temporalmente los prefijos `/Web-Subvenciones/` a rutas relativas para pruebas en local en la raíz.

## Accesibilidad y rendimiento

- Diseño mobile-first, probado en 375px / 768px / 1200px+.
- Contraste de color conforme a WCAG AA, navegación por teclado, foco visible y enlace "saltar al contenido".
- Sin dependencias externas de terceros en tiempo de ejecución (fuentes del sistema, sin frameworks CSS/JS pesados).
- Menú de navegación accesible con `aria-expanded`/`aria-controls`, y `aria-current="page"` en la sección activa.

## Aviso legal

Subvenciones Jóvenes es un proyecto informativo independiente y no gestiona solicitudes de subvenciones. Toda la información (incluidas las 30+ subvenciones del directorio) tiene fines educativos e ilustrativos; verifica siempre requisitos, plazos y cuantías en las fuentes oficiales antes de presentar una solicitud real.
