/* ============================================================
   Vive Libre - language switcher (i18n)
   Globe/flag dropdown injected into the header. Persists choice
   in localStorage, sets <html lang>, applies translations to
   [data-i18n] (text), [data-i18n-html] (innerHTML) and
   [data-i18n-attr] (attributes). English (en) is the in-page
   source; missing keys fall back to the English text.
   ============================================================ */
(function () {
  "use strict";

  var FLAGS = {
    "gb": '<svg viewBox="0 0 60 30" class="fl"><rect width="60" height="30" fill="#012169"/><path d="M0,0 60,30 M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" stroke-width="2.6"/><rect x="25" width="10" height="30" fill="#fff"/><rect y="10" width="60" height="10" fill="#fff"/><rect x="27" width="6" height="30" fill="#C8102E"/><rect y="12" width="60" height="6" fill="#C8102E"/></svg>',
    "us": '<svg viewBox="0 0 26 14" class="fl"><rect width="26" height="14" fill="#fff"/><g fill="#B22234"><rect width="26" height="1" y="0"/><rect width="26" height="1" y="2"/><rect width="26" height="1" y="4"/><rect width="26" height="1" y="6"/><rect width="26" height="1" y="8"/><rect width="26" height="1" y="10"/><rect width="26" height="1" y="12"/></g><rect width="11" height="7" fill="#3C3B6E"/></svg>',
    "nl": '<svg viewBox="0 0 3 2" class="fl"><rect width="3" height="2" fill="#21468B"/><rect width="3" height="1.333" fill="#fff"/><rect width="3" height="0.667" fill="#AE1C28"/></svg>',
    "be": '<svg viewBox="0 0 3 2" class="fl"><rect width="1" height="2" fill="#000"/><rect x="1" width="1" height="2" fill="#FDDA24"/><rect x="2" width="1" height="2" fill="#EF3340"/></svg>',
    "fr": '<svg viewBox="0 0 3 2" class="fl"><rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#0055A4"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>',
    "no": '<svg viewBox="0 0 22 16" class="fl"><rect width="22" height="16" fill="#EF2B2D"/><rect x="6" width="4" height="16" fill="#fff"/><rect y="6" width="22" height="4" fill="#fff"/><rect x="7" width="2" height="16" fill="#002868"/><rect y="7" width="22" height="2" fill="#002868"/></svg>',
    "de": '<svg viewBox="0 0 5 3" class="fl"><rect width="5" height="3" fill="#FFCE00"/><rect width="5" height="2" fill="#D00"/><rect width="5" height="1" fill="#000"/></svg>'
  };

  var LANGS = [
    { code: "en",    label: "English",          short: "EN", flag: "gb" },
    { code: "en-US", label: "American English", short: "US", flag: "us" },
    { code: "nl",    label: "Nederlands",       short: "NL", flag: "nl" },
    { code: "nl-BE", label: "Vlaams",           short: "BE", flag: "be" },
    { code: "fr",    label: "Français",         short: "FR", flag: "fr" },
    { code: "no",    label: "Norsk",            short: "NO", flag: "no" },
    { code: "de",    label: "Deutsch",          short: "DE", flag: "de" }
  ];
  var STORE = "vl_lang";
  var T = (window.VL_I18N = window.VL_I18N || {});

  function stored() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function save(code) { try { localStorage.setItem(STORE, code); } catch (e) {} }
  function meta(code) { return LANGS.filter(function (l) { return l.code === code; })[0] || LANGS[0]; }

  var captured = false;
  function captureEnglish() {
    if (captured) return;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.getAttribute("data-en") === null) el.setAttribute("data-en", el.textContent);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      if (el.getAttribute("data-en-html") === null) el.setAttribute("data-en-html", el.innerHTML);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var a = pair.split(":")[0] && pair.split(":")[0].trim();
        if (a && el.getAttribute("data-en-attr-" + a) === null) el.setAttribute("data-en-attr-" + a, el.getAttribute(a) || "");
      });
    });
    captured = true;
  }

  function apply(code) {
    captureEnglish();
    var dict = T[code] || {};
    var isEn = code === "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = isEn ? el.getAttribute("data-en") : (dict[key] != null ? dict[key] : el.getAttribute("data-en"));
      if (val != null) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var val = isEn ? el.getAttribute("data-en-html") : (dict[key] != null ? dict[key] : el.getAttribute("data-en-html"));
      if (val != null) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var bits = pair.split(":");
        if (bits.length < 2) return;
        var attr = bits[0].trim(), key = bits[1].trim();
        var val = isEn ? el.getAttribute("data-en-attr-" + attr) : (dict[key] != null ? dict[key] : el.getAttribute("data-en-attr-" + attr));
        if (val != null) el.setAttribute(attr, val);
      });
    });

    document.documentElement.setAttribute("lang", code);
    var cur = meta(code);
    document.querySelectorAll(".lang-current").forEach(function (s) { s.textContent = cur.short; });
    document.querySelectorAll(".lang-flag-current").forEach(function (s) { s.innerHTML = FLAGS[cur.flag] || ""; });
    document.querySelectorAll(".lang-option").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-lang") === code ? "true" : "false");
    });
  }

  function buildSwitcher() {
    var nav = document.querySelector(".nav-menu .nav-links");
    if (!nav) return;
    var li = document.createElement("li");
    li.className = "lang-switch";
    var opts = LANGS.map(function (l) {
      return '<button type="button" class="lang-option" role="menuitemradio" data-lang="' + l.code + '">' +
        '<span class="lang-flag">' + (FLAGS[l.flag] || "") + '</span>' +
        '<span class="lang-label">' + l.label + '</span>' +
        '<span class="lang-short">' + l.short + '</span></button>';
    }).join("");
    li.innerHTML =
      '<button type="button" class="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="Choose language">' +
        '<span class="lang-flag-current"></span>' +
        '<span class="lang-current">EN</span>' +
        '<svg class="lang-caret" viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
      '</button>' +
      '<div class="lang-menu" role="menu">' + opts + '</div>';
    nav.appendChild(li);

    var btn = li.querySelector(".lang-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    li.querySelectorAll(".lang-option").forEach(function (b) {
      b.addEventListener("click", function () {
        var code = b.getAttribute("data-lang");
        save(code); apply(code);
        li.classList.remove("open"); btn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function (e) {
      if (!li.contains(e.target)) { li.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  function init() {
    buildSwitcher();
    var code = stored();
    if (!code) {
      var n = (navigator.language || "en").toLowerCase();
      if (n === "en-us") code = "en-US";
      else if (n === "nl-be") code = "nl-BE";
      else { var two = n.slice(0, 2); code = LANGS.some(function (l) { return l.code === two; }) ? two : "en"; }
    }
    apply(code);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
