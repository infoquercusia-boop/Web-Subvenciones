/**
 * utils.js — funciones compartidas en todo el sitio
 * Subvenciones Jóvenes 2026
 */
(function () {
  "use strict";

  function initNav() {
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function markCurrentNavLink() {
    var path = window.location.pathname.replace(/\/index\.html$/, "/");
    document.querySelectorAll(".nav__links a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      var normalized = href.replace(/\/index\.html$/, "/");
      if (normalized !== "/" && path.indexOf(normalized) === 0) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    markCurrentNavLink();
  });

  var Store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) { /* noop */ }
    }
  };

  function formatDate(dateInput) {
    var d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  }

  function parseSpanishDate(str) {
    // Formato dd/mm/yyyy
    var parts = String(str).split("/");
    if (parts.length !== 3) return null;
    var d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    return isNaN(d.getTime()) ? null : d;
  }

  function daysBetween(dateA, dateB) {
    var msPerDay = 1000 * 60 * 60 * 24;
    var a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
    var b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
    return Math.round((b - a) / msPerDay);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.SJ = {
    Store: Store,
    formatDate: formatDate,
    parseSpanishDate: parseSpanishDate,
    daysBetween: daysBetween,
    escapeHtml: escapeHtml
  };
})();
