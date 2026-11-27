/* =====================================================================
   20 DEC PLAN — day-by-day tracker for the in-person coding round.
   - Content: plan-data.js (window.DEC20). Own state per user, key
     "dec20-plan-v1-<name>"; no other plan's key is read or written.
   - All DOM hooks use data-d20-* attributes / d20* ids.
   - Registered with window.Plans (setUser / flush / forgetUser).
   ===================================================================== */
(function () {
  "use strict";
  const DATA = window.DEC20;
  if (!DATA || !window.Plans) return;

  const KEY_PREFIX = "dec20-plan-v1-";
  const DAYS = DATA.days;
  const ALL = DAYS.flatMap((day) => day.must.concat(day.stretch, day.stdin).map((p) => ({ p, day })));
  const BY_ID = {};
  ALL.forEach((x) => { BY_ID[x.p.id] = x; });
  const MUST = DAYS.flatMap((d) => d.must);
  const STRETCH = DAYS.flatMap((d) => d.stretch);
  const STDIN = DAYS.flatMap((d) => d.stdin);

  const CHECKPOINTS = [
    { id: "A", day: 9, date: "2026-12-06", pass: "First mock problem passes every test within 40 minutes.",
      miss: "Spend Day 10 evening plus 30 minutes daily on easy / medium implementation from stdin. Skip DP stretch problems." },
    { id: "B", day: 13, date: "2026-12-10", pass: "Two mock problems pass every test within 2 h 15 min.",
      miss: "Use Day 14 to re-solve greedy, binary search and DP must problems." },
    { id: "C", day: 15, date: "2026-12-12", pass: "Two full solves in Mock 2 or Mock 3.",
      miss: "Days 16-19: must problems only. Replace Day 20 with greedy / DP re-solving. Exam plan: one full solve for certain, then the second." }
  ];
  const MOCKS = [["diag", "Diagnostic · 28 Nov"], ["m1", "Mock 1 · 6 Dec"], ["m2", "Mock 2 · 10 Dec"], ["m3", "Mock 3 · 12 Dec"], ["mini", "Mini mock · 18 Dec"]];
  const MOCK_FIELDS = [["time", "Minutes per problem"], ["full", "Full passes"], ["partial", "Partial"], ["loss", "Biggest loss"], ["fix", "Fix before next"]];
  const CAUSES = [["U", "Understanding"], ["P", "Pattern missed"], ["I", "Implementation"], ["E", "Edge case"], ["T", "Too slow"]];

  const BLANK = () => ({ v: 1, checked: {}, redo: {}, hours: {}, notes: {}, open: {}, shown: {}, cp: {}, drill: {}, mocks: {}, errors: [], preference: false, updated: null });
  let state = BLANK(), user = null, canStore = true, saveTimer = null;
  let drillAt = 0, drillShown = false, drillMissedOnly = false;

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const str = (x) => typeof x === "string" ? x : (typeof x === "number" && isFinite(x) ? String(x) : "");
  const obj = (x) => (x && typeof x === "object" && !Array.isArray(x)) ? x : {};
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = () => iso(new Date());
  const asDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = asDate(s); d.setDate(d.getDate() + n); return iso(d); };
  const daysBetween = (a, b) => Math.round((asDate(b) - asDate(a)) / 86400000);
  const short = (s) => asDate(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  function toast(msg) {
    const el = $("#status"); if (!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 1400);
  }

  /* ---------- storage ---------- */
  function sanitize(v) {
    const s = BLANK();
    if (!v || typeof v !== "object") return s;
    ["checked", "redo", "hours", "notes", "open", "shown", "cp", "drill", "mocks"].forEach((k) => { s[k] = obj(v[k]); });
    Object.keys(s.redo).forEach((k) => { if (!BY_ID[k] || !/^\d{4}-\d\d-\d\d$/.test(s.redo[k])) delete s.redo[k]; });
    s.errors = Array.isArray(v.errors) ? v.errors.filter((e) => e && typeof e.p === "string").map((e) => ({
      id: str(e.id) || uid(), p: e.p, cause: CAUSES.some((c) => c[0] === e.cause) ? e.cause : "P", clue: str(e.clue), date: str(e.date)
    })) : [];
    s.preference = !!v.preference;
    s.updated = typeof v.updated === "number" ? v.updated : null;
    return s;
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function storageWorks() { try { localStorage.setItem("dec20-probe", "1"); localStorage.removeItem("dec20-probe"); return true; } catch (e) { return false; } }
  function warnStorage() { const w = $("#storageWarn"); if (w) w.classList.remove("hidden"); }
  function load() {
    state = BLANK();
    if (!canStore || !user) return;
    try { const raw = localStorage.getItem(KEY_PREFIX + user); if (raw) state = sanitize(JSON.parse(raw)); }
    catch (e) { state = BLANK(); }
  }
  // keeps this user in the shared "Continue as…" list, like the other plans do
  function touchProfile() {
    try {
      let arr = JSON.parse(localStorage.getItem("prime-ledger-profiles") || "[]");
      if (!Array.isArray(arr)) arr = [];
      const p = arr.find((x) => x && x.name === user);
      if (p) p.updated = Date.now(); else arr.unshift({ name: user, updated: Date.now(), pct: 0 });
      arr.sort((a, b) => b.updated - a.updated);
      localStorage.setItem("prime-ledger-profiles", JSON.stringify(arr));
    } catch (e) {}
  }
  function writeNow() {
    if (!canStore || !user) return false;
    try { state.updated = Date.now(); localStorage.setItem(KEY_PREFIX + user, JSON.stringify(state)); touchProfile(); return true; }
    catch (e) { canStore = false; warnStorage(); return false; }
  }
  function save(quiet) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      const ok = writeNow();
      if (!ok) toast("Not saved — storage blocked"); else if (!quiet) toast("Saved");
    }, 350);
  }
  function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; writeNow(); } }

  /* ---------- helpers ---------- */
  const count = (list) => list.filter((p) => state.checked[p.id]).length;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const bar = (p) => '<span class="mbar"><span style="width:' + p + '%"></span></span>';
  const stat = (v, l) => '<div class="stat"><div class="v">' + v + '</div><div class="l">' + l + "</div></div>";
  const link = (p) => p.task ? "https://cses.fi/problemset/task/" + p.task : "https://leetcode.com/problems/" + p.id + "/";
  const name = (p) => p.task ? "CSES · " + p.t : p.n + ". " + p.t;
  const currentDay = () => DAYS.find((d) => d.date === today());
  // 3 days later; next day from 15 Dec, so nothing falls due on or after exam day
  const redoDate = () => addDays(today(), today() >= "2026-12-15" && today() < DATA.exam ? 1 : 3);

  function problemHTML(p, day, kind) {
    const done = !!state.checked[p.id], due = state.redo[p.id];
    const blind = day.blind && p.hint;
    return '<div class="item compact d20-row' + (done ? " done" : "") + '">' +
      '<input type="checkbox" data-d20-id="' + p.id + '"' + (done ? " checked" : "") + ' aria-label="' + esc(name(p)) + '">' +
      '<div><div class="it"><a class="d20-link" href="' + link(p) + '" target="_blank" rel="noopener">' + esc(name(p)) + "</a>" +
        (p.lv ? '<span class="flag d-' + p.lv + '">' + p.lv + "</span>" : "") +
        (kind ? '<span class="flag lv">' + kind + "</span>" : "") +
        '<button type="button" class="tagbtn' + (due ? " on" : "") + '" data-d20-help="' + p.id + '" aria-pressed="' + !!due + '" title="Adds it to the redo queue (3 days later; next day from 15 Dec)">' +
          (due ? "Redo " + short(due) : "Needed help") + "</button>" +
        (blind ? '<button type="button" class="tagbtn" data-d20-hint="' + p.id + '">' + (state.shown[p.id] ? "Hide pattern" : "Show pattern (after)") + "</button>" : "") +
      "</div>" + (blind && state.shown[p.id] ? '<div class="id-txt">' + esc(p.hint) + "</div>" : "") + "</div></div>";
  }
  const problemList = (day) =>
    day.must.map((p) => problemHTML(p, day, "")).join("") +
    day.stretch.map((p) => problemHTML(p, day, "stretch")).join("") +
    day.stdin.map((p) => problemHTML(p, day, "stdin")).join("");

  /* ---------- header and top cards ---------- */
  function renderHeader() {
    const done = count(MUST), p = pct(done, MUST.length);
    $("#d20TotalPct").textContent = p + "%";
    $("#d20TotalCount").textContent = done + " of " + MUST.length + " must problems";
    $("#d20ProgPct").textContent = user ? p + "%" : "";
  }

  function renderToday() {
    const t = today(), left = daysBetween(t, DATA.exam), day = currentDay();
    let body = "";
    const pref = '<label class="d20-check"><input type="checkbox" data-d20-pref' + (state.preference ? " checked" : "") + "> Date preference (20 Dec) submitted and screenshot saved</label>";
    if (!state.preference && new Date() < new Date(DATA.preference)) body += '<p class="target"><b>Due 28 Nov, 12:00 PM.</b> ' + pref + "</p>";
    else body += '<p class="id-txt">' + pref + "</p>";
    if (left < 0) body += '<p class="empty">The 20 December round has passed. Your logs stay here.</p>';
    else if (left === 0) body += '<p class="target"><b>Exam day.</b> No new problems. Carry ID and hall ticket. Open “Exam-day plan” below.</p>';
    else if (day) {
      body += '<h3>Day ' + day.d + " · " + esc(day.label) + " · " + day.hours + " h</h3>" +
        '<div class="it" style="font-size:16px">' + esc(day.title) + "</div>" +
        '<p class="id-txt">' + esc(day.learn) + "</p>" +
        '<div class="d20-list">' + (problemList(day) || '<div class="empty">No new problems today. Work through the redo queue.</div>') + "</div>" +
        '<p class="fine"><b>Done when:</b> ' + esc(day.done) + "</p>";
    } else body += '<p class="id-txt">The plan starts on <b>28 November</b> with a timed diagnostic. Today: read PDF sections 1–4.</p>';
    $("#d20Today").innerHTML = "<h2>Today — " + (left > 0 ? left + " day" + (left === 1 ? "" : "s") + " to 20 Dec" : "20 Dec round") + "</h2>" + body;
  }

  function renderProgress() {
    const t = today();
    const planned = DAYS.filter((d) => d.date <= t).reduce((a, d) => a + d.hours, 0);
    const logged = DAYS.reduce((a, d) => a + (Number(state.hours[d.d]) || 0), 0);
    const due = Object.keys(state.redo).filter((k) => state.redo[k] <= t).length;
    const row = (l, list) => '<div class="mrow static"><span class="lname">' + l + "</span>" + bar(pct(count(list), list.length)) + '<span class="lpct">' + count(list) + "/" + list.length + "</span></div>";
    const topics = [["Patterns", 1, 6], ["DP", 7, 8], ["DP (sequences)", 10, 10], ["Backtrack + sim", 11, 12], ["Mocks", 0, 0], ["Trees", 16, 17], ["Graphs", 18, 20]];
    const rows = topics.map(([l, a, b]) => {
      const list = l === "Mocks" ? DAYS.filter((d) => d.blind && d.d > 1).flatMap((d) => d.must)
        : DAYS.filter((d) => d.d >= a && d.d <= b && !d.blind).flatMap((d) => d.must);
      return row(l, list);
    }).join("");
    $("#d20Progress").innerHTML = "<h2>Progress</h2>" +
      '<div class="stats">' + stat(count(MUST) + '<span class="d20-of">/' + MUST.length + "</span>", "Must") +
        stat(count(STRETCH) + '<span class="d20-of">/' + STRETCH.length + "</span>", "Stretch") +
        stat(count(STDIN) + '<span class="d20-of">/' + STDIN.length + "</span>", "Stdin") +
        stat(due, "Redo due") + "</div>" +
      '<p class="id-txt">Hours logged: <b>' + logged + "</b> · planned up to today: <b>" + planned + "</b> · whole plan: <b>" + DAYS.reduce((a, d) => a + d.hours, 0) + "</b></p>" +
      "<h3>Must problems by block</h3>" + rows;
  }

  function renderQueue() {
    const t = today();
    const redo = Object.keys(state.redo).sort((a, b) => state.redo[a].localeCompare(state.redo[b])).map((id) => {
      const p = BY_ID[id].p, due = state.redo[id];
      return '<div class="d20-q"><span><a class="d20-link" href="' + link(p) + '" target="_blank" rel="noopener">' + esc(name(p)) + "</a> " +
        '<span class="chip">' + (due <= t ? "due now" : "due " + short(due)) + "</span></span>" +
        '<button class="btn" data-d20-resolved="' + id + '">Solved from blank</button></div>';
    }).join("");
    const carry = DAYS.filter((d) => d.date < t).flatMap((d) => d.must.filter((p) => !state.checked[p.id] && !state.redo[p.id]).map((p) =>
      '<div class="d20-q"><span><a class="d20-link" href="' + link(p) + '" target="_blank" rel="noopener">' + esc(name(p)) + '</a> <span class="chip">Day ' + d.d + "</span></span>" +
      '<button class="btn" data-d20-goto="' + d.d + '">Open day</button></div>'));
    $("#d20Queue").innerHTML = "<h2>Redo queue — solve again 3 days later</h2>" +
      (redo || '<div class="empty">Empty. Press “Needed help” on any problem you could not solve alone.</div>') +
      "<h3>Carried over (unfinished must problems)</h3>" +
      (carry.length ? carry.slice(0, 8).join("") + (carry.length > 8 ? '<p class="id-txt">+ ' + (carry.length - 8) + " more. Do not move mocks; drop stretch problems first.</p>" : "") : '<div class="empty">Nothing carried over.</div>');
  }

  function renderCheckpoints() {
    $("#d20Checks").innerHTML = "<h2>Checkpoints</h2>" + CHECKPOINTS.map((c) => {
      const v = state.cp[c.id];
      const b = (val, label) => '<button class="tagbtn' + (v === val ? " on" : "") + '" data-d20-cp="' + c.id + '" data-d20-val="' + val + '" aria-pressed="' + (v === val) + '">' + label + "</button>";
      return '<div class="d20-cp"><div class="it">' + c.id + " · Day " + c.day + " · " + short(c.date) + "</div>" +
        '<div class="id-txt">' + esc(c.pass) + '</div><div class="tags">' + b("pass", "Passed") + b("miss", "Missed") + "</div>" +
        (v === "miss" ? '<p class="fine"><b>Change the plan:</b> ' + esc(c.miss) + "</p>" : "") +
        (v === "pass" ? '<p class="target">On track. Continue as planned.</p>' : "") + "</div>";
    }).join("");
  }

  /* ---------- day list ---------- */
  function dayHTML(day) {
    const t = today(), isToday = day.date === t;
    const open = state.open[day.d] === undefined ? isToday : !!state.open[day.d];
    const done = count(day.must), total = day.must.length;
    const complete = total > 0 && done === total;
    return '<section class="block mod' + (open ? " open" : "") + (complete ? " complete" : "") + (isToday ? " d20-now" : "") + '" id="d20-day-' + day.d + '">' +
      '<div class="mhead" data-d20-day="' + day.d + '" role="button" tabindex="0" aria-expanded="' + open + '">' +
      '<span class="bnum">D' + day.d + "</span>" +
      '<span class="mwrap"><span class="mtitle">' + esc(day.title) + '</span><span class="mmeta">' + esc(day.label) + " · " + day.hours + " h" + (isToday ? " · TODAY" : "") + (day.blind ? " · timed, pattern hidden" : "") + "</span></span>" +
      '<span class="sflag done">complete</span><span class="bcount">' + (total ? done + "/" + total : "") + '</span><span class="chev">▼</span>' +
      '<span class="mprog" style="width:' + pct(done, total) + '%"></span></div>' +
      '<div class="mbody">' + (open ?
        '<div class="bnote">' + esc(day.learn) + "<br><b>Done when:</b> " + esc(day.done) + "</div>" + problemList(day) +
        '<div class="mnotes"><div class="d20-meta"><div class="fld"><label for="d20h' + day.d + '">Hours done</label><input class="fin" id="d20h' + day.d + '" type="number" min="0" max="16" step="0.5" data-d20-hours="' + day.d + '" value="' + esc(state.hours[day.d]) + '"></div></div>' +
        '<div class="flabel">Notes</div><textarea data-d20-note="' + day.d + '" placeholder="What clue did you miss? Which edge case broke?">' + esc(state.notes[day.d]) + "</textarea></div>"
        : "") + "</div></section>";
  }
  function renderDays() { $("#d20Days").innerHTML = DAYS.map(dayHTML).join(""); }

  /* ---------- pattern drill ---------- */
  function drillPool() { return DATA.drill.map((_, i) => i).filter((i) => !drillMissedOnly || state.drill[i] === "miss"); }
  function renderDrill() {
    const got = Object.values(state.drill).filter((v) => v === "got").length;
    const miss = Object.values(state.drill).filter((v) => v === "miss").length;
    const pool = drillPool();
    let body;
    if (!pool.length) body = '<div class="empty">No missed items. Switch back to all items.</div>';
    else {
      if (!pool.includes(drillAt)) drillAt = pool[0];
      const q = DATA.drill[drillAt];
      body = '<div class="d20-meta"><span class="chip">Item ' + (drillAt + 1) + " of " + DATA.drill.length + "</span></div>" +
        '<p class="it" style="font-size:16px">' + esc(q.q) + "</p>" +
        (drillShown
          ? '<p class="target"><b>' + esc(q.a) + "</b><br>" + esc(q.r) + '</p><div class="toolbar"><button class="btn" data-d20-drill="got">I got it, with the reason</button><button class="btn danger" data-d20-drill="miss">I missed it</button></div>'
          : '<p class="id-txt">Say the pattern and one reason aloud (under 60 seconds).</p><div class="toolbar"><button class="btn" data-d20-drill="show">Reveal answer</button><button class="btn" data-d20-drill="skip">Skip</button></div>');
    }
    $("#d20Drill").innerHTML = "<h2>Pattern recognition drill — " + got + " got · " + miss + " missed · target 26/" + DATA.drill.length + "</h2>" + body +
      '<div class="toolbar" style="margin-bottom:0"><button class="btn' + (drillMissedOnly ? " on" : "") + '" data-d20-drill="missed">Missed only</button><button class="btn" data-d20-drill="reset">Reset score</button></div>';
  }

  /* ---------- logs ---------- */
  function renderMocks() {
    $("#d20Mocks").innerHTML = "<h2>Mock log</h2>" + MOCKS.map(([id, label]) => {
      const m = obj(state.mocks[id]);
      return '<div class="d20-cp"><div class="it">' + label + '</div><div class="d20-mock">' + MOCK_FIELDS.map(([k, l]) =>
        '<div class="fld"><label>' + l + '</label><input class="fin" type="text" data-d20-mock="' + id + '" data-d20-f="' + k + '" value="' + esc(m[k]) + '" aria-label="' + label + " " + l + '"></div>').join("") + "</div></div>";
    }).join("");
  }
  function renderErrors() {
    const tally = CAUSES.map(([k, l]) => '<span class="chip">' + l + " <b>" + state.errors.filter((e) => e.cause === k).length + "</b></span>").join("");
    const rows = state.errors.slice().reverse().map((e) => '<div class="d20-q"><span><b>' + esc(e.p) + '</b> <span class="chip">' + esc(CAUSES.find((c) => c[0] === e.cause)[1]) + '</span> <span class="chip">' + esc(e.date) + '</span><br><span class="id-txt">' + esc(e.clue) + '</span></span><button class="btn danger" data-d20-err-del="' + e.id + '" aria-label="Remove">×</button></div>').join("");
    $("#d20Errors").innerHTML = "<h2>Error log</h2><div class=\"tally\">" + tally + "</div>" +
      '<div class="d20-form"><input class="fin" id="d20ErrP" type="text" placeholder="Problem"><select class="fin" id="d20ErrC" aria-label="Cause">' +
      CAUSES.map(([k, l]) => '<option value="' + k + '">' + l + "</option>").join("") +
      '</select><input class="fin" id="d20ErrK" type="text" placeholder="Clue missed / case that broke"><button class="btn" id="d20ErrAdd">Add</button></div>' +
      (rows || '<div class="empty">Log every failure. The tally shows what to fix first.</div>');
  }
  function renderBackup() {
    $("#d20Backup").innerHTML = '<div class="flabel">20 Dec plan backup</div><p class="empty" style="padding-top:0">Saved in this browser for ' + esc(user) + ", separately from your other plans.</p>" +
      '<div class="toolbar"><button class="btn" id="d20Export">Export backup</button><button class="btn" id="d20Import">Import backup</button><input type="file" id="d20ImportFile" accept="application/json,.json" class="hidden"></div>' +
      '<div class="flabel">Danger zone</div><button class="btn danger" id="d20Reset">Erase 20 Dec progress</button>';
  }

  function renderTop() { renderHeader(); renderToday(); renderProgress(); renderQueue(); }
  function render() {
    if (!user) return;
    renderTop(); renderCheckpoints(); renderDays(); renderDrill(); renderMocks(); renderErrors(); renderBackup();
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    if (!user || !e.target.closest("#d20View")) return;
    const t = e.target;
    const hit = (a) => t.closest("[" + a + "]");
    let el;
    if ((el = hit("data-d20-help"))) {
      const id = el.dataset.d20Help;
      if (state.redo[id]) delete state.redo[id];
      else { state.redo[id] = redoDate(); delete state.checked[id]; }
      save(); renderTop(); renderDays(); return;
    }
    if ((el = hit("data-d20-resolved"))) { const id = el.dataset.d20Resolved; delete state.redo[id]; state.checked[id] = 1; save(); renderTop(); renderDays(); return; }
    if ((el = hit("data-d20-hint"))) { const id = el.dataset.d20Hint; if (state.shown[id]) delete state.shown[id]; else state.shown[id] = 1; save(true); renderToday(); renderDays(); return; }
    if ((el = hit("data-d20-day"))) {
      const d = el.dataset.d20Day, sec = el.closest("section");
      state.open[d] = !sec.classList.contains("open"); save(true); renderDays();
      const head = document.querySelector('[data-d20-day="' + d + '"]'); if (head) head.focus({ preventScroll: true });
      return;
    }
    if ((el = hit("data-d20-goto"))) {
      const d = el.dataset.d20Goto; state.open[d] = true; save(true); renderDays();
      document.getElementById("d20-day-" + d).scrollIntoView({ behavior: "smooth", block: "start" }); return;
    }
    if ((el = hit("data-d20-cp"))) { const id = el.dataset.d20Cp, v = el.dataset.d20Val; if (state.cp[id] === v) delete state.cp[id]; else state.cp[id] = v; save(); renderCheckpoints(); return; }
    if ((el = hit("data-d20-drill"))) {
      const a = el.dataset.d20Drill;
      const advance = () => { const pool = DATA.drill.map((_, i) => i).filter((i) => !drillMissedOnly || state.drill[i] === "miss" || i === drillAt); const at = pool.indexOf(drillAt); drillAt = pool.length ? pool[(at + 1) % pool.length] : 0; drillShown = false; };
      if (a === "show") drillShown = true;
      else if (a === "skip") advance();
      else if (a === "got" || a === "miss") { const cur = drillAt; advance(); state.drill[cur] = a; save(true); }
      else if (a === "missed") { drillMissedOnly = !drillMissedOnly; drillShown = false; }
      else if (a === "reset") { if (!confirm("Reset the drill score?")) return; state.drill = {}; drillAt = 0; drillShown = false; drillMissedOnly = false; save(true); }
      renderDrill(); return;
    }
    if (t.id === "d20ErrAdd") {
      const p = $("#d20ErrP").value.trim(); if (!p) { $("#d20ErrP").focus(); return; }
      state.errors.push({ id: uid(), p, cause: $("#d20ErrC").value, clue: $("#d20ErrK").value.trim(), date: short(today()) });
      save(); renderErrors(); return;
    }
    if ((el = hit("data-d20-err-del"))) { state.errors = state.errors.filter((x) => x.id !== el.dataset.d20ErrDel); save(); renderErrors(); return; }
    if (t.id === "d20Export") {
      flush();
      const payload = { app: "dec20-plan", version: 1, user, exported: new Date().toISOString(), data: state };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url; a.download = "dec20-plan-backup-" + today() + ".json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); toast("Backup downloaded"); return;
    }
    if (t.id === "d20Import") { $("#d20ImportFile").click(); return; }
    if (t.id === "d20Reset") {
      if (confirm("Erase every 20 Dec plan tick, log and note for " + user + "? Your other plans are not affected. This cannot be undone.")) {
        state = BLANK(); writeNow(); render(); toast("20 Dec progress erased");
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.target.id === "d20ErrP" || e.target.id === "d20ErrK")) { e.preventDefault(); $("#d20ErrAdd").click(); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-d20-day]")) { e.preventDefault(); e.target.click(); }
  });

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!user || !el.matches) return;
    if (el.matches("[data-d20-hours]")) {
      const n = Math.min(Math.max(Number(el.value) || 0, 0), 16);
      if (el.value === "") delete state.hours[el.dataset.d20Hours]; else state.hours[el.dataset.d20Hours] = n;
      save(true); renderProgress(); return;
    }
    if (el.matches("[data-d20-note]")) { state.notes[el.dataset.d20Note] = el.value; save(true); return; }
    if (el.matches("[data-d20-mock]")) { const id = el.dataset.d20Mock; state.mocks[id] = obj(state.mocks[id]); state.mocks[id][el.dataset.d20F] = el.value; save(true); }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.id === "d20ImportFile") {
      const file = el.files && el.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const v = JSON.parse(reader.result);
          if (!v || v.app !== "dec20-plan" || !v.data || typeof v.data.checked !== "object") throw new Error("bad shape");
          if (!confirm("Replace " + user + "'s 20 Dec progress with this backup? Your other plans are not affected.")) return;
          state = sanitize(v.data); writeNow(); render(); toast("Backup restored");
        } catch (err) { toast("That file isn't a 20 Dec plan backup"); }
      };
      reader.readAsText(file); el.value = "";
      return;
    }
    if (!user || !el.matches) return;
    if (el.matches("[data-d20-pref]")) { state.preference = el.checked; save(); renderToday(); return; }
    if (el.matches("input[type=checkbox][data-d20-id]")) {
      const id = el.dataset.d20Id;
      if (el.checked) { state.checked[id] = 1; delete state.redo[id]; } else delete state.checked[id];
      save(); renderTop(); renderDays();
    }
  });

  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
    else if (user) renderTop(); // the date may have changed while the tab was in the background
  });

  window.Plans.register("d20", {
    setUser(n) {
      flush();
      user = n ? String(n).trim() : null;
      canStore = storageWorks();
      if (!canStore) warnStorage();
      drillAt = 0; drillShown = false; drillMissedOnly = false;
      load(); render();
    },
    flush,
    forgetUser(n) { try { localStorage.removeItem(KEY_PREFIX + String(n).trim()); } catch (e) {} },
    _debug: { items: ALL, state: () => state }
  });
})();
