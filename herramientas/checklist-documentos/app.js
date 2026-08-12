/**
 * Checklist de Documentación por Subvención
 * Todo el estado se guarda en localStorage bajo la clave "sj-checklist-<tipo>"
 */
(function () {
  "use strict";

  var DATA = {
    emprendimiento: {
      label: "Emprendimiento",
      sections: [
        {
          nombre: "Documentos personales",
          items: [
            "DNI o NIE en vigor (ambas caras)",
            "Certificado de empadronamiento actualizado (menos de 3 meses)",
            "Número de la Seguridad Social o afiliación",
            "Cuenta bancaria a tu nombre (certificado de titularidad)"
          ]
        },
        {
          nombre: "Documentos fiscales",
          items: [
            "Declaración de la Renta (IRPF) 2025",
            "Certificado de estar al corriente con Hacienda",
            "Certificado de estar al corriente con la Seguridad Social",
            "Vida laboral actualizada"
          ]
        },
        {
          nombre: "Documentos empresariales",
          items: [
            "Plan de negocio o memoria del proyecto",
            "Alta como autónomo (modelo 036/037) o proyecto de constitución de empresa",
            "Presupuesto detallado de inversión",
            "Justificante de inscripción en el registro correspondiente (si ya existe la empresa)"
          ]
        }
      ]
    },
    educacion: {
      label: "Educación",
      sections: [
        {
          nombre: "Documentos personales",
          items: [
            "DNI o NIE en vigor",
            "Certificado de empadronamiento actualizado",
            "Libro de familia o documento equivalente (becas familiares)",
            "Cuenta bancaria a tu nombre"
          ]
        },
        {
          nombre: "Documentos fiscales",
          items: [
            "Declaración de la Renta (IRPF) 2025 propia y/o familiar",
            "Certificado de estar al corriente con Hacienda",
            "Certificado de ingresos si no hiciste declaración"
          ]
        },
        {
          nombre: "Documentos académicos",
          items: [
            "Justificante de matrícula o admisión en el curso 2026-2027",
            "Certificado académico de notas del curso anterior",
            "Carta de motivación o proyecto formativo",
            "Acreditación del centro (si es formación privada u online)"
          ]
        }
      ]
    },
    vivienda: {
      label: "Vivienda",
      sections: [
        {
          nombre: "Documentos personales",
          items: [
            "DNI o NIE en vigor",
            "Certificado de empadronamiento",
            "Certificado de no ser propietario de otra vivienda",
            "Cuenta bancaria a tu nombre"
          ]
        },
        {
          nombre: "Documentos fiscales",
          items: [
            "Declaración de la Renta (IRPF) 2025",
            "Certificado de estar al corriente con Hacienda",
            "Certificado de estar al corriente con la Seguridad Social",
            "Justificante de ingresos (nómina o certificado de prestaciones)"
          ]
        },
        {
          nombre: "Documentos de la vivienda",
          items: [
            "Contrato de alquiler firmado o contrato de arras/compraventa",
            "Referencia catastral de la vivienda",
            "Recibos de alquiler o hipoteca de los últimos meses",
            "Certificado de eficiencia energética (rehabilitación)"
          ]
        }
      ]
    },
    movilidad: {
      label: "Movilidad",
      sections: [
        {
          nombre: "Documentos personales",
          items: [
            "DNI o NIE en vigor",
            "Certificado de empadronamiento",
            "Cuenta bancaria a tu nombre"
          ]
        },
        {
          nombre: "Documentos fiscales",
          items: [
            "Declaración de la Renta (IRPF) 2025",
            "Certificado de estar al corriente con Hacienda"
          ]
        },
        {
          nombre: "Documentos específicos",
          items: [
            "Factura de la autoescuela o del examen de conducir",
            "Factura de compra o contrato de renting del vehículo eléctrico",
            "Certificado de achatarramiento del vehículo antiguo (si aplica)",
            "Justificante del abono de transporte público solicitado"
          ]
        }
      ]
    }
  };

  var select = document.getElementById("tipo-subvencion");
  var container = document.getElementById("checklist-sections");
  var progressLabel = document.getElementById("progress-label");
  var progressPercent = document.getElementById("progress-percent");
  var progressBar = document.getElementById("progress-bar");
  var progressWrap = document.getElementById("progress-bar-wrap");
  var saveStatus = document.getElementById("save-status");

  function storageKey(tipo) {
    return "sj-checklist-" + tipo;
  }

  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function render(tipo) {
    var data = DATA[tipo];
    var saved = window.SJ.Store.get(storageKey(tipo), {});
    container.innerHTML = "";

    data.sections.forEach(function (section, sIdx) {
      var details = document.createElement("details");
      details.className = "accordion";
      details.open = sIdx === 0;

      var summary = document.createElement("summary");
      var countSpan = document.createElement("span");
      countSpan.className = "doc-section-title";
      countSpan.innerHTML = window.SJ.escapeHtml(section.nombre) +
        ' <span class="doc-count-pill" data-section="' + sIdx + '"></span>';
      summary.appendChild(countSpan);
      details.appendChild(summary);

      var body = document.createElement("div");
      body.className = "accordion-body";

      section.items.forEach(function (item, iIdx) {
        var id = "chk-" + slug(section.nombre) + "-" + iIdx;
        var row = document.createElement("div");
        row.className = "checkbox-row";
        var checked = !!saved[id];
        if (checked) row.classList.add("is-checked");

        row.innerHTML =
          '<input type="checkbox" id="' + id + '" data-id="' + id + '"' + (checked ? " checked" : "") + '>' +
          '<label for="' + id + '">' + window.SJ.escapeHtml(item) + "</label>";

        body.appendChild(row);
      });

      details.appendChild(body);
      container.appendChild(details);
    });

    updateProgress(tipo);

    container.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        var data2 = window.SJ.Store.get(storageKey(tipo), {});
        data2[cb.dataset.id] = cb.checked;
        window.SJ.Store.set(storageKey(tipo), data2);
        cb.closest(".checkbox-row").classList.toggle("is-checked", cb.checked);
        updateProgress(tipo);
      });
    });
  }

  function updateProgress(tipo) {
    var data = DATA[tipo];
    var saved = window.SJ.Store.get(storageKey(tipo), {});
    var total = 0, done = 0;

    data.sections.forEach(function (section, sIdx) {
      var sectionTotal = section.items.length;
      var sectionDone = 0;
      section.items.forEach(function (item, iIdx) {
        var id = "chk-" + slug(section.nombre) + "-" + iIdx;
        total++;
        if (saved[id]) { done++; sectionDone++; }
      });
      var pill = container.querySelector('.doc-count-pill[data-section="' + sIdx + '"]');
      if (pill) pill.textContent = sectionDone + "/" + sectionTotal;
    });

    var pct = total ? Math.round((done / total) * 100) : 0;
    progressLabel.textContent = done + " de " + total + " documentos preparados";
    progressPercent.textContent = pct + "%";
    progressBar.style.width = pct + "%";
    progressWrap.setAttribute("aria-valuenow", String(pct));
  }

  function currentTipo() {
    return select.value;
  }

  select.addEventListener("change", function () {
    render(currentTipo());
    saveStatus.textContent = "";
  });

  document.getElementById("btn-guardar").addEventListener("click", function () {
    saveStatus.textContent = "Progreso guardado en este navegador (" + new Date().toLocaleTimeString("es-ES") + ").";
  });

  document.getElementById("btn-reset").addEventListener("click", function () {
    if (!confirm("¿Seguro que quieres reiniciar el checklist de " + DATA[currentTipo()].label + "? Se borrará tu progreso guardado.")) return;
    window.SJ.Store.remove(storageKey(currentTipo()));
    render(currentTipo());
    saveStatus.textContent = "Checklist reiniciado.";
  });

  function buildTextExport(tipo) {
    var data = DATA[tipo];
    var saved = window.SJ.Store.get(storageKey(tipo), {});
    var lines = [];
    lines.push("CHECKLIST DE DOCUMENTACIÓN — " + data.label.toUpperCase());
    lines.push("Subvenciones Jóvenes 2026-2027");
    lines.push("Generado el " + new Date().toLocaleDateString("es-ES"));
    lines.push("");

    data.sections.forEach(function (section, sIdx) {
      lines.push(section.nombre.toUpperCase());
      section.items.forEach(function (item, iIdx) {
        var id = "chk-" + slug(section.nombre) + "-" + iIdx;
        lines.push((saved[id] ? "[x] " : "[ ] ") + item);
      });
      lines.push("");
    });

    return lines.join("\n");
  }

  document.getElementById("btn-texto").addEventListener("click", function () {
    var text = buildTextExport(currentTipo());
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "checklist-" + currentTipo() + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-pdf").addEventListener("click", function () {
    var tipo = currentTipo();
    var data = DATA[tipo];
    var saved = window.SJ.Store.get(storageKey(tipo), {});
    var printArea = document.getElementById("print-area");

    var html = "<h1>Checklist de Documentación — " + window.SJ.escapeHtml(data.label) + "</h1>";
    html += "<p>Subvenciones Jóvenes 2026-2027 · Generado el " + new Date().toLocaleDateString("es-ES") + "</p>";

    data.sections.forEach(function (section, sIdx) {
      html += "<h2>" + window.SJ.escapeHtml(section.nombre) + "</h2><ul>";
      section.items.forEach(function (item, iIdx) {
        var id = "chk-" + slug(section.nombre) + "-" + iIdx;
        html += "<li>" + (saved[id] ? "☑" : "☐") + " " + window.SJ.escapeHtml(item) + "</li>";
      });
      html += "</ul>";
    });

    printArea.innerHTML = html;
    window.print();
  });

  render(currentTipo());
})();
