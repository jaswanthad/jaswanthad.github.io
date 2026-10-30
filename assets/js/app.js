/* =============================================================================
   APP
   Renders every page from content.js. To change what the site says, edit
   content.js; you shouldn't need to touch this file.
   Routes:  #/                 home
            #/selected, #/about, #/contact   home sections
            #/work             all work
            #/work/uhg         the protected UnitedHealth Group case studies
            #/work/<slug>      a case study
            #/work/<slug>/<section-id>   a section inside a case study
   ============================================================================= */
(function () {
  "use strict";

  var C = window.PORTFOLIO || {};
  var V = window.Visuals;
  var LOCKED = window.PORTFOLIO_LOCKED || null;
  var SESSION_KEY = "portfolio-access";
  var HOME_SECTIONS = ["selected", "about", "contact"];
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var state = { unlocked: null, route: null, observers: [], tableN: 0 };

  /* ------------------------------------------------------------- helpers */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    var s = String(u || "").trim();
    if (/^(https?:|mailto:|tel:|data:image\/)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return "#";
    return s;
  }
  // Escapes text, then applies **bold**, *italic*, ==highlight== and [link](url).
  function fmt(s) {
    var out = esc(s);
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
      return '<a href="' + esc(safeUrl(url.replace(/&amp;/g, "&"))) + '">' + label + "</a>";
    });
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/==(.+?)==/g, "<mark>$1</mark>");
    out = out.replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, "$1<em>$2</em>");
    return out;
  }
  function byId(id) { return document.getElementById(id); }
  function cases() { return C.caseStudies || []; }
  function findCase(slug) { return cases().filter(function (c) { return c.slug === slug; })[0]; }
  function groups() { return (C.work && C.work.groups) || []; }
  function groupOf(cs) { return groups().filter(function (g) { return g.id === cs.group; })[0] || {}; }
  function isOpen(cs) { return !cs.protected || !!(state.unlocked && state.unlocked[cs.slug]); }
  function fullCase(cs) {
    if (!cs.protected) return cs;
    var extra = state.unlocked && state.unlocked[cs.slug];
    return extra ? Object.assign({}, cs, extra) : null;
  }
  function mailto(subject, body) {
    return "mailto:" + (C.meta.email || "") + "?subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
  }
  function accessMail() {
    return mailto("Portfolio access request", "Hi " + (C.meta.firstName || "") + ",\n\nCould you send me the password for your protected case studies?\n\nName:\nCompany:\nRole:\n");
  }
  function announce(msg) {
    var el = byId("sr-status");
    if (!el) return;
    el.textContent = "";
    window.setTimeout(function () { el.textContent = msg; }, 60);
  }
  function nextFrame(fn) { window.requestAnimationFrame(function () { window.requestAnimationFrame(fn); }); }

  var ICON = {
    problem: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.1"/></svg>',
    approach: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>',
    result: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M5 15l4.5-4.5 3.5 3.5L19 8"/><path d="M15 8h4v4"/></svg>',
    learn: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/></svg>',
    role: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
    note: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/></svg>',
    no: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
    yes: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.7 2.7L16 9.6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.6-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    brand: '<svg class="brand__mark" viewBox="0 0 64 64" width="34" height="34" aria-hidden="true" focusable="false"><rect class="bm-bg" width="64" height="64" rx="16"/><rect class="bm-hl" x="12" y="43" width="40" height="8" rx="3"/><text class="bm-tx" x="32" y="38" text-anchor="middle">JA</text></svg>'
  };

  function tags(list, cls) {
    if (!list || !list.length) return "";
    return '<span class="tags' + (cls ? " " + cls : "") + '">' + list.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("") + "</span>";
  }

  /* -------------------------------------------------------- header/footer */
  function renderHeader() {
    var m = C.meta || {};
    var links = [["work", "Work"], ["motion", "Motion"], ["about", "About"]];
    byId("site-header").innerHTML =
      '<div class="wrap hdr__in">' +
      '<a class="brand" href="#/">' + ICON.brand + "<span>" + esc(m.name) + "</span></a>" +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">' + ICON.menu + "<span>Menu</span></button>" +
      '<nav class="nav" id="site-nav" aria-label="Main">' +
      links.map(function (l) { return '<a class="nav__link" href="#/' + l[0] + '" data-nav="' + l[0] + '">' + l[1] + "</a>"; }).join("") +
      (m.resumeUrl ? '<a class="nav__link nav__link--cv" href="' + esc(safeUrl(m.resumeUrl)) + '">Résumé</a>' : "") +
      "</nav></div>";
  }

  function renderFooter() {
    var m = C.meta || {};
    byId("site-footer").innerHTML =
      '<div class="wrap ftr__in">' +
      '<div><p class="ftr__name">' + esc(m.name) + "</p><p>" + esc(m.role) + ", " + esc(m.location) + "</p></div>" +
      '<div class="ftr__col">' + (C.colophon ? '<p class="ftr__colophon">' + fmt(C.colophon) + "</p>" : "") +
      (m.lastUpdated ? "<p>Last updated " + esc(m.lastUpdated) + ".</p>" : "") + "</div></div>";
  }

  /* ----------------------------------------------------------------- home */
  function viewHome() {
    return heroView() + selectedView() + aboutView() + contactView();
  }

  function heroView() {
    var h = C.hero || {};
    var st = [["pin", "1", "10%", "4%", "-6deg", "7s"], ["chip", "Submitted for review", "36%", "0%", "3deg", "9s"], ["bubble", "You’re booked with Dr. Rivera on Thursday at 9:30 AM.", "52%", "24%", "-2deg", "8s"],
      ["meter", "<i></i><i></i><i class=\"off\"></i>Moderate confidence", "4%", "44%", "4deg", "10s"], ["dim", "<span>44 px</span>", "40%", "66%", "-3deg", "8.5s"], ["ratio", "5.34:1 passes AA", "66%", "84%", "5deg", "9.5s"]];
    var stickers = '<div class="stk" aria-hidden="true">' + st.map(function (s, k) {
      return '<span class="stk__i stk__' + s[0] + '" style="--x:' + s[2] + ";--y:" + s[3] + ";--r:" + s[4] + ";--d:" + s[5] + ";--k:" + k + '">' + s[1] + "</span>";
    }).join("") + "</div>";
    return '<section class="intro" aria-labelledby="hero-title"><div class="wrap intro__grid"><div class="intro__text">' +
      '<h1 class="intro__t" id="hero-title">' + fmt(h.headline) + "</h1>" +
      '<p class="intro__b">' + fmt(h.summary) + "</p>" +
      (h.intro ? '<p class="intro__m">' + fmt(h.intro) + "</p>" : "") +
      '<p class="intro__now"><span class="intro__dot" aria-hidden="true"></span>It’s <span data-clock>now</span> in Boston</p>' +
      "</div>" + stickers + "</div></section>";
  }

  function groupById(id) { return groups().filter(function (g) { return g.id === id; })[0]; }

  function featured() {
    return ((C.work && C.work.featured) || []).map(function (id) {
      var g = groupById(id);
      if (g && g.protected) return { group: g };
      var cs = findCase(id);
      return cs ? { cs: cs } : null;
    }).filter(Boolean);
  }

  var INDEX_ORDER = ["uhg", "motion", "finlatics-learner-journey", "portfolio-simulation-dashboards", "finlatics-design-system", "advisor-ai", "nike-nft-concept", "b2b-saas-navigation"];
  function thumb(src, cover) {
    return '<span class="ix__thumb" aria-hidden="true">' + (src ? '<img src="' + esc(safeUrl(src)) + '" alt="" loading="lazy" decoding="async">' : V.cover(cover)) + "</span>";
  }
  function indexRow(o) {
    return '<li class="ix__item"><a class="ix__row" href="' + o.href + '" style="--proj:' + esc(o.color || "#2C3340") + '"' + (o.preview ? ' data-preview="' + esc(safeUrl(o.preview)) + '"' : "") + ">" +
      '<span class="ix__when">' + esc(o.when || "") + "</span>" +
      '<span class="ix__main"><span class="ix__name">' + esc(o.title) + '</span><span class="ix__co">' + (o.meta || "") + "</span></span>" +
      thumb(o.src, o.cover) + "</a></li>";
  }
  function indexItems(list) {
    return list.map(function (id) {
      if (id === "motion") { var M = C.motion || {}; return indexRow({ href: "#/motion", color: M.color || "#C8321E", when: M.indexWhen || "Studies", title: M.indexTitle || "In-app motion", meta: esc(M.indexMeta || ""), src: M.preview, cover: "flow", preview: M.preview }); }
      var g = groupById(id);
      if (g) return indexRow({ href: "#/work/" + g.id, color: g.color, when: g.indexWhen || g.period, title: g.indexTitle || g.title || g.company,
        meta: esc(g.indexMeta || g.company) + (state.unlocked ? "" : ' <span class="ix__lock">' + ICON.lock + "Password protected</span>"), cover: g.cover || "chat", preview: g.preview });
      var cs = findCase(id); if (!cs) return "";
      var gg = groupOf(cs);
      return indexRow({ href: "#/work/" + cs.slug, color: cs.color, when: cs.indexWhen || gg.period || "", title: cs.indexTitle || cs.title, meta: esc(cs.indexMeta || gg.company || ""), src: cs.coverImage, cover: cs.cover, preview: cs.preview });
    }).join("");
  }
  function selectedView() {
    var w = C.work || {};
    return '<section class="sec ix" id="selected" aria-labelledby="sel-title"><div class="wrap">' +
      '<h2 class="ix__h" id="sel-title">' + esc(w.indexHeading || "Selected work") + "</h2>" +
      '<ol class="ix__list">' + indexItems(w.index || INDEX_ORDER) + "</ol>" +
      '<p class="ix__more"><a href="#/work">Every case study, by company</a></p></div></section>' + toolsView();
  }
  function toolsView() {
    var t = C.tools || [];
    if (!t.length) return "";
    var set = function (hidden) { return '<ul class="marq__set"' + (hidden ? ' aria-hidden="true"' : "") + ">" + t.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; };
    return '<section class="tools" aria-labelledby="tools-h"><div class="wrap"><h2 class="ix__h" id="tools-h">Tools I work in</h2></div>' +
      '<div class="marq"><div class="marq__track">' + set(false) + set(true) + "</div></div></section>";
  }

  function cardCover(cs) {
    return '<span class="feat__cover">' + (cs.coverImage ? '<img src="' + esc(safeUrl(cs.coverImage)) + '" alt="" loading="lazy" decoding="async">' : V.cover(cs.cover)) + "</span>";
  }

  function caseCard(cs) {
    var g = groupOf(cs);
    return '<a class="feat" href="#/work/' + esc(cs.slug) + '">' + cardCover(cs) +
      '<span class="feat__body"><span class="feat__co">' + esc(g.company || "") + "</span>" +
      '<span class="feat__title">' + esc(cs.title) + '</span><span class="feat__teaser">' + fmt(cs.teaser) + "</span></span></a>";
  }

  function groupCard(g) {
    var open = !!state.unlocked;
    return '<a class="feat" href="#/work/' + esc(g.id) + '">' + cardCover({ cover: g.cover || "chat" }) +
      '<span class="feat__body"><span class="feat__co">' + esc(g.company) +
      '<span class="feat__lock">' + (open ? ICON.unlock : ICON.lock) + (open ? "Unlocked" : "Password protected") + "</span></span>" +
      '<span class="feat__title">' + esc(g.title || g.company) + '</span><span class="feat__teaser">' + fmt(g.teaser || g.description || "") + "</span></span></a>";
  }

  function aboutView() {
    var ab = C.about || {}, x = C.experience || {};
    return '<section class="sec about" id="about" aria-labelledby="about-title"><div class="wrap about__in">' +
      '<h2 class="sec__title" id="about-title">' + esc(ab.title || "About") + "</h2>" +
      '<div class="about__body">' + (ab.paragraphs || []).map(function (p) { return '<p class="about__p">' + fmt(p) + "</p>"; }).join("") +
      '<h3 class="about__h">Experience</h3><ol class="about__list">' + (x.roles || []).map(function (r) {
        return '<li><span class="about__when">' + esc(r.period) + '</span><span class="about__what"><strong>' + esc(r.role) + "</strong><span>" + esc(r.company) + "</span></span></li>";
      }).join("") + "</ol>" +
      '<h3 class="about__h">Education</h3><ul class="about__list about__list--edu">' + (x.education || []).map(function (e) {
        return '<li><span class="about__what"><strong>' + esc(e.degree) + "</strong><span>" + esc(e.school) + ", " + esc(e.place) + "</span></span></li>";
      }).join("") + "</ul></div></div></section>";
  }

  /* ------------------------------------------------------------- all work */
  function workRow(cs, g, onHub) {
    var locked = cs.protected && !isOpen(cs);
    var inner = (cs.protected ? '<span class="wl__icon">' + (locked ? ICON.lock : ICON.unlock) + '<span class="sr-only">' + (locked ? "Protected: " : "Unlocked: ") + "</span></span>" : "") +
      '<span class="wl__text"><span class="wl__t">' + esc(cs.title) + '</span><span class="wl__d">' + fmt(cs.teaser) + "</span></span>";
    if (locked && onHub) return '<li><div class="wl__row is-locked">' + inner + "</div></li>";
    return '<li><a class="wl__row" href="#/work/' + esc(locked ? g.id : cs.slug) + '">' + inner + "</a></li>";
  }

  function viewWork() {
    var w = C.work || {};
    var intro = (w.intro || "").replace("{count}", String(cases().length));
    return '<section class="wl"><div class="wrap">' +
      '<a class="back" href="#/">' + ICON.back + "<span>Home</span></a>" +
      '<h1 class="cs__title wl__title" tabindex="-1">' + esc(w.allTitle || "All work") + "</h1>" +
      (intro ? '<p class="cs__sum">' + fmt(intro) + "</p>" : "") +
      groups().map(function (g) {
        var list = cases().filter(function (c) { return c.group === g.id; });
        if (!list.length) return "";
        return '<section class="wl__group" aria-labelledby="wl-' + esc(g.id) + '"><div class="wl__head">' +
          '<h2 class="wl__co" id="wl-' + esc(g.id) + '">' + esc(g.company) + "</h2>" +
          '<p class="wl__role">' + esc(g.role) + (g.period ? ", " + esc(g.period) : "") + "</p></div>" +
          '<ul class="wl__list">' + list.map(function (cs) { return workRow(cs, g, false); }).join("") + "</ul></section>";
      }).join("") + "</div></section>";
  }

  function viewGroup(g) {
    if (!g) return viewNotFound();
    var list = cases().filter(function (c) { return c.group === g.id; }), open = !!state.unlocked;
    return '<article class="cs hub" style="--proj:' + esc(g.color || "#1F3480") + '"><header class="cv"><div class="wrap cv__in">' +
      '<a class="back cv__back" href="#/work">' + ICON.back + "<span>All work</span></a>" +
      '<p class="cv__co"><span>' + esc(g.company) + '</span><span class="cv__lock">' + (open ? ICON.unlock : ICON.lock) + (open ? "Unlocked" : "Protected") + "</span></p>" +
      '<h1 class="cv__title" tabindex="-1">' + esc(g.title || g.company) + "</h1>" +
      '<p class="cv__sum">' + fmt(g.description || "") + "</p></div></header>" +
      '<div class="wrap hub__body">' +
      (open ? "" : '<div class="gate"><span class="gate__icon">' + ICON.lock + "</span>" +
        '<h2 class="gate__t">Shared privately</h2>' +
        '<p class="gate__b">These case studies cover current work at ' + esc(g.company) + ". Enter the password you received to open all " + list.length + " of them for this visit.</p>" +
        unlockForm("hub") + "</div>") +
      '<h2 class="wl__co hub__h">' + list.length + " case studies</h2>" +
      '<ol class="ix__list hub__list">' + list.map(function (cs) { return indexRow({ href: "#/work/" + cs.slug, color: cs.color, when: "", title: cs.title, meta: fmt(cs.teaser || ""), cover: cs.cover }); }).join("") + "</ol></div></article>";
  }

  function evidenceView(h) {
    var list = h.evidence || [];
    if (!list.length) return "";
    return '<aside class="ev" aria-labelledby="ev-title">' +
      '<h2 class="ev__title" id="ev-title">' + esc(h.evidenceTitle) + "</h2>" +
      (h.evidenceHint ? '<p class="ev__hint">' + esc(h.evidenceHint) + "</p>" : "") +
      '<ul class="ev__list">' + list.map(function (e, i) {
        var open = i === 0, n = e.items.length;
        return '<li class="ev__item"><h3 class="ev__h">' +
          '<button class="ev__claim" type="button" id="ev-b-' + i + '" aria-expanded="' + open + '" aria-controls="ev-' + i + '">' +
          '<span class="ev__t">' + esc(e.claim) + '</span><span class="ev__n">' + n + (n === 1 ? " case study" : " case studies") + "</span>" +
          '<span class="ev__chev">' + ICON.chevron + "</span></button></h3>" +
          '<div class="ev__region' + (open ? " is-entering" : "") + '" id="ev-' + i + '" role="region" aria-labelledby="ev-b-' + i + '"' + (open ? "" : " hidden") + ">" +
          '<ul class="ev__evidence">' + e.items.map(evidenceItem).join("") + "</ul></div></li>";
      }).join("") + "</ul></aside>";
  }

  function evidenceItem(it) {
    var cs = findCase(it.slug);
    if (!cs) return "";
    var g = groupOf(cs), open = isOpen(cs);
    return '<li><a class="ev__link" href="#/work/' + esc(cs.slug) + '">' +
      '<span class="ev__src">' + esc(g.company || "") +
      (cs.protected ? '<span class="ev__lock">' + (open ? ICON.unlock : ICON.lock) + (open ? "Unlocked" : "Protected") + "</span>" : "") + "</span>" +
      '<span class="ev__text">' + fmt(it.text) + "</span></a></li>";
  }

  function workView() {
    var w = C.work || {};
    var intro = (w.intro || "").replace("{count}", String(cases().length));
    return '<section class="sec" id="work" aria-labelledby="work-title"><div class="wrap">' +
      '<header class="sec__head"><h2 class="sec__title" id="work-title">' + esc(w.title) + "</h2>" + (intro ? '<p class="sec__lede">' + fmt(intro) + "</p>" : "") + "</header>" +
      groups().map(chapterView).join("") + "</div></section>";
  }

  function chapterView(g) {
    var list = cases().filter(function (c) { return c.group === g.id; });
    if (!list.length) return "";
    return '<div class="chapter"><div class="chapter__head">' +
      '<h3 class="chapter__co">' + esc(g.company) + "</h3>" +
      '<p class="chapter__role">' + esc(g.role) + '</p>' + (g.period ? '<p class="chapter__period">' + esc(g.period) + "</p>" : "") +
      (g.description ? '<p class="chapter__desc">' + fmt(g.description) + "</p>" : "") +
      '</div><div class="chapter__body">' + (g.protected ? vaultView(list) : featsView(list)) + "</div></div>";
  }

  function vaultView(list) {
    var open = !!state.unlocked;
    return '<div class="vault' + (open ? " is-unlocked" : "") + '"><ul class="vault__list">' +
      list.map(function (cs) {
        var o = isOpen(cs);
        return '<li><a class="vault__row" href="#/work/' + esc(cs.slug) + '">' +
          '<span class="vault__icon">' + (o ? ICON.unlock : ICON.lock) + '<span class="sr-only">' + (o ? "Unlocked: " : "Protected: ") + "</span></span>" +
          '<span class="vault__text"><span class="vault__t">' + esc(cs.title) + '</span><span class="vault__d">' + fmt(cs.teaser) + "</span>" + tags(cs.tags) + "</span></a></li>";
      }).join("") + "</ul>" +
      '<div class="vault__foot">' + (open ? unlockedNote() : unlockForm("home")) + "</div></div>";
  }

  function unlockForm(id) {
    return '<form class="unlock" data-unlock novalidate>' +
      '<label class="unlock__label" for="pw-' + id + '">Have the password?</label>' +
      '<span class="unlock__row"><input class="unlock__input" id="pw-' + id + '" name="password" type="password" autocomplete="current-password" aria-describedby="pw-' + id + '-msg">' +
      '<button class="btn btn--primary" type="submit">Unlock case studies</button></span>' +
      '<span class="unlock__msg" id="pw-' + id + '-msg" data-unlock-msg></span>' +
      '<span class="unlock__ask">No password yet? <a href="' + esc(accessMail()) + '">Request access by email</a></span>' +
      "</form>";
  }

  function unlockedNote() {
    return '<p class="unlock__done">' + ICON.unlock + "<span>Unlocked for this visit. Open any case study above.</span></p>";
  }

  function featsView(list) {
    return '<div class="feats">' + list.map(function (cs, i) {
      var wide = list.length % 2 === 1 && i === 0;
      return '<a class="feat' + (wide ? " feat--wide" : "") + '" href="#/work/' + esc(cs.slug) + '">' +
        '<span class="feat__cover">' + (cs.coverImage ? '<img src="' + esc(safeUrl(cs.coverImage)) + '" alt="" loading="lazy" decoding="async">' : V.cover(cs.cover)) + "</span>" +
        '<span class="feat__body"><span class="feat__title">' + esc(cs.title) + '</span><span class="feat__teaser">' + fmt(cs.teaser) + "</span>" + tags(cs.tags) + "</span></a>";
    }).join("") + "</div>";
  }

  function projectsView() {
    var list = C.personalProjects || [];
    if (!list.length) return "";
    return '<section class="sec sec--flush" id="projects" aria-labelledby="pp-title"><div class="wrap">' +
      '<header class="sec__head"><h2 class="sec__title" id="pp-title">' + esc(C.projectsTitle || "Independent work") + "</h2>" + (C.projectsIntro ? '<p class="sec__lede">' + fmt(C.projectsIntro) + "</p>" : "") + "</header>" +
      '<ul class="pp">' + list.map(function (p) {
        var media = p.image ? '<img class="pp__media" src="' + esc(safeUrl(p.image)) + '" alt="' + esc(p.imageAlt || "") + '" loading="lazy">'
          : '<span class="pp__media">' + V.cover(p.cover || "layers") + "</span>";
        var links = (p.links || []).map(function (l) { return '<a href="' + esc(safeUrl(l.url)) + '">' + esc(l.label) + "</a>"; }).join("");
        return '<li class="pp__item">' + media + '<div class="pp__body">' + (p.year ? '<p class="pp__year">' + esc(p.year) + "</p>" : "") +
          '<h3 class="pp__t">' + esc(p.title) + '</h3><p class="pp__d">' + fmt(p.description) + "</p>" + tags(p.tags) +
          (links ? '<p class="pp__links">' + links + "</p>" : "") + "</div></li>";
      }).join("") + "</ul></div></section>";
  }

  function approachView() {
    var a = C.approach || {};
    return '<section class="sec band" id="approach" aria-labelledby="approach-title"><div class="wrap">' +
      '<header class="sec__head"><h2 class="sec__title" id="approach-title">' + esc(a.title) + "</h2>" + (a.intro ? '<p class="sec__lede">' + fmt(a.intro) + "</p>" : "") + "</header>" +
      '<ul class="prin">' + (a.principles || []).map(function (p) {
        return '<li class="prin__item"><h3 class="prin__t">' + esc(p.title) + '</h3><p class="prin__b">' + fmt(p.body) + "</p></li>";
      }).join("") + "</ul></div></section>";
  }

  function experienceView() {
    var x = C.experience || {}, cap = C.capabilities || {};
    return '<section class="sec" id="experience" aria-labelledby="xp-title"><div class="wrap">' +
      '<header class="sec__head"><h2 class="sec__title" id="xp-title">' + esc(x.title) + "</h2></header>" +
      '<ol class="xp">' + (x.roles || []).map(function (r) {
        return '<li class="xp__item"><p class="xp__period">' + esc(r.period) + "</p>" +
          '<div class="xp__main"><h3 class="xp__role">' + esc(r.role) + '<span class="xp__co">' + esc(r.company) + "</span></h3>" +
          '<p class="xp__sum">' + fmt(r.summary) + "</p>" +
          (r.points && r.points.length ? '<ul class="xp__pts">' + r.points.map(function (p) { return "<li>" + fmt(p) + "</li>"; }).join("") + "</ul>" : "") +
          "</div></li>";
      }).join("") + "</ol>" +
      '<div class="xp__more">' +
      '<div class="xp__block"><h3 class="xp__h">Education</h3><ul class="edu">' + (x.education || []).map(function (e) {
        return '<li><span class="edu__d">' + esc(e.degree) + '</span><span class="edu__s">' + esc(e.school) + ", " + esc(e.place) + "</span></li>";
      }).join("") + "</ul></div>" +
      '<div class="xp__block"><h3 class="xp__h">' + esc(cap.title || "Capabilities") + '</h3><div class="caps">' + (cap.groups || []).map(function (g) {
        return '<div class="caps__g"><h4 class="caps__t">' + esc(g.name) + '</h4><p class="caps__i">' + g.items.map(esc).join(", ") + "</p></div>";
      }).join("") + "</div></div></div></div></section>";
  }

  function contactView() {
    var c = C.contact || {}, m = C.meta || {};
    return '<section class="contact" id="contact" aria-labelledby="contact-title"><div class="wrap contact__in">' +
      '<h2 class="contact__title" id="contact-title">' + esc(c.title) + "</h2>" +
      '<p class="contact__body">' + fmt(c.body) + "</p>" +
      '<a class="contact__email" href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>" +
      '<ul class="contact__links">' +
      (m.linkedin ? '<li><a href="' + esc(safeUrl(m.linkedin)) + '">LinkedIn</a></li>' : "") +
      (m.resumeUrl ? '<li><a href="' + esc(safeUrl(m.resumeUrl)) + '">Résumé (PDF)</a></li>' : "") +
      (m.location ? "<li><span>" + esc(m.location) + "</span></li>" : "") + "</ul>" +
      (c.accessNote ? '<p class="contact__note">' + fmt(c.accessNote) + ' <a href="' + esc(accessMail()) + '">Request access</a></p>' : "") +
      "</div></section>";
  }

  /* ---------------------------------------------------------- case study */
  function viewCase(slug) {
    var cs = findCase(slug);
    if (!cs) return viewNotFound();
    var g = groupOf(cs), full = fullCase(cs);
    return full ? caseView(full, g) : lockedView(cs, g);
  }

  function caseColor(cs, g) { return cs.color || (g && g.color) || "#2C3340"; }
  function hasRecreation(cs) {
    return (cs.sections || []).some(function (s) { return (s.blocks || []).some(function (b) { return b.type === "visual" && (b.illustrative || (b.illustrative == null && V.isMock(b.kind))); }); });
  }
  function readMode() { var m = "tour"; try { m = window.sessionStorage.getItem("portfolio-mode") || "tour"; } catch (e) { /* storage unavailable */ } return m === "story" ? "story" : "tour"; }
  function modeSwitch() {
    var m = readMode();
    return '<div class="mode" role="group" aria-label="How to read this case study">' +
      '<button type="button" class="mode__b" data-mode="tour" aria-pressed="' + (m === "tour") + '">Visual tour</button>' +
      '<button type="button" class="mode__b" data-mode="story" aria-pressed="' + (m === "story") + '">Full story</button></div>';
  }
  function caseHead(cs, g, locked) {
    var hasHero = !locked && cs.hero;
    return '<header class="cv' + (hasHero ? " cv--hero" : "") + '"><div class="wrap cv__in">' +
      '<a class="back cv__back" href="#/work">' + ICON.back + "<span>All work</span></a>" +
      '<p class="cv__co"><span>' + esc(g.company || "") + "</span>" +
      (cs.protected ? '<span class="cv__lock">' + (locked ? ICON.lock : ICON.unlock) + (locked ? "Protected" : "Unlocked") + "</span>" : "") + "</p>" +
      '<h1 class="cv__title" tabindex="-1">' + esc(cs.title) + "</h1>" +
      '<p class="cv__sum">' + fmt(locked ? cs.teaser : (cs.summary || cs.teaser)) + "</p>" +
      "</div>" + (hasHero ? '<div class="wrap cv__hero">' + caseHeroView(cs.hero) + "</div>" : "") + "</header>" +
      (locked ? "" : '<div class="wrap cs__top">' + metaView(cs.meta) + outcomesView(cs.outcomes) +
        '<div class="cs__tools">' + modeSwitch() + (hasRecreation(cs) ? '<p class="cs__note">Screens on this page are recreations with fictional data.</p>' : "") + "</div></div>");
  }

  function lockedView(cs, g) {
    return '<article class="cs cs--locked" style="--proj:' + esc(caseColor(cs, g)) + '">' + caseHead(cs, g, true) +
      '<div class="wrap"><div class="gate">' +
      '<span class="gate__icon">' + ICON.lock + "</span>" +
      '<h2 class="gate__t">This case study is shared privately</h2>' +
      '<p class="gate__b">It covers current work at ' + esc(g.company || "my current employer") + ". Enter the password you received to open it, or request access by email.</p>" +
      unlockForm("case") +
      '<p class="gate__fine">Protected case studies are encrypted, so their content can’t be read from this site’s files. One password opens all of them for this visit.</p>' +
      "</div></div>" + nextView(cs) + "</article>";
  }

  function caseView(cs, g) {
    var secs = cs.sections || [], fig = 0;
    var body = secs.map(function (s) {
      return '<section class="cs__sec" id="sec-' + esc(s.id) + '" aria-labelledby="h-' + esc(s.id) + '">' +
        (s.label && s.label !== s.title ? '<p class="cs__label">' + esc(s.label) + "</p>" : "") +
        '<h2 class="cs__h2" id="h-' + esc(s.id) + '" tabindex="-1">' + esc(s.title) + "</h2>" +
        (s.blocks || []).map(function (b) { return block(b, function () { return ++fig; }); }).join("") +
        "</section>";
    }).join("");
    var toc = secs.length > 1 ? '<nav class="toc" aria-label="On this page"><p class="toc__t">On this page</p><ol class="toc__list">' +
      secs.map(function (s) { return '<li><a class="toc__a" href="#/work/' + esc(cs.slug) + "/" + esc(s.id) + '" data-sec="' + esc(s.id) + '">' + esc(s.label || s.title) + "</a></li>"; }).join("") +
      "</ol></nav>" : "";
    return '<article class="cs' + (readMode() === "story" ? " cs--story" : "") + '" style="--proj:' + esc(caseColor(cs, g)) + '">' + caseHead(cs, g, false) +
      '<div class="wrap cs__body"><div class="cs__content">' + body +
      '<div class="tour-end"><p class="tour-end__t">That’s the visual tour.</p><p class="tour-end__b">The full story adds the context, the decisions and how the work was measured.</p>' +
      '<button type="button" class="btn btn--primary mode__b" data-mode="story" aria-pressed="false">Read the full story</button></div>' +
      "</div></div>" + nextView(cs) + "</article>";
  }

  function caseHeroView(h) {
    if (!h) return "";
    return '<figure class="cs__hero">' + '<div class="cs__hero-plate">' + V.render(h.kind || "image", h.data || h, h) + "</div>" +
      (h.caption ? '<figcaption class="cs__hero-cap">' + fmt(h.caption) + "</figcaption>" : "") + "</figure>";
  }

  function metaView(meta) {
    if (!meta || !meta.length) return "";
    return '<dl class="cs__meta">' + meta.map(function (m) { return "<div><dt>" + esc(m.label) + "</dt><dd>" + fmt(m.value) + "</dd></div>"; }).join("") + "</dl>";
  }

  function outcomesView(list, cls) {
    if (!list || !list.length) return "";
    return '<ul class="oc ' + (cls || "cs__outcomes") + '">' + list.map(function (o) {
      return '<li><span class="oc__v">' + esc(o.value) + '</span><span class="oc__l">' + fmt(o.label) + "</span></li>";
    }).join("") + "</ul>";
  }

  var GLANCE = [["problem", "Problem"], ["approach", "What I did"], ["result", "Result"]];
  function glanceView(list) {
    if (!list || !list.length) return "";
    return '<ol class="gl" aria-label="At a glance">' + list.map(function (it, i) {
      var k = GLANCE[i] || GLANCE[GLANCE.length - 1];
      return '<li class="gl__item gl__item--' + k[0] + '"><span class="gl__icon">' + ICON[k[0]] + '</span><span class="gl__k">' + esc(it.label || k[1]) + '</span><span class="gl__b">' + fmt(it.body) + "</span></li>";
    }).join("") + "</ol>";
  }

  function noteKind(label) {
    if (/took forward|learned|lesson|isn’t an edge case|complements/i.test(label)) return "learn";
    if (/^next|measure|evaluate|change now|do differently/i.test(label)) return "next";
    if (/my part|my role/i.test(label)) return "role";
    return "note";
  }
  function textBlock(body) {
    var m = /^\*\*([^*]+?)\*\*\s*([\s\S]*)$/.exec(String(body || ""));
    if (!m || !m[2]) return '<p class="b-text">' + fmt(body) + "</p>";
    var label = m[1].replace(/[.:]\s*$/, ""), kind = noteKind(label);
    return '<div class="b-note b-note--' + kind + '"><span class="b-note__i">' + ICON[kind] + '</span><p class="b-note__t">' + fmt(label) + '</p><p class="b-note__b">' + fmt(m[2]) + "</p></div>";
  }
  function initials(title) {
    var words = String(title || "").replace(/[(),].*$/, "").trim().split(/\s+/);
    return words.filter(function (w) { return /^[A-Z]/.test(w); }).slice(0, 2).map(function (w) { return w[0]; }).join("") || "•";
  }
  function baView(b) {
    var cols = b.columns || [];
    return '<div class="ba">' + (b.caption ? '<p class="b-table__cap">' + esc(b.caption) + "</p>" : "") +
      '<div class="ba__head" aria-hidden="true"><span></span><span>' + ICON.no + esc(cols[1]) + "</span><span>" + ICON.yes + esc(cols[2]) + "</span></div>" +
      '<ul class="ba__list">' + (b.rows || []).map(function (r) {
        return '<li class="ba__row"><p class="ba__label">' + fmt(r[0]) + "</p>" +
          '<p class="ba__before"><span class="ba__tag">' + ICON.no + esc(cols[1]) + '</span><span class="sr-only">' + esc(cols[1]) + ': </span>' + fmt(r[1]) + "</p>" +
          '<p class="ba__after"><span class="ba__tag">' + ICON.yes + esc(cols[2]) + '</span><span class="sr-only">' + esc(cols[2]) + ': </span>' + fmt(r[2]) + "</p></li>";
      }).join("") + "</ul></div>";
  }

  function block(b, nextFig) {
    switch (b.type) {
      case "text":
        return textBlock(b.body);
      case "callout":
        return '<div class="b-callout"><span class="b-callout__mark" aria-hidden="true">?</span>' + (b.title ? '<p class="b-callout__t">' + esc(b.title) + "</p>" : "") + '<p class="b-callout__b">' + fmt(b.body) + "</p></div>";
      case "steps":
        return (b.title ? '<h3 class="b-h3">' + esc(b.title) + "</h3>" : "") +
          '<ol class="b-steps' + ((b.items || []).length <= 5 ? " b-steps--h" : "") + '" style="--n:' + (b.items || []).length + '">' + (b.items || []).map(function (it) {
            return '<li><span class="b-steps__t">' + esc(it.title) + "</span>" + (it.body ? '<span class="b-steps__b">' + fmt(it.body) + "</span>" : "") + "</li>";
          }).join("") + "</ol>";
      case "principles":
        return (b.title ? '<h3 class="b-h3">' + esc(b.title) + "</h3>" : "") +
          (function () {
            var items = b.items || [], quotes = items.length && items.every(function (it) { return /^“/.test(it.body || ""); });
            var style = b.style === "personas" ? "personas" : quotes ? "quotes" : "cards";
            var cols = items.length <= 3 ? items.length : items.length === 4 ? 2 : 3;
            return '<ul class="b-prin b-prin--' + style + '" style="--c:' + cols + '">' + items.map(function (it) {
              if (style === "quotes") return '<li><span class="b-prin__b">' + fmt(it.body) + '</span><span class="b-prin__t">' + esc(it.title) + "</span></li>";
              return '<li>' + (style === "personas" ? '<span class="b-prin__av" aria-hidden="true">' + esc(initials(it.title)) + "</span>" : "") +
                '<span class="b-prin__txt"><span class="b-prin__t">' + esc(it.title) + '</span><span class="b-prin__b">' + fmt(it.body) + "</span></span></li>";
            }).join("") + "</ul>";
          })();
      case "decisions":
        return (b.title ? '<h3 class="b-h3">' + esc(b.title) + "</h3>" : "") +
          '<ul class="dec">' + (b.items || []).map(function (d) {
            return '<li class="dec__item"><p class="dec__d">' + fmt(d.decision) + "</p>" +
              '<div class="dec__c"><p class="dec__k">Why</p><p>' + fmt(d.why) + "</p></div>" +
              (d.tradeoff ? '<div class="dec__c dec__c--to"><p class="dec__k">Trade-off</p><p>' + fmt(d.tradeoff) + "</p></div>" : "") + "</li>";
          }).join("") + "</ul>";
      case "faq":
        return (b.title ? '<h3 class="b-sub">' + esc(b.title) + "</h3>" : "") + '<div class="b-faq">' + (b.items || []).map(function (it) {
          return '<details class="b-faq__item"><summary class="b-faq__q">' + esc(it.q) + '</summary><div class="b-faq__a">' + fmt(it.a) + "</div></details>";
        }).join("") + "</div>";
      case "facts":
        return '<dl class="b-facts">' + (b.items || []).map(function (it) { return '<div class="b-facts__item"><dt>' + esc(it.label) + "</dt><dd>" + fmt(it.body) + "</dd></div>"; }).join("") + "</dl>";
      case "lists":
        return '<div class="b-lists">' + (b.columns || []).map(function (col) {
          return '<div class="b-lists__col"><h3 class="b-sub">' + esc(col.title) + '</h3><ul class="b-lists__ul">' + (col.items || []).map(function (it) {
            return "<li><span>" + fmt(it[0]) + "</span>" + (it[1] ? '<span class="b-lists__tag">' + esc(it[1]) + "</span>" : "") + "</li>";
          }).join("") + "</ul></div>";
        }).join("") + "</div>";
      case "measure":
        return '<div class="b-measure">' + (b.items || []).map(function (it, i) {
          return '<div class="b-measure__item' + (i === 0 ? " is-key" : "") + '"><p class="b-measure__k">' + esc(it.label) + '</p><p class="b-measure__b">' + fmt(it.body) + "</p></div>";
        }).join("") + "</div>";
      case "table":
        return (b.columns || []).length === 3 && /before/i.test(b.columns[1]) && /after/i.test(b.columns[2]) ? baView(b) : tableView(b);
      case "metrics":
        return outcomesView(b.items, "b-metrics");
      case "visual":
        return figureView(b, nextFig());
      default:
        return "";
    }
  }

  function tableView(b) {
    var id = "tbl-" + (++state.tableN);
    return '<div class="b-table">' + (b.caption ? '<p class="b-table__cap" id="' + id + '">' + esc(b.caption) + "</p>" : "") +
      '<div class="b-table__scroll" tabindex="0" role="region" ' + (b.caption ? 'aria-labelledby="' + id + '"' : 'aria-label="Table"') + ">" +
      "<table><thead><tr>" + (b.columns || []).map(function (c) { return '<th scope="col">' + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      (b.rows || []).map(function (r) {
        return "<tr>" + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + fmt(c) + "</th>" : "<td>" + fmt(c) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div></div>";
  }

  function figureView(b, n) {
    var mock = V.isMock(b.kind);
    var illustrative = b.illustrative != null ? b.illustrative : mock;
    var label = String(b.alt || b.caption || "").replace(/==|\*\*/g, "");
    return '<figure class="fig fig--' + esc(b.kind) + '">' +
      '<div class="fig__canvas"' + (mock ? ' role="img" aria-label="' + esc(label) + '"' : "") + ">" + V.render(b.kind, b.data, b) + "</div>" +
      '<figcaption class="fig__cap"><span class="fig__n">Figure ' + n + "</span><span>" + fmt(b.caption || "") + "</span>" +
      (illustrative ? '<span class="fig__note">Illustrative recreation, not production UI.</span>' : "") + "</figcaption></figure>";
  }

  function nextView(cs) {
    var list = cases(), i = -1, k;
    for (k = 0; k < list.length; k++) if (list[k].slug === cs.slug) i = k;
    var nx = list[(i + 1) % list.length];
    if (!nx || nx.slug === cs.slug) return "";
    var g = groupOf(nx);
    return '<nav class="next" aria-label="Next case study" style="--next:' + esc(caseColor(nx, g)) + '"><div class="wrap"><a class="next__a" href="#/work/' + esc(nx.slug) + '">' +
      '<span class="next__k">Next' + (nx.protected && !isOpen(nx) ? ", password protected" : "") + "</span>" +
      '<span class="next__t">' + esc(nx.title) + '</span><span class="next__g">' + esc(g.company || "") + "</span></a></div></nav>";
  }

  function viewNotFound() {
    return '<section class="sec nf"><div class="wrap">' +
      '<h1 class="cs__title" tabindex="-1">This page doesn’t exist</h1>' +
      '<p class="cs__sum">The link may be out of date. Every case study is listed under All work.</p>' +
      '<p class="nf__cta"><a class="btn btn--primary" href="#/work">See all work</a></p></div></section>';
  }

  /* ---------------------------------------------------------------- unlock */
  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function codeError(code) { var e = new Error(code); e.code = code; return e; }

  // The encrypted file is loaded only when someone tries to unlock, so the
  // home page stays light even though it carries images.
  function loadLocked() {
    if (LOCKED) return Promise.resolve(LOCKED);
    if (state.lockedLoading) return state.lockedLoading;
    state.lockedLoading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "content.locked.js";
      s.onload = function () {
        LOCKED = window.PORTFOLIO_LOCKED || null;
        if (LOCKED) resolve(LOCKED); else { state.lockedLoading = null; reject(codeError("missing")); }
      };
      s.onerror = function () { state.lockedLoading = null; reject(codeError("missing")); };
      document.head.appendChild(s);
    });
    return state.lockedLoading;
  }

  function unlock(password) {
    if (!password) return Promise.reject(codeError("empty"));
    if (!(window.crypto && window.crypto.subtle)) return Promise.reject(codeError("insecure"));
    var subtle = window.crypto.subtle, enc = new TextEncoder(), L = null;
    return loadLocked()
      .then(function (locked) {
        L = locked;
        return subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
      })
      .then(function (base) {
        return subtle.deriveKey({ name: "PBKDF2", salt: b64(L.salt), iterations: L.iterations, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      })
      .then(function (key) {
        return subtle.decrypt({ name: "AES-GCM", iv: b64(L.iv) }, key, b64(L.data)).catch(function () { throw codeError("wrong"); });
      })
      .then(function (plain) {
        var data = JSON.parse(new TextDecoder().decode(plain));
        var map = {};
        (data.caseStudies || []).forEach(function (cs) { map[cs.slug] = cs; });
        state.unlocked = map;
        try { window.sessionStorage.setItem(SESSION_KEY, password); } catch (e) { /* storage unavailable */ }
        return map;
      });
  }

  var UNLOCK_ERRORS = {
    empty: "Enter the password you received.",
    wrong: "That password didn’t work. Check it for typos and try again, or request access by email.",
    insecure: "Unlocking needs a secure connection. Open the site from its https:// address.",
    missing: "Protected content isn’t included in this copy of the site."
  };

  document.addEventListener("submit", function (e) {
    var form = e.target.closest && e.target.closest("form[data-unlock]");
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector("input[type=password]");
    var msg = form.querySelector("[data-unlock-msg]");
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    input.removeAttribute("aria-invalid");
    msg.className = "unlock__msg";
    msg.textContent = "Checking the password…";
    unlock(input.value).then(function () {
      var onCase = state.route && state.route.name === "case";
      render({ force: true, restoreY: onCase ? 0 : window.scrollY });
      announce("Unlocked. The protected case studies are open for this visit.");
      var target = onCase ? document.querySelector(".cs__title") : document.querySelector(".wl__row");
      if (target) target.focus({ preventScroll: !onCase });
    }).catch(function (err) {
      btn.disabled = false;
      msg.className = "unlock__msg is-error";
      msg.textContent = UNLOCK_ERRORS[err && err.code] || UNLOCK_ERRORS.wrong;
      input.setAttribute("aria-invalid", "true");
      input.focus();
      input.select();
    });
  });

  /* ---------------------------------------------------------------- router */
  function parseRoute() {
    var hash = location.hash || "";
    if (hash && hash.indexOf("#/") !== 0) return state.route || { name: "home" };
    var parts = decodeURIComponent(hash.replace(/^#\/?/, "")).split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    if (parts[0] === "work") {
      if (!parts[1]) return { name: "work" };
      if (!findCase(parts[1]) && groupById(parts[1])) return { name: "group", id: parts[1] };
      return { name: "case", slug: parts[1], section: parts[2] || null };
    }
    if (parts[0] === "motion") return { name: "motion" };
    if (HOME_SECTIONS.indexOf(parts[0]) > -1) return { name: "home", section: parts[0] };
    return { name: "notfound" };
  }
  function samePage(a, b) {
    if (!a || !b || a.name !== b.name) return false;
    return a.name === "home" || a.name === "work" || a.name === "motion" || (a.name === "case" && a.slug === b.slug) || (a.name === "group" && a.id === b.id);
  }

  // One Google Analytics page view per page, with the route as a readable path (/work/member-assistant).
  function trackPage() {
    if (typeof window.gtag !== "function") return;
    var path = "/" + String(location.hash || "").replace(/^#\/?/, "");
    window.gtag("event", "page_view", { page_title: document.title, page_location: location.origin + path + location.search, page_path: path });
  }

  function render(opts) {
    opts = opts || {};
    var r = parseRoute();
    var first = !state.route;
    var keep = !opts.force && samePage(state.route, r);
    if (!keep) {
      cleanup();
      state.tableN = 0;
      byId("main").innerHTML = r.name === "home" ? viewHome() : r.name === "work" ? viewWork() : r.name === "group" ? viewGroup(groupById(r.id)) : r.name === "case" ? viewCase(r.slug) : r.name === "motion" ? viewMotion() : viewNotFound();
      mount(r);
      enhance(r);
    }
    state.route = r;
    setTitle(r);
    if (!keep) trackPage();
    setNav(r.name === "motion" ? "motion" : r.name === "case" || r.name === "work" || r.name === "group" ? "work" : navFor(r.section));
    toggleMenu(false);

    if (opts.restoreY != null) { window.scrollTo(0, opts.restoreY); return; }
    if (r.section) { scrollToSection(r, !keep, !first); return; }
    if (!keep) {
      window.scrollTo(0, 0);
      if (!first) { var h1 = document.querySelector("#main h1"); if (h1) h1.focus({ preventScroll: true }); }
    }
  }

  function scrollToSection(r, instant, moveFocus) {
    var el = byId(r.name === "case" ? "sec-" + r.section : r.section);
    if (!el) { if (instant) window.scrollTo(0, 0); return; }
    el.scrollIntoView({ behavior: instant || reduceMotion ? "auto" : "smooth", block: "start" });
    if (moveFocus) {
      var h = el.querySelector("h2");
      if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
  }

  function setTitle(r) {
    var m = C.meta || {}, cs = r.name === "case" ? findCase(r.slug) : null;
    var g = r.name === "group" ? groupById(r.id) : null;
    document.title = cs ? cs.title + " | " + m.name : g ? g.company + " | " + m.name : r.name === "work" ? ((C.work && C.work.allTitle) || "All work") + " | " + m.name : r.name === "motion" ? ((C.motion && C.motion.title) || "In-app motion") + " | " + m.name : r.name === "notfound" ? "Page not found | " + m.name : m.name + ", " + m.role;
  }

  // The home page's selected-work section belongs to the Work link.
  function navFor(id) { return id === "selected" ? "work" : id; }

  function setNav(id) {
    var links = document.querySelectorAll("[data-nav]");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-nav") === id) links[i].setAttribute("aria-current", "true");
      else links[i].removeAttribute("aria-current");
    }
  }

  function setToc(id) {
    var links = document.querySelectorAll(".toc__a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-sec") === id) links[i].setAttribute("aria-current", "true");
      else links[i].removeAttribute("aria-current");
    }
  }

  /* --------------------------------------------- after-render behaviors */
  function observe(elements, onActive) {
    if (!("IntersectionObserver" in window) || !elements.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) onActive(en.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    elements.forEach(function (el) { io.observe(el); });
    state.observers.push(io);
  }
  function cleanup() {
    state.observers.forEach(function (io) { io.disconnect(); });
    state.observers = [];
  }

  function mount(r) {
    if (r.name === "home") {
      // One orchestrated moment: the first claim's evidence is highlighted in.
      var region = document.querySelector(".ev__region.is-entering");
      if (region) window.setTimeout(function () { region.classList.remove("is-entering"); }, reduceMotion ? 0 : 450);
      observe(HOME_SECTIONS.map(byId).filter(Boolean), function (id) { setNav(navFor(id)); });
      progress.show(false);
    } else if (r.name === "case") {
      observe([].slice.call(document.querySelectorAll(".cs__sec")), function (id) { setToc(id.replace(/^sec-/, "")); });
      progress.show(true);
    } else {
      progress.show(false);
    }
  }

  function toggleEvidence(btn) {
    var open = btn.getAttribute("aria-expanded") === "true";
    var region = byId(btn.getAttribute("aria-controls"));
    if (!region) return;
    btn.setAttribute("aria-expanded", String(!open));
    if (open) { region.hidden = true; return; }
    region.classList.add("is-entering");
    region.hidden = false;
    nextFrame(function () { region.classList.remove("is-entering"); });
  }

  function toggleMenu(force) {
    var btn = document.querySelector(".menu-btn"), nav = byId("site-nav");
    if (!btn || !nav) return;
    var open = typeof force === "boolean" ? force : btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  function openLightbox(img) {
    var d = byId("lightbox");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "lightbox";
      d.className = "lightbox";
      d.setAttribute("aria-label", "Full-size image");
      d.innerHTML = '<div class="lightbox__bar"><button class="btn btn--ghost lightbox__close" type="button">Close</button></div><div class="lightbox__body"><img alt=""></div>';
      d.addEventListener("click", function (ev) { if (ev.target === d || ev.target.closest(".lightbox__close")) d.close(); });
      document.body.appendChild(d);
    }
    var big = d.querySelector(".lightbox__body img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
  }

  /* ---------------------------------------------------------------- motion */
  var fine = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var motionObs = null, clockTimer = null;
  var floater = null, fx = 0, fy = 0, tx = 0, ty = 0, vx = 0, rafId = 0, floatOn = false, preloaded = false;
  function enhance() {
    if (motionObs) { motionObs.disconnect(); motionObs = null; }
    enhanceMotion();
    if (floater) { floatOn = false; floater.classList.remove("is-on"); }
    var stages = document.querySelectorAll("#main .v-stage");
    if (stages.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) [].forEach.call(stages, function (s) { s.classList.add("is-in"); });
      else {
        motionObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); motionObs.unobserve(e.target); } }); }, { threshold: 0.3 });
        [].forEach.call(stages, function (s) { motionObs.observe(s); });
      }
    }
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
    var clk = document.querySelector("[data-clock]");
    if (clk) {
      var tick = function () { try { clk.textContent = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date()); } catch (e) { clk.textContent = "daytime"; } };
      tick(); clockTimer = setInterval(tick, 30000);
    }
    var w = document.querySelector(".wipe.is-covering");
    if (w) requestAnimationFrame(function () { w.classList.remove("is-covering"); w.classList.add("is-leaving"); setTimeout(function () { w.classList.remove("is-leaving"); }, 560); });
  }

  // A preview that follows the cursor over the project index, tilting with its speed.
  function ensureFloater() {
    if (floater) return floater;
    floater = document.createElement("div"); floater.className = "floater"; floater.setAttribute("aria-hidden", "true");
    floater.innerHTML = '<img alt="" decoding="async"><span class="floater__tag">Open case study</span>';
    document.body.appendChild(floater); return floater;
  }
  function floatLoop() {
    fx += (tx - fx) * 0.16; fy += (ty - fy) * 0.16; var dx = tx - fx; vx += (dx - vx) * 0.2;
    var rot = Math.max(-7, Math.min(7, vx * 0.09));
    floater.style.transform = "translate3d(" + (fx + 28) + "px," + (fy - floater.offsetHeight / 2) + "px,0) rotate(" + rot.toFixed(2) + "deg)";
    rafId = (floatOn || Math.abs(dx) > 0.5) ? requestAnimationFrame(floatLoop) : 0;
  }
  if (fine && !reduceMotion) {
    document.documentElement.classList.add("has-floater");
    document.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; if (floatOn && !rafId) rafId = requestAnimationFrame(floatLoop); }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var row = e.target.closest && e.target.closest(".ix__row[data-preview]"); if (!row) return;
      if (!preloaded) { preloaded = true; [].forEach.call(document.querySelectorAll(".ix__row[data-preview]"), function (r) { var im = new Image(); im.src = r.getAttribute("data-preview"); }); }
      var f = ensureFloater(), img = f.querySelector("img");
      if (img.getAttribute("src") !== row.getAttribute("data-preview")) img.setAttribute("src", row.getAttribute("data-preview"));
      f.style.setProperty("--proj", row.style.getPropertyValue("--proj"));
      if (!floatOn) { fx = tx = e.clientX; fy = ty = e.clientY; vx = 0; }
      floatOn = true; f.classList.add("is-on"); if (!rafId) rafId = requestAnimationFrame(floatLoop);
    });
    document.addEventListener("pointerout", function (e) {
      var row = e.target.closest && e.target.closest(".ix__row[data-preview]");
      if (!row || (e.relatedTarget && row.contains(e.relatedTarget))) return;
      floatOn = false; if (floater) floater.classList.remove("is-on");
    });
  }

  // A wipe in the project's color when opening a case study.
  document.addEventListener("click", function (e) {
    if (reduceMotion || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a.ix__row, a.next__a"); if (!a) return;
    var href = a.getAttribute("href"); if (!href || href.charAt(0) !== "#") return;
    e.preventDefault();
    var nav = a.closest(".next"), color = (a.style.getPropertyValue("--proj") || (nav ? nav.style.getPropertyValue("--next") : "") || "#000").trim();
    var w = document.querySelector(".wipe");
    if (!w) { w = document.createElement("div"); w.className = "wipe"; w.setAttribute("aria-hidden", "true"); document.body.appendChild(w); }
    w.style.background = color; w.classList.remove("is-leaving"); void w.offsetWidth; w.classList.add("is-covering");
    setTimeout(function () { if (location.hash === href) render({ force: true }); else location.hash = href; }, 380);
  });

  // Spec stickers in the intro can be picked up and moved.
  var drag = null;
  document.addEventListener("pointerdown", function (e) {
    var s = e.target.closest && e.target.closest(".stk__i"); if (!s) return;
    e.preventDefault(); try { s.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    drag = { el: s, x: e.clientX, y: e.clientY, dx: parseFloat(s.getAttribute("data-dx") || 0), dy: parseFloat(s.getAttribute("data-dy") || 0), nx: 0, ny: 0 };
    s.classList.add("is-drag");
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    drag.nx = drag.dx + e.clientX - drag.x; drag.ny = drag.dy + e.clientY - drag.y;
    drag.el.style.translate = drag.nx + "px " + drag.ny + "px";
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    document.addEventListener(t, function () {
      if (!drag) return;
      drag.el.setAttribute("data-dx", drag.nx || drag.dx); drag.el.setAttribute("data-dy", drag.ny || drag.dy);
      drag.el.classList.remove("is-drag"); drag = null;
    });
  });

  /* --------------------------------------------------------- in-app motion studies */
  var EASE = { std: "cubic-bezier(.2,0,0,1)", enter: "cubic-bezier(.05,.7,.1,1)", exit: "cubic-bezier(.3,0,.8,.15)", settle: "cubic-bezier(.34,1.56,.64,1)", slide: "cubic-bezier(.3,1.25,.5,1)" };
  function A(el, kf, d, at, e, sp, fill) { if (!el) return null; return el.animate(kf, { duration: d / sp, delay: at / sp, easing: EASE[e] || e || EASE.std, fill: fill || "both" }); }
  var IN = function (y, s) { return [{ opacity: 0, transform: "translateY(" + (y || 12) + "px)" + (s ? " scale(" + s + ")" : "") }, { opacity: 1, transform: "none" }]; };
  var FADE_OUT = [{ opacity: 1 }, { opacity: 0 }];
  var CK = '<svg viewBox="0 0 20 20" class="mui__ck" aria-hidden="true"><path d="M5 10.5l3.3 3.3L15 7" pathLength="1"/></svg>';
  function tap(stage, target, at, sp) {
    var t = stage.querySelector(".mui__tap"); if (!t || !target) return;
    var s = stage.getBoundingClientRect(), r = target.getBoundingClientRect();
    t.style.left = (r.left - s.left + r.width / 2) + "px"; t.style.top = (r.top - s.top + r.height / 2) + "px";
    t.animate([{ opacity: .35, transform: "scale(.3)" }, { opacity: 0, transform: "scale(1.5)" }], { duration: 420 / sp, delay: at / sp, easing: EASE.std, fill: "both" });
  }
  var DEMOS = {
    message: {
      html: '<div class="mui mui--phone"><div class="mui__bar"><span class="mui__av">AI</span><b>Care assistant</b></div><div class="mui__cv">' +
        '<p class="mui__b mui__b--m" data-k="m1">I need a dermatologist near me.</p>' +
        '<div class="mui__slot"><p class="mui__typing" data-k="ty"><i></i><i></i><i></i></p><p class="mui__b" data-k="a1">I found 3 in-network dermatologists within 5 miles.</p></div>' +
        '<div class="mui__card" data-k="c1"><b>Dr. Ana Rivera</b><span>Next opening Thu, 9:30 AM</span><span class="mui__row"><em class="mui__ok">In network</em><span class="mui__btn">Book</span></span></div>' +
        '<p class="mui__qr" data-k="qr"><span>Show 2 more</span><span>Other times</span><span>Talk to a person</span></p>' +
        '</div><div class="mui__comp"><span>Type a message</span><i></i></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("m1"), IN(12, .96), 240, 0, "enter", sp);
        A(q("ty"), [{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }], 160, 420, "std", sp);
        [].forEach.call(q("ty").children, function (d, i) { d.animate([{ transform: "none" }, { transform: "translateY(-4px)" }, { transform: "none" }], { duration: 560 / sp, delay: (560 + i * 120) / sp, iterations: 2, easing: EASE.std }); });
        A(q("ty"), FADE_OUT, 120, 1720, "exit", sp, "forwards");
        A(q("a1"), IN(12, .96), 240, 1760, "enter", sp);
        A(q("c1"), IN(16), 280, 1960, "enter", sp);
        [].forEach.call(q("qr").children, function (c, i) { A(c, IN(8), 200, 2240 + i * 60, "enter", sp); });
        return 2700;
      }
    },
    booking: {
      html: '<div class="mui mui--phone"><div class="mui__bar"><span class="mui__back">‹</span><b>Book a visit</b></div><div class="mui__cv">' +
        '<p class="mui__lbl">Dr. Ana Rivera, Thursday, Oct 15</p>' +
        '<div class="mui__slots"><span class="off">8:30 AM</span><span data-k="s">9:30 AM</span><span>11:00 AM</span><span>1:45 PM</span><span class="off">3:30 PM</span><span>4:15 PM</span></div>' +
        '<span class="mui__cta" data-k="cta"><span data-k="l1">Choose a time</span><span class="mui__cta-l2" data-k="l2">Book Thu at 9:30 AM</span><span class="mui__spin" data-k="sp"></span><span class="mui__done" data-k="ck">' + CK + "</span></span>" +
        '<div class="mui__card mui__confirm" data-k="cf"><b>You’re booked</b><span>Thu, Oct 15 at 9:30 AM with Dr. Ana Rivera, Downtown clinic</span></div>' +
        '</div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var cta = q("cta"), w = cta.offsetWidth;
        tap(s, q("s"), 380, sp);
        A(q("s"), [{ backgroundColor: "#FFFFFF", color: "#15233B", borderColor: "#7C8698" }, { backgroundColor: "#15233B", color: "#FFFFFF", borderColor: "#15233B" }], 140, 500, "std", sp);
        A(cta, [{ backgroundColor: "#E8ECF2", color: "#7C8698" }, { backgroundColor: "#15233B", color: "#FFFFFF" }], 200, 600, "std", sp);
        A(q("l1"), FADE_OUT, 100, 600, "exit", sp, "forwards");
        A(q("l2"), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 160, 680, "enter", sp);
        tap(s, cta, 1500, sp);
        A(q("l2"), FADE_OUT, 100, 1620, "exit", sp, "forwards");
        A(cta, [{ width: w + "px" }, { width: "48px" }], 260, 1620, "std", sp);
        A(q("sp"), [{ opacity: 0 }, { opacity: 1 }], 120, 1800, "std", sp);
        q("sp").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(540deg)" }], { duration: 700 / sp, delay: 1800 / sp, easing: "linear" });
        A(q("sp"), FADE_OUT, 100, 2420, "exit", sp, "forwards");
        A(cta, [{ backgroundColor: "#15233B" }, { backgroundColor: "#1B6E45" }], 200, 2420, "std", sp, "forwards");
        A(q("ck").querySelector("path"), [{ strokeDashoffset: "1px" }, { strokeDashoffset: "0px" }], 240, 2460, "settle", sp);
        A(q("cf"), IN(20), 280, 2720, "enter", sp);
        return 3300;
      }
    },
    steps: {
      html: '<div class="mui mui--desk"><div class="mui__steps">' +
        '<span class="mui__st done"><i>' + CK + '</i>Member</span><span class="mui__ln full"></span>' +
        '<span class="mui__st cur" data-k="s2"><i data-k="s2i"><b data-k="s2n">2</b><span data-k="s2c">' + CK + '</span></i>Clinical</span><span class="mui__ln"><b data-k="ln"></b></span>' +
        '<span class="mui__st up" data-k="s3"><i data-k="s3i">3</i>Documents</span><span class="mui__ln"></span><span class="mui__st up"><i>4</i>Review</span></div>' +
        '<div class="mui__reqs"><div class="mui__req"><span class="mui__ok2">' + CK + '</span>Clinical notes, last 60 days<em>Complete</em></div><div class="mui__req"><span class="mui__ok2">' + CK + '</span>Imaging history<em>Complete</em></div>' +
        '<div class="mui__req mui__req--miss" data-k="r3"><span class="mui__ri"><b data-k="ri1">i</b><span class="mui__ok2" data-k="ri2">' + CK + '</span></span>Prior treatment, with dates<em class="mui__w"><span data-k="w1">Missing</span><span data-k="w2">Complete</span></em></div></div>' +
        '<p class="mui__badge" data-k="bd">Clinical information complete</p></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("r3"), [{ backgroundColor: "#FFFFFF", borderColor: "#7C8698" }, { backgroundColor: "#E3F4EA", borderColor: "#E3F4EA" }], 200, 420, "std", sp);
        A(q("ri1"), [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.6)" }], 120, 400, "exit", sp);
        A(q("ri2"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 480, "settle", sp);
        A(q("w1"), FADE_OUT, 100, 400, "exit", sp);
        A(q("w2"), [{ opacity: 0 }, { opacity: 1 }], 160, 480, "std", sp);
        A(q("s2n"), [{ opacity: 1 }, { opacity: 0 }], 100, 1000, "exit", sp);
        A(q("s2c"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 1060, "settle", sp);
        A(q("s2i"), [{ backgroundColor: "#15233B" }, { backgroundColor: "#1B6E45" }], 200, 1000, "std", sp);
        A(q("ln"), [{ width: "0%" }, { width: "100%" }], 320, 1200, "std", sp);
        A(q("s3i"), [{ backgroundColor: "#FFFFFF", color: "#5B6677", borderColor: "#7C8698" }, { backgroundColor: "#15233B", color: "#FFFFFF", borderColor: "#15233B" }], 160, 1480, "std", sp);
        A(q("s3"), [{ color: "#5B6677" }, { color: "#15233B" }], 160, 1480, "std", sp);
        A(q("bd"), IN(8), 240, 1700, "enter", sp);
        return 2300;
      }
    },
    flag: {
      html: '<div class="mui mui--desk"><div class="mui__flag" data-k="pn"><div class="mui__frow"><span class="mui__risk" data-k="rk">Rising risk: type 2 diabetes</span>' +
        '<span class="mui__conf"><i data-k="b1"></i><i data-k="b2"></i><i class="off"></i>Moderate confidence</span><span class="mui__date" data-k="dt">Data through Oct 2</span></div>' +
        '<p class="mui__stmt">Associated with a higher risk. This is not a diagnosis.</p>' +
        [["A1C rising", "5.9% to 6.3%", 80], ["Fasting glucose above range", "118 mg/dL", 55], ["BMI", "31.2", 50], ["Family history", "Parent", 28]].map(function (f, i) {
          return '<div class="mui__fact" data-k="f' + i + '"><span class="mui__row"><b>' + f[0] + "</b><span>" + f[1] + '</span></span><span class="mui__track"><i data-k="t' + i + '" style="width:' + f[2] + '%"></i></span></div>';
        }).join("") + "</div></div>",
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("pn"), IN(8), 240, 0, "enter", sp);
        A(q("rk"), [{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, transform: "none" }], 280, 200, "settle", sp);
        A(q("b1"), [{ backgroundColor: "#EEF2F7" }, { backgroundColor: "#15233B" }], 160, 420, "std", sp);
        A(q("b2"), [{ backgroundColor: "#EEF2F7" }, { backgroundColor: "#15233B" }], 160, 500, "std", sp);
        A(q("dt"), [{ opacity: 0 }, { opacity: 1 }], 160, 640, "std", sp);
        for (var i = 0; i < 4; i++) {
          A(q("f" + i), [{ opacity: 0 }, { opacity: 1 }], 160, 760 + i * 90, "std", sp);
          var t = q("t" + i); A(t, [{ width: "0%" }, { width: t.style.width }], 480, 800 + i * 90, "enter", sp);
        }
        return 1900;
      }
    },
    live: {
      html: '<div class="mui mui--desk mui--fin"><div class="mui__frow mui__frow--sp"><b>Portfolio against the BSE 500</b><span class="mui__pause" data-k="pz">Paused. Last update 10:42 AM</span></div>' +
        '<svg class="mui__chart" viewBox="0 0 480 210" aria-hidden="true"><path class="mui__grid" d="M0 50H480M0 100H480M0 150H480"/>' +
        '<path class="mui__bench" d="M8 168L74 160L140 156L206 148L272 142L338 134L404 128"/>' +
        '<path class="mui__line" data-k="ln" pathLength="1" d="M8 176L74 140L140 154L206 110L272 124L338 82L404 96"/>' +
        '<path class="mui__line" data-k="ext" pathLength="1" d="M404 96L470 62"/>' +
        '<line class="mui__x" data-k="x" x1="272" x2="272" y1="12" y2="198"/><circle class="mui__pt" data-k="pt" cx="272" cy="124" r="5"/>' +
        '<g data-k="tp"><rect x="284" y="78" width="118" height="40" rx="7" class="mui__tipbg"/><text x="296" y="95" class="mui__tipk">Sep 14</text><text x="296" y="110" class="mui__tipv">₹11,08,240</text></g>' +
        '<circle class="mui__pt mui__pt--new" data-k="np" cx="470" cy="62" r="5"/></svg>' +
        '<p class="mui__hint" data-k="hn">The tooltip stays on its point while new data arrives</p></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("ln"), [{ strokeDashoffset: "1px" }, { strokeDashoffset: "0px" }], 900, 0, "std", sp);
        A(q("x"), [{ opacity: 0 }, { opacity: 1 }], 160, 1000, "std", sp);
        A(q("pt"), [{ opacity: 0 }, { opacity: 1 }], 160, 1000, "std", sp);
        A(q("tp"), [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 200, 1040, "enter", sp);
        A(q("ext"), [{ strokeDashoffset: "1px" }, { strokeDashoffset: "0px" }], 420, 1700, "std", sp);
        A(q("np"), [{ opacity: 0, transform: "scale(.3)" }, { opacity: 1, transform: "none" }], 280, 2080, "settle", sp);
        A(q("hn"), [{ opacity: 0 }, { opacity: 1 }], 200, 2140, "std", sp);
        A(q("pz"), IN(6), 220, 2800, "enter", sp);
        A(q("ln"), [{ stroke: "#0F7A52" }, { stroke: "#8C9099" }], 300, 2800, "std", sp, "forwards");
        A(q("ext"), [{ stroke: "#0F7A52" }, { stroke: "#8C9099" }], 300, 2800, "std", sp, "forwards");
        return 3400;
      }
    },
    range: {
      html: '<div class="mui mui--desk mui--fin"><div class="mui__frow mui__frow--sp"><b>BSE 500 portfolio</b><span class="mui__seg"><span class="mui__thumb" data-k="th"></span><span>1M</span><span class="on" data-k="t3">3M</span><span>6M</span><span data-k="ty">1Y</span></span></div>' +
        '<svg class="mui__chart mui__chart--sm" viewBox="0 0 480 150" aria-hidden="true"><path class="mui__grid" d="M0 40H480M0 80H480M0 120H480"/>' +
        '<path class="mui__line mui__line--a" data-k="pa" d="M8 120L80 104L152 110L224 80L296 88L368 60L472 48"/><path class="mui__line mui__line--b" data-k="pb" d="M8 136L60 128L112 118L164 122L216 100L268 104L320 76L372 70L424 52L472 30"/></svg>' +
        '<div class="mui__holds"><div class="mui__hold" data-k="h1"><b>HDFC Bank</b><span>₹1,86,240</span><em>+8.6%</em></div><div class="mui__hold"><b>ICICI Bank</b><span>₹1,37,280</span><em>+5.3%</em></div><div class="mui__hold"><b>Infosys</b><span>₹1,50,800</span><em>+2.6%</em></div></div>' +
        '<div class="mui__scrim" data-k="sc"></div><div class="mui__panel" data-k="pl"><b>HDFC Bank</b><span>120 shares, avg ₹1,420</span><span>Value ₹1,86,240, +8.6%</span><span class="mui__btn">Close</span></div>' +
        '<span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var dx = q("ty").offsetLeft - q("t3").offsetLeft;
        tap(s, q("ty"), 380, sp);
        A(q("th"), [{ transform: "none" }, { transform: "translateX(" + dx + "px)" }], 300, 500, "slide", sp);
        A(q("t3"), [{ color: "#FFFFFF" }, { color: "#5B6677" }], 160, 560, "std", sp);
        A(q("ty"), [{ color: "#5B6677" }, { color: "#FFFFFF" }], 160, 560, "std", sp);
        A(q("pa"), [{ opacity: 1 }, { opacity: 0 }], 160, 600, "exit", sp);
        A(q("pb"), [{ opacity: 0, transform: "scaleY(.94)" }, { opacity: 1, transform: "none" }], 300, 680, "enter", sp);
        tap(s, q("h1"), 1500, sp);
        A(q("h1"), [{ backgroundColor: "#FFFFFF" }, { backgroundColor: "#E7F3EC" }], 120, 1560, "std", sp);
        A(q("sc"), [{ opacity: 0 }, { opacity: 1 }], 240, 1660, "std", sp);
        A(q("pl"), [{ transform: "translateX(100%)" }, { transform: "none" }], 320, 1660, "enter", sp);
        A(q("pl"), [{ transform: "none" }, { transform: "translateX(100%)" }], 240, 3300, "exit", sp, "forwards");
        A(q("sc"), [{ opacity: 1 }, { opacity: 0 }], 200, 3300, "std", sp, "forwards");
        return 3700;
      }
    }
  };
  function curveSvg(b) {
    var x1 = b[0] * 120, y1 = 80 - b[1] * 80, x2 = b[2] * 120, y2 = 80 - b[3] * 80;
    return '<svg class="mo-curve" viewBox="-6 -28 132 116" aria-hidden="true"><path class="mo-curve__axis" d="M0 80H120M0 80V-20"/><path class="mo-curve__line" d="M0 80C' + x1 + " " + y1 + " " + x2 + " " + y2 + ' 120 0"/></svg>';
  }
  function viewMotion() {
    var M = C.motion || {}, T = M.tokens || {};
    return '<article class="cs mo-page" style="--proj:' + esc(M.color || "#C8321E") + '"><header class="cv"><div class="wrap cv__in">' +
      '<a class="back cv__back" href="#/">' + ICON.back + "<span>Home</span></a>" +
      '<p class="cv__co"><span>' + esc(M.kicker || "Motion studies") + "</span></p>" +
      '<h1 class="cv__title" tabindex="-1">' + esc(M.title || "In-app motion") + '</h1><p class="cv__sum">' + fmt(M.summary || "") + "</p></div></header>" +
      '<div class="wrap mo-body">' +
      '<section class="mo-tokens" aria-labelledby="mo-tok"><h2 class="cs__h2" id="mo-tok">' + esc(T.title || "The motion system") + "</h2>" +
      '<dl class="mo-dur">' + (T.durations || []).map(function (d) { return '<div><dt>' + esc(d[0]) + '</dt><dd><span class="mo-dur__v">' + esc(d[1]) + "</span>" + esc(d[2]) + "</dd></div>"; }).join("") + "</dl>" +
      '<ul class="mo-ease">' + (T.easings || []).map(function (e) { return "<li>" + curveSvg(e[3]) + '<p class="mo-ease__n">' + esc(e[0]) + '</p><p class="mo-ease__d">' + esc(e[2]) + "</p><code>" + esc(e[1]) + "</code></li>"; }).join("") + "</ul>" +
      (T.reduced ? '<p class="mo-reduced"><strong>Reduced motion.</strong> ' + esc(T.reduced) + "</p>" : "") + "</section>" +
      (M.note ? '<p class="cs__note mo-note">' + esc(M.note) + "</p>" : "") +
      '<div class="mo-grid">' + (M.demos || []).map(function (d) {
        var def = DEMOS[d.id]; if (!def) return "";
        return '<figure class="mo" data-demo="' + esc(d.id) + '"><div class="mo__stage">' + def.html + "</div>" +
          '<figcaption class="mo__cap"><p class="mo__ctx">' + esc(d.context || "") + '</p><h2 class="mo__t">' + esc(d.title) + '</h2><p class="mo__p">' + esc(d.purpose || "") + "</p>" +
          '<div class="mo__ctl"><button type="button" class="mo__play">Play</button><button type="button" class="mo__slow" aria-pressed="false">Slow motion</button></div>' +
          '<dl class="mo__spec">' + (d.spec || []).map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl></figcaption></figure>";
      }).join("") + "</div></div></article>";
  }
  var moTimers = [], moObs = null;
  function playDemo(fig, auto) {
    var def = DEMOS[fig.getAttribute("data-demo")]; if (!def) return;
    var stage = fig.querySelector(".mo__stage");
    clearTimeout(fig._loop);
    if (stage.getAnimations) stage.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
    stage.innerHTML = def.html;
    var sp = reduceMotion && !auto ? 40 : fig.classList.contains("is-slow") ? 0.25 : 1;
    var total = def.play(stage, sp) / sp;
    if (!reduceMotion) fig._loop = setTimeout(function () { if (fig._vis && document.visibilityState !== "hidden") playDemo(fig, true); }, total + 2600);
    moTimers.push(fig._loop);
  }
  function enhanceMotion() {
    moTimers.forEach(clearTimeout); moTimers = [];
    if (moObs) { moObs.disconnect(); moObs = null; }
    var figs = document.querySelectorAll("#main .mo"); if (!figs.length || reduceMotion || !("IntersectionObserver" in window)) return;
    moObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var f = e.target; var was = f._vis; f._vis = e.isIntersecting; if (e.isIntersecting && !was) playDemo(f, true); if (!e.isIntersecting) clearTimeout(f._loop); });
    }, { threshold: 0.45 });
    [].forEach.call(figs, function (f) { moObs.observe(f); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".mo__play, .mo__slow"); if (!b) return;
    var fig = b.closest(".mo"); if (!fig) return;
    if (b.classList.contains("mo__slow")) { var on = !fig.classList.contains("is-slow"); fig.classList.toggle("is-slow", on); b.setAttribute("aria-pressed", String(on)); }
    playDemo(fig, false);
  });

  // Reading mode: a visual tour by default, the full story on request.
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".mode__b"); if (!b) return;
    var mode = b.getAttribute("data-mode") === "story" ? "story" : "tour";
    try { window.sessionStorage.setItem("portfolio-mode", mode); } catch (err) { /* storage unavailable */ }
    var art = document.querySelector("article.cs"); if (art) art.classList.toggle("cs--story", mode === "story");
    [].forEach.call(document.querySelectorAll(".mode .mode__b"), function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-mode") === mode)); });
    announce(mode === "story" ? "Showing the full story" : "Showing the visual tour");
    if (b.closest(".tour-end")) { var top = document.querySelector(".cs__top"); if (top) top.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }
  });

  document.addEventListener("click", function (e) {
    var zoom = e.target.closest(".v-zoom");
    if (zoom) { var shot = zoom.querySelector("img"); if (shot) openLightbox(shot); return; }
    var claim = e.target.closest(".ev__claim");
    if (claim) { toggleEvidence(claim); return; }
    if (e.target.closest(".menu-btn")) { toggleMenu(); return; }
    // Re-clicking a link to where you already are still scrolls there.
    var a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute("href") === location.hash) {
      e.preventDefault();
      toggleMenu(false);
      var r = parseRoute();
      if (r.section) scrollToSection(r, false, true);
      else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var btn = document.querySelector(".menu-btn");
      if (btn && btn.getAttribute("aria-expanded") === "true") { toggleMenu(false); btn.focus(); }
    }
  });

  var progress = (function () {
    var el = null, bar = null, on = false, ticking = false;
    function update() {
      ticking = false;
      var root = document.documentElement;
      var hdr = byId("site-header");
      if (hdr) hdr.classList.toggle("is-scrolled", root.scrollTop > 8);
      if (!on || !bar) return;
      var max = root.scrollHeight - root.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, root.scrollTop / max) : 0) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    return {
      show: function (v) {
        el = el || byId("progress");
        bar = bar || (el && el.firstElementChild);
        on = v;
        if (el) el.hidden = !v;
        update();
      }
    };
  })();

  /* ----------------------------------------------------------------- start */
  function init() {
    renderHeader();
    renderFooter();
    window.addEventListener("hashchange", function () {
      if (location.hash && location.hash.indexOf("#/") !== 0) return; // plain anchors such as the skip link
      render();
    });
    render();
    if (document.fonts && document.fonts.ready && state.route && state.route.section) {
      document.fonts.ready.then(function () { if (state.route.section) scrollToSection(state.route, true, false); });
    }
    var saved = null;
    try { saved = window.sessionStorage.getItem(SESSION_KEY); } catch (e) { /* storage unavailable */ }
    if (saved) {
      unlock(saved).then(function () {
        if (!state.route || state.route.name === "notfound") return;
        render({ force: true, restoreY: window.scrollY });
      }).catch(function () {
        try { window.sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
      });
    }
  }

  init();
})();
