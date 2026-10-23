/* =============================================================================
   APP
   Renders every page from content.js. To change what the site says, edit
   content.js; you shouldn't need to touch this file.
   Routes:  #/                 home
            #/work, #/approach, #/experience, #/contact   home sections
            #/work/<slug>      a case study
            #/work/<slug>/<section-id>   a section inside a case study
   ============================================================================= */
(function () {
  "use strict";

  var C = window.PORTFOLIO || {};
  var V = window.Visuals;
  var LOCKED = window.PORTFOLIO_LOCKED || null;
  var SESSION_KEY = "portfolio-access";
  var HOME_SECTIONS = ["work", "projects", "approach", "experience", "contact"];
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
    var links = [["work", "Work"], ["approach", "How I work"], ["experience", "Experience"], ["contact", "Contact"]];
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
    return heroView() + workView() + projectsView() + approachView() + experienceView() + contactView();
  }

  function heroView() {
    var h = C.hero || {}, m = C.meta || {};
    return '<section class="hero" aria-labelledby="hero-title"><div class="wrap hero__grid">' +
      '<div class="hero__main">' +
      '<p class="hero__who"><span class="hero__name">' + esc(m.name) + '</span><span class="hero__role">' + fmt(h.intro) + "</span></p>" +
      '<h1 class="hero__title" id="hero-title">' + fmt(h.headline) + "</h1>" +
      '<p class="hero__sum">' + fmt(h.summary) + "</p>" +
      '<p class="hero__cta"><a class="btn btn--primary" href="#/work">See selected work</a><a class="btn btn--ghost" href="mailto:' + esc(m.email) + '">Email me</a></p>' +
      (m.availability ? '<p class="hero__avail">' + fmt(m.availability) + "</p>" : "") +
      "</div>" + evidenceView(h) + "</div></section>";
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

  function caseHead(cs, g, locked) {
    return '<header class="cs__head wrap">' +
      '<a class="back" href="#/work">' + ICON.back + "<span>All work</span></a>" +
      '<p class="cs__co"><span>' + esc(g.company || "") + "</span>" +
      (cs.protected ? '<span class="cs__lock">' + (locked ? ICON.lock : ICON.unlock) + (locked ? "Protected" : "Unlocked") + "</span>" : "") + "</p>" +
      '<h1 class="cs__title" tabindex="-1">' + esc(cs.title) + "</h1>" +
      '<p class="cs__sum">' + fmt(locked ? cs.teaser : (cs.summary || cs.teaser)) + "</p>" +
      (locked ? tags(cs.tags, "cs__tags") : metaView(cs.meta) + outcomesView(cs.outcomes)) +
      "</header>";
  }

  function lockedView(cs, g) {
    return '<article class="cs cs--locked">' + caseHead(cs, g, true) +
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
        '<h2 class="cs__h2" id="h-' + esc(s.id) + '" tabindex="-1">' + esc(s.title) + "</h2>" +
        (s.blocks || []).map(function (b) { return block(b, function () { return ++fig; }); }).join("") +
        "</section>";
    }).join("");
    var toc = secs.length > 1 ? '<nav class="toc" aria-label="On this page"><p class="toc__t">On this page</p><ol class="toc__list">' +
      secs.map(function (s) { return '<li><a class="toc__a" href="#/work/' + esc(cs.slug) + "/" + esc(s.id) + '" data-sec="' + esc(s.id) + '">' + esc(s.label || s.title) + "</a></li>"; }).join("") +
      "</ol></nav>" : "";
    return '<article class="cs">' + caseHead(cs, g, false) +
      '<div class="wrap cs__body">' + toc + '<div class="cs__content">' + body + "</div></div>" +
      nextView(cs) + "</article>";
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

  function block(b, nextFig) {
    switch (b.type) {
      case "text":
        return '<p class="b-text">' + fmt(b.body) + "</p>";
      case "callout":
        return '<div class="b-callout">' + (b.title ? '<p class="b-callout__t">' + esc(b.title) + "</p>" : "") + '<p class="b-callout__b">' + fmt(b.body) + "</p></div>";
      case "steps":
        return (b.title ? '<h3 class="b-h3">' + esc(b.title) + "</h3>" : "") +
          '<ol class="b-steps">' + (b.items || []).map(function (it) {
            return '<li><span class="b-steps__t">' + esc(it.title) + "</span>" + (it.body ? '<span class="b-steps__b">' + fmt(it.body) + "</span>" : "") + "</li>";
          }).join("") + "</ol>";
      case "principles":
        return (b.title ? '<h3 class="b-h3">' + esc(b.title) + "</h3>" : "") +
          '<ul class="b-prin">' + (b.items || []).map(function (it) {
            return '<li><span class="b-prin__t">' + esc(it.title) + '</span><span class="b-prin__b">' + fmt(it.body) + "</span></li>";
          }).join("") + "</ul>";
      case "decisions":
        return (b.title ? '<h3 class="b-h3">' + esc(b.title) + "</h3>" : "") +
          '<ul class="dec">' + (b.items || []).map(function (d) {
            return '<li class="dec__item"><p class="dec__d">' + fmt(d.decision) + "</p>" +
              '<div class="dec__c"><p class="dec__k">Why</p><p>' + fmt(d.why) + "</p></div>" +
              (d.tradeoff ? '<div class="dec__c dec__c--to"><p class="dec__k">Trade-off</p><p>' + fmt(d.tradeoff) + "</p></div>" : "") + "</li>";
          }).join("") + "</ul>";
      case "table":
        return tableView(b);
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
    return '<nav class="next" aria-label="Next case study"><div class="wrap"><a class="next__a" href="#/work/' + esc(nx.slug) + '">' +
      '<span class="next__k">Next case study' + (nx.protected && !isOpen(nx) ? ", protected" : "") + "</span>" +
      '<span class="next__t">' + esc(nx.title) + '</span><span class="next__g">' + esc(g.company || "") + "</span></a></div></nav>";
  }

  function viewNotFound() {
    return '<section class="sec nf"><div class="wrap">' +
      '<h1 class="cs__title" tabindex="-1">This page doesn’t exist</h1>' +
      '<p class="cs__sum">The link may be out of date. Every case study is listed under Selected work.</p>' +
      '<p class="nf__cta"><a class="btn btn--primary" href="#/work">See selected work</a></p></div></section>';
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
      var target = onCase ? document.querySelector(".cs__title") : document.querySelector(".vault__row");
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
    if (parts[0] === "work" && parts[1]) return { name: "case", slug: parts[1], section: parts[2] || null };
    if (HOME_SECTIONS.indexOf(parts[0]) > -1) return { name: "home", section: parts[0] };
    return { name: "notfound" };
  }
  function samePage(a, b) {
    if (!a || !b || a.name !== b.name) return false;
    return a.name === "home" || (a.name === "case" && a.slug === b.slug);
  }

  function render(opts) {
    opts = opts || {};
    var r = parseRoute();
    var first = !state.route;
    var keep = !opts.force && samePage(state.route, r);
    if (!keep) {
      cleanup();
      state.tableN = 0;
      byId("main").innerHTML = r.name === "home" ? viewHome() : r.name === "case" ? viewCase(r.slug) : viewNotFound();
      mount(r);
    }
    state.route = r;
    setTitle(r);
    setNav(r.name === "case" ? "work" : r.section);
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
    document.title = cs ? cs.title + " | " + m.name : r.name === "notfound" ? "Page not found | " + m.name : m.name + ", " + m.role;
  }

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
      observe(HOME_SECTIONS.map(byId).filter(Boolean), function (id) { setNav(id); });
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
