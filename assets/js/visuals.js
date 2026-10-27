/* =============================================================================
   VISUALS
   Draws case study figures and card covers from the data in content.js.
   Colors come from CSS variables, so everything follows light and dark mode.
   All mock interfaces are original, illustrative recreations.
   ============================================================================= */
window.Visuals = (function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Escaped text that also supports ==highlight==
  function t(s) { return esc(s).replace(/==(.+?)==/g, "<mark>$1</mark>"); }

  // Mock interfaces are exposed to assistive tech as a single labeled image.
  var MOCKS = { chat: true, form: true, explain: true, chart: true, anatomy: true, registry: true, slots: true, system: true };

  function chrome(title) {
    return '<div class="v-chrome"><span class="v-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="v-chrome__t">' + esc(title || "") + "</span></div>";
  }

  var ICO = {
    ok: '<svg class="v-ico v-ico--ok" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="M6 10.4l2.6 2.6L14 7.6"/></svg>',
    error: '<svg class="v-ico v-ico--err" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="M10 5.5v5.5M10 14.2v.3"/></svg>',
    ai: '<svg class="v-ico v-ico--ai" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5l1.7 4.6 4.8 1.4-4.8 1.6L10 14.8 8.3 10.1 3.5 8.5l4.8-1.4z"/></svg>'
  };

  /* ---------------------------------------------------------------- flow */
  function flow(d) {
    var steps = d.steps || [];
    return '<ol class="v-flow" style="--n:' + steps.length + '">' + steps.map(function (s, i) {
      return '<li class="v-flow__step' + (s.highlight ? " is-key" : "") + '">' +
        '<span class="v-flow__n" aria-hidden="true">' + (i + 1) + "</span>" +
        '<span class="v-flow__t">' + t(s.title) + "</span>" +
        (s.note ? '<span class="v-flow__d">' + t(s.note) + "</span>" : "") +
        "</li>";
    }).join("") + "</ol>";
  }

  /* ------------------------------------------------------------- compare */
  function compare(d) {
    var items = d.items || [];
    var max = 0;
    items.forEach(function (it) { max = Math.max(max, it.before, it.after); });
    function bar(kind, v, label) {
      var w = max ? Math.max(4, Math.round((v / max) * 100)) : 0;
      return '<div class="v-bar v-bar--' + kind + '"><span class="v-bar__track"><span class="v-bar__fill" style="width:' + w + '%"></span></span><span class="v-bar__v">' + esc(label) + "</span></div>";
    }
    return '<div class="v-compare">' +
      '<p class="v-compare__legend"><span class="k k--before">' + esc(d.beforeLabel || "Before") + '</span><span class="k k--after">' + esc(d.afterLabel || "After") + "</span></p>" +
      items.map(function (it) {
        var indexed = it.unit === "index";
        var unit = it.unit && !indexed ? " " + it.unit : "";
        return '<div class="v-compare__item">' +
          '<p class="v-compare__head"><span class="v-compare__label">' + esc(it.label) + "</span>" +
          (it.display ? '<span class="v-compare__delta">' + esc(it.display) + "</span>" : "") + "</p>" +
          bar("before", it.before, indexed ? "Baseline" : it.before + unit) +
          bar("after", it.after, indexed ? (it.display || it.after) : it.after + unit) +
          "</div>";
      }).join("") + "</div>";
  }

  /* ---------------------------------------------------------------- chat */
  function chat(d) {
    function msg(m) {
      var who = m.from === "user" ? "user" : "bot";
      var cards = (m.cards || []).map(function (c) {
        return '<div class="v-pcard"><div class="v-pcard__info"><strong>' + esc(c.title) + "</strong><span>" + esc(c.meta) + '</span><span class="v-pcard__note">' + esc(c.note) + "</span></div>" +
          (c.action ? '<span class="v-btn v-btn--sm">' + esc(c.action) + "</span>" : "") + "</div>";
      }).join("");
      var chips = (m.chips || []).map(function (c) { return '<span class="v-chip">' + esc(c) + "</span>"; }).join("");
      return '<div class="v-msg v-msg--' + who + '"><p>' + t(m.text) + "</p>" +
        (cards ? '<div class="v-msg__cards">' + cards + "</div>" : "") +
        (chips ? '<div class="v-msg__chips">' + chips + "</div>" : "") + "</div>";
    }
    return '<div class="v-device v-device--phone"><div class="v-chat">' +
      '<div class="v-chat__bar"><span class="v-chat__avatar" aria-hidden="true"></span><span class="v-chat__title">' + esc(d.title || "Assistant") + '</span><span class="v-chat__status">Online</span></div>' +
      '<div class="v-chat__log">' + (d.messages || []).map(msg).join("") + "</div>" +
      '<div class="v-chat__input"><span>Type a message</span><span class="v-chat__send" aria-hidden="true"></span></div>' +
      "</div></div>";
  }

  /* ---------------------------------------------------------------- form */
  function form(d) {
    var cur = d.current || 0;
    var steps = (d.steps || []).map(function (s, i) {
      var st = i < cur ? "done" : i === cur ? "current" : "todo";
      return '<li class="is-' + st + '"><span>' + (i + 1) + "</span>" + esc(s) + "</li>";
    }).join("");
    var fields = (d.fields || []).map(function (f) {
      var state = f.state || "ok";
      return '<div class="v-field is-' + esc(state) + '">' +
        '<span class="v-field__label">' + esc(f.label) + (state === "ai" ? '<span class="v-tag">AI suggestion</span>' : "") + "</span>" +
        '<span class="v-field__input">' + (f.value ? "<span>" + esc(f.value) + "</span>" : '<span class="v-field__empty">Not added yet</span>') + (ICO[state] || "") + "</span>" +
        (f.note ? '<span class="v-field__note">' + esc(f.note) + "</span>" : "") +
        "</div>";
    }).join("");
    var check = (d.checklist || []).map(function (c) {
      return '<li class="' + (c.done ? "is-done" : "is-todo") + '">' + esc(c.label) + "</li>";
    }).join("");
    return '<div class="v-device">' + chrome(d.title) +
      '<div class="v-form"><ol class="v-form__steps">' + steps + "</ol>" +
      '<div class="v-form__body"><div class="v-form__fields">' + fields + "</div>" +
      '<div class="v-form__aside"><span class="v-form__aside-t">Needed for this service</span><ul class="v-check">' + check + "</ul>" +
      '<span class="v-btn v-btn--block is-disabled">' + esc(d.cta || "Submit") + "</span>" +
      (d.hint ? '<span class="v-form__hint">' + esc(d.hint) + "</span>" : "") +
      "</div></div></div></div>";
  }

  /* ------------------------------------------------------------- explain */
  function explain(d) {
    var factors = d.factors || [];
    var maxW = 0;
    factors.forEach(function (f) { maxW = Math.max(maxW, f.weight); });
    var rows = factors.map(function (f) {
      var w = maxW ? Math.round((f.weight / maxW) * 100) : 0;
      return '<li><span class="v-factor__label">' + t(f.label) + '</span><span class="v-factor__bar"><span style="width:' + w + '%"></span></span></li>';
    }).join("");
    var actions = (d.actions || []).map(function (a, i) {
      return '<span class="v-btn v-btn--sm' + (i ? " v-btn--ghost" : "") + '">' + esc(a) + "</span>";
    }).join("");
    return '<div class="v-device">' + chrome("Patient summary") +
      '<div class="v-explain">' +
      '<div class="v-explain__head"><span class="v-explain__flag">' + esc(d.title) + '</span><strong class="v-explain__subj">' + esc(d.subject) + '</strong><span class="v-pill v-pill--warn">' + esc(d.level) + "</span></div>" +
      '<div class="v-explain__meta"><span>' + esc(d.confidence) + "</span><span>" + esc(d.freshness) + "</span></div>" +
      '<p class="v-explain__why">Why this was flagged</p>' +
      '<ol class="v-factors">' + rows + "</ol>" +
      '<div class="v-explain__actions">' + actions + "</div>" +
      "</div></div>";
  }

  /* --------------------------------------------------------------- chart */
  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function chart(d) {
    var n = 64, rnd = prng(d.seed || 7), a = [], b = [], va = 100, vb = 100, i;
    for (i = 0; i < n; i++) {
      va += (rnd() - 0.42) * 1.5;
      vb += (rnd() - 0.46) * 0.9;
      a.push(va); b.push(vb);
    }
    var all = a.concat(b), min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    var W = 600, H = 240, pad = 18;
    function x(k) { return (k * W) / (n - 1); }
    function y(v) { return pad + (H - 2 * pad) * (1 - (v - min) / (max - min)); }
    function path(arr) { return arr.map(function (v, k) { return (k ? "L" : "M") + x(k).toFixed(1) + " " + y(v).toFixed(1); }).join(" "); }
    var ci = Math.round(n * 0.7), cx = x(ci), cy = y(a[ci]);
    var pct = function (arr) { var v = (arr[ci] / arr[0] - 1) * 100; return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(1) + "%"; };
    var L = (cx / W) * 100, T = (cy / H) * 100;
    var grid = "";
    for (i = 1; i < 4; i++) grid += '<line class="v-grid" x1="0" x2="' + W + '" y1="' + (H * i) / 4 + '" y2="' + (H * i) / 4 + '"/>';
    var benchY = (y(b[Math.round(n * 0.32)]) / H) * 100;
    var ranges = (d.ranges || []).map(function (r) { return '<span class="' + (r === d.active ? "is-on" : "") + '">' + esc(r) + "</span>"; }).join("");
    var notes = (d.notes || []).map(function (note, k) { return '<li><span class="v-num">' + (k + 1) + "</span><span>" + esc(note) + "</span></li>"; }).join("");
    return '<div class="v-device">' + chrome(d.title) +
      '<div class="v-chart">' +
      '<div class="v-chart__top"><p class="v-chart__legend"><span class="s s--a">' + esc(d.series || "Portfolio") + '</span><span class="s s--b">' + esc(d.benchmark || "Benchmark") + "</span></p>" +
      '<span class="v-chart__range"><span class="v-seg">' + ranges + '</span><span class="v-num v-num--inline">4</span></span></div>' +
      '<div class="v-chart__plot">' +
      '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + grid +
      '<path class="v-area" d="' + path(a) + " L" + W + " " + H + " L0 " + H + ' Z"/>' +
      '<path class="v-line-b" d="' + path(b) + '"/>' +
      '<path class="v-line-a" d="' + path(a) + '"/>' +
      '<line class="v-cross" x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="0" y2="' + H + '"/></svg>' +
      '<span class="v-chart__dot" style="left:' + L.toFixed(2) + "%;top:" + T.toFixed(2) + '%"></span>' +
      '<span class="v-chart__tip" style="left:' + L.toFixed(2) + "%;top:" + T.toFixed(2) + '%"><strong>' + esc(d.date || "") + "</strong><span>" + esc(d.series || "Portfolio") + " " + pct(a) + "</span><span>" + esc(d.benchmark || "Benchmark") + " " + pct(b) + "</span></span>" +
      '<span class="v-num" style="left:' + L.toFixed(2) + '%;top:6%">1</span>' +
      '<span class="v-num" style="left:' + Math.max(8, L - 30).toFixed(2) + "%;top:" + Math.max(8, T - 24).toFixed(2) + '%">2</span>' +
      '<span class="v-num" style="left:32%;top:' + Math.min(92, benchY + 9).toFixed(2) + '%">3</span>' +
      "</div></div></div>" +
      '<ol class="v-notes">' + notes + "</ol>";
  }

  /* ---------------------------------------------------------------- tree */
  function tree(d) {
    function col(side, cls) {
      var p = (side && side.path) || [];
      var clicks = Math.max(0, p.length - 1);
      return '<div class="v-tree__col ' + cls + '"><p class="v-tree__head"><strong>' + esc(side.title) + "</strong><span>" + clicks + (clicks === 1 ? " click" : " clicks") + "</span></p>" +
        '<ol class="v-tree__path">' + p.map(function (s, k) {
          return '<li style="--d:' + k + '"><span>' + esc(s) + "</span><em>" + (k ? "Click " + k : "Start") + "</em></li>";
        }).join("") + "</ol></div>";
    }
    return '<div class="v-tree">' + col(d.before || {}, "is-before") + col(d.after || {}, "is-after") + "</div>";
  }

  /* ------------------------------------------------------------- anatomy */
  function anatomy(d) {
    var states = (d.states || []).map(function (s) {
      return '<div class="v-anat__state"><span class="v-demo-btn is-' + esc(String(s).toLowerCase()) + '">' + esc(d.label || "Button") + '</span><span class="v-anat__cap">' + esc(s) + "</span></div>";
    }).join("");
    var tokens = (d.tokens || []).map(function (tk) {
      return "<tr><td><code>" + esc(tk[0]) + "</code></td><td>" + esc(tk[1]) + "</td></tr>";
    }).join("");
    return '<div class="v-anat"><div class="v-anat__states">' + states + "</div>" +
      '<div class="v-anat__tokens"><table><thead><tr><th>Token</th><th>Used for</th></tr></thead><tbody>' + tokens + "</tbody></table></div></div>";
  }

  /* ------------------------------------------------------------ registry */
  function registry(d) {
    function pill(s) {
      var k = /production/i.test(s) ? "ok" : /review/i.test(s) ? "warn" : "neutral";
      return '<span class="v-pill v-pill--' + k + '">' + esc(s) + "</span>";
    }
    var filters = (d.filters || []).map(function (f, k) { return '<span class="v-filter' + (k === d.active ? " is-on" : "") + '">' + esc(f) + "</span>"; }).join("");
    var head = (d.columns || []).map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("");
    var rows = (d.rows || []).map(function (r) {
      return "<tr>" + r.map(function (c, k) { return "<td>" + (k === 2 ? pill(c) : esc(c)) + "</td>"; }).join("") + "</tr>";
    }).join("");
    return '<div class="v-device">' + chrome("Model management") +
      '<div class="v-reg"><div class="v-reg__top"><strong>' + esc(d.title || "") + '</strong><span class="v-reg__filters">' + filters + "</span></div>" +
      '<table class="v-reg__table"><thead><tr>' + head + "</tr></thead><tbody>" + rows + "</tbody></table></div></div>";
  }

  /* --------------------------------------------------------------- slots */
  function slots(d) {
    var days = (d.days || []).map(function (x, k) {
      return '<span class="v-day' + (k === d.activeDay ? " is-on" : "") + '"><small>' + esc(x.d) + "</small><b>" + esc(x.n) + "</b></span>";
    }).join("");
    var times = (d.slots || []).map(function (s, k) {
      return '<span class="v-slot' + (k === d.selected ? " is-on" : "") + '">' + esc(s) + "</span>";
    }).join("");
    return '<div class="v-device v-device--phone"><div class="v-slots">' +
      '<div class="v-slots__head"><strong>' + esc(d.title || "") + "</strong><span>" + esc(d.provider || "") + "</span><span>" + esc(d.location || "") + "</span></div>" +
      '<div class="v-days">' + days + "</div>" +
      '<p class="v-slots__label">Available times</p><div class="v-slot-grid">' + times + "</div>" +
      '<span class="v-btn v-btn--block">' + esc(d.cta || "Book") + "</span>" +
      "</div></div>";
  }

  /* ------------------------------------------------------ image, gallery
     Your own screens.
     image:   data: { src, alt, width, height, frame, maxWidth }
     gallery: data: { columns, columnsSmall, items: [{ src, alt, label, width, height }] } */
  function zoomable(d) {
    var size = d.width ? ' width="' + Number(d.width) + '" height="' + Number(d.height) + '"' : "";
    var lazy = /^data:/.test(String(d.src)) ? "" : ' loading="lazy"';
    return '<button class="v-zoom" type="button" aria-label="Open full-size image: ' + esc(d.alt || d.label || "screen") + '">' +
      '<img src="' + esc(d.src) + '" alt="' + esc(d.alt || "") + '"' + size + lazy + ' decoding="async"></button>';
  }
  function image(d) {
    return '<div class="v-shot v-shot--' + esc(d.frame || "plain") + '"' + (d.maxWidth ? ' style="max-width:' + Number(d.maxWidth) + 'px"' : "") + ">" + zoomable(d) + "</div>";
  }
  function pinsHtml(pins, num) {
    return (pins || []).map(function (p, i) { return '<span class="v-pin" style="left:' + Number(p.x) + "%;top:" + Number(p.y) + "%;--i:" + i + '" aria-hidden="true">' + Number(num || p.n) + "</span>"; }).join("");
  }
  function stage(d, num) {
    return '<div class="v-stage"' + (d.maxWidth ? ' style="max-width:' + Number(d.maxWidth) + 'px"' : "") + ">" + zoomable(d) + pinsHtml(d.pins, num) + "</div>";
  }
  function annotated(d) {
    var notes = d.notes || [];
    return '<div class="v-ann"><div class="v-ann__plate">' + stage(d) + "</div>" + (notes.length ? '<ol class="v-notes">' + notes.map(function (t, i) {
      return '<li><span class="v-notes__n" aria-hidden="true">' + (i + 1) + "</span><span>" + esc(t) + "</span></li>";
    }).join("") + "</ol>" : "") + "</div>";
  }
  function gallery(d) {
    var items = d.items || [];
    var cols = Number(d.columns) || Math.min(items.length, 4) || 1;
    var small = Number(d.columnsSmall) || Math.min(cols, 2);
    return '<div class="v-gallery' + (items.some(function (it) { return it.note; }) ? " v-gallery--notes" : "") + '" style="--cols:' + cols + ";--cols-sm:" + small + '">' + items.map(function (it, i) {
      var n = it.n || i + 1;
      return '<figure class="v-gallery__item"><div class="v-gallery__shot">' + (it.pins ? stage(it, n) : zoomable(it)) + "</div>" +
        (it.label || it.note ? '<figcaption class="v-gallery__cap">' + (it.label ? '<span class="v-gallery__label">' + esc(it.label) + "</span>" : "") +
        (it.note ? '<span class="v-gallery__note">' + (it.pins ? '<span class="v-notes__n" aria-hidden="true">' + n + "</span>" : "") + "<span>" + esc(it.note) + "</span></span>" : "") + "</figcaption>" : "") + "</figure>";
    }).join("") + "</div>";
  }

  /* --------------------------------------------------------------- system
     Design-system sheets drawn from the product's own tokens
     (window.PORTFOLIO.designSystem in content.js, or data.tokens).
     data: { section: "foundations" | "components" | "patterns" } */
  function rgbOf(h) { var m = /^#?([0-9a-f]{6})$/i.exec(String(h || "")); var n = m ? parseInt(m[1], 16) : 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function luminance(h) {
    var w = [0.2126, 0.7152, 0.0722];
    return rgbOf(h).reduce(function (sum, v, i) { v /= 255; return sum + w[i] * (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); }, 0);
  }
  function ratio(a, b) { var x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function shade(h, f) { return "#" + rgbOf(h).map(function (v) { return ("0" + Math.round(v * f).toString(16)).slice(-2); }).join(""); }
  var TICK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.3l2.2 2.2 4.8-4.9" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function aa(r, need) {
    var ok = r >= (need || 4.5);
    return '<span class="fx-aa ' + (ok ? "is-pass" : "is-fail") + '">' + r.toFixed(1) + ":1 " + (ok ? "Pass" : "Fail") + "</span>";
  }
  function fxState(html, cap) { return '<div class="fx-state">' + html + '<span class="fx-cap">' + cap + "</span></div>"; }

  function fxFoundations(T, c) {
    var textish = { primary: 1, text: 1, muted: 1, error: 1, positive: 1 };
    var sw = (T.colors || []).map(function (x) {
      var check = textish[x.role] ? aa(ratio(x.hex, "#FFFFFF")) + '<span class="fx-aa__on">text on white</span>'
        : x.role === "borderStrong" ? aa(ratio(x.hex, "#FFFFFF"), 3) + '<span class="fx-aa__on">control edge, 3:1</span>'
        : '<span class="fx-aa__on">Body text on it: ' + ratio(c.text || "#111111", x.hex).toFixed(1) + ":1</span>";
      return '<div class="fx-sw"><span class="fx-sw__chip" style="background:' + esc(x.hex) + '"></span>' +
        '<span class="fx-sw__name">' + esc(x.token) + '</span><span class="fx-sw__hex">' + esc(x.hex) + "</span>" +
        '<span class="fx-sw__use">' + esc(x.use) + '</span><span class="fx-sw__aa">' + check + "</span></div>";
    }).join("");
    var type = (T.type || []).map(function (x) {
      return '<div class="fx-type__row"><span class="fx-type__sample" style="font-size:' + Number(x.size) + "px;line-height:" + Number(x.line) + "px;font-weight:" + Number(x.weight) + '">' + esc(x.sample) + "</span>" +
        '<span class="fx-type__spec">' + esc(x.token) + "<br>" + Number(x.size) + " / " + Number(x.line) + ", " + esc(x.weightName) + "</span></div>";
    }).join("");
    var space = (T.space || []).map(function (v) {
      return '<div class="fx-space__row"><span>space.' + v / 4 + "</span><span>" + v + 'px</span><i style="width:' + Number(v) * 2 + 'px"></i></div>';
    }).join("");
    var radius = (T.radius || []).map(function (x) {
      return '<div class="fx-radius"><i style="border-radius:' + Math.min(Number(x.px), 26) + 'px"></i><span>' + esc(x.token) + "</span><span>" + (x.px >= 999 ? "Full" : x.px + "px") + "</span></div>";
    }).join("");
    return '<div class="fx-card"><p class="fx-h">Color</p><div class="fx-swatches">' + sw + "</div></div>" +
      '<div class="fx-grid"><div class="fx-card"><p class="fx-h">Typography, ' + esc(T.font || "Inter") + '</p><div class="fx-type">' + type + "</div></div>" +
      '<div class="fx-card"><p class="fx-h">Spacing, 4 px base</p><p class="fx-meta">Bars drawn at 2× scale.</p><div class="fx-space">' + space + "</div>" +
      '<p class="fx-h fx-h--sub">Corner radius</p><div class="fx-radii">' + radius + "</div></div></div>";
  }

  function fxComponents(c) {
    function btnRow(kind, label) {
      return '<div class="fx-variant"><p class="fx-meta">' + label + '</p><div class="fx-states">' +
        ["Default", "Hover", "Focus", "Disabled"].map(function (s) { return fxState('<span class="fx-btn fx-btn--' + kind + " is-" + s.toLowerCase() + '">Continue</span>', s); }).join("") + "</div></div>";
    }
    function field(label, state, value, cls, help) {
      return '<div class="fx-field"><span class="fx-label">' + label + '<em class="fx-tag">' + state + '</em></span><span class="fx-input ' + cls + '">' + value + "</span>" +
        (help ? '<span class="fx-help is-error">' + help + "</span>" : "") + "</div>";
    }
    function choice(t, sub, on) {
      return '<div class="fx-choice' + (on ? " is-selected" : "") + '"><div><strong>' + t + "</strong><span>" + sub + "</span></div>" +
        (on ? '<span class="fx-check">' + TICK + "</span>" : '<span class="fx-radio"></span>') + "</div>";
    }
    var checks = [
      ["Primary button label", ratio("#FFFFFF", c.primary), 4.5],
      ["Body text on the page background", ratio(c.text, c.canvas), 4.5],
      ["Secondary text on white", ratio(c.muted, "#FFFFFF"), 4.5],
      ["Error text on white", ratio(c.error, "#FFFFFF"), 4.5],
      ["Input and control borders", ratio(c.borderStrong, "#FFFFFF"), 3]
    ];
    return '<div class="fx-card"><p class="fx-h">Buttons</p>' + btnRow("primary", "Primary") + btnRow("secondary", "Secondary") + btnRow("ghost", "Ghost") +
      '<p class="fx-note">48 px tall with a 12 px radius. Focus adds a 2 px ring in the primary color with a 2 px gap, so it shows on any background.</p></div>' +
      '<div class="fx-grid">' +
      '<div class="fx-card"><p class="fx-h">Text input</p>' +
        field("Full name", "Default", "Enter your full name", "is-placeholder") +
        field("Full name", "Focus", "Alex Morgan", "is-focus") +
        field("College email", "Error", "alex@university", "is-error", "Enter a valid college email address.") +
        field("Program", "Disabled", "Equity Research", "is-disabled") +
        '<p class="fx-note">Errors appear as text under the field, never as color alone. Borders use the strong token so inputs meet 3:1.</p></div>' +
      '<div class="fx-card"><p class="fx-h">Selection card</p>' + choice("Equity Research", "Simulated stock picking and valuation", true) + choice("Investment Banking", "M&amp;A and capital markets case studies", false) +
        '<p class="fx-note">The whole card is the target. The selected state changes the border, the fill and the mark, so it never relies on color alone.</p></div>' +
      '<div class="fx-card"><p class="fx-h">Progress and status</p>' +
        '<div class="fx-stepper"><span class="fx-meta">Step 2 of 3</span><div class="fx-steps"><i class="is-on"></i><i class="is-on"></i><i></i></div></div>' +
        [33, 67, 100].map(function (p) { return '<div class="fx-progress"><span class="fx-meta">' + p + '% complete</span><div class="fx-bar"><span style="width:' + p + '%"></span></div></div>'; }).join("") +
        '<div class="fx-chips"><span class="fx-chip fx-chip--brand">Module complete</span><span class="fx-chip fx-chip--brand">Lesson 2.2 · 18 min</span><span class="fx-chip fx-chip--positive">+4.1%</span><span class="fx-chip fx-chip--error">Missing</span><span class="fx-chip fx-chip--neutral">Draft</span></div>' +
        '<div class="fx-marks">' + fxState('<span class="fx-check">' + TICK + "</span>", "Completed") + fxState('<span class="fx-radio is-on"></span>', "In progress") + fxState('<span class="fx-radio"></span>', "Not started") + "</div></div>" +
      '<div class="fx-card"><p class="fx-h">Accessibility checks, WCAG 2.1 AA</p><ul class="fx-checks">' +
        checks.map(function (x) { return "<li><span>" + x[0] + "</span>" + aa(x[1], x[2]) + "</li>"; }).join("") +
        '<li><span>Touch targets at least 44 × 44 px</span><span class="fx-aa is-pass">Pass</span></li></ul></div>' +
      "</div>";
  }

  function fxPatterns() {
    var holdings = [["HDFC", "120 sh · HDFC Bank", "₹1,98,240", "+9.8%"], ["ICICI", "110 sh · ICICI Bank", "₹1,37,280", "+5.3%"]].map(function (h) {
      return '<div class="fx-hold"><span class="fx-tick">' + h[0] + "</span><span><b>" + h[0] + "</b><small>" + h[1] + '</small></span><span class="fx-val">' + h[2] + "<small>" + h[3] + "</small></span></div>";
    }).join("");
    return '<div class="fx-grid">' +
      '<div class="fx-card"><p class="fx-h">Metric cards</p><div class="fx-kpis">' +
        '<div class="fx-kpi"><span>Portfolio value</span><strong>₹11,23,780</strong></div>' +
        '<div class="fx-kpi"><span>Return vs benchmark</span><strong class="is-pos">+3.2%</strong><small>Portfolio +8.1%, benchmark +4.9%</small></div></div>' +
        '<p class="fx-note">Cards in a row share one height, and the supporting line is optional, so rows stay aligned either way.</p></div>' +
      '<div class="fx-card"><p class="fx-h">Chart controls</p><div class="fx-seg"><span>1M</span><span class="is-on">3M</span><span>6M</span><span>1Y</span></div>' +
        '<div class="fx-tipwrap"><span class="fx-tip">Oct 12 · ₹11,23,780</span></div>' +
        '<p class="fx-note">The range control is 44 px tall. The tooltip sits above the point it describes and never covers the line being read.</p></div>' +
      '<div class="fx-card"><p class="fx-h">Holding row</p>' + holdings + "</div>" +
      '<div class="fx-card"><p class="fx-h">Lesson item</p>' +
        '<div class="fx-lesson"><span class="fx-check">' + TICK + "</span><span><b>Income statement basics</b><small>12 min · Completed</small></span></div>" +
        '<div class="fx-lesson is-current"><span class="fx-radio is-on"></span><span><b>Balance sheet ratios</b><small>18 min · In progress</small></span></div>' +
        '<div class="fx-lesson"><span class="fx-radio"></span><span><b>Cash flow analysis</b><small>15 min · Not started</small></span></div></div>' +
      '<div class="fx-card"><p class="fx-h">Loading and empty</p><div class="fx-skel"><i style="width:40%"></i><i></i><i style="width:85%"></i></div>' +
        '<div class="fx-empty"><b>No open positions yet</b><span>Your simulated ₹10,00,000 is in cash. Place a demo trade to see your first holding here.</span><span class="fx-btn fx-btn--primary">Place a demo trade</span></div></div>' +
      "</div>";
  }

  function system(d) {
    var T = d.tokens || (window.PORTFOLIO && window.PORTFOLIO.designSystem) || {};
    var c = {};
    (T.colors || []).forEach(function (x) { c[x.role] = x.hex; });
    c.primaryHover = shade(c.primary || "#157A52", 0.85);
    var vars = Object.keys(c).map(function (k) { return "--fx-" + k + ":" + c[k]; }).join(";");
    var body = d.section === "foundations" ? fxFoundations(T, c) : d.section === "patterns" ? fxPatterns() : fxComponents(c);
    return '<div class="fx" style="' + esc(vars) + '">' + body + "</div>";
  }

  var R = { flow: flow, compare: compare, chat: chat, form: form, explain: explain, chart: chart, tree: tree, anatomy: anatomy, registry: registry, slots: slots, image: image, gallery: gallery, annotated: annotated, system: system };

  /* ---------------------------------------------------------------- covers
     Abstract illustrations for case study cards (480 × 300). */
  var C = {
    chat:
      '<rect class="k-surface k-ol" x="150" y="30" width="180" height="300" rx="26"/>' +
      '<rect class="k-wash" x="166" y="58" width="108" height="26" rx="13"/>' +
      '<rect class="k-ink" x="218" y="94" width="96" height="26" rx="13"/>' +
      '<rect class="k-wash" x="166" y="130" width="142" height="74" rx="14"/>' +
      '<rect class="k-surface k-ol" x="176" y="141" width="122" height="24" rx="8"/>' +
      '<rect class="k-surface k-ol" x="176" y="170" width="122" height="24" rx="8"/>' +
      '<rect class="k-ink" x="262" y="147" width="28" height="12" rx="6"/><rect class="k-ink" x="262" y="176" width="28" height="12" rx="6"/>' +
      '<rect class="k-rule" x="184" y="149" width="56" height="8" rx="4"/><rect class="k-rule" x="184" y="178" width="44" height="8" rx="4"/>' +
      '<rect class="k-ink" x="232" y="214" width="82" height="26" rx="13"/>' +
      '<rect class="k-mark" x="166" y="250" width="134" height="30" rx="15"/>' +
      '<rect class="k-onmark" x="180" y="261" width="78" height="8" rx="4"/>',
    form:
      '<rect class="k-surface k-ol" x="96" y="36" width="288" height="250" rx="18"/>' +
      '<circle class="k-ink" cx="126" cy="66" r="7"/><circle class="k-ink" cx="150" cy="66" r="7"/><circle class="k-surface k-ol-ink" cx="174" cy="66" r="7"/><circle class="k-surface k-ol" cx="198" cy="66" r="7"/>' +
      '<rect class="k-rule" x="120" y="92" width="74" height="8" rx="4"/><rect class="k-wash k-ol" x="120" y="106" width="240" height="28" rx="9"/>' +
      '<rect class="k-rule" x="120" y="146" width="96" height="8" rx="4"/><rect class="k-mark k-ol-dash" x="120" y="160" width="240" height="28" rx="9"/>' +
      '<rect class="k-rule" x="120" y="200" width="64" height="8" rx="4"/><rect class="k-surface k-ol-flag" x="120" y="214" width="240" height="28" rx="9"/>' +
      '<circle class="k-flag" cx="344" cy="228" r="6"/>' +
      '<rect class="k-ink" x="270" y="254" width="90" height="20" rx="10"/>',
    explain:
      '<rect class="k-surface k-ol" x="78" y="40" width="324" height="226" rx="18"/>' +
      '<path class="k-flag" d="M110 62l8 8-8 8-8-8z"/><rect class="k-ink" x="128" y="64" width="112" height="12" rx="6"/>' +
      '<rect class="k-flagsoft" x="306" y="60" width="72" height="22" rx="11"/>' +
      '<rect class="k-mark" x="100" y="104" width="134" height="20" rx="4"/><rect class="k-onmark" x="106" y="110" width="118" height="8" rx="4"/>' +
      '<rect class="k-wash" x="252" y="109" width="126" height="10" rx="5"/><rect class="k-ink" x="252" y="109" width="126" height="10" rx="5"/>' +
      '<rect class="k-rule" x="106" y="146" width="104" height="8" rx="4"/><rect class="k-wash" x="252" y="145" width="126" height="10" rx="5"/><rect class="k-ink" x="252" y="145" width="82" height="10" rx="5"/>' +
      '<rect class="k-rule" x="106" y="182" width="118" height="8" rx="4"/><rect class="k-wash" x="252" y="181" width="126" height="10" rx="5"/><rect class="k-ink" x="252" y="181" width="58" height="10" rx="5"/>' +
      '<rect class="k-ink" x="100" y="222" width="84" height="22" rx="11"/><rect class="k-surface k-ol" x="192" y="222" width="84" height="22" rx="11"/>',
    grid:
      (function () {
        var s = "", r, c;
        for (r = 0; r < 3; r++) for (c = 0; c < 4; c++) {
          var x = 82 + c * 82, y = 46 + r * 74;
          s += '<rect class="k-surface k-ol" x="' + x + '" y="' + y + '" width="66" height="58" rx="12"/>';
          s += (r + c) % 3 === 0 ? '<rect class="k-ink" x="' + (x + 13) + '" y="' + (y + 21) + '" width="40" height="16" rx="8"/>'
            : (r + c) % 3 === 1 ? '<rect class="k-rule" x="' + (x + 12) + '" y="' + (y + 19) + '" width="42" height="7" rx="3.5"/><rect class="k-rule" x="' + (x + 12) + '" y="' + (y + 32) + '" width="28" height="7" rx="3.5"/>'
              : '<rect class="k-wash k-ol" x="' + (x + 12) + '" y="' + (y + 20) + '" width="30" height="18" rx="9"/><circle class="k-ink" cx="' + (x + 33) + '" cy="' + (y + 29) + '" r="6"/>';
        }
        return s + '<rect class="k-none k-ol-focus" x="159" y="113" width="80" height="72" rx="16"/>' +
          '<circle class="k-good" cx="234" cy="118" r="11"/><path class="k-check" d="M228.5 118.5l3.6 3.6 6.6-7"/>';
      })(),
    layers:
      '<rect class="k-wash k-ol" x="178" y="34" width="232" height="150" rx="16"/>' +
      '<rect class="k-surface k-ol" x="132" y="72" width="232" height="150" rx="16"/>' +
      '<rect class="k-rule" x="150" y="92" width="84" height="8" rx="4"/><rect class="k-rule" x="150" y="108" width="140" height="8" rx="4"/>' +
      '<rect class="k-surface k-ol-ink" x="86" y="112" width="232" height="160" rx="16"/>' +
      '<rect class="k-ink" x="104" y="130" width="70" height="10" rx="5"/>' +
      '<rect class="k-rule" x="104" y="158" width="196" height="1.5"/><rect class="k-rule" x="104" y="186" width="196" height="1.5"/><rect class="k-rule" x="104" y="214" width="196" height="1.5"/>' +
      '<rect class="k-mark" x="98" y="164" width="208" height="18" rx="5"/>' +
      '<rect class="k-onmark" x="108" y="169" width="64" height="8" rx="4"/><rect class="k-rule" x="108" y="196" width="80" height="8" rx="4"/><rect class="k-rule" x="108" y="224" width="52" height="8" rx="4"/>' +
      '<rect class="k-ink" x="246" y="242" width="54" height="18" rx="9"/>',
    journey:
      '<polyline class="k-st" points="64,196 152,150 240,176 328,118 416,138"/>' +
      '<circle class="k-surface k-ol-ink" cx="64" cy="196" r="12"/><circle class="k-surface k-ol-ink" cx="152" cy="150" r="12"/>' +
      '<circle class="k-mark" cx="240" cy="176" r="30"/><circle class="k-ink" cx="240" cy="176" r="13"/>' +
      '<circle class="k-surface k-ol" cx="328" cy="118" r="12"/><circle class="k-surface k-ol" cx="416" cy="138" r="12"/>' +
      '<rect class="k-rule" x="40" y="222" width="48" height="8" rx="4"/><rect class="k-rule" x="128" y="176" width="48" height="8" rx="4"/>' +
      '<rect class="k-ink" x="206" y="220" width="68" height="9" rx="4.5"/>' +
      '<rect class="k-rule" x="304" y="144" width="48" height="8" rx="4"/><rect class="k-rule" x="392" y="164" width="48" height="8" rx="4"/>',
    chart:
      '<rect class="k-surface k-ol" x="56" y="40" width="368" height="224" rx="18"/>' +
      '<rect class="k-rule" x="80" y="110" width="320" height="1.5"/><rect class="k-rule" x="80" y="160" width="320" height="1.5"/><rect class="k-rule" x="80" y="210" width="320" height="1.5"/>' +
      '<polyline class="k-st-slate" points="80,196 120,190 160,198 200,182 240,186 280,172 320,176 360,166 400,170"/>' +
      '<polyline class="k-st-ink" points="80,204 120,186 160,192 200,158 240,166 280,132 320,140 360,112 400,118"/>' +
      '<line class="k-st-cross" x1="320" y1="64" x2="320" y2="244"/>' +
      '<circle class="k-mark" cx="320" cy="140" r="16"/><circle class="k-surface k-ol-ink" cx="320" cy="140" r="6"/>' +
      '<rect class="k-ink" x="214" y="70" width="92" height="44" rx="9"/><rect class="k-onink" x="226" y="82" width="48" height="7" rx="3.5"/><rect class="k-onink" x="226" y="96" width="66" height="7" rx="3.5"/>',
    system:
      '<rect class="k-ink" x="64" y="66" width="80" height="34" rx="10"/>' +
      '<rect class="k-slate" x="156" y="66" width="80" height="34" rx="10"/>' +
      '<rect class="k-none k-ol-focus" x="242" y="60" width="92" height="46" rx="14"/><rect class="k-ink" x="248" y="66" width="80" height="34" rx="10"/>' +
      '<rect class="k-wash k-ol" x="340" y="66" width="80" height="34" rx="10"/>' +
      '<rect class="k-onink" x="80" y="79" width="48" height="8" rx="4"/><rect class="k-onink" x="172" y="79" width="48" height="8" rx="4"/><rect class="k-onink" x="264" y="79" width="48" height="8" rx="4"/><rect class="k-rule" x="356" y="79" width="48" height="8" rx="4"/>' +
      '<circle class="k-ink" cx="88" cy="168" r="20"/><circle class="k-slate" cx="142" cy="168" r="20"/><circle class="k-mark" cx="196" cy="168" r="20"/><circle class="k-good" cx="250" cy="168" r="20"/><circle class="k-flag" cx="304" cy="168" r="20"/><circle class="k-wash k-ol" cx="358" cy="168" r="20"/>' +
      '<rect class="k-rule" x="68" y="222" width="140" height="8" rx="4"/><rect class="k-rule" x="68" y="240" width="96" height="8" rx="4"/>' +
      '<rect class="k-surface k-ol" x="256" y="214" width="164" height="40" rx="10"/><rect class="k-rule" x="270" y="230" width="90" height="8" rx="4"/>',
    tree:
      '<rect class="k-surface k-ol" x="48" y="56" width="110" height="26" rx="8"/>' +
      '<rect class="k-surface k-ol" x="64" y="96" width="110" height="26" rx="8"/>' +
      '<rect class="k-surface k-ol" x="80" y="136" width="110" height="26" rx="8"/>' +
      '<rect class="k-surface k-ol" x="96" y="176" width="110" height="26" rx="8"/>' +
      '<rect class="k-surface k-ol-ink" x="112" y="216" width="110" height="26" rx="8"/>' +
      '<rect class="k-rule" x="250" y="40" width="1.5" height="220"/>' +
      '<rect class="k-surface k-ol" x="284" y="56" width="130" height="26" rx="8"/>' +
      '<rect class="k-surface k-ol" x="300" y="96" width="130" height="26" rx="8"/>' +
      '<rect class="k-mark" x="316" y="136" width="130" height="26" rx="8"/><rect class="k-onmark" x="328" y="145" width="70" height="8" rx="4"/>'
  };

  return {
    isMock: function (kind) { return !!MOCKS[kind]; },
    render: function (kind, data, block) {
      var fn = R[kind];
      return fn ? fn(data || {}, block || {}) : '<p class="v-missing">Unknown visual: ' + esc(kind) + "</p>";
    },
    cover: function (kind) {
      var body = C[kind] || C.layers;
      return '<svg class="cover" viewBox="0 0 480 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><rect class="k-bg" width="480" height="300"/>' + body + "</svg>";
    }
  };
})();
