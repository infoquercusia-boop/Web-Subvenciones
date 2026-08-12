/**
 * Rastreador de Solicitud — Timeline Interactivo
 * Plazos orientativos (días) de la convocatoria 2026-2027
 */
(function () {
  "use strict";

  var PLAZOS = {
    emprendimiento: {
      label: "Emprendimiento",
      diasCierrePlazo: 45,
      diasResolucion: 150,
      diasPago: 30
    },
    educacion: {
      label: "Educación",
      diasCierrePlazo: 60,
      diasResolucion: 120,
      diasPago: 20
    },
    vivienda: {
      label: "Vivienda",
      diasCierrePlazo: 30,
      diasResolucion: 90,
      diasPago: 15
    },
    movilidad: {
      label: "Movilidad",
      diasCierrePlazo: 30,
      diasResolucion: 60,
      diasPago: 15
    }
  };

  var STORAGE_KEY = "sj-rastreador-solicitudes";
  var form = document.getElementById("track-form");
  var resultEl = document.getElementById("track-result");
  var statusEl = document.getElementById("tracker-status");
  var savedEl = document.getElementById("saved-trackers");

  function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function buildTimeline(fechaPresentacion, tipo) {
    var plazo = PLAZOS[tipo];
    var hoy = new Date();
    var fechaCierre = addDays(fechaPresentacion, plazo.diasCierrePlazo);
    var fechaResolucion = addDays(fechaPresentacion, plazo.diasResolucion);
    var fechaPago = addDays(fechaResolucion, plazo.diasPago);

    var estado;
    if (SJ.daysBetween(hoy, fechaCierre) < 0) {
      estado = "Cerrado";
    } else if (SJ.daysBetween(hoy, fechaCierre) >= 0 && hoy >= fechaPresentacion) {
      estado = "En plazo";
    } else {
      estado = "Próximamente";
    }
    if (hoy > fechaResolucion) estado = "Resuelto";

    return {
      plazo: plazo,
      fechaPresentacion: fechaPresentacion,
      fechaCierre: fechaCierre,
      fechaResolucion: fechaResolucion,
      fechaPago: fechaPago,
      estado: estado,
      hoy: hoy
    };
  }

  function estadoBadgeClass(estado) {
    switch (estado) {
      case "En plazo": return "badge-green";
      case "Cerrado": return "badge-red";
      case "Próximamente": return "badge-yellow";
      case "Resuelto": return "badge-blue";
      default: return "badge-blue";
    }
  }

  function itemState(hoy, fecha, isFuturePending) {
    if (hoy >= fecha) return "is-done";
    if (isFuturePending) return "is-current";
    return "";
  }

  function render(tl) {
    var diasHastaCierre = SJ.daysBetween(tl.hoy, tl.fechaCierre);
    var diasHastaResolucion = SJ.daysBetween(tl.hoy, tl.fechaResolucion);
    var diasHastaPago = SJ.daysBetween(tl.hoy, tl.fechaPago);

    var html = '<div class="result-box result-eligible" style="background: var(--color-bg-alt); border-color: var(--color-border);">';
    html += '<div class="flex justify-between items-center flex-wrap gap-2">';
    html += "<h3>Timeline de tu solicitud (" + tl.plazo.label + ")</h3>";
    html += '<span class="badge ' + estadoBadgeClass(tl.estado) + '">' + tl.estado + "</span>";
    html += "</div>";

    html += '<div class="timeline">';

    html += '<div class="timeline__item is-done">';
    html += '<div class="timeline__dot">1</div>';
    html += '<div class="timeline__title">Solicitud presentada</div>';
    html += '<div class="timeline__date">' + SJ.formatDate(tl.fechaPresentacion) + '</div>';
    html += '<div class="timeline__desc">Tu solicitud fue registrada en esta fecha.</div>';
    html += '</div>';

    var cierreState = tl.hoy >= tl.fechaCierre ? "is-done" : "is-warning";
    html += '<div class="timeline__item ' + cierreState + '">';
    html += '<div class="timeline__dot">2</div>';
    html += '<div class="timeline__title">Cierre del plazo de la convocatoria</div>';
    html += '<div class="timeline__date">' + SJ.formatDate(tl.fechaCierre) + '</div>';
    html += '<div class="timeline__desc">' + (diasHastaCierre >= 0
      ? "Faltan " + diasHastaCierre + " día" + (diasHastaCierre === 1 ? "" : "s") + " para el cierre del plazo."
      : "El plazo cerró hace " + Math.abs(diasHastaCierre) + " días.") + '</div>';
    html += '</div>';

    var resolucionState = tl.hoy >= tl.fechaResolucion ? "is-done" : "is-current";
    html += '<div class="timeline__item ' + resolucionState + '">';
    html += '<div class="timeline__dot">3</div>';
    html += '<div class="timeline__title">Resolución estimada</div>';
    html += '<div class="timeline__date">' + SJ.formatDate(tl.fechaResolucion) + '</div>';
    html += '<div class="timeline__desc">' + (diasHastaResolucion >= 0
      ? "Faltan aproximadamente " + diasHastaResolucion + " días para la resolución estimada."
      : "La resolución estimada fue hace " + Math.abs(diasHastaResolucion) + " días. Si no has recibido respuesta, contacta con el organismo.") + '</div>';
    html += '</div>';

    var pagoState = tl.hoy >= tl.fechaPago ? "is-done" : "";
    html += '<div class="timeline__item ' + pagoState + '">';
    html += '<div class="timeline__dot">4</div>';
    html += '<div class="timeline__title">Pago estimado (si es aprobada)</div>';
    html += '<div class="timeline__date">' + SJ.formatDate(tl.fechaPago) + '</div>';
    html += '<div class="timeline__desc">' + (diasHastaPago >= 0
      ? "Si tu solicitud es aprobada, el pago suele llegar en torno a esta fecha (" + diasHastaPago + " días)."
      : "Fecha de pago estimada ya superada.") + '</div>';
    html += '</div>';

    html += '</div>'; // timeline
    html += '</div>'; // result-box

    resultEl.innerHTML = html;
    resultEl.style.display = "block";
  }

  function readForm() {
    var fecha = document.getElementById("fecha-presentacion").value;
    var tipo = document.getElementById("tipo-tracker").value;
    return { fecha: fecha, tipo: tipo };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var data = readForm();
    var fechaPresentacion = new Date(data.fecha + "T00:00:00");
    var tl = buildTimeline(fechaPresentacion, data.tipo);
    render(tl);
  });

  document.getElementById("btn-guardar-tracker").addEventListener("click", function () {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var data = readForm();
    var list = SJ.Store.get(STORAGE_KEY, []);
    list.push({ fecha: data.fecha, tipo: data.tipo, guardadoEl: new Date().toISOString() });
    SJ.Store.set(STORAGE_KEY, list);
    statusEl.textContent = "Aviso guardado. Verás esta solicitud en la lista de abajo cada vez que visites esta página.";
    renderSaved();
  });

  function renderSaved() {
    var list = SJ.Store.get(STORAGE_KEY, []);
    if (!list.length) {
      savedEl.innerHTML = "";
      return;
    }
    var html = "<h3>Tus solicitudes guardadas</h3>";
    list.forEach(function (item, idx) {
      var fechaPresentacion = new Date(item.fecha + "T00:00:00");
      var tl = buildTimeline(fechaPresentacion, item.tipo);
      var diasHastaCierre = SJ.daysBetween(tl.hoy, tl.fechaCierre);
      html += '<div class="card" style="margin-bottom: var(--space-3);">';
      html += '<div class="flex justify-between items-center flex-wrap gap-2">';
      html += "<strong>" + PLAZOS[item.tipo].label + " · presentada el " + SJ.formatDate(fechaPresentacion) + "</strong>";
      html += '<span class="badge ' + estadoBadgeClass(tl.estado) + '">' + tl.estado + "</span>";
      html += "</div>";
      html += '<p class="text-muted" style="margin: var(--space-2) 0 0;">' + (diasHastaCierre >= 0
        ? "Faltan " + diasHastaCierre + " días para el cierre de plazo."
        : "Resolución estimada: " + SJ.formatDate(tl.fechaResolucion)) + "</p>";
      html += '<button type="button" class="btn btn-sm btn-secondary" data-remove="' + idx + '" style="margin-top: var(--space-3);">Eliminar aviso</button>';
      html += "</div>";
    });
    savedEl.innerHTML = html;

    savedEl.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-remove"), 10);
        var list2 = SJ.Store.get(STORAGE_KEY, []);
        list2.splice(idx, 1);
        SJ.Store.set(STORAGE_KEY, list2);
        renderSaved();
      });
    });
  }

  // Prefill tipo from query string (?tipo=emprendimiento) when arriving from directorio
  (function prefillFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var tipo = params.get("tipo");
    if (tipo && PLAZOS[tipo]) {
      document.getElementById("tipo-tracker").value = tipo;
    }
  })();

  renderSaved();
})();
