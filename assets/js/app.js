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
    return heroView() + '<div class="curtain">' + toolsView() + impactView() + approachView() + leadershipView() + beliefView() + thinkingView() + aboutView() + contactView() + "</div>";
  }

  function heroView() {
    var h = C.hero || {}, L = h.liquid || {}, words = L.words || ["Decisions", "have", "weight."], k = 0;
    var chars = words.map(function (w) {
      return '<span class="lq__word">' + Array.from(w).map(function (ch) { k++; return '<span class="lq__w"><span class="lq__c">' + esc(ch) + "</span></span>"; }).join("") + "</span>";
    }).join("");
    var dots = (L.dots || []).map(function (c) { return '<i style="background:' + esc(c) + '"></i>'; }).join("");
    return '<div class="lq-wrap"><section class="lq" aria-labelledby="hero-title"><canvas class="lq__cv" aria-hidden="true"></canvas>' +
      '<div class="lq__in"><h1 class="lq__t" id="hero-title"><span class="sr-only">' + esc(words.join(" ")) + '</span><span class="lq__chars" aria-hidden="true">' + chars + "</span></h1>" +
      '<p class="lq__sub" data-reveal>' + fmt(L.subtitle || h.summary || "") + "</p>" +
      '<div class="lq__btns" data-reveal><a class="btn btn--primary" href="#/work">' + esc(L.primary || "See the work") + '</a><a class="btn lq__btn2" href="#/motion">' + esc(L.secondary || "In-app motion") + "</a></div>" +
      (L.proof ? '<p class="lq__proof" data-reveal><span class="lq__dots" aria-hidden="true">' + dots + "</span><span>" + fmt(L.proof) + "</span></p>" : "") +
      (L.hintPointer ? '<p class="lq__hint" data-reveal><span class="lq__hint--fine">' + esc(L.hintPointer) + '</span><span class="lq__hint--touch">' + esc(L.hintTouch || "") + "</span></p>" : "") +
      '</div><p class="lq__now"><span class="intro__dot" aria-hidden="true"></span>It’s <span data-clock>now</span> in Boston</p></section></div>';
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
    return '<li class="ix__item" data-tags="' + esc((o.tags || []).join(" ")) + '"><a class="ix__row" href="' + o.href + '" style="--proj:' + esc(o.color || "#2C3340") + '"' + (o.preview ? ' data-preview="' + esc(safeUrl(o.preview)) + '"' : "") + ">" +
      '<span class="ix__when">' + esc(o.when || "") + "</span>" +
      '<span class="ix__main"><span class="ix__name">' + esc(o.title) + '</span><span class="ix__co">' + (o.meta || "") + "</span></span>" +
      thumb(o.src, o.cover) + "</a></li>";
  }
  function indexItems(list) {
    return list.map(function (id) {
      if (id === "motion") { var M = C.motion || {}; return indexRow({ href: "#/motion", color: M.color || "#C8321E", when: M.indexWhen || "Studies", title: M.indexTitle || "In-app motion", meta: esc(M.indexMeta || ""), src: M.preview, cover: "flow", preview: M.preview, tags: M.tags }); }
      var g = groupById(id);
      if (g) return indexRow({ href: "#/work/" + g.id, color: g.color, when: g.indexWhen || g.period, title: g.indexTitle || g.title || g.company,
        meta: esc(g.indexMeta || g.company) + (state.unlocked ? "" : ' <span class="ix__lock">' + ICON.lock + "Password protected</span>"), cover: g.cover || "chat", preview: g.preview, tags: g.tags });
      var cs = findCase(id); if (!cs) return "";
      var gg = groupOf(cs);
      return indexRow({ href: "#/work/" + cs.slug, color: cs.color, when: cs.indexWhen || gg.period || "", title: cs.indexTitle || cs.title, meta: esc(cs.indexMeta || gg.company || ""), src: cs.coverImage, cover: cs.cover, preview: cs.preview, tags: cs.tags });
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

  function impactView() {
    var I = C.impact || {}; if (!(I.items || []).length) return "";
    return '<section class="sec impact" aria-labelledby="impact-h"><div class="wrap"><h2 class="ix__h" id="impact-h">' + esc(I.title || "Impact") + "</h2>" +
      '<ul class="impact__list">' + I.items.map(function (x) {
        return '<li class="impact__i" style="--proj:' + esc(x.color || "#000000") + '"><span class="impact__v"><span class="sr-only">' + esc(x.value) + '</span><span class="impact__num" aria-hidden="true">' + esc(x.value) + '</span></span><span class="impact__l">' + esc(x.label) + '</span><span class="impact__s">' + esc(x.source) + "</span></li>";
      }).join("") + "</ul>" + (I.note ? '<p class="impact__n">' + esc(I.note) + "</p>" : "") + "</div></section>";
  }
  function leadershipView() {
    var L = C.leadership || {}; if (!(L.items || []).length) return "";
    return '<section class="sec lead" id="leadership" aria-labelledby="lead-h"><div class="wrap"><div class="lead__head"><h2 class="sec__title" id="lead-h">' + esc(L.title || "Leadership") + '</h2><p class="lead__intro">' + fmt(L.intro || "") + "</p></div>" +
      '<ol class="lead__list">' + L.items.map(function (x) {
        return '<li class="lead__i"><div><h3 class="lead__t">' + esc(x.title) + '</h3><p class="lead__m">' + esc(x.meta || "") + '</p></div><p class="lead__b">' + fmt(x.body) + "</p></li>";
      }).join("") + "</ol>" + (L.closing ? '<p class="lead__close">' + fmt(L.closing) + "</p>" : "") + "</div></section>";
  }
  function beliefView() {
    var B = C.belief || {}; if (!B.text) return "";
    return '<section class="belief" aria-label="' + esc(B.label || "Design belief") + '"><div class="wrap"><p class="belief__l">' + esc(B.label || "") + '</p><blockquote class="belief__q"><p>' + B.text.split(" ").map(function (w) { return '<span class="bw">' + esc(w) + "</span>"; }).join(" ") + "</p></blockquote></div></section>";
  }
  function thinkingView() {
    var T = C.thinking || {}; if (!(T.topics || []).length) return "";
    return '<section class="sec think" id="thinking" aria-labelledby="think-h"><div class="wrap"><h2 class="sec__title" id="think-h">' + esc(T.title) + '</h2><p class="think__intro">' + fmt(T.intro || "") + "</p>" +
      ((T.interests || []).length ? '<ul class="think__int">' + T.interests.map(function (x) { return '<li><h3 class="think__it">' + esc(x.title) + '</h3><p class="think__ib">' + fmt(x.body) + "</p></li>"; }).join("") + "</ul>" : "") +
      '<ul class="think__topics">' + T.topics.map(function (x) { return '<li><h3 class="think__tt">' + esc(x.title) + '</h3><p class="think__tb">' + fmt(x.body) + "</p></li>"; }).join("") + "</ul>" +
      (T.note ? '<p class="think__note">' + fmt(T.note) + "</p>" : "") + "</div></section>";
  }
  function aboutView() {
    var ab = C.about || {}, x = C.experience || {};
    return '<section class="sec about" id="about" aria-labelledby="about-title"><div class="wrap about__in">' +
      '<h2 class="sec__title" id="about-title">' + esc(ab.title || "About") + "</h2>" +
      '<div class="about__body">' + (ab.lead ? '<p class="about__lead">' + fmt(ab.lead) + "</p>" : "") + (ab.paragraphs || []).map(function (p) { return '<p class="about__p">' + fmt(p) + "</p>"; }).join("") +
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
    var w = C.work || {}, ids = (w.selected || []).concat(w.other || []), t = w.pageTitle || "Work";
    return '<article class="wk"><header class="wrap wk__head"><h1 class="wk__t" tabindex="-1"><span class="sr-only">' + esc(t) + "</span>" +
      Array.from(t).map(function (ch, i) { return '<span class="wk__ch" style="--i:' + i + '" aria-hidden="true">' + esc(ch) + "</span>"; }).join("") + "</h1>" +
      (w.pageIntro ? '<p class="wk__sub">' + fmt(w.pageIntro) + "</p>" : "") + "</header>" +
      '<section class="wrap wk__sec" aria-labelledby="wk-list-h"><h2 class="sr-only" id="wk-list-h">Projects</h2><ol class="ix__list wk__list">' + indexItems(ids) + "</ol></section></article>";
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
      "</div></div>" + pagerView(cs) + "</article>";
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
      "</div></div>" + pagerView(cs) + "</article>";
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
      case "motion":
        return '<div class="mo-grid mo-grid--in">' + (b.ids || []).map(demoFigure).join("") + "</div>";
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

  var ARROW = {
    prev: '<svg class="pg__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    next: '<svg class="pg__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
  };
  function pagerView(cs) {
    var list = cases(), i = -1, k;
    for (k = 0; k < list.length; k++) if (list[k].slug === cs.slug) i = k;
    if (i < 0 || list.length < 2) return "";
    var side = function (c, dir) {
      var g = groupOf(c) || {}, locked = c.protected && !isOpen(c), prev = dir === "prev", pv = c.preview || g.preview;
      var label = prev ? "Previous case study" : "Next case study";
      return '<a class="pg__link pg__link--' + dir + '" href="#/work/' + esc(c.slug) + '" style="--to:' + esc(caseColor(c, g)) + '" aria-label="' + esc(label + ": " + c.title + (locked ? ", password protected" : "")) + '">' +
        (pv ? '<span class="pg__peek" aria-hidden="true"><img src="' + esc(safeUrl(pv)) + '" alt="" loading="lazy" decoding="async"></span>' : "") + 
        '<span class="pg__fill" aria-hidden="true"></span>' +
        '<span class="pg__label" aria-hidden="true">' + (prev ? ARROW.prev + "<span>" + label + "</span>" : "<span>" + label + "</span>" + ARROW.next) + "</span>" +
        '<span class="pg__reveal" aria-hidden="true"><span class="pg__inner"><span class="pg__title">' + esc(c.title) + '</span><span class="pg__meta">' + esc(g.company || "") + (locked ? ", password protected" : "") + "</span></span></span></a>";
    };
    return '<nav class="pg" aria-label="More case studies">' + side(list[(i - 1 + list.length) % list.length], "prev") + side(list[(i + 1) % list.length], "next") + "</nav>";
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
    if (parts[0] === "selected") return { name: "work" };
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
    initLiquid();
    initNavLiquid();
    bindScrollFX();
    bindWork();
    initSmoothScroll();
    bindStory();
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
      var row = e.target.closest && e.target.closest(".ix__row[data-preview], .pg__link[data-preview]"); if (!row) return;
      if (!preloaded) { preloaded = true; [].forEach.call(document.querySelectorAll(".ix__row[data-preview], .pg__link[data-preview]"), function (r) { var im = new Image(); im.src = r.getAttribute("data-preview"); }); }
      var f = ensureFloater(), img = f.querySelector("img");
      if (img.getAttribute("src") !== row.getAttribute("data-preview")) img.setAttribute("src", row.getAttribute("data-preview"));
      f.style.setProperty("--proj", row.style.getPropertyValue("--proj") || row.style.getPropertyValue("--to"));
      if (!floatOn) { fx = tx = e.clientX; fy = ty = e.clientY; vx = 0; }
      floatOn = true; f.classList.add("is-on"); if (!rafId) rafId = requestAnimationFrame(floatLoop);
    });
    document.addEventListener("pointerout", function (e) {
      var row = e.target.closest && e.target.closest(".ix__row[data-preview], .pg__link[data-preview]");
      if (!row || (e.relatedTarget && row.contains(e.relatedTarget))) return;
      floatOn = false; if (floater) floater.classList.remove("is-on");
    });
  }

  // A wipe in the project's color when opening a case study.
  document.addEventListener("click", function (e) {
    if (reduceMotion || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a.ix__row, a.next__a, a.pg__link"); if (!a) return;
    var href = a.getAttribute("href"); if (!href || href.charAt(0) !== "#") return;
    e.preventDefault();
    var nav = a.closest(".next"), color = (a.style.getPropertyValue("--proj") || a.style.getPropertyValue("--to") || (nav ? nav.style.getPropertyValue("--next") : "") || "#000").trim();
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
    },
    handoff: {
      html: '<div class="mui mui--phone"><div class="mui__bar"><span class="mui__av">AI</span><b>Care assistant</b></div><div class="mui__cv">' +
        '<p class="mui__b">Dr. Rivera has no openings this week.</p>' +
        '<p class="mui__qr"><span>Next week</span><span>Other doctors</span><span data-k="tp">Talk to a person</span></p>' +
        '<div class="mui__hand" data-k="hc"><b>Talk to a person</b><span>We’ll share this conversation, so you won’t repeat yourself.</span>' +
        '<span class="mui__ctx"><em data-k="x0">Dermatology</em><em data-k="x1">In network</em><em data-k="x2">Thu or Fri</em></span>' +
        '<span class="mui__conn"><i class="mui__live" data-k="lv"></i><span class="mui__stack"><span data-k="c1">Connecting, about 4 min</span><span data-k="c2">Maria from member services joined</span></span></span></div>' +
        '</div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("tp"), 300, sp);
        A(q("tp"), [{ backgroundColor: "#FFFFFF", color: "#15233B" }, { backgroundColor: "#15233B", color: "#FFFFFF" }], 140, 420, "std", sp);
        A(q("hc"), IN(24), 320, 600, "enter", sp);
        ["x0", "x1", "x2"].forEach(function (k, i) { A(q(k), [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "none" }], 260, 920 + i * 80, "settle", sp); });
        q("lv").animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.9)", opacity: .3 }, { transform: "scale(1)", opacity: 1 }], { duration: 900 / sp, delay: 1200 / sp, iterations: 2, easing: EASE.std });
        A(q("c1"), [{ opacity: 1 }, { opacity: 0 }], 120, 2600, "exit", sp);
        A(q("c2"), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 200, 2680, "enter", sp);
        return 3300;
      }
    },
    labs: {
      html: '<div class="mui mui--phone"><div class="mui__bar"><span class="mui__av">AI</span><b>Care assistant</b></div><div class="mui__cv">' +
        '<p class="mui__b">Your lipid panel from Oct 2 is ready.</p>' +
        '<div class="mui__card mui__lab" data-k="lc"><span class="mui__row"><b>LDL cholesterol</b><b data-k="val">128 mg/dL</b></span>' +
        '<span class="mui__range"><i class="mui__zone"></i><i class="mui__mark" data-k="mk"></i></span><span class="mui__row mui__ticks"><span>0</span><span>Reference: under 100</span><span>200</span></span>' +
        '<span><span class="mui__warn" data-k="bd">Above range</span></span></div>' +
        '<p class="mui__b" data-k="ex">I can show results, but your care team can explain them.</p><p class="mui__qr"><span data-k="qr">Message my care team</span></p></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("lc"), IN(12), 240, 0, "enter", sp);
        A(q("mk"), [{ left: "0%" }, { left: "64%" }], 640, 300, "enter", sp);
        A(q("val"), [{ opacity: 0 }, { opacity: 1 }], 200, 700, "std", sp);
        A(q("bd"), [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "none" }], 280, 1000, "settle", sp);
        A(q("ex"), IN(10), 240, 1500, "enter", sp);
        A(q("qr"), IN(8), 200, 1800, "enter", sp);
        return 2400;
      }
    },
    disagree: {
      html: '<div class="mui mui--desk"><div class="mui__flag2" data-k="fl"><span class="mui__risk">Rising risk: type 2 diabetes</span><span class="mui__stmt">Associated with a higher risk. This is not a diagnosis.</span><span class="mui__row mui__row--start"><span class="mui__btn">Review chart</span><span class="mui__ghost" data-k="dg">Disagree</span></span></div>' +
        '<div class="mui__scrim" data-k="sc"></div><div class="mui__dlg" data-k="dl"><b>Why don’t you agree?</b>' +
        '<span class="mui__opt" data-k="o1"><i data-k="r1"></i>Already managing this condition</span><span class="mui__opt"><i></i>The data is out of date</span><span class="mui__opt"><i></i>Not clinically relevant</span>' +
        '<span class="mui__row mui__row--end"><span class="mui__ghost">Cancel</span><span class="mui__cta2" data-k="ds">Dismiss flag</span></span></div>' +
        '<div class="mui__toast" data-k="ts">Flag dismissed with your reason <b>Undo</b></div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("dg"), 300, sp);
        A(q("sc"), [{ opacity: 0 }, { opacity: 1 }], 200, 420, "std", sp);
        A(q("dl"), [{ opacity: 0, transform: "translate(-50%, -46%) scale(.96)" }, { opacity: 1, transform: "translate(-50%, -50%)" }], 240, 420, "enter", sp);
        tap(s, q("o1"), 1100, sp);
        A(q("r1"), [{ boxShadow: "inset 0 0 0 0 #15233B" }, { boxShadow: "inset 0 0 0 5px #15233B" }], 200, 1200, "settle", sp);
        A(q("ds"), [{ backgroundColor: "#E8ECF2", color: "#7C8698" }, { backgroundColor: "#15233B", color: "#FFFFFF" }], 160, 1260, "std", sp);
        tap(s, q("ds"), 1900, sp);
        A(q("dl"), [{ opacity: 1, transform: "translate(-50%, -50%)" }, { opacity: 0, transform: "translate(-50%, -50%) scale(.98)" }], 200, 2000, "exit", sp, "forwards");
        A(q("sc"), [{ opacity: 1 }, { opacity: 0 }], 200, 2000, "std", sp, "forwards");
        A(q("fl"), [{ opacity: 1, transform: "none" }, { opacity: .4, transform: "scale(.98)" }], 240, 2100, "std", sp);
        A(q("ts"), [{ opacity: 0, transform: "translate(-50%, 16px)" }, { opacity: 1, transform: "translate(-50%, 0)" }], 280, 2250, "enter", sp);
        return 3000;
      }
    },
    focus: {
      html: '<div class="mui mui--desk mui--a11y"><b class="mui__h3">Schedule a visit</b>' +
        '<span class="mui__fl">Email<span class="mui__in" data-k="f1">you@example.com</span></span>' +
        '<span class="mui__chk" data-k="f2"><i></i>Text me a reminder</span>' +
        '<span class="mui__cta3" data-k="f3">Book visit</span>' +
        '<span class="mui__ring" data-k="rg"></span><span class="mui__key" data-k="key">Tab</span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var box = s.querySelector(".mui").getBoundingClientRect();
        var R = function (el, rad) { var r = el.getBoundingClientRect(); return { left: (r.left - box.left - 5) + "px", top: (r.top - box.top - 5) + "px", width: (r.width + 10) + "px", height: (r.height + 10) + "px", borderRadius: rad }; };
        var a = R(q("f1"), "12px"), b = R(q("f2"), "9px"), c = R(q("f3"), "999px");
        A(q("rg"), [Object.assign({ opacity: 0 }, a), Object.assign({ opacity: 1 }, a)], 160, 200, "std", sp);
        A(q("key"), [{ opacity: 0 }, { opacity: 1 }], 160, 700, "std", sp);
        [900, 1800].forEach(function (t) { q("key").animate([{ transform: "none" }, { transform: "translateY(3px)" }, { transform: "none" }], { duration: 160 / sp, delay: t / sp, easing: EASE.std }); });
        A(q("rg"), [b, b], 1, 0, "std", 1, "none");
        A(q("rg"), [a, b], 220, 1000, "std", sp);
        A(q("rg"), [b, c], 220, 1900, "std", sp, "forwards");
        A(q("f3"), [{ transform: "none" }, { transform: "scale(.96)", offset: .4 }, { transform: "none" }], 200, 2700, "std", sp);
        return 3200;
      }
    },
    synthesis: {
      html: '<div class="mui mui--desk mui--board"><div class="mui__theme">' + [["Network status is unclear", ["“Is participating the same as in network?”", "“I called just to double-check.”", "“I booked, then it wasn’t covered.”"]], ["The first choice is full", ["“No openings, so I gave up.”", "“I wanted the next doctor nearby.”", "“It just said try later.”"]], ["Results need context", ["“Is 128 bad?”", "“I needed the normal range.”", "“I called the nurse line.”"]]].map(function (c, ci) {
          return '<div class="mui__tcol"><b data-k="h' + ci + '">' + c[0] + "</b>" + c[1].map(function (n, ni) {
            return '<span class="mui__note" data-k="n' + ci + ni + '">' + n + (ci === 2 && ni === 1 ? '<i class="mui__strike" data-k="st"></i><em class="mui__nf" data-k="nf">Not in transcript</em>' : "") + "</span>";
          }).join("") + "</div>";
        }).join("") + '</div><span class="mui__sweep" data-k="sw"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var off = [[70, 40, -8], [-40, 90, 6], [110, -30, 10], [-90, 30, -5], [30, 120, 8], [-70, -50, -10], [50, 80, 5], [-120, 10, 7], [80, -70, -6]], k = 0;
        for (var ci = 0; ci < 3; ci++) for (var ni = 0; ni < 3; ni++) {
          var o = "translate(" + off[k][0] + "px, " + off[k][1] + "px) rotate(" + off[k][2] + "deg)";
          A(q("n" + ci + ni), [{ opacity: 0, transform: o }, { opacity: 1, transform: o, offset: .3 }, { opacity: 1, transform: "none" }], 900, 100 + k * 50, "std", sp); k++;
        }
        for (var h = 0; h < 3; h++) A(q("h" + h), [{ opacity: 0 }, { opacity: 1 }], 200, 1200 + h * 80, "std", sp);
        var tw = s.querySelector(".mui__theme").offsetWidth, sw = q("sw").offsetWidth;
        A(q("sw"), [{ opacity: 0, transform: "none" }, { opacity: 1, transform: "none", offset: .12 }, { opacity: 1, transform: "translateX(" + (tw - sw) + "px)", offset: .88 }, { opacity: 0, transform: "translateX(" + (tw - sw) + "px)" }], 1200, 1600, "std", sp);
        A(q("st"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 300, 2650, "std", sp);
        A(q("n21"), [{ opacity: 1 }, { opacity: .55 }], 300, 2650, "std", sp, "forwards");
        A(q("nf"), [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "none" }], 280, 2700, "settle", sp);
        return 3300;
      }
    },
    onboard: {
      html: '<div class="mui mui--phone mui--finp"><div class="mui__bar"><span class="mui__av mui__av--g">F</span><b>Finlatics</b></div><div class="mui__cv">' +
        '<span class="mui__prog"><i data-k="pg"></i></span><span class="mui__lbl">Step 2 of 3</span>' +
        '<div class="mui__panes"><div class="mui__pane mui__pane--a" data-k="p1"><b class="mui__h3">Pick a learning track</b><span class="mui__track2 on">Equity Research</span><span class="mui__track2">Investment Banking</span><span class="mui__track2">Financial Markets</span></div>' +
        '<div class="mui__pane" data-k="p2"><b class="mui__h3">Create your account</b><span class="mui__fl">College email<span class="mui__in mui__in--ok" data-k="in"><span class="mui__stack"><span data-k="e1">alex@university</span><span data-k="e2">alex@university.edu</span></span><span class="mui__ok3" data-k="ok">' + CK + '</span></span></span>' +
        '<span class="mui__err" data-k="er">Enter a full college email, like name@school.edu</span><span class="mui__cta4">Continue</span></div></div>' +
        '</div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("pg"), [{ width: "33%" }, { width: "66%" }], 480, 400, "std", sp);
        A(q("p1"), [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-32px)" }], 280, 400, "exit", sp);
        A(q("p2"), [{ opacity: 0, transform: "translateX(40px)" }, { opacity: 1, transform: "none" }], 320, 480, "enter", sp);
        A(q("in"), [{ borderColor: "#9CA3AF" }, { borderColor: "#B42318" }], 160, 1300, "std", sp);
        A(q("er"), [{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }], 200, 1300, "enter", sp);
        A(q("e1"), [{ opacity: 1 }, { opacity: 0 }], 200, 2300, "std", sp);
        A(q("e2"), [{ opacity: 0 }, { opacity: 1 }], 200, 2300, "std", sp);
        A(q("in"), [{ borderColor: "#B42318" }, { borderColor: "#0F7A52" }], 160, 2300, "std", sp, "forwards");
        A(q("er"), [{ opacity: 1 }, { opacity: 0 }], 160, 2400, "exit", sp, "forwards");
        A(q("ok"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 2380, "settle", sp);
        return 3000;
      }
    },
    lesson: {
      html: '<div class="mui mui--phone mui--finp"><div class="mui__bar"><span class="mui__av mui__av--g">F</span><b>Finlatics</b></div><div class="mui__cv">' +
        '<b class="mui__h3">Module 3: Balance sheet ratios</b><span class="mui__ringwrap"><svg viewBox="0 0 64 64" class="mui__ring2" aria-hidden="true"><circle cx="32" cy="32" r="26" class="mui__ring2-bg"/><circle cx="32" cy="32" r="26" class="mui__ring2-fg" data-k="rc" pathLength="1"/></svg>' +
        '<span><span class="mui__stack mui__pct"><b data-k="p1">60%</b><b data-k="p2">80%</b></span> of the module done</span></span>' +
        '<div class="mui__les mui__les--done"><i>' + CK + '</i>Current ratio</div><div class="mui__les mui__les--done" data-k="l2"><i data-k="l2i">' + CK + '</i>Quick ratio</div><div class="mui__les"><i>3</i>Debt to equity</div>' +
        '<span class="mui__cta4" data-k="nx">Next lesson: Debt to equity</span></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("l2i"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 300, "settle", sp);
        A(q("l2"), [{ backgroundColor: "#FFFFFF" }, { backgroundColor: "#ECFDF3" }], 200, 300, "std", sp);
        A(q("rc"), [{ strokeDashoffset: "0.4px" }, { strokeDashoffset: "0.2px" }], 600, 500, "enter", sp);
        A(q("p1"), [{ opacity: 1 }, { opacity: 0 }], 240, 600, "std", sp);
        A(q("p2"), [{ opacity: 0 }, { opacity: 1 }], 240, 600, "std", sp);
        A(q("nx"), IN(14), 280, 1300, "enter", sp);
        return 2000;
      }
    },
    states: {
      html: '<div class="mui mui--desk mui--fin mui--center"><span class="mui__stack mui__bl">' + ["Default", "Hover", "Pressed", "Focus", "Loading", "Disabled"].map(function (l, i) { return '<b data-k="sl' + i + '">' + l + "</b>"; }).join("") + "</span>" +
        '<span class="mui__dsb" data-k="b"><span class="mui__stack"><span data-k="bt">Continue</span><span class="mui__spin mui__spin--g" data-k="bs"></span></span></span>' +
        '<svg class="mui__cursor" data-k="cur" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2l12 7-5.5 1.4L7 16z"/></svg></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var lab = function (i, at) { if (i > 0) A(q("sl" + (i - 1)), [{ opacity: 1 }, { opacity: 0 }], 120, at, "std", sp, "forwards"); A(q("sl" + i), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 160, at, "enter", sp); };
        lab(0, 0);
        A(q("cur"), [{ opacity: 0, transform: "translate(70px, 60px)" }, { opacity: 1, transform: "none" }], 400, 200, "enter", sp);
        lab(1, 700); A(q("b"), [{ backgroundColor: "#0F7A52" }, { backgroundColor: "#0B5F40" }], 160, 700, "std", sp);
        lab(2, 1300); A(q("b"), [{ transform: "none" }, { transform: "scale(.97)", offset: .4 }, { transform: "none" }], 200, 1300, "std", sp);
        lab(3, 1900); A(q("cur"), [{ opacity: 1 }, { opacity: 0 }], 160, 1800, "exit", sp, "forwards"); A(q("b"), [{ boxShadow: "0 0 0 0 rgba(15,122,82,0)" }, { boxShadow: "0 0 0 4px #9ED8B7" }], 160, 1900, "std", sp);
        lab(4, 2500); A(q("bt"), [{ opacity: 1 }, { opacity: 0 }], 120, 2500, "exit", sp, "forwards"); A(q("bs"), [{ opacity: 0 }, { opacity: 1 }], 240, 2540, "std", sp, "forwards");
        q("bs").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 700 / sp, delay: 2540 / sp, iterations: 1, easing: "linear" });
        lab(5, 3200); A(q("bs"), [{ opacity: 1 }, { opacity: 0 }], 120, 3200, "exit", sp, "forwards"); A(q("bt"), [{ opacity: 0 }, { opacity: 1 }], 160, 3240, "std", sp, "forwards");
        A(q("b"), [{ backgroundColor: "#0B5F40", boxShadow: "0 0 0 4px #9ED8B7", opacity: 1 }, { backgroundColor: "#9CA3AF", boxShadow: "0 0 0 0 rgba(0,0,0,0)", opacity: .7 }], 200, 3200, "std", sp, "forwards");
        return 3800;
      }
    },
    visa: {
      html: '<div class="mui mui--desk mui--adv"><div class="mui__frow mui__frow--sp"><b>Jobs for you</b><span class="mui__tog">Sponsors visas<i class="mui__sw" data-k="sw"><b data-k="kn"></b></i></span></div>' +
        '<span class="mui__stack mui__cnt"><span data-k="c1">8 jobs</span><span data-k="c2">5 of 8 sponsor visas</span></span>' +
        [["Product Designer", "Brightline Health", 1], ["UX Designer", "Northpeak", 0], ["Product Designer II", "Mesa Analytics", 1], ["Design Intern", "Coastal Labs", 1], ["UI Designer", "Fieldnote", 0], ["Service Designer", "Harbor Fintech", 1]].map(function (j, i) {
          return '<div class="mui__job' + (j[2] ? "" : " mui__job--no") + '" data-k="j' + i + '"><b>' + j[0] + "</b><span>" + j[1] + "</span>" + (j[2] ? '<em class="mui__spons" data-k="b' + i + '">Sponsors visas</em>' : '<em class="mui__nos">No sponsorship</em>') + "</div>";
        }).join("") + "</div>",
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("kn"), [{ transform: "none" }, { transform: "translateX(16px)" }], 200, 400, "std", sp);
        A(q("sw"), [{ backgroundColor: "#CBD5E1" }, { backgroundColor: "#155DFC" }], 200, 400, "std", sp);
        A(q("c1"), [{ opacity: 1 }, { opacity: 0 }], 160, 600, "std", sp);
        A(q("c2"), [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 200, 640, "enter", sp);
        var k = 0;
        for (var i = 0; i < 6; i++) {
          var row = q("j" + i);
          if (row.classList.contains("mui__job--no")) A(row, [{ opacity: 1 }, { opacity: .38 }], 200, 650 + i * 40, "exit", sp);
          else { A(q("b" + i), [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], 280, 760 + k * 80, "settle", sp); k++; }
        }
        return 2000;
      }
    },
    star: {
      html: '<div class="mui mui--desk mui--adv"><b class="mui__h3">Tell me about a time you led a project</b>' +
        '<p class="mui__ans"><span class="mui__sg mui__sg--s" data-k="s0">Last spring our capstone team lost its lead,</span> <span class="mui__sg mui__sg--t" data-k="s1">and I had to get the app to demo day in five weeks.</span> <span class="mui__sg mui__sg--a" data-k="s2">I split the work into weekly goals and ran short check-ins,</span> <span class="mui__sg mui__sg--r" data-k="s3">and we shipped on time.</span></p>' +
        '<div class="mui__starlist">' + [["S", "Situation"], ["T", "Task"], ["A", "Action"], ["R", "Result"]].map(function (x, i) { return '<span><i data-k="k' + i + '">' + x[0] + "</i>" + x[1] + "</span>"; }).join("") + "</div>" +
        '<p class="mui__hint" data-k="hn">All four parts found. Strong answer.</p></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var bg = ["#E6EEFC", "#FEF0DC", "#E3F4EA", "#FDE8E6"];
        for (var i = 0; i < 4; i++) {
          var t0 = 200 + i * 650;
          A(q("s" + i), [{ clipPath: "inset(0 100% 0 0)", backgroundColor: "rgba(255,255,255,0)" }, { clipPath: "inset(0 0 0 0)", backgroundColor: "rgba(255,255,255,0)" }], 500, t0, "linear", sp);
          A(q("s" + i), [{ backgroundColor: "rgba(255,255,255,0)" }, { backgroundColor: bg[i] }], 160, t0 + 520, "std", sp, "forwards");
          A(q("k" + i), [{ backgroundColor: "#EEF2F7", color: "#5B6677", transform: "scale(.8)" }, { backgroundColor: "#155DFC", color: "#FFFFFF", transform: "none" }], 280, t0 + 560, "settle", sp);
        }
        A(q("hn"), IN(6), 240, 3000, "enter", sp);
        return 3600;
      }
    },
    nft: {
      html: '<div class="mui mui--phone mui--nike"><div class="mui__bar mui__bar--dk"><b>Shop</b></div><div class="mui__cv mui__cv--dk">' +
        '<span class="mui__seg3"><span class="mui__thumb3" data-k="th"></span><span data-k="t0">Shoes</span><span data-k="t1">NFTs</span></span>' +
        '<div class="mui__grid2">' + [["Air Max 90", "Genesis #0412"], ["Dunk Low", "Drop 07 #0088"], ["Pegasus 41", "Swoosh Pass #1290"], ["Blazer Mid", "Archive #0034"]].map(function (p, i) {
          return '<div class="mui__pc"><span class="mui__pcf" data-k="sh' + i + '"><i class="mui__pimg"></i><b>' + p[0] + "</b></span><span class=\"mui__pcf mui__pcf--n\" data-k=\"nf" + i + '"><i class="mui__pimg mui__pimg--n"></i><b>' + p[1] + '</b><em data-k="v' + i + '">Verified</em></span></div>';
        }).join("") + "</div>" +
        '<span class="mui__qrbtn" data-k="qb">Scan to verify</span></div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var dx = q("t1").offsetLeft - q("t0").offsetLeft;
        tap(s, q("t1"), 280, sp);
        A(q("th"), [{ transform: "none" }, { transform: "translateX(" + dx + "px)" }], 300, 400, "slide", sp);
        A(q("t0"), [{ color: "#FFFFFF" }, { color: "#5F6A70" }], 160, 440, "std", sp);
        A(q("t1"), [{ color: "#5F6A70" }, { color: "#FFFFFF" }], 160, 440, "std", sp);
        for (var i = 0; i < 4; i++) {
          A(q("sh" + i), [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-8px)" }], 200, 600 + i * 80, "exit", sp);
          A(q("nf" + i), [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], 280, 680 + i * 80, "enter", sp);
          A(q("v" + i), [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], 260, 1200 + i * 80, "settle", sp);
        }
        q("qb").animate([{ boxShadow: "0 0 0 0 rgba(0,0,0,.28)" }, { boxShadow: "0 0 0 10px rgba(0,0,0,0)" }], { duration: 900 / sp, delay: 2200 / sp, iterations: 2, easing: EASE.std });
        return 4000;
      }
    },
    scan: {
      html: '<div class="mui mui--phone mui--nike mui--dark"><div class="mui__bar mui__bar--dk"><b>Verify an NFT</b></div><div class="mui__cv mui__cv--dk mui__cv--mid">' +
        '<span class="mui__cam" data-k="cam"><i class="mui__cn mui__cn--1"></i><i class="mui__cn mui__cn--2"></i><i class="mui__cn mui__cn--3"></i><i class="mui__cn mui__cn--4"></i><span class="mui__qrc"></span><b class="mui__scanl" data-k="ln"></b></span>' +
        '<span class="mui__lbl mui__lbl--dk">Hold the code inside the frame</span>' +
        '<div class="mui__ver" data-k="vr"><b>' + CK + ' Authentic</b><span>Air Max Genesis #0412, owned by you</span></div></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        q("ln").animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(166px)", opacity: 1 }, { transform: "translateY(0)", opacity: 1 }], { duration: 1800 / sp, delay: 300 / sp, iterations: 1, easing: EASE.std, fill: "both" });
        A(q("ln"), [{ opacity: 1 }, { opacity: 0 }], 160, 2100, "exit", sp, "forwards");
        [].forEach.call(s.querySelectorAll(".mui__cn"), function (c) { A(c, [{ borderColor: "#FFFFFF" }, { borderColor: "#22C55E" }], 200, 2100, "std", sp); });
        A(q("cam"), [{ transform: "none" }, { transform: "scale(1.05)", offset: .5 }, { transform: "none" }], 320, 2100, "settle", sp);
        A(q("vr"), IN(18), 300, 2400, "enter", sp);
        return 3200;
      }
    }
,
    results: {
      html: '<div class="mui mui--phone"><div class="mui__bar"><span class="mui__av">AI</span><b>Care assistant</b></div><div class="mui__cv">' +
        '<p class="mui__b mui__b--m">Dermatologists near me who take my plan</p>' +
        '<div class="mui__res"><div class="mui__resg" data-k="sk">' + [0, 1].map(function () { return '<div class="mui__sk"><i style="width:55%"></i><i style="width:80%"></i><i style="width:40%"></i><span class="mui__shim"></span></div>'; }).join("") + "</div>" +
        '<div class="mui__resg">' + [["Dr. Ana Rivera", "Next opening Thu, 9:30 AM"], ["Dr. Mei Chen", "Next opening Fri, 2:00 PM"]].map(function (d, i) {
          return '<div class="mui__card" data-k="c' + i + '"><b>' + d[0] + "</b><span>" + d[1] + '</span><span class="mui__row"><em class="mui__ok">In network</em><span class="mui__btn">Book</span></span></div>';
        }).join("") + "</div></div>" +
        '<span class="mui__count" data-k="ct">2 in network within 5 miles</span></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        [].forEach.call(s.querySelectorAll(".mui__shim"), function (sh) { sh.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(100%)" }], { duration: 600 / sp, iterations: 2, easing: "linear" }); });
        A(q("sk"), [{ opacity: 1 }, { opacity: 0 }], 120, 1200, "exit", sp);
        A(q("c0"), IN(12), 280, 1200, "enter", sp);
        A(q("c1"), IN(12), 280, 1280, "enter", sp);
        A(q("ct"), [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "none" }], 280, 1640, "settle", sp);
        return 2400;
      }
    },
    sheet: {
      html: '<div class="mui mui--phone mui--finp"><div class="mui__bar"><span class="mui__av mui__av--g">F</span><b>Holdings</b></div><div class="mui__cv">' +
        [["HDFC Bank", "₹1,86,240", "+8.6%"], ["ICICI Bank", "₹1,37,280", "+5.3%"], ["Infosys", "₹1,50,800", "+2.6%"], ["ITC", "₹1,14,380", "−0.8%"]].map(function (r, i) {
          return '<div class="mui__hold mui__hold--p"' + (i === 0 ? ' data-k="r0"' : "") + "><b>" + r[0] + "</b><span>" + r[1] + "</span><em>" + r[2] + "</em></div>";
        }).join("") + "</div>" +
        '<div class="mui__scrim" data-k="sc"></div><div class="mui__sheet" data-k="sh"><i class="mui__handle"></i><b class="mui__h3" data-k="s0">HDFC Bank</b>' +
        [["Shares", "120"], ["Average price", "₹1,420"], ["Value", "₹1,86,240"], ["Return", "+8.6%"]].map(function (r, i) { return '<span class="mui__kv" data-k="s' + (i + 1) + '"><span>' + r[0] + "</span><b>" + r[1] + "</b></span>"; }).join("") +
        '<span class="mui__cta4" data-k="s5">Close</span></div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("r0"), 300, sp);
        A(q("r0"), [{ backgroundColor: "#FFFFFF" }, { backgroundColor: "#E7F3EC" }], 120, 400, "std", sp);
        A(q("sc"), [{ opacity: 0 }, { opacity: 1 }], 240, 480, "std", sp);
        A(q("sh"), [{ transform: "translateY(100%)" }, { transform: "none" }], 320, 480, "enter", sp);
        for (var i = 0; i < 6; i++) A(q("s" + i), IN(10), 220, 640 + i * 50, "enter", sp);
        A(q("sh"), [{ transform: "none" }, { transform: "translateY(100%)" }], 240, 2600, "exit", sp, "forwards");
        A(q("sc"), [{ opacity: 1 }, { opacity: 0 }], 200, 2600, "std", sp, "forwards");
        return 3100;
      }
    },
    tracker: {
      html: '<div class="mui mui--desk mui--adv"><b class="mui__h3">Application tracker</b><div class="mui__kan">' +
        '<div class="mui__col"><span class="mui__colh">Saved <em>2</em></span><div class="mui__kc"><b>UX Designer</b><span>Northpeak</span></div><div class="mui__kc"><b>UI Designer</b><span>Fieldnote</span></div></div>' +
        '<div class="mui__col"><span class="mui__colh">Applied <em class="mui__stack"><span data-k="a1">2</span><span data-k="a2">1</span></em></span><div class="mui__kc" data-k="mv"><b>Product Designer</b><span>Brightline Health</span><i class="mui__ktag" data-k="tg">Interview Thu, 10 AM</i></div><div class="mui__kc" data-k="di"><b>Design Intern</b><span>Coastal Labs</span></div></div>' +
        '<div class="mui__col"><span class="mui__colh">Interviewing <em class="mui__stack"><span data-k="i1">1</span><span data-k="i2">2</span></em></span><div class="mui__kc"><b>Service Designer</b><span>Harbor Fintech</span></div><div class="mui__kslot" data-k="sl"></div></div>' +
        "</div></div>",
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var mv = q("mv"), sl = q("sl"), a = mv.getBoundingClientRect(), b = sl.getBoundingClientRect(), dx = b.left - a.left, dy = b.top - a.top;
        A(sl, [{ opacity: 0 }, { opacity: 1 }], 200, 400, "std", sp);
        A(mv, [{ transform: "none", boxShadow: "0 0 0 rgba(0,0,0,0)" }, { transform: "scale(1.04) rotate(-1.5deg)", boxShadow: "0 18px 30px -12px rgba(30,27,75,.35)" }], 180, 300, "std", sp);
        A(mv, [{ transform: "scale(1.04) rotate(-1.5deg)" }, { transform: "translate(" + dx + "px," + dy + "px) scale(1.04) rotate(1deg)" }], 520, 520, "std", sp);
        A(mv, [{ transform: "translate(" + dx + "px," + dy + "px) scale(1.04) rotate(1deg)", boxShadow: "0 18px 30px -12px rgba(30,27,75,.35)" }, { transform: "translate(" + dx + "px," + dy + "px)", boxShadow: "0 0 0 rgba(0,0,0,0)" }], 300, 1040, "settle", sp);
        A(sl, [{ opacity: 1 }, { opacity: 0 }], 160, 1100, "std", sp, "forwards");
        A(q("di"), [{ transform: "none" }, { transform: "translateY(" + (-(a.height + 8)) + "px)" }], 260, 1100, "std", sp);
        A(q("a1"), [{ opacity: 1 }, { opacity: 0 }], 160, 1100, "std", sp); A(q("a2"), [{ opacity: 0 }, { opacity: 1 }], 160, 1100, "std", sp);
        A(q("i1"), [{ opacity: 1 }, { opacity: 0 }], 160, 1100, "std", sp); A(q("i2"), [{ opacity: 0 }, { opacity: 1 }], 160, 1100, "std", sp);
        A(q("tg"), [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], 280, 1300, "settle", sp);
        return 2200;
      }
    },
    collection: {
      html: '<div class="mui mui--phone mui--nike"><div class="mui__bar mui__bar--dk"><b>Your collection</b></div><div class="mui__cv mui__cv--dk">' +
        '<span class="mui__lbl mui__lbl--dk">4 NFTs, all verified</span><div class="mui__car"><div class="mui__cart" data-k="tr">' +
        [["Genesis #0412", "Air Max"], ["Drop 07 #0088", "Dunk Low"], ["Swoosh Pass #1290", "Members"], ["Archive #0034", "Blazer"]].map(function (n, i) {
          return '<div class="mui__nft" data-k="n' + i + '"><i class="mui__pimg mui__pimg--n" style="filter:hue-rotate(' + (i * 70) + 'deg)"></i><b>' + n[0] + "</b><span>" + n[1] + "</span><em>Verified</em></div>";
        }).join("") + "</div></div>" +
        '<span class="mui__dots">' + [0, 1, 2, 3].map(function (i) { return '<i data-k="d' + i + '"></i>'; }).join("") + "</span></div></div>",
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        var step = q("n1").offsetLeft - q("n0").offsetLeft, T = 3600;
        var pos = [[0, 0], [600, 0], [1020, -step], [1700, -step], [2120, -2 * step], [2900, -2 * step], [3420, 0]];
        q("tr").animate(pos.map(function (p) { return { offset: p[0] / T, transform: "translateX(" + p[1] + "px)" }; }).concat([{ offset: 1, transform: "translateX(0px)" }]), { duration: T / sp, easing: "linear", fill: "both" });
        var active = function (i) { return [[0, i === 0], [600, i === 0], [1020, i === 1], [1700, i === 1], [2120, i === 2], [2900, i === 2], [3420, i === 0], [T, i === 0]]; };
        for (var i = 0; i < 4; i++) {
          q("n" + i).animate(active(i).map(function (a) { return { offset: a[0] / T, transform: a[1] ? "scale(1)" : "scale(.9)", opacity: a[1] ? 1 : 0.55, easing: EASE.slide }; }), { duration: T / sp, fill: "both" });
          q("d" + i).animate(active(i).map(function (a) { return { offset: a[0] / T, width: a[1] ? "20px" : "6px", opacity: a[1] ? 1 : 0.4, easing: EASE.std }; }), { duration: T / sp, fill: "both" });
        }
        return T;
      }
    }
,
    upload: {
      html: '<div class="mui mui--desk"><b class="mui__h3">Supporting documents</b><div class="mui__drop">Drop files here or <u>browse</u></div>' +
        '<div class="mui__file" data-k="fr"><i class="mui__fico"></i><span class="mui__fmeta"><b>Imaging report, Sep 28.pdf</b><span class="mui__stack"><span data-k="u1">Uploading, 2.4 MB</span><span data-k="u2">Uploaded, 2.4 MB</span></span><span class="mui__fbar"><i data-k="fp"></i></span></span><span class="mui__ok2" data-k="fk">' + CK + "</span></div>" +
        '<div class="mui__req mui__req--miss" data-k="rq"><span class="mui__ri"><b data-k="q1">i</b><span class="mui__ok2" data-k="q2">' + CK + '</span></span>Imaging history<em class="mui__w"><span data-k="w1">Missing</span><span data-k="w2">Complete</span></em></div>' +
        '<p class="mui__badge" data-k="bd">2 of 3 requirements met</p></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("fr"), IN(10), 240, 200, "enter", sp);
        A(q("fp"), [{ width: "0%" }, { width: "100%" }], 900, 400, "std", sp);
        A(q("u1"), [{ opacity: 1 }, { opacity: 0 }], 160, 1300, "std", sp); A(q("u2"), [{ opacity: 0 }, { opacity: 1 }], 160, 1300, "std", sp);
        A(q("fk"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 1300, "settle", sp);
        A(q("rq"), [{ backgroundColor: "#FFFFFF", borderColor: "#7C8698" }, { backgroundColor: "#E3F4EA", borderColor: "#E3F4EA" }], 200, 1500, "std", sp);
        A(q("q1"), [{ opacity: 1 }, { opacity: 0 }], 120, 1500, "exit", sp); A(q("q2"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 1560, "settle", sp);
        A(q("w1"), [{ opacity: 1 }, { opacity: 0 }], 100, 1500, "exit", sp); A(q("w2"), [{ opacity: 0 }, { opacity: 1 }], 160, 1560, "std", sp);
        A(q("bd"), IN(8), 240, 1800, "enter", sp);
        return 2500;
      }
    },
    source: {
      html: '<div class="mui mui--desk"><div class="mui__frow mui__frow--sp"><span class="mui__risk">Rising risk: type 2 diabetes</span><span class="mui__ghost" data-k="vs">View source data</span></div>' +
        [["A1C rising", "5.9% to 6.3%"], ["Fasting glucose above range", "118 mg/dL"], ["BMI", "31.2"]].map(function (r) { return '<div class="mui__fact"><span class="mui__row"><b>' + r[0] + "</b><span>" + r[1] + "</span></span></div>"; }).join("") +
        '<div class="mui__scrim" data-k="sc"></div><div class="mui__drawer" data-k="dr"><b class="mui__h3">A1C, last 18 months</b>' +
        '<svg class="mui__chart mui__chart--xs" viewBox="0 0 240 90" aria-hidden="true"><path class="mui__grid" d="M0 30H240M0 60H240"/><path class="mui__line mui__line--n" data-k="ln" pathLength="1" d="M6 70L60 64L114 56L168 44L234 26"/></svg>' +
        [["Apr 2025", "5.9%"], ["Oct 2025", "6.0%"], ["Apr 2026", "6.1%"], ["Oct 2026", "6.3%"]].map(function (r, i) { return '<span class="mui__kv mui__kv--row" data-k="r' + i + '"><span>' + r[0] + "</span><b>" + r[1] + "</b></span>"; }).join("") +
        '<span class="mui__note2">From the lab feed. Clinician notes not used.</span></div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("vs"), 300, sp);
        A(q("sc"), [{ opacity: 0 }, { opacity: 1 }], 240, 420, "std", sp);
        A(q("dr"), [{ transform: "translateX(100%)" }, { transform: "none" }], 320, 420, "enter", sp);
        A(q("ln"), [{ strokeDashoffset: "1px" }, { strokeDashoffset: "0px" }], 700, 760, "std", sp);
        for (var i = 0; i < 4; i++) A(q("r" + i), IN(6), 200, 900 + i * 60, "enter", sp);
        A(q("r3"), [{ backgroundColor: "rgba(254,240,220,0)" }, { backgroundColor: "#FEF0DC" }], 200, 1500, "std", sp, "forwards");
        A(q("dr"), [{ transform: "none" }, { transform: "translateX(100%)" }], 240, 2700, "exit", sp, "forwards");
        A(q("sc"), [{ opacity: 1 }, { opacity: 0 }], 200, 2700, "std", sp, "forwards");
        return 3100;
      }
    },
    trade: {
      html: '<div class="mui mui--phone mui--finp"><div class="mui__bar"><span class="mui__av mui__av--g">F</span><b>Buy HDFC Bank</b></div><div class="mui__cv">' +
        '<span class="mui__kv"><span>Price</span><b>₹1,552</b></span><span class="mui__lbl">Quantity</span>' +
        '<span class="mui__step"><b data-k="mn">−</b><span class="mui__stack"><b data-k="n0">10</b><b data-k="n1">11</b><b data-k="n2">12</b></span><b data-k="pl">+</b></span>' +
        '<span class="mui__kv"><span>Total</span><span class="mui__stack"><b data-k="t0">₹15,520</b><b data-k="t1">₹17,072</b><b data-k="t2">₹18,624</b></span></span>' +
        '<span class="mui__cta4" data-k="po">Place order</span>' +
        '<div class="mui__hold mui__hold--p" data-k="hr"><b>HDFC Bank</b><span class="mui__stack"><span data-k="h0">120 shares</span><span data-k="h1">132 shares</span></span><em>+8.6%</em></div></div>' +
        '<div class="mui__toast mui__toast--top" data-k="ts">Order placed: 12 shares of HDFC Bank</div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("pl"), 300, sp); tap(s, q("pl"), 700, sp);
        A(q("n0"), [{ opacity: 1 }, { opacity: 0 }], 120, 360, "std", sp); A(q("n1"), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 120, 360, "std", sp);
        A(q("n1"), [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], 120, 760, "std", sp, "forwards"); A(q("n2"), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 120, 760, "std", sp);
        A(q("t0"), [{ opacity: 1 }, { opacity: 0 }], 120, 360, "std", sp); A(q("t1"), [{ opacity: 0 }, { opacity: 1 }], 120, 360, "std", sp);
        A(q("t1"), [{ opacity: 1 }, { opacity: 0 }], 120, 760, "std", sp, "forwards"); A(q("t2"), [{ opacity: 0 }, { opacity: 1 }], 120, 760, "std", sp);
        tap(s, q("po"), 1300, sp); A(q("po"), [{ transform: "none" }, { transform: "scale(.97)", offset: 0.4 }, { transform: "none" }], 200, 1320, "std", sp);
        A(q("ts"), [{ transform: "translate(-50%, -140%)" }, { transform: "translate(-50%, 0)" }], 320, 1500, "enter", sp);
        A(q("ts"), [{ transform: "translate(-50%, 0)" }, { transform: "translate(-50%, -140%)" }], 240, 2800, "exit", sp, "forwards");
        A(q("hr"), [{ backgroundColor: "#FFFFFF" }, { backgroundColor: "#E7F3EC" }], 200, 1650, "std", sp);
        A(q("h0"), [{ opacity: 1 }, { opacity: 0 }], 160, 1650, "std", sp); A(q("h1"), [{ opacity: 0 }, { opacity: 1 }], 160, 1650, "std", sp);
        return 3300;
      }
    },
    unlock: {
      html: '<div class="mui mui--phone mui--finp"><div class="mui__bar"><span class="mui__av mui__av--g">F</span><b>Equity Research</b></div><div class="mui__cv">' +
        '<div class="mui__mod"><span class="mui__row"><b>Module 3: Balance sheet ratios</b><span class="mui__ok3" data-k="ck">' + CK + '</span></span><span class="mui__prog"><i data-k="pg" style="width:100%"></i></span></div>' +
        '<div class="mui__mod mui__mod--next" data-k="m4"><span class="mui__row"><b>Module 4: Valuation basics</b><span class="mui__lock" data-k="lk"><i class="mui__shackle" data-k="sh"></i><i class="mui__lbody"></i></span></span><span class="mui__lbl">6 lessons, about 2 hours</span><span class="mui__cta4 mui__cta4--sm" data-k="go">Start module 4</span></div>' +
        '<div class="mui__mod mui__mod--off"><span class="mui__row"><b>Module 5: Building a model</b></span><span class="mui__lbl">Unlocks after module 4</span></div></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("pg"), [{ width: "80%" }, { width: "100%" }], 500, 200, "std", sp);
        A(q("ck"), [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], 320, 700, "settle", sp);
        A(q("sh"), [{ transform: "none" }, { transform: "translateY(-3px) rotate(-28deg)" }], 240, 1000, "std", sp);
        A(q("lk"), [{ opacity: 1 }, { opacity: 0 }], 160, 1240, "exit", sp);
        A(q("m4"), [{ opacity: 0.5, backgroundColor: "#FFFFFF" }, { opacity: 1, backgroundColor: "#ECFDF3" }], 240, 1200, "std", sp);
        A(q("go"), IN(8), 240, 1450, "enter", sp);
        return 2300;
      }
    },
    match: {
      html: '<div class="mui mui--desk mui--adv"><b class="mui__h3">Resume match: Product Designer, Brightline Health</b>' +
        '<div class="mui__frow"><span class="mui__score"><svg viewBox="0 0 64 64" class="mui__ring2" aria-hidden="true"><circle cx="32" cy="32" r="26" class="mui__ring2-bg"/><circle cx="32" cy="32" r="26" class="mui__ring2-fg mui__ring2-fg--b" data-k="rc" pathLength="1"/></svg><span class="mui__stack mui__pct"><b data-k="p0">54%</b><b data-k="p1">86%</b></span></span>' +
        '<span class="mui__kw">' + [["Figma", 1], ["Prototyping", 1], ["User research", 1], ["Design systems", 1], ["Accessibility", 1], ["SQL", 0], ["A/B testing", 0]].map(function (k, i) { return '<em class="' + (k[1] ? "mui__kwy" : "mui__kwn") + '" data-k="k' + i + '">' + k[0] + "</em>"; }).join("") + "</span></div>" +
        '<div class="mui__card mui__tip" data-k="tp"><b>Add “design systems” to your summary</b><span>It appears four times in the job description.</span></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("rc"), [{ strokeDashoffset: "0.46px" }, { strokeDashoffset: "0.14px" }], 900, 300, "enter", sp);
        A(q("p0"), [{ opacity: 1 }, { opacity: 0 }], 200, 700, "std", sp); A(q("p1"), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 240, 700, "enter", sp);
        for (var i = 0; i < 5; i++) A(q("k" + i), [{ backgroundColor: "#F3F4F6", color: "#6A7282", transform: "scale(.92)" }, { backgroundColor: "#DBEAFE", color: "#1E40AF", transform: "none" }], 260, 400 + i * 80, "settle", sp);
        A(q("tp"), IN(10), 280, 1500, "enter", sp);
        return 2300;
      }
    },
    feedback: {
      html: '<div class="mui mui--desk mui--adv"><div class="mui__frow mui__frow--sp"><b class="mui__h3">Mock interview feedback</b><span class="mui__wave">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<i data-k="w' + i + '"></i>'; }).join("") + "</span></div>" +
        [["Strength", "Clear structure: you named the situation and the result.", "y"], ["Improve", "Quantify the result. How much faster did the team ship?", "n"], ["Practice next", "A time you disagreed with a teammate.", "i"]].map(function (c, i) {
          return '<div class="mui__card mui__fb" data-k="c' + i + '"><em class="mui__fbt mui__fbt--' + c[2] + '" data-k="g' + i + '">' + c[0] + "</em><span>" + c[1] + "</span></div>";
        }).join("") + '<span class="mui__spons" data-k="sc">4 of 5, strong answer</span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        for (var i = 0; i < 10; i++) q("w" + i).animate([{ transform: "scaleY(.3)" }, { transform: "scaleY(1)" }, { transform: "scaleY(.3)" }], { duration: 420 / sp, delay: (i * 40) / sp, iterations: 2, easing: EASE.std });
        for (var c = 0; c < 3; c++) { A(q("c" + c), IN(12), 280, 900 + c * 120, "enter", sp); A(q("g" + c), [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "none" }], 260, 1000 + c * 120, "settle", sp); }
        A(q("sc"), [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "none" }], 280, 1500, "settle", sp);
        return 2400;
      }
    },
    bag: {
      html: '<div class="mui mui--phone mui--nike"><div class="mui__bar mui__bar--dk mui__row"><b>Air Max 90</b><span class="mui__bagi" data-k="bg"><i></i><em class="mui__stack"><span data-k="b0">0</span><span data-k="b1">1</span></em></span></div><div class="mui__cv mui__cv--dk">' +
        '<i class="mui__pimg mui__pimg--hero" data-k="im"></i><span class="mui__lbl mui__lbl--dk">Select size</span>' +
        '<span class="mui__sizes">' + ["UK 7", "UK 8", "UK 9", "UK 10"].map(function (z, i) { return '<em data-k="z' + i + '">' + z + "</em>"; }).join("") + "</span>" +
        '<span class="mui__qrbtn mui__stack" data-k="ab"><span data-k="a0">Add to bag</span><span data-k="a1">Added to bag</span></span></div>' +
        '<i class="mui__fly" data-k="fl"></i><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("z1"), 300, sp);
        A(q("z1"), [{ backgroundColor: "#FFFFFF", color: "#1A2530", borderColor: "#DADADA" }, { backgroundColor: "#000000", color: "#FFFFFF", borderColor: "#000000" }], 140, 420, "std", sp);
        A(q("ab"), [{ backgroundColor: "#D9D9D9", color: "#5F6A70" }, { backgroundColor: "#000000", color: "#FFFFFF" }], 200, 520, "std", sp);
        tap(s, q("ab"), 1100, sp);
        var box = s.querySelector(".mui").getBoundingClientRect(), ib = q("im").getBoundingClientRect(), bb = q("bg").getBoundingClientRect(), fl = q("fl");
        var sx = ib.left - box.left + ib.width / 2 - 24, sy = ib.top - box.top + ib.height / 2 - 24, ex = bb.left - box.left + bb.width / 2 - 24, ey = bb.top - box.top + bb.height / 2 - 24;
        fl.style.left = sx + "px"; fl.style.top = sy + "px";
        A(fl, [{ opacity: 0, transform: "none" }, { opacity: 1, transform: "none", offset: 0.1 }, { opacity: 1, transform: "translate(" + (ex - sx) + "px," + (ey - sy) + "px) scale(.25)" }], 620, 1200, "std", sp, "forwards");
        A(fl, [{ opacity: 1 }, { opacity: 0 }], 80, 1820, "std", sp, "forwards");
        A(q("b0"), [{ opacity: 1 }, { opacity: 0 }], 120, 1800, "std", sp); A(q("b1"), [{ opacity: 0, transform: "scale(.5)" }, { opacity: 1, transform: "none" }], 280, 1800, "settle", sp);
        A(q("bg"), [{ transform: "none" }, { transform: "scale(1.15)", offset: 0.4 }, { transform: "none" }], 320, 1800, "settle", sp);
        A(q("a0"), [{ opacity: 1 }, { opacity: 0 }], 120, 1820, "std", sp); A(q("a1"), [{ opacity: 0 }, { opacity: 1 }], 160, 1880, "std", sp);
        return 2700;
      }
    },
    listing: {
      html: '<div class="mui mui--phone mui--nike"><div class="mui__bar mui__bar--dk"><b>Sell NFT</b></div><div class="mui__cv mui__cv--dk">' +
        '<div class="mui__nft mui__nft--row"><i class="mui__pimg mui__pimg--n"></i><span><b>Genesis #0412</b><span>Air Max</span><em class="mui__listed" data-k="ls">Listed</em></span></div>' +
        '<span class="mui__lbl mui__lbl--dk">Price</span><span class="mui__in mui__in--nk" data-k="in"><span class="mui__stack"><span data-k="v0" class="mui__ph">Set a price</span><span data-k="v1">0.42 ETH</span></span></span>' +
        '<span class="mui__qrbtn mui__stack" data-k="lb"><span data-k="l0">List for sale</span><span data-k="l1">Listing</span></span>' +
        '<div class="mui__done2" data-k="dn"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" pathLength="1" data-k="dc"/><path d="M12 20.5l5.5 5.5L28 15" pathLength="1" data-k="dp"/></svg><b>Listed for 0.42 ETH</b></div></div><span class="mui__tap" aria-hidden="true"></span></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        tap(s, q("in"), 280, sp);
        A(q("in"), [{ borderColor: "#DADADA" }, { borderColor: "#000000" }], 160, 380, "std", sp);
        A(q("v0"), [{ opacity: 1 }, { opacity: 0 }], 120, 640, "std", sp); A(q("v1"), [{ opacity: 0 }, { opacity: 1 }], 160, 640, "std", sp);
        A(q("lb"), [{ backgroundColor: "#D9D9D9", color: "#5F6A70" }, { backgroundColor: "#000000", color: "#FFFFFF" }], 200, 820, "std", sp);
        tap(s, q("lb"), 1200, sp);
        A(q("l0"), [{ opacity: 1 }, { opacity: 0 }], 120, 1260, "std", sp); A(q("l1"), [{ opacity: 0 }, { opacity: 1 }], 160, 1300, "std", sp);
        A(q("dn"), IN(12), 280, 1700, "enter", sp);
        A(q("dc"), [{ strokeDashoffset: "1px" }, { strokeDashoffset: "0px" }], 420, 1760, "std", sp);
        A(q("dp"), [{ strokeDashoffset: "1px" }, { strokeDashoffset: "0px" }], 260, 2120, "settle", sp);
        A(q("ls"), [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], 280, 2200, "settle", sp);
        return 2900;
      }
    },
    breadcrumb: {
      html: '<div class="mui mui--desk mui--b2b"><span class="mui__stack mui__clicks"><b data-k="c0">4 clicks to export a report</b><b data-k="c1">2 clicks to export a report</b></span>' +
        '<span class="mui__crumbs">' + [["Dashboard", 0], ["Reports", 1], ["Exports", 1], ["Settings", 1], ["Export report", 2]].map(function (c, i) {
          return (i ? '<i class="mui__arr' + (c[1] === 1 ? ' mui__arr--x" data-k="a' + i + '"' : '"') + ">›</i>" : "") + '<em class="mui__crumb' + (c[1] === 1 ? " mui__crumb--x" : c[1] === 2 ? " mui__crumb--goal" : "") + '"' + (c[1] === 1 ? ' data-k="x' + i + '"' : "") + ">" + c[0] + "</em>";
        }).join("") + "</span>" +
        '<div class="mui__card mui__qa" data-k="qa"><b>Quick action, pinned to the dashboard</b><span class="mui__row"><span>Export report</span><span class="mui__btn">Export</span></span></div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        [1, 2, 3].forEach(function (i, n) {
          var x = q("x" + i), a = q("a" + i);
          x.style.cssText = "max-width:none;padding-left:10px;padding-right:10px;border-width:1px;opacity:1"; a.style.cssText = "max-width:none;opacity:1";
          var w = x.offsetWidth, aw = a.offsetWidth; x.style.cssText = ""; a.style.cssText = "";
          A(x, [{ opacity: 1, maxWidth: w + "px", paddingLeft: "10px", paddingRight: "10px", borderWidth: "1px" }, { opacity: 0, maxWidth: "0px", paddingLeft: "0px", paddingRight: "0px", borderWidth: "0px" }], 300, 600 + n * 60, "std", sp);
          A(a, [{ opacity: 1, maxWidth: aw + "px" }, { opacity: 0, maxWidth: "0px" }], 300, 600 + n * 60, "std", sp);
        });
        A(q("c0"), [{ opacity: 1 }, { opacity: 0 }], 160, 720, "std", sp); A(q("c1"), [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 200, 760, "enter", sp);
        A(q("qa"), IN(12), 280, 1100, "enter", sp);
        return 2000;
      }
    },
    command: {
      html: '<div class="mui mui--desk mui--b2b"><span class="mui__row"><b class="mui__h3">Analytics workspace</b><span class="mui__keyk" data-k="kk">⌘ K</span></span>' +
        '<div class="mui__fact"><span class="mui__row"><b>Weekly report</b><span>Ready</span></span></div><div class="mui__fact"><span class="mui__row"><b>User activity</b><span>Updated 2 h ago</span></span></div>' +
        '<div class="mui__scrim" data-k="sc"></div><div class="mui__pal" data-k="pl"><span class="mui__palin"><span class="mui__stack"><span data-k="i0" class="mui__ph">Search actions</span><span data-k="i1">e</span><span data-k="i2">ex</span><span data-k="i3">exp</span></span></span>' +
        [["Export report", 1], ["Export users", 1], ["Share dashboard", 0], ["Invite teammate", 0], ["Open settings", 0]].map(function (r, i) { return '<span class="mui__palr' + (i === 0 ? " mui__palr--on" : "") + '" data-k="r' + i + '">' + r[0] + "</span>"; }).join("") + "</div>" +
        '<div class="mui__toast" data-k="ts">Exporting report…</div></div>',
      play: function (s, sp) {
        var q = function (k) { return s.querySelector('[data-k="' + k + '"]'); };
        A(q("kk"), [{ transform: "none" }, { transform: "translateY(2px)", offset: 0.5 }, { transform: "none" }], 160, 200, "std", sp);
        A(q("sc"), [{ opacity: 0 }, { opacity: 1 }], 200, 300, "std", sp, "forwards");
        A(q("pl"), [{ opacity: 0, transform: "translate(-50%, 0) scale(.96)" }, { opacity: 1, transform: "translate(-50%, 0)" }], 240, 300, "enter", sp);
        [["i0", 700], ["i1", 850], ["i2", 1000]].forEach(function (p, n) { var nx = ["i1", "i2", "i3"][n]; A(q(p[0]), [{ opacity: 1 }, { opacity: 0 }], 60, p[1], "std", sp); A(q(nx), [{ opacity: 0 }, { opacity: 1 }], 60, p[1], "std", sp); });
        A(q("i3"), [{ opacity: 0 }, { opacity: 1 }], 60, 1000, "std", sp);
        [2, 3, 4].forEach(function (i, n) { A(q("r" + i), [{ opacity: 1, maxHeight: "40px", paddingTop: "8px", paddingBottom: "8px" }, { opacity: 0, maxHeight: "0px", paddingTop: "0px", paddingBottom: "0px" }], 200, 1050 + n * 40, "exit", sp); });
        A(q("kk"), [{ transform: "none" }, { transform: "translateY(2px)", offset: 0.5 }, { transform: "none" }], 160, 1800, "std", sp);
        A(q("pl"), [{ opacity: 1, transform: "translate(-50%, 0)" }, { opacity: 0, transform: "translate(-50%, 0) scale(.98)" }], 200, 1900, "exit", sp, "forwards");
        A(q("sc"), [{ opacity: 1 }, { opacity: 0 }], 200, 1900, "std", sp, "forwards");
        A(q("ts"), [{ opacity: 0, transform: "translate(-50%, 16px)" }, { opacity: 1, transform: "translate(-50%, 0)" }], 280, 2000, "enter", sp);
        return 2800;
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
      ((M.groups && M.groups.length) ? M.groups.map(function (g) {
        return '<section class="mo-group" aria-labelledby="mog-' + esc(g.id) + '"><h2 class="mo-gh" id="mog-' + esc(g.id) + '">' + esc(g.title) + "</h2>" + (g.note ? '<p class="mo-gn">' + fmt(g.note) + "</p>" : "") +
          '<div class="mo-grid">' + (g.ids || []).map(demoFigure).join("") + "</div></section>";
      }).join("") : '<div class="mo-grid">' + (M.demos || []).map(function (d) { return demoFigure(d.id); }).join("") + "</div>") + "</div></article>";
  }
  function demoFigure(id) {
    var M = C.motion || {}, d = (M.demos || []).filter(function (x) { return x.id === id; })[0], def = DEMOS[id];
    if (!d || !def) return "";
    return '<figure class="mo" data-demo="' + esc(d.id) + '"><div class="mo__stage">' + def.html + "</div>" +
      '<figcaption class="mo__cap"><p class="mo__ctx">' + esc(d.context || "") + '</p><h3 class="mo__t">' + esc(d.title) + '</h3><p class="mo__p">' + esc(d.purpose || "") + "</p>" +
      '<div class="mo__ctl"><button type="button" class="mo__play">Play</button><button type="button" class="mo__slow" aria-pressed="false">Slow motion</button></div>' +
      '<dl class="mo__spec">' + (d.spec || []).map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl></figcaption></figure>";
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

  /* ------------------------------------------------------------------ liquid type hero
     Each letter's variable-font weight and scale follow the cursor on springs.
     At rest the letters beat like a pulse (lub-dub) travelling across the word;
     the cursor leaves a fading chart line; a click sends a pulse ring through the type. */
  var LQ = null;
  function stopLiquid() { if (!LQ) return; cancelAnimationFrame(LQ.raf); LQ.off.forEach(function (f) { f(); }); LQ = null; }
  function initLiquid() {
    stopLiquid();
    var root = document.querySelector("#main .lq"); if (!root || reduceMotion) return;
    var canvas = root.querySelector(".lq__cv"), ctx = canvas.getContext && canvas.getContext("2d"); if (!ctx) return;
    var wraps = [].slice.call(root.querySelectorAll(".lq__w")), chars = wraps.map(function (w) { return w.firstChild; });
    var reveal = [].slice.call(root.querySelectorAll("[data-reveal]"));
    var BASE = 300, MAX = 800, RAD = 180, SPRING = 0.035, DAMP = 0.92, PEAK = 0.12, EO = "cubic-bezier(.23, 1, .32, 1)";
    var st = chars.map(function () { return { cx: 0, cy: 0, w: BASE, wv: 0, s: 1, sv: 0, ready: false }; });
    var L = LQ = { raf: 0, off: [] };
    var mouse = { x: -9999, y: -9999, inside: false }, idle = 1, ripples = [], trail = [], lastDot = 0, locked = false, visible = true, t0 = performance.now(), W = 0, H = 0;
    var darkQ = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    var isDark = function () { var t = document.documentElement.getAttribute("data-theme"); return t ? t === "dark" : !!(darkQ && darkQ.matches); };
    var on = function (el, ev, fn, opt) { el.addEventListener(ev, fn, opt); L.off.push(function () { el.removeEventListener(ev, fn, opt); }); };
    function size() { var r = root.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); canvas.style.width = W + "px"; canvas.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function measure() { var r = root.getBoundingClientRect(); wraps.forEach(function (w, i) { var b = w.getBoundingClientRect(); st[i].cx = b.left - r.left + b.width / 2; st[i].cy = b.top - r.top + b.height / 2; }); }
    function lock() {
      wraps.forEach(function (w) { w.style.width = ""; }); chars.forEach(function (c) { c.style.fontVariationSettings = "'wght' " + BASE; });
      void root.offsetHeight;
      var ws = wraps.map(function (w) { return w.getBoundingClientRect().width; });
      wraps.forEach(function (w, i) { w.style.width = ws[i] + "px"; }); locked = true; measure();
    }
    size(); measure();
    wraps.forEach(function (w, i) {
      var an = w.animate([{ opacity: 0, transform: "translateY(40px) scale(.85)", filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], { duration: 900, delay: 500 + i * 45, easing: EO, fill: "backwards" });
      if (i === wraps.length - 1) an.onfinish = function () {
        var go = function () { if (LQ !== L) return; lock(); st.forEach(function (s) { s.ready = true; }); };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
      };
    });
    reveal.forEach(function (el, i) { el.animate([{ opacity: 0, transform: "translateY(30px) scale(.94)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], { duration: 1000, delay: 900 + i * 130, easing: EO, fill: "backwards" }); });
    canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2000, easing: "ease-in-out", fill: "backwards" });
    on(root, "pointermove", function (e) {
      var r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
      mouse.x = x; mouse.y = y; mouse.inside = true;
      if (now - lastDot > 18) { trail.push({ x: x, y: y, t: now }); lastDot = now; }
    });
    on(root, "pointerleave", function () { mouse.inside = false; });
    on(root, "pointerdown", function (e) { var r = root.getBoundingClientRect(); ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, max: Math.max(W, H) * 0.6 }); });
    on(window, "resize", function () { size(); if (locked) lock(); else measure(); });
    if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }); io.observe(root); L.off.push(function () { io.disconnect(); }); }
    // A heartbeat: two quick pulses, then rest.
    var beat = function (p) { var g = function (m, s) { var d = (p - m) / s; return Math.exp(-d * d); }; return g(0.12, 0.05) + 0.65 * g(0.32, 0.06); };
    function frame(now) {
      L.raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      var t = (now - t0) / 1000, dark = isDark(), glowC = dark ? "245,240,230" : "20,20,24";
      idle += ((mouse.inside ? 0 : 1) - idle) * 0.05;
      ripples.forEach(function (rp) { rp.r += 5; }); ripples = ripples.filter(function (rp) { return rp.r <= rp.max; });
      for (var i = 0; i < st.length; i++) {
        var c = st[i]; if (!c.ready) continue;
        var inf = 0;
        if (mouse.inside) { var dx = c.cx - mouse.x, dy = c.cy - mouse.y, d = Math.sqrt(dx * dx + dy * dy); if (d < RAD) inf = Math.pow(1 - d / RAD, 2); }
        var tw = BASE + (MAX - BASE) * inf, ts = 1 + PEAK * inf;
        var p = ((t * 0.9 - i * 0.045) % 1.3 + 1.3) % 1.3;
        tw += beat(p) * 70 * idle + heroP * 380;
        for (var k = 0; k < ripples.length; k++) {
          var rp = ripples[k], ex = c.cx - rp.x, ey = c.cy - rp.y, cd = Math.sqrt(ex * ex + ey * ey), prox = 1 - Math.abs(cd - rp.r) / 60;
          if (prox > 0) { var fade = 1 - rp.r / rp.max; c.wv += fade * prox * 45; c.sv += fade * prox * 0.008; }
        }
        c.wv += (tw - c.w) * SPRING; c.wv *= DAMP; c.w += c.wv;
        c.sv += (ts - c.s) * SPRING; c.sv *= DAMP; c.s += c.sv;
        var el = chars[i], glow = Math.max(0, (c.w - BASE) / (MAX - BASE));
        el.style.fontVariationSettings = "'wght' " + Math.round(Math.max(200, Math.min(800, c.w)));
        el.style.transform = "scale(" + c.s.toFixed(4) + ")";
        el.style.textShadow = glow > 0.1 ? "0 0 " + (30 * glow).toFixed(1) + "px rgba(" + glowC + "," + (glow * 0.15).toFixed(3) + ")" : "none";
      }
      ctx.clearRect(0, 0, W, H);
      var tc = dark ? "226,232,240" : "87,91,99";
      trail = trail.filter(function (q) { return now - q.t < 900; });
      for (var j = 1; j < trail.length; j++) {
        var a0 = trail[j - 1], a1 = trail[j], life = 1 - (now - a1.t) / 900;
        ctx.strokeStyle = "rgba(" + tc + "," + (life * 0.28).toFixed(3) + ")"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
        if (j % 4 === 0) { ctx.fillStyle = "rgba(" + tc + "," + (life * 0.45).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(a1.x, a1.y, 2.2 * life + 0.8, 0, Math.PI * 2); ctx.fill(); }
      }
      var rc = dark ? "255,116,97" : "200,50,30";
      ripples.forEach(function (rp) {
        var pr = rp.r / rp.max, al = (1 - pr) * (1 - pr);
        ctx.strokeStyle = "rgba(" + rc + "," + (al * 0.3).toFixed(3) + ")"; ctx.lineWidth = 2.5 * (1 - pr * 0.5); ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(" + rc + "," + (al * 0.12).toFixed(3) + ")"; ctx.lineWidth = 8 * (1 - pr); ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r * 0.92, 0, Math.PI * 2); ctx.stroke();
      });
    }
    L.raf = requestAnimationFrame(frame);
  }

  // Work list: stagger the rows, then let CSS play the entrance.
  function bindWork() {
    var wk = document.querySelector("#main .wk"); if (!wk) return;
    [].forEach.call(wk.querySelectorAll(".wk__list > li"), function (li, i) { li.style.setProperty("--i", i); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { wk.classList.add("wk--in"); }); });
  }

  /* ------------------------------------------------------------------ immersive scroll
     A pinned hero under a rising curtain, a belief statement lit word by word,
     numbers that count up, rule lines that draw in, a nav that steps aside while
     you read, and a red progress line across the top. */
  var heroP = 0, lastY = 0, ticking = false, SFX = { wrap: null, hero: null, band: null, words: [] }, rvObs = null, cntObs = null, navVel = 0, NAVLQ = null;
  function scrollFrame() {
    ticking = false;
    var y = window.scrollY || document.documentElement.scrollTop || 0, vh = window.innerHeight, dh = document.documentElement.scrollHeight - vh, dy = y - lastY;
    lastY = y; navVel = dy; if (NAVLQ) NAVLQ.kick();
    document.documentElement.style.setProperty("--sp", dh > 0 ? Math.min(1, Math.max(0, y / dh)).toFixed(4) : "0");
    var hdr = byId("site-header");
    if (hdr && !reduceMotion) {
      var menuOpen = hdr.querySelector('.menu-btn[aria-expanded="true"]'), focusIn = hdr.contains(document.activeElement);
      var pinEnd = SFX.wrap ? SFX.wrap.offsetTop + SFX.wrap.offsetHeight : 240;
      if (!menuOpen && !focusIn && dy > 6 && y > pinEnd) hdr.classList.add("is-hidden");
      else if (dy < -6 || y < pinEnd || menuOpen || focusIn) hdr.classList.remove("is-hidden");
    }
    if (SFX.wrap && SFX.hero && !reduceMotion) {
      var D = SFX.wrap.offsetHeight - SFX.hero.offsetHeight;
      heroP = D > 0 ? Math.min(1, Math.max(0, y / D)) : 0; SFX.hero.style.setProperty("--p", heroP.toFixed(4));
    } else heroP = 0;
    storyFrame();
    if (SFX.words.length) {
      var r = SFX.band.getBoundingClientRect(), q = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25))), n = SFX.words.length;
      SFX.words.forEach(function (w, i) { w.style.opacity = Math.min(1, Math.max(0.16, q * n * 1.2 - i)).toFixed(3); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(scrollFrame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  (function () { var bar = document.createElement("div"); bar.className = "sprog"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar); })();
  function countUp(el) {
    var txt = el.getAttribute("data-final") || el.textContent, m = txt.match(/^([^0-9]*)([0-9]+)(.*)$/); if (!m) { el.textContent = txt; return; }
    var pre = m[1], n = parseInt(m[2], 10), suf = m[3], t0 = performance.now(), dur = 1300;
    (function step(now) { var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = k < 1 ? pre + Math.round(n * e) + suf : txt; if (k < 1) requestAnimationFrame(step); })(t0);
  }
  function bindScrollFX() {
    SFX.wrap = document.querySelector("#main .lq-wrap"); SFX.hero = SFX.wrap ? SFX.wrap.querySelector(".lq") : null;
    SFX.band = document.querySelector("#main .belief"); SFX.words = SFX.band && !reduceMotion ? [].slice.call(SFX.band.querySelectorAll(".bw")) : [];
    var hdr = byId("site-header"); if (hdr) hdr.classList.remove("is-hidden");
    if (rvObs) { rvObs.disconnect(); rvObs = null; } if (cntObs) { cntObs.disconnect(); cntObs = null; }
    if (!reduceMotion && "IntersectionObserver" in window) {
      rvObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("rv--in"); rvObs.unobserve(e.target); } }); }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
      [].forEach.call(document.querySelectorAll("#main .prin__item, #main .lead__i, #main .think__topics > li"), function (el) { el.classList.add("rv"); rvObs.observe(el); });
      cntObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cntObs.unobserve(e.target); } }); }, { threshold: 0.6 });
      [].forEach.call(document.querySelectorAll("#main .impact__num"), function (el) {
        el.setAttribute("data-final", el.textContent); var m = el.textContent.match(/^([^0-9]*)([0-9]+)(.*)$/); if (m) el.textContent = m[1] + "0" + m[3]; cntObs.observe(el);
      });
    }
    lastY = window.scrollY || 0; scrollFrame();
  }

  /* ------------------------------------------------------------------ liquid nav
     The name and the links swell on springs as the cursor passes, and every letter
     thickens a little with fast scrolling. Skipped when the nav is collapsed into a menu. */
  function initNavLiquid() {
    if (NAVLQ || reduceMotion) return;
    var hdr = byId("site-header"); if (!hdr) return;
    var mb = hdr.querySelector(".menu-btn"), els = [].slice.call(hdr.querySelectorAll(".brand > span, .nav__link")); if (!els.length) return;
    var items = [];
    els.forEach(function (el) {
      var text = el.textContent; if (!text.trim()) return;
      var link = el.closest("a"); if (link && !link.getAttribute("aria-label")) link.setAttribute("aria-label", link.textContent.replace(/\s+/g, " ").trim());
      var base = parseInt(getComputedStyle(el).fontWeight, 10) || 600;
      el.innerHTML = '<span class="lqn" aria-hidden="true">' + Array.from(text).map(function (ch) { return '<span class="lqn__w"><span class="lqn__c">' + (ch === " " ? "&nbsp;" : esc(ch)) + "</span></span>"; }).join("") + "</span>";
      [].forEach.call(el.querySelectorAll(".lqn__w"), function (w) { items.push({ w: w, c: w.firstChild, base: base, cx: 0, cy: 0, wt: base, wv: 0, s: 1, sv: 0 }); });
    });
    var mouse = { x: -999, y: -999, inside: false }, locked = false, raf = 0, R = 64, SP = 0.06, DM = 0.84;
    var collapsed = function () { return mb && getComputedStyle(mb).display !== "none"; };
    function measure() { items.forEach(function (it) { var b = it.w.getBoundingClientRect(); it.cx = b.left + b.width / 2; it.cy = b.top + b.height / 2; }); }
    function lock() {
      items.forEach(function (it) { it.w.style.width = ""; it.c.style.fontVariationSettings = "'wght' " + it.base; it.c.style.transform = ""; it.wt = it.base; it.wv = 0; it.s = 1; it.sv = 0; });
      if (collapsed()) { locked = false; return; }
      void hdr.offsetHeight;
      var ws = items.map(function (it) { return it.w.getBoundingClientRect().width; });
      items.forEach(function (it, i) { it.w.style.width = ws[i] + "px"; }); locked = true; measure();
    }
    function kick() { if (!raf && locked) raf = requestAnimationFrame(frame); }
    function frame() {
      raf = 0; var active = false, boost = Math.min(1, Math.abs(navVel) / 40) * 140; navVel *= 0.88;
      items.forEach(function (it) {
        var inf = 0; if (mouse.inside) { var dx = it.cx - mouse.x, dy = it.cy - mouse.y, d = Math.sqrt(dx * dx + dy * dy); if (d < R) inf = Math.pow(1 - d / R, 2); }
        var tw = Math.min(800, it.base + (800 - it.base) * inf + boost * (1 - inf)), ts = 1 + 0.08 * inf;
        it.wv += (tw - it.wt) * SP; it.wv *= DM; it.wt += it.wv; it.sv += (ts - it.s) * SP; it.sv *= DM; it.s += it.sv;
        if (Math.abs(it.wv) > 0.05 || Math.abs(tw - it.wt) > 0.5 || Math.abs(it.sv) > 0.0005) active = true;
        it.c.style.fontVariationSettings = "'wght' " + Math.round(it.wt); it.c.style.transform = "scale(" + it.s.toFixed(4) + ")";
      });
      if (active || mouse.inside || Math.abs(navVel) > 0.5) raf = requestAnimationFrame(frame);
    }
    hdr.addEventListener("pointermove", function (e) { if (!locked) return; mouse.x = e.clientX; mouse.y = e.clientY; if (!mouse.inside) { mouse.inside = true; measure(); } kick(); });
    hdr.addEventListener("pointerleave", function () { mouse.inside = false; kick(); });
    window.addEventListener("resize", lock);
    NAVLQ = { kick: kick };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lock); else lock();
  }

  /* ------------------------------------------------------------------ scroll storytelling
     Weighted smooth scrolling everywhere; single screens that open out to the full
     window; annotated screens that pin while their notes step past, the camera moving
     to each pin; galleries that travel sideways as the page scrolls down. */
  var SS = null, STORY = { grow: [], reels: [], scrolly: [], cover: null }, stepObs = null;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function initSmoothScroll() {
    if (SS || reduceMotion || !fine) return;
    var target = window.scrollY, current = target, raf = 0;
    var maxY = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    var innerScroll = function (el, dy) {
      while (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
        var s = getComputedStyle(el);
        if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1 && ((dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) || (dy < 0 && el.scrollTop > 0))) return true;
        el = el.parentElement;
      }
      return false;
    };
    function step() {
      current += (target - current) * 0.1;
      if (Math.abs(target - current) < 0.5) current = target;
      window.scrollTo(0, current);
      raf = current !== target ? requestAnimationFrame(step) : 0;
    }
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (innerScroll(e.target, e.deltaY) || document.querySelector("dialog[open], .lightbox.is-open, [aria-modal='true']")) return;
      e.preventDefault();
      if (!raf) { current = window.scrollY; target = current; }
      target = Math.max(0, Math.min(maxY(), target + e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1)));
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!raf) target = current = window.scrollY; }, { passive: true });
    SS = { stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; target = current = window.scrollY; } };
  }
  function reelItemWidth(it, vh) {
    var img = it.querySelector("img"), w = img ? +img.getAttribute("width") || 4 : 4, h = img ? +img.getAttribute("height") || 3 : 3, ar = w / h;
    return Math.round(Math.min(ar >= 1 ? 760 : 330, vh * (ar >= 1 ? 0.56 : 0.6) * ar));
  }
  function overflowsWindow(fig) {
    var items = fig.querySelectorAll(".v-gallery__item"), vh = window.innerHeight, vw = document.documentElement.clientWidth, sum = 0;
    [].forEach.call(items, function (it) { sum += reelItemWidth(it, vh); });
    var left = Math.max(24, fig.getBoundingClientRect().left);
    return sum + 40 * (items.length - 1) + left * 2 > vw + 120;
  }
  function makeReel(fig) {
    var canvas = fig.querySelector(".fig__canvas"), track = canvas && canvas.querySelector(".v-gallery"); if (!track) return null;
    var reel = document.createElement("div"), pin = document.createElement("div"), bar = document.createElement("div");
    reel.className = "reel"; pin.className = "reel__pin"; bar.className = "reel__bar"; bar.setAttribute("aria-hidden", "true"); bar.innerHTML = "<i></i>";
    canvas.parentNode.insertBefore(reel, canvas); pin.appendChild(canvas); pin.appendChild(bar); reel.appendChild(pin);
    fig.classList.add("fig--reel");
    return { fig: fig, reel: reel, track: track, bar: bar.firstChild, extra: 0 };
  }
  function layoutStory() {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    STORY.reels.forEach(function (R) {
      [].forEach.call(R.track.children, function (it) { it.style.width = reelItemWidth(it, vh) + "px"; });
      R.reel.style.marginLeft = ""; R.reel.style.width = "";
      var left = R.reel.getBoundingClientRect().left;
      R.reel.style.marginLeft = -left + "px"; R.reel.style.width = vw + "px";
      R.track.style.paddingLeft = R.track.style.paddingRight = Math.max(24, left) + "px";
      R.extra = Math.max(0, R.track.scrollWidth - vw);
      R.reel.style.height = (R.extra + vh) + "px";
    });
    STORY.grow.forEach(function (G) {
      G.canvas.style.marginLeft = ""; G.canvas.style.width = "";
      var r = G.fig.getBoundingClientRect(); G.L = r.left; G.R = vw - r.right;
      G.canvas.style.setProperty("--cw", Math.round(r.width) + "px"); G.canvas.style.marginLeft = -r.left + "px"; G.canvas.style.width = vw + "px";
    });
    STORY.scrolly.forEach(function (S) {
      var img = S.stage.querySelector("img"), w = img ? +img.getAttribute("width") || 4 : 4, h = img ? +img.getAttribute("height") || 3 : 3;
      S.stage.style.maxWidth = Math.round(Math.min(S.plate.parentNode.clientWidth * 0.58, (vh - 150) * (w / h))) + "px";
      S.plate.style.top = Math.max(24, Math.round((vh - S.plate.offsetHeight) / 2)) + "px";
    });
  }
  function storyFrame() {
    var vh = window.innerHeight;
    STORY.reels.forEach(function (R) {
      if (!R.extra) return;
      var p = clamp01(-R.reel.getBoundingClientRect().top / R.extra);
      R.track.style.transform = "translate3d(" + (-p * R.extra).toFixed(1) + "px,0,0)"; R.bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    });
    STORY.grow.forEach(function (G) {
      var g = clamp01((vh - G.fig.getBoundingClientRect().top) / (vh * 0.75)), k = 1 - g;
      G.canvas.style.clipPath = "inset(0 " + (G.R * k).toFixed(1) + "px 0 " + (G.L * k).toFixed(1) + "px round " + (18 * k + 2).toFixed(1) + "px)";
      G.canvas.style.setProperty("--g", g.toFixed(4));
    });
    if (STORY.cover) { var c = clamp01(-STORY.cover.getBoundingClientRect().top / (vh * 0.7)); STORY.cover.style.setProperty("--cz", c.toFixed(4)); }
  }
  function setStep(S, i) {
    if (S.active === i) return; S.active = i;
    S.notes.forEach(function (li, k) { li.classList.toggle("is-active", k === i); });
    S.pins.forEach(function (p, k) { p.classList.toggle("is-active", k === i); p.classList.toggle("is-dim", i > -1 && k !== i); });
    var pin = S.pins[i];
    if (pin) { S.stage.style.setProperty("--ox", pin.style.left); S.stage.style.setProperty("--oy", pin.style.top); S.stage.style.setProperty("--zoom", "1.32"); }
    else S.stage.style.setProperty("--zoom", "1");
  }
  function bindStory() {
    if (SS) SS.stop();
    if (stepObs) { stepObs.disconnect(); stepObs = null; }
    STORY = { grow: [], reels: [], scrolly: [], cover: null };
    var art = document.querySelector("#main article.cs"); if (!art || reduceMotion) return;
    var wide = window.matchMedia("(min-width: 1000px)").matches;
    STORY.cover = art.querySelector(".cv__hero");
    if (wide) {
      [].forEach.call(art.querySelectorAll(".fig--gallery"), function (fig) { if (fig.querySelectorAll(".v-gallery__item").length >= 3 && overflowsWindow(fig)) { var R = makeReel(fig); if (R) STORY.reels.push(R); } });
      [].forEach.call(art.querySelectorAll(".fig--annotated"), function (fig) {
        var notes = [].slice.call(fig.querySelectorAll(".v-notes > li")), stage = fig.querySelector(".v-ann__plate .v-stage"), plate = fig.querySelector(".v-ann__plate");
        if (notes.length < 2 || !stage) return;
        fig.classList.add("fig--scrolly");
        var pins = [].slice.call(stage.querySelectorAll(".v-pin"));
        pins.sort(function (a, b) { return (+a.textContent) - (+b.textContent); });
        var S = { fig: fig, notes: notes, pins: pins, stage: stage, plate: plate, active: -2 };
        notes.forEach(function (li, k) { li.setAttribute("data-step", k); });
        STORY.scrolly.push(S); setStep(S, -1);
      });
    }
    if (wide) [].forEach.call(art.querySelectorAll(".cs__content .fig"), function (fig) {
      if (fig.classList.contains("fig--reel") || fig.classList.contains("fig--scrolly") || fig.closest(".mo")) return;
      var canvas = fig.querySelector(".fig__canvas"); if (!canvas) return;
      fig.classList.add("fig--grow"); STORY.grow.push({ fig: fig, canvas: canvas, L: 0, R: 0 });
    });
    if (STORY.scrolly.length && "IntersectionObserver" in window) {
      stepObs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var li = e.target, S = STORY.scrolly.filter(function (s) { return s.notes.indexOf(li) > -1; })[0];
          if (S) setStep(S, +li.getAttribute("data-step"));
        });
      }, { rootMargin: "-46% 0px -46% 0px" });
      STORY.scrolly.forEach(function (S) { S.notes.forEach(function (li) { stepObs.observe(li); }); });
    }
    layoutStory(); storyFrame();
  }
  window.addEventListener("resize", function () { if (STORY.reels.length || STORY.grow.length || STORY.scrolly.length) { layoutStory(); storyFrame(); } });

  // Reading mode: a visual tour by default, the full story on request.
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".mode__b"); if (!b) return;
    var mode = b.getAttribute("data-mode") === "story" ? "story" : "tour";
    try { window.sessionStorage.setItem("portfolio-mode", mode); } catch (err) { /* storage unavailable */ }
    var art = document.querySelector("article.cs"); if (art) art.classList.toggle("cs--story", mode === "story");
    [].forEach.call(document.querySelectorAll(".mode .mode__b"), function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-mode") === mode)); });
    announce(mode === "story" ? "Showing the full story" : "Showing the visual tour");
    layoutStory(); storyFrame();
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
