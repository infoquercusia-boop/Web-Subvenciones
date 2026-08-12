/**
 * Calculadora de Elegibilidad Rápida
 * Reglas orientativas de convocatorias 2026-2027 (bases IRPF 2025)
 */
(function () {
  "use strict";

  var RULES = {
    emprendimiento: {
      label: "Emprendimiento",
      edadMin: 18,
      edadMax: 35,
      ingresosMax: 24000,
      situacionesValidas: ["desempleado", "autonomo"],
      situacionLabel: "estar desempleado/a o dado de alta como autónomo/a",
      cantidad: "5.000 € – 25.000 €"
    },
    educacion: {
      label: "Educación",
      edadMin: 16,
      edadMax: 35,
      ingresosMax: 20000,
      situacionesValidas: ["estudiante", "desempleado", "autonomo", "empleado", "inactivo"],
      situacionLabel: "estar matriculado/a o admitido/a en un curso 2026-2027",
      cantidad: "300 € – 6.000 €"
    },
    vivienda: {
      label: "Vivienda",
      edadMin: 18,
      edadMax: 35,
      ingresosMax: 25920,
      situacionesValidas: ["desempleado", "autonomo", "empleado", "estudiante"],
      situacionLabel: "no ser propietario/a de otra vivienda y acreditar ingresos",
      cantidad: "Hasta 250 €/mes (alquiler) o 10.800 € (compra)"
    },
    movilidad: {
      label: "Movilidad",
      edadMin: 18,
      edadMax: 35,
      ingresosMax: 22000,
      situacionesValidas: ["desempleado", "estudiante", "autonomo", "empleado", "inactivo"],
      situacionLabel: "estar empadronado/a y acreditar ingresos dentro del límite",
      cantidad: "Hasta 1.000 € (carnet) o 7.000 € (vehículo eléctrico)"
    }
  };

  var COMUNIDADES_CON_AYUDAS_EXTRA = ["Andalucía", "Cataluña", "Madrid", "Comunidad Valenciana", "País Vasco", "Galicia"];

  var form = document.getElementById("elig-form");
  var resultado = document.getElementById("resultado");
  var perfilStatus = document.getElementById("perfil-status");
  var PROFILE_KEY = "sj-calculadora-perfil";

  function evaluar(perfil) {
    var rule = RULES[perfil.tipo];
    var checks = [];

    var edadOk = perfil.edad >= rule.edadMin && perfil.edad <= rule.edadMax;
    checks.push({
      cumple: edadOk,
      texto: "Edad entre " + rule.edadMin + " y " + rule.edadMax + " años (tienes " + perfil.edad + ")"
    });

    var ingresosOk = perfil.ingresos <= rule.ingresosMax;
    checks.push({
      cumple: ingresosOk,
      texto: "Ingresos anuales 2025 no superiores a " + rule.ingresosMax.toLocaleString("es-ES") + " € (declaraste " + perfil.ingresos.toLocaleString("es-ES") + " €)"
    });

    var situacionOk = rule.situacionesValidas.indexOf(perfil.situacion) !== -1;
    checks.push({
      cumple: situacionOk,
      texto: "Cumples la situación requerida: " + rule.situacionLabel
    });

    checks.push({
      cumple: true,
      texto: "Residente en " + perfil.comunidad + (COMUNIDADES_CON_AYUDAS_EXTRA.indexOf(perfil.comunidad) !== -1 ? " (esta comunidad además ofrece líneas propias complementarias)" : "")
    });

    var elegible = checks.every(function (c) { return c.cumple; });
    return { elegible: elegible, checks: checks, rule: rule };
  }

  function sugerirAlternativas(perfil) {
    var alternativas = [];
    Object.keys(RULES).forEach(function (key) {
      if (key === perfil.tipo) return;
      var r = evaluar(Object.assign({}, perfil, { tipo: key }));
      if (r.elegible) alternativas.push(RULES[key].label);
    });
    return alternativas;
  }

  function render(perfil, resultadoEval) {
    var rule = resultadoEval.rule;
    var cumplidos = resultadoEval.checks.filter(function (c) { return c.cumple; });
    var noCumplidos = resultadoEval.checks.filter(function (c) { return !c.cumple; });

    var html = '<div class="result-box ' + (resultadoEval.elegible ? "result-eligible" : "result-not-eligible") + '">';
    html += "<h3>" + (resultadoEval.elegible
      ? "✅ Eres elegible para la subvención de " + rule.label
      : "❌ No cumples todos los requisitos para " + rule.label) + "</h3>";

    if (resultadoEval.elegible) {
      html += "<p>Según los datos introducidos, cumples los requisitos generales de la convocatoria 2026-2027 de <strong>" + rule.label + "</strong>. Cuantía orientativa: <strong>" + rule.cantidad + "</strong>.</p>";
    } else {
      html += "<p>Con los datos introducidos no cumples uno o más requisitos generales de <strong>" + rule.label + "</strong> para 2026-2027. Revisa el detalle a continuación.</p>";
    }

    html += "<h4>Requisitos que sí cumples</h4>";
    html += '<ul class="result-list">';
    cumplidos.forEach(function (c) {
      html += "<li>✅ " + window.SJ.escapeHtml(c.texto) + "</li>";
    });
    html += "</ul>";

    if (noCumplidos.length) {
      html += "<h4>Requisitos que no cumples</h4>";
      html += '<ul class="result-list">';
      noCumplidos.forEach(function (c) {
        html += "<li>❌ " + window.SJ.escapeHtml(c.texto) + "</li>";
      });
      html += "</ul>";
    }

    if (!resultadoEval.elegible) {
      var alternativas = sugerirAlternativas(perfil);
      if (alternativas.length) {
        html += '<div class="callout callout-tip"><h4>Prueba con otra subvención</h4><p>Con tu perfil actual, sí podrías ser elegible para: <strong>' + alternativas.join(", ") + "</strong>. Cambia el tipo de subvención arriba y vuelve a comprobarlo.</p></div>";
      } else {
        html += '<div class="callout callout-warning"><h4>Ninguna categoría encaja todavía</h4><p>Con los datos introducidos no encontramos otra categoría del directorio en la que encajes. Consulta el <a href="/Web-Subvenciones/directorio/">directorio completo</a> por si hay una convocatoria específica de tu comunidad autónoma con requisitos distintos.</p></div>';
      }
    }

    html += '<div class="flex flex-wrap gap-3" style="margin-top: var(--space-4);">';
    html += '<a class="btn btn-primary" href="/Web-Subvenciones/directorio/">Ver subvenciones de ' + rule.label.toLowerCase() + " en el directorio</a>";
    html += '<a class="btn btn-secondary" href="/Web-Subvenciones/herramientas/checklist-documentos/">Preparar documentación</a>';
    html += "</div>";
    html += "</div>";

    resultado.innerHTML = html;
    resultado.style.display = "block";
    resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function readForm() {
    var fd = new FormData(form);
    return {
      edad: parseInt(fd.get("edad"), 10),
      comunidad: fd.get("comunidad"),
      tipo: fd.get("tipo"),
      ingresos: parseFloat(fd.get("ingresos")),
      situacion: fd.get("situacion")
    };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var perfil = readForm();
    if (isNaN(perfil.edad) || isNaN(perfil.ingresos)) return;
    var resultadoEval = evaluar(perfil);
    render(perfil, resultadoEval);
  });

  document.getElementById("btn-guardar-perfil").addEventListener("click", function () {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var perfil = readForm();
    window.SJ.Store.set(PROFILE_KEY, perfil);
    perfilStatus.textContent = "Perfil guardado en este navegador.";
  });

  document.getElementById("btn-cargar-perfil").addEventListener("click", function () {
    var perfil = window.SJ.Store.get(PROFILE_KEY, null);
    if (!perfil) {
      perfilStatus.textContent = "No hay ningún perfil guardado todavía.";
      return;
    }
    document.getElementById("edad").value = perfil.edad;
    document.getElementById("comunidad").value = perfil.comunidad;
    document.getElementById("tipo").value = perfil.tipo;
    document.getElementById("ingresos").value = perfil.ingresos;
    document.getElementById("situacion").value = perfil.situacion;
    perfilStatus.textContent = "Perfil cargado.";
  });
})();
