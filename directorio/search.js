/**
 * search.js — Directorio de Subvenciones para Jóvenes 2026-2027
 * Filtrado, búsqueda, orden y detalle 100% client-side, sin backend.
 */
(function () {
  "use strict";

  var DATA_URL = "/web-tecnologia-ads/directorio/data.json";
  var STORAGE_KEY = "sj_directorio_filtros";

  var allSubs = [];
  var filtered = [];

  var els = {};

  function qs(sel) { return document.querySelector(sel); }

  function cacheEls() {
    els.results = qs("#results");
    els.resultsCount = qs("#results-count");
    els.noResults = qs("#no-results");
    els.form = qs("#filters-form");
    els.busqueda = qs("#f-busqueda");
    els.tipo = qs("#f-tipo");
    els.comunidad = qs("#f-comunidad");
    els.edad = qs("#f-edad");
    els.estado = qs("#f-estado");
    els.cantidad = qs("#f-cantidad");
    els.orden = qs("#f-orden");
    els.reset = qs("#f-reset");
    els.dialog = qs("#detalle-dialog");
    els.dialogBody = qs("#detalle-body");
    els.dialogClose = qs("#detalle-close");
  }

  function estadoBadgeClass(estado) {
    switch (estado) {
      case "En plazo": return "badge-green";
      case "Proximamente": return "badge-blue";
      case "Cerrado": return "badge-red";
      case "Resuelto": return "badge-yellow";
      default: return "badge";
    }
  }

  function tipoLabel(tipo) {
    var labels = {
      emprendimiento: "Emprendimiento",
      educacion: "Educación",
      vivienda: "Vivienda",
      movilidad: "Movilidad"
    };
    return labels[tipo] || tipo;
  }

  function loadFiltersFromStorage() {
    var saved = window.SJ && window.SJ.Store.get(STORAGE_KEY, null);
    if (!saved) return;
    if (els.busqueda && saved.busqueda) els.busqueda.value = saved.busqueda;
    if (els.tipo && saved.tipo) els.tipo.value = saved.tipo;
    if (els.comunidad && saved.comunidad) els.comunidad.value = saved.comunidad;
    if (els.edad && saved.edad) els.edad.value = saved.edad;
    if (els.estado && saved.estado) els.estado.value = saved.estado;
    if (els.cantidad && saved.cantidad) els.cantidad.value = saved.cantidad;
    if (els.orden && saved.orden) els.orden.value = saved.orden;
  }

  function saveFiltersToStorage() {
    if (!window.SJ) return;
    window.SJ.Store.set(STORAGE_KEY, {
      busqueda: els.busqueda.value,
      tipo: els.tipo.value,
      comunidad: els.comunidad.value,
      edad: els.edad.value,
      estado: els.estado.value,
      cantidad: els.cantidad.value,
      orden: els.orden.value
    });
  }

  function populateComunidades() {
    var comunidades = Array.from(new Set(allSubs.map(function (s) { return s.comunidad; }))).sort();
    comunidades.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      els.comunidad.appendChild(opt);
    });
  }

  function matchesFilters(sub) {
    var busqueda = (els.busqueda.value || "").trim().toLowerCase();
    var tipo = els.tipo.value;
    var comunidad = els.comunidad.value;
    var edad = els.edad.value;
    var estado = els.estado.value;
    var cantidad = els.cantidad.value;

    if (tipo && sub.tipo !== tipo) return false;
    if (comunidad && sub.comunidad !== comunidad) return false;
    if (estado && sub.estado !== estado) return false;

    if (edad) {
      var edadNum = parseInt(edad, 10);
      if (!isNaN(edadNum)) {
        if (edadNum < sub.edadMinima || edadNum > sub.edadMaxima) return false;
      }
    }

    if (cantidad) {
      if (cantidad === "0-5000" && sub.cantidadMax > 5000) return false;
      if (cantidad === "5000-15000" && (sub.cantidadMax < 5000 || sub.cantidadMin > 15000)) return false;
      if (cantidad === "15000+" && sub.cantidadMax < 15000) return false;
    }

    if (busqueda) {
      var haystack = [
        sub.nombre,
        sub.entidad,
        sub.comunidad,
        (sub.requisitos || []).join(" ")
      ].join(" ").toLowerCase();
      if (haystack.indexOf(busqueda) === -1) return false;
    }

    return true;
  }

  function sortSubs(list) {
    var orden = els.orden.value;
    var copy = list.slice();
    if (orden === "cantidad-desc") {
      copy.sort(function (a, b) { return b.cantidadMax - a.cantidadMax; });
    } else if (orden === "cantidad-asc") {
      copy.sort(function (a, b) { return a.cantidadMin - b.cantidadMin; });
    } else if (orden === "nombre") {
      copy.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    } else {
      // fecha-cierre (por defecto): más próximas primero
      copy.sort(function (a, b) {
        var da = window.SJ.parseSpanishDate(a.plazoSolicitud);
        var db = window.SJ.parseSpanishDate(b.plazoSolicitud);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      });
    }
    return copy;
  }

  function renderCard(sub) {
    var esc = window.SJ.escapeHtml;
    return (
      '<article class="card sub-card" data-id="' + esc(sub.id) + '">' +
        '<div class="sub-card__meta">' +
          '<span class="badge badge-blue">' + esc(tipoLabel(sub.tipo)) + '</span>' +
          '<span class="badge">' + esc(sub.comunidad) + '</span>' +
          '<span class="badge ' + estadoBadgeClass(sub.estado) + '">' + esc(sub.estado) + '</span>' +
        '</div>' +
        '<h3>' + esc(sub.nombre) + '</h3>' +
        '<p class="text-muted">' + esc(sub.entidad) + '</p>' +
        '<p class="sub-card__amount">' + esc(sub.cantidad) + '</p>' +
        '<p class="text-muted" style="font-size: var(--fs-xs);">' +
          'Edad: ' + sub.edadMinima + '–' + sub.edadMaxima + ' años · ' +
          'Plazo: ' + esc(sub.plazoApertura) + ' a ' + esc(sub.plazoSolicitud) +
        '</p>' +
        '<button type="button" class="btn btn-secondary btn-sm btn-detalle" data-id="' + esc(sub.id) + '">Ver detalle</button>' +
      '</article>'
    );
  }

  function render() {
    filtered = sortSubs(allSubs.filter(matchesFilters));

    els.resultsCount.textContent = filtered.length + (filtered.length === 1
      ? " subvención encontrada"
      : " subvenciones encontradas");

    if (filtered.length === 0) {
      els.results.innerHTML = "";
      els.noResults.hidden = false;
      return;
    }

    els.noResults.hidden = true;
    els.results.innerHTML = filtered.map(renderCard).join("");
  }

  function openDetalle(id) {
    var sub = allSubs.find(function (s) { return s.id === id; });
    if (!sub || !els.dialog) return;
    var esc = window.SJ.escapeHtml;

    var requisitosHtml = (sub.requisitos || []).map(function (r) {
      return "<li>" + esc(r) + "</li>";
    }).join("");
    var documentosHtml = (sub.documentosRequeridos || []).map(function (d) {
      return "<li>" + esc(d) + "</li>";
    }).join("");

    els.dialogBody.innerHTML =
      '<div class="sub-card__meta">' +
        '<span class="badge badge-blue">' + esc(tipoLabel(sub.tipo)) + '</span>' +
        '<span class="badge">' + esc(sub.comunidad) + '</span>' +
        '<span class="badge ' + estadoBadgeClass(sub.estado) + '">' + esc(sub.estado) + '</span>' +
        '<span class="badge">Dificultad: ' + esc(sub.dificultad) + '</span>' +
      '</div>' +
      '<h2 class="mt-0">' + esc(sub.nombre) + '</h2>' +
      '<p class="text-muted">' + esc(sub.entidad) + '</p>' +
      '<p class="sub-card__amount">' + esc(sub.cantidad) + '</p>' +
      '<table>' +
        '<tr><th>Edad</th><td>' + sub.edadMinima + '–' + sub.edadMaxima + ' años</td></tr>' +
        '<tr><th>Apertura</th><td>' + esc(sub.plazoApertura) + '</td></tr>' +
        '<tr><th>Fin de plazo</th><td>' + esc(sub.plazoSolicitud) + '</td></tr>' +
        '<tr><th>Resolución estimada</th><td>' + esc(sub.resolucion_estimada) + '</td></tr>' +
      '</table>' +
      '<h4>Requisitos</h4><ul>' + requisitosHtml + '</ul>' +
      '<h4>Documentos requeridos</h4><ul>' + documentosHtml + '</ul>' +
      '<div class="flex gap-3 flex-wrap" style="margin-top: var(--space-5);">' +
        '<a class="btn btn-primary" href="' + esc(sub.enlace) + '" target="_blank" rel="noopener noreferrer">Ir a la web oficial</a>' +
        '<a class="btn btn-accent" href="/web-tecnologia-ads/herramientas/rastreador-solicitud/?tipo=' + encodeURIComponent(sub.tipo) + '">Rastrear esta solicitud</a>' +
      '</div>';

    if (typeof els.dialog.showModal === "function") {
      els.dialog.showModal();
    } else {
      els.dialog.setAttribute("open", "true");
    }
  }

  function closeDetalle() {
    if (!els.dialog) return;
    if (typeof els.dialog.close === "function") {
      els.dialog.close();
    } else {
      els.dialog.removeAttribute("open");
    }
  }

  function bindEvents() {
    els.form.addEventListener("input", function () {
      saveFiltersToStorage();
      render();
    });
    els.form.addEventListener("change", function () {
      saveFiltersToStorage();
      render();
    });
    els.reset.addEventListener("click", function () {
      els.form.reset();
      if (window.SJ) window.SJ.Store.remove(STORAGE_KEY);
      render();
    });
    els.results.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-detalle");
      if (!btn) return;
      openDetalle(btn.getAttribute("data-id"));
    });
    if (els.dialogClose) {
      els.dialogClose.addEventListener("click", closeDetalle);
    }
    if (els.dialog) {
      els.dialog.addEventListener("click", function (e) {
        if (e.target === els.dialog) closeDetalle();
      });
    }
  }

  function showLoadError() {
    els.results.innerHTML = "";
    els.resultsCount.textContent = "";
    els.noResults.hidden = false;
    els.noResults.innerHTML =
      '<p><strong>No se pudieron cargar las subvenciones.</strong></p>' +
      '<p class="text-muted">Comprueba tu conexión o vuelve a intentarlo. Si estás abriendo el archivo directamente ' +
      'desde el disco (file://), sirve el sitio con un servidor local (por ejemplo <code>python3 -m http.server</code>) ' +
      'para que la carga de datos funcione correctamente.</p>';
  }

  function init() {
    cacheEls();
    if (!els.form || !els.results) return;

    bindEvents();

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        allSubs = Array.isArray(data) ? data : [];
        populateComunidades();
        loadFiltersFromStorage();
        render();
      })
      .catch(function (err) {
        console.error("Error cargando data.json", err);
        showLoadError();
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
