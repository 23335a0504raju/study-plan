/* =====================================================================
   INFOSYS 20 DEC — tracker for the in-person coding round.
   Screens: Today · Full plan · Pattern quiz · My progress · Guide.
   - Content: plan-data.js (window.DEC20). Own state per user, key
     "dec20-plan-v1-<name>"; no other plan's progress is read or written.
   - All DOM hooks use data-d20-* attributes / d20* ids.
   - Registered with window.Plans (setUser / flush / forgetUser).
   ===================================================================== */
(function () {
  "use strict";
  const DATA = window.DEC20;
  if (!DATA || !window.Plans) return;

  const KEY_PREFIX = "dec20-plan-v1-";
  const OLD_R2_PREFIX = "infosys-r2-v1-"; // removed plan: only cleared when a profile is deleted
  const DAYS = DATA.days;
  const FIRST = DAYS[0], LAST = DAYS[DAYS.length - 1];
  const ALL = DAYS.flatMap((day) => day.must.concat(day.stretch, day.stdin).map((p) => ({ p, day })));
  const BY_ID = {};
  ALL.forEach((x) => { BY_ID[x.p.id] = x; });
  const MAIN = DAYS.flatMap((d) => d.must);
  const EXTRA = DAYS.flatMap((d) => d.stretch);
  const TYPING = DAYS.flatMap((d) => d.stdin);

  const PHASES = [
    { n: "Core patterns", d: "Hashing, two pointers, greedy, heaps, binary search. These win the first problem.", from: 1, to: 6 },
    { n: "Dynamic programming and first mock", d: "The topic that comes up most for the harder problems.", from: 7, to: 10 },
    { n: "Practice and mock tests", d: "Backtracking, story problems, two full mocks and a repair day.", from: 11, to: 15 },
    { n: "Trees and graphs", d: "The last learning block.", from: 16, to: 20 },
    { n: "Final two days", d: "Short mock, then rest.", from: 21, to: 22 }
  ];
  const CHECKPOINTS = [
    { id: "A", date: "2026-12-06", when: "Checkpoint A · after Mock 1", pass: "The first problem passes every test case within 40 minutes.",
      miss: "Spend the Day 10 evening, plus 30 minutes daily, on easy and medium problems where you read the input yourself. Skip the extra DP problems." },
    { id: "B", date: "2026-12-10", when: "Checkpoint B · after Mock 2", pass: "Two problems pass every test case within 2 hours 15 minutes.",
      miss: "Use the repair day (11 Dec) to solve the greedy, binary search and DP problems again." },
    { id: "C", date: "2026-12-12", when: "Checkpoint C · after Mock 3", pass: "You fully solved two problems in Mock 2 or Mock 3.",
      miss: "13–16 Dec: main problems only. Replace 17 Dec with greedy and DP re-solving. In the exam, secure one full solve first, then go for the second." }
  ];
  const MOCKS = [["diag", "Diagnostic · 28 Nov"], ["m1", "Mock 1 · 6 Dec"], ["m2", "Mock 2 · 10 Dec"], ["m3", "Mock 3 · 12 Dec"], ["mini", "Mini mock · 18 Dec"]];
  const MOCK_FIELDS = [["time", "Minutes per problem"], ["full", "Fully solved"], ["partial", "Partly solved"], ["loss", "What cost the most"], ["fix", "Fix before next"]];
  const CAUSES = [["U", "Misread the question"], ["P", "Missed the pattern"], ["I", "Coding mistake"], ["E", "Edge case"], ["T", "Too slow"]];

  const BLANK = () => ({ v: 1, checked: {}, redo: {}, hours: {}, notes: {}, shown: {}, cp: {}, drill: {}, mocks: {}, errors: [], preference: false, updated: null });
  let state = BLANK(), user = null, canStore = true, saveTimer = null;
  let tab = "today", picked = null; // picked = day number being viewed; null follows the calendar
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
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function toast(msg) {
    const el = $("#status"); if (!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 1400);
  }

  /* ---------- storage ---------- */
  function sanitize(v) {
    const s = BLANK();
    if (!v || typeof v !== "object") return s;
    ["checked", "redo", "hours", "notes", "shown", "cp", "drill", "mocks"].forEach((k) => { s[k] = obj(v[k]); });
    Object.keys(s.redo).forEach((k) => { if (!BY_ID[k] || !/^\d{4}-\d\d-\d\d$/.test(s.redo[k])) delete s.redo[k]; });
    s.errors = Array.isArray(v.errors) ? v.errors.filter((e) => e && typeof e.p === "string").map((e) => ({
      id: str(e.id) || uid(), p: e.p, cause: CAUSES.some((c) => c[0] === e.cause) ? e.cause : "P", clue: str(e.clue), date: str(e.date)
    })) : [];
    s.preference = !!v.preference;
    s.updated = typeof v.updated === "number" ? v.updated : null;
    return s;
  }
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
  const name = (p) => p.task ? p.t : p.n + ". " + p.t;
  const anchor = (p) => '<a class="d20-link" href="' + link(p) + '" target="_blank" rel="noopener">' + esc(name(p)) + " ↗</a>";
  const calendarDay = () => {
    const t = today();
    return t < FIRST.date ? FIRST : (DAYS.find((d) => d.date === t) || LAST);
  };
  const shownDay = () => DAYS.find((d) => d.d === picked) || calendarDay();
  // 3 days later; next day from 15 Dec, so nothing falls due on or after exam day
  const redoDate = () => addDays(today(), today() >= "2026-12-15" && today() < DATA.exam ? 1 : 3);
  const dueIds = () => Object.keys(state.redo).sort((a, b) => state.redo[a].localeCompare(state.redo[b]));
  const unfinished = () => DAYS.filter((d) => d.date < today()).flatMap((d) =>
    d.must.filter((p) => !state.checked[p.id] && !state.redo[p.id]).map((p) => ({ p, d })));

  /* ---------- Today ---------- */
  function problemHTML(p, day) {
    const done = !!state.checked[p.id], due = state.redo[p.id];
    const blind = day.blind && p.hint;
    return '<li class="d20-prob' + (done ? " done" : "") + '">' +
      '<input type="checkbox" data-d20-id="' + p.id + '"' + (done ? " checked" : "") + ' aria-label="Solved: ' + esc(name(p)) + '">' +
      '<div class="d20-pmain"><div class="d20-pname">' + anchor(p) + (p.lv ? '<span class="flag d-' + p.lv + '">' + p.lv + "</span>" : "") + "</div>" +
        (blind && state.shown[p.id] ? '<div class="id-txt">' + esc(p.hint) + "</div>" : "") + "</div>" +
      '<div class="d20-pbtns">' +
        (blind ? '<button type="button" class="tagbtn" data-d20-hint="' + p.id + '" title="Open only after the test">' + (state.shown[p.id] ? "Hide answer hint" : "Answer hint") + "</button>" : "") +
        '<button type="button" class="tagbtn' + (due ? " on" : "") + '" data-d20-help="' + p.id + '" aria-pressed="' + !!due + '">' +
          (due ? "Solve again " + short(due) + " · undo" : "I needed help") + "</button>" +
      "</div></li>";
  }
  const stepHTML = (n, title, help, body, tally) =>
    '<section class="card d20-step"><div class="d20-stephead"><span class="d20-num">' + n + '</span><h3>' + title + "</h3>" +
    (tally ? '<span class="d20-tally">' + tally + "</span>" : "") + "</div>" +
    (help ? '<p class="d20-help">' + help + "</p>" : "") + body + "</section>";
  const listStep = (n, title, help, list, day) =>
    stepHTML(n, title, help, '<ul class="d20-probs">' + list.map((p) => problemHTML(p, day)).join("") + "</ul>", count(list) + " of " + list.length + " done");

  function bannerHTML() {
    const t = today();
    let out = "";
    if (!state.preference && new Date() < new Date(DATA.preference))
      out += '<div class="d20-banner warn-b"><b>Do this first — due 28 Nov, 12:00 PM.</b><label class="d20-check"><input type="checkbox" data-d20-pref> I submitted my 20 Dec date preference and saved a screenshot</label></div>';
    if (t < FIRST.date) out += '<div class="d20-banner"><b>Your plan starts on ' + esc(FIRST.label) + '.</b> Today, read sections 1–4 of the <a href="dec20/Infosys_20Dec_Prep_Plan.pdf" target="_blank" rel="noopener">plan PDF</a>. Below is a preview of Day 1.</div>';
    else if (t === DATA.exam) out += '<div class="d20-banner"><b>Today is the exam.</b> No new problems. Carry your ID and hall ticket. Read the exam-day plan in the Guide tab.</div>';
    else if (t > DATA.exam) out += '<div class="d20-banner"><b>The 20 December round is over.</b> Your progress and logs stay here.</div>';
    return out;
  }

  function renderToday() {
    const day = shownDay(), t = today(), isToday = day.date === t;
    const inPlan = t >= FIRST.date && t <= LAST.date;
    let n = 0, steps = "";
    steps += stepHTML(++n, "Read this first", "", '<p class="d20-learn">' + esc(day.learn) + "</p>");
    if (day.must.length) steps += day.blind
      ? listStep(++n, "Timed test", "Solve without any hints or notes. Tick a box only when every test case passes. Open the answer hint after the test.", day.must, day)
      : listStep(++n, "Solve these problems", "Click a name to open it. Tick the box when every test case passes. If you could not solve it alone, press <b>I needed help</b> and it comes back later.", day.must, day);
    if (day.stdin.length) steps += listStep(++n, "Write a full program", "These are on CSES (free account). Your code must read the input itself, like in the real exam.", day.stdin, day);
    if (day.stretch.length) steps += listStep(++n, "Extra — only if you have time", "", day.stretch, day);
    steps += stepHTML(++n, "Finish the day", "",
      '<p class="target"><b>You are done when:</b> ' + esc(day.done) + "</p>" +
      '<div class="d20-finish"><div class="fld"><label for="d20Hours">Hours studied (plan: ' + day.hours + ')</label><input class="fin" id="d20Hours" type="number" min="0" max="16" step="0.5" data-d20-hours="' + day.d + '" value="' + esc(state.hours[day.d]) + '"></div>' +
      '<div class="fld"><label for="d20Note">Notes</label><textarea id="d20Note" data-d20-note="' + day.d + '" placeholder="What clue did you miss? Which case broke your code?">' + esc(state.notes[day.d]) + "</textarea></div></div>");

    $("#d20Today").innerHTML = bannerHTML() +
      '<div class="d20-daybar">' +
        '<button class="btn" data-d20-pick="' + (day.d - 1) + '"' + (day.d === FIRST.d ? " disabled" : "") + ">← Previous day</button>" +
        '<div class="d20-daytitle"><div class="eyebrow">' + (isToday ? "Today · " : "") + "Day " + day.d + " of " + DAYS.length + " · " + esc(day.label) + " · " + day.hours + " hours</div>" +
        "<h2>" + esc(day.title) + "</h2></div>" +
        '<button class="btn" data-d20-pick="' + (day.d + 1) + '"' + (day.d === LAST.d ? " disabled" : "") + ">Next day →</button>" +
      "</div>" +
      (inPlan && !isToday ? '<p class="d20-back"><button class="btn on" data-d20-pick="0">Back to today</button></p>' : "") +
      steps;
  }

  const queueRow = (p, chip, button) => '<div class="d20-q"><span>' + anchor(p) + ' <span class="chip">' + chip + "</span></span>" + button + "</div>";
  const resolveButton = (id) => '<button class="btn" data-d20-resolved="' + id + '">I solved it now</button>';
  const openButton = (d) => '<button class="btn" data-d20-pick="' + d + '">Open day</button>';

  function renderSide() {
    const t = today(), left = daysBetween(t, DATA.exam);
    const due = dueIds().filter((id) => state.redo[id] <= t);
    const late = unfinished();
    let out = '<div class="card d20-count">' +
      (left > 0 ? '<div class="big">' + left + '</div><div class="cap">day' + (left === 1 ? "" : "s") + " until 20 December</div>"
        : '<div class="big">' + (left === 0 ? "Today" : "Done") + '</div><div class="cap">20 December round</div>') +
      '<div class="d20-sidebar">' + bar(pct(count(MAIN), MAIN.length)) + "</div>" +
      '<p class="id-txt">' + count(MAIN) + " of " + MAIN.length + " main problems solved</p>" +
      '<a class="btn d20-pdf" href="dec20/Infosys_20Dec_Prep_Plan.pdf" target="_blank" rel="noopener">Open the plan PDF</a></div>';
    if (due.length) out += '<div class="card"><h2>Solve again today</h2>' + due.map((id) => queueRow(BY_ID[id].p, "Day " + BY_ID[id].day.d, resolveButton(id))).join("") + "</div>";
    if (late.length) out += '<div class="card"><h2>Unfinished from earlier days</h2>' + late.slice(0, 5).map((x) => queueRow(x.p, "Day " + x.d.d, openButton(x.d.d))).join("") +
      (late.length > 5 ? '<p class="id-txt">+ ' + (late.length - 5) + " more in My progress. Skip extra problems first; never skip a mock.</p>" : "") + "</div>";
    $("#d20Side").innerHTML = out;
  }

  /* ---------- Full plan ---------- */
  function renderPlan() {
    const t = today();
    $("#d20Plan").innerHTML = PHASES.map((ph, i) => {
      const days = DAYS.filter((d) => d.d >= ph.from && d.d <= ph.to);
      const main = days.flatMap((d) => d.must);
      return '<section class="card d20-phase"><div class="d20-phasehead"><div><div class="eyebrow">Part ' + (i + 1) + " · " + esc(days[0].label) + " to " + esc(days[days.length - 1].label) + "</div>" +
        "<h3>" + esc(ph.n) + '</h3><p class="id-txt">' + esc(ph.d) + '</p></div><span class="d20-tally">' + count(main) + " of " + main.length + " solved</span></div>" +
        days.map((d) => {
          const done = count(d.must), total = d.must.length;
          return '<button class="d20-dayrow' + (d.date === t ? " now" : "") + (total && done === total ? " done" : "") + '" data-d20-pick="' + d.d + '">' +
            '<span class="d20-dnum">Day ' + d.d + '</span><span class="d20-ddate">' + esc(d.label) + "</span>" +
            '<span class="d20-dtitle">' + esc(d.title) + (d.date === t ? ' <span class="flag lv">today</span>' : "") + "</span>" +
            '<span class="d20-dcount">' + (total ? done + "/" + total : "—") + "</span></button>";
        }).join("") + "</section>";
    }).join("") + '<div class="d20-banner"><b>Sunday 20 December · Exam day.</b> No new problems. Use the exam-day plan in the Guide tab.</div>';
  }

  /* ---------- My progress ---------- */
  function renderProgress() {
    const t = today();
    const planned = DAYS.filter((d) => d.date <= t).reduce((a, d) => a + d.hours, 0);
    const logged = DAYS.reduce((a, d) => a + (Number(state.hours[d.d]) || 0), 0);
    const rows = PHASES.map((ph) => {
      const list = DAYS.filter((d) => d.d >= ph.from && d.d <= ph.to).flatMap((d) => d.must);
      return '<div class="mrow static d20-mrow"><span class="lname">' + esc(ph.n) + "</span>" + bar(pct(count(list), list.length)) + '<span class="lpct">' + count(list) + "/" + list.length + "</span></div>";
    }).join("");
    const of = (list) => count(list) + '<span class="d20-of">/' + list.length + "</span>";
    $("#d20Progress").innerHTML = "<h2>How much is done</h2>" +
      '<div class="stats">' + stat(of(MAIN), "Main problems") + stat(of(EXTRA), "Extra") + stat(of(TYPING), "Full programs") +
        stat(logged + '<span class="d20-of"> h</span>', "Hours studied") + "</div>" +
      '<p class="id-txt">The plan expects <b>' + planned + " h</b> by today, out of " + DAYS.reduce((a, d) => a + d.hours, 0) + " h in total.</p>" +
      "<h3>Main problems by part</h3>" + rows;
  }
  function renderCheckpoints() {
    $("#d20Checks").innerHTML = "<h2>Am I on track?</h2>" + CHECKPOINTS.map((c) => {
      const v = state.cp[c.id];
      const b = (val, label) => '<button class="tagbtn' + (v === val ? " on" : "") + '" data-d20-cp="' + c.id + '" data-d20-val="' + val + '" aria-pressed="' + (v === val) + '">' + label + "</button>";
      return '<div class="d20-cp"><div class="it">' + c.when + " · " + short(c.date) + "</div>" +
        '<div class="id-txt">Goal: ' + esc(c.pass) + '</div><div class="tags">' + b("pass", "I met it") + b("miss", "I missed it") + "</div>" +
        (v === "miss" ? '<p class="fine"><b>Change the plan:</b> ' + esc(c.miss) + "</p>" : "") +
        (v === "pass" ? '<p class="target">On track. Continue as planned.</p>' : "") + "</div>";
    }).join("");
  }
  function renderQueue() {
    const t = today();
    const redo = dueIds().map((id) => queueRow(BY_ID[id].p, state.redo[id] <= t ? "due now" : "due " + short(state.redo[id]), resolveButton(id))).join("");
    const late = unfinished().map((x) => queueRow(x.p, "Day " + x.d.d, openButton(x.d.d))).join("");
    $("#d20Queue").innerHTML = "<h2>Problems to solve again</h2>" +
      (redo || '<div class="empty">None. Problems marked “I needed help” appear here.</div>') +
      "<h3>Unfinished from earlier days</h3>" + (late || '<div class="empty">Nothing unfinished.</div>');
  }
  function renderMocks() {
    $("#d20Mocks").innerHTML = "<h2>Mock test results</h2>" + MOCKS.map(([id, label]) => {
      const m = obj(state.mocks[id]);
      return '<div class="d20-cp"><div class="it">' + label + '</div><div class="d20-mock">' + MOCK_FIELDS.map(([k, l]) =>
        '<div class="fld"><label>' + l + '</label><input class="fin" type="text" data-d20-mock="' + id + '" data-d20-f="' + k + '" value="' + esc(m[k]) + '" aria-label="' + label + " " + l + '"></div>').join("") + "</div></div>";
    }).join("");
  }
  function renderErrors() {
    const tally = CAUSES.map(([k, l]) => '<span class="chip">' + l + " <b>" + state.errors.filter((e) => e.cause === k).length + "</b></span>").join("");
    const rows = state.errors.slice().reverse().map((e) => '<div class="d20-q"><span><b>' + esc(e.p) + '</b> <span class="chip">' + esc(CAUSES.find((c) => c[0] === e.cause)[1]) + '</span> <span class="chip">' + esc(e.date) + '</span><br><span class="id-txt">' + esc(e.clue) + '</span></span><button class="btn danger" data-d20-err-del="' + e.id + '" aria-label="Remove">×</button></div>').join("");
    $("#d20Errors").innerHTML = '<h2>Mistake log</h2><p class="d20-help">Add every problem you got wrong. The counts show what to fix first.</p><div class="tally">' + tally + "</div>" +
      '<div class="d20-form"><input class="fin" id="d20ErrP" type="text" placeholder="Problem name" aria-label="Problem name"><select class="fin" id="d20ErrC" aria-label="What went wrong">' +
      CAUSES.map(([k, l]) => '<option value="' + k + '">' + l + "</option>").join("") +
      '</select><input class="fin" id="d20ErrK" type="text" placeholder="Clue I missed or case that broke" aria-label="Clue missed"><button class="btn" id="d20ErrAdd">Add</button></div>' +
      (rows || '<div class="empty">No entries yet.</div>');
  }

  /* ---------- Pattern quiz ---------- */
  function drillPool() { return DATA.drill.map((_, i) => i).filter((i) => !drillMissedOnly || state.drill[i] === "miss"); }
  function renderDrill() {
    const got = Object.values(state.drill).filter((v) => v === "got").length;
    const miss = Object.values(state.drill).filter((v) => v === "miss").length;
    const pool = drillPool();
    let body;
    if (!pool.length) body = '<div class="empty">No wrong answers left. Switch back to all questions.</div>';
    else {
      if (!pool.includes(drillAt)) drillAt = pool[0];
      const q = DATA.drill[drillAt];
      body = '<div class="d20-meta"><span class="chip">Question ' + (drillAt + 1) + " of " + DATA.drill.length + "</span></div>" +
        '<p class="d20-question">' + esc(q.q) + "</p>" +
        (drillShown
          ? '<p class="target"><b>' + esc(q.a) + "</b><br>" + esc(q.r) + '</p><div class="toolbar"><button class="btn" data-d20-drill="got">I was right</button><button class="btn danger" data-d20-drill="miss">I was wrong</button></div>'
          : '<p class="d20-help">Which technique would you use, and why? Answer aloud, then check.</p><div class="toolbar"><button class="btn on" data-d20-drill="show">Show answer</button><button class="btn" data-d20-drill="skip">Skip</button></div>');
    }
    $("#d20Drill").innerHTML = "<h2>Right: " + got + " · Wrong: " + miss + " · Goal: 26 of " + DATA.drill.length + "</h2>" + body +
      '<div class="toolbar d20-drillfoot"><button class="btn' + (drillMissedOnly ? " on" : "") + '" data-d20-drill="missed">Only my wrong ones</button><button class="btn" data-d20-drill="reset">Start over</button></div>';
  }

  function renderBackup() {
    $("#d20Backup").innerHTML = "<h2>Backup</h2><p class=\"d20-help\">Progress for " + esc(user) + " is saved in this browser only. Export it before clearing browser data or changing laptops.</p>" +
      '<div class="toolbar"><button class="btn" id="d20Export">Export backup</button><button class="btn" id="d20Import">Import backup</button><input type="file" id="d20ImportFile" accept="application/json,.json" class="hidden">' +
      '<button class="btn danger" id="d20Reset">Erase this plan’s progress</button></div>';
  }

  /* ---------- render ---------- */
  function renderHeader() {
    const done = count(MAIN), p = pct(done, MAIN.length);
    $("#d20TotalPct").textContent = p + "%";
    $("#d20TotalCount").textContent = done + " of " + MAIN.length + " main problems solved";
    $("#d20ProgPct").textContent = user ? p + "%" : "";
  }
  function showTab() {
    document.querySelectorAll("[data-d20-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.d20Tab === tab)));
    document.querySelectorAll("[data-d20-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.d20Panel !== tab));
  }
  // everything that depends on ticks, dates or the redo queue
  function renderStatus() { renderHeader(); renderToday(); renderSide(); renderPlan(); renderProgress(); renderQueue(); }
  function render() {
    if (!user) return;
    showTab(); renderStatus(); renderCheckpoints(); renderDrill(); renderMocks(); renderErrors(); renderBackup();
  }
  // re-rendering replaces the clicked control, so put keyboard focus back on its successor
  function refocus(attr, value) {
    const el = document.querySelector('#d20View [' + attr + '="' + value + '"]');
    if (el) el.focus({ preventScroll: true });
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    if (!user || !e.target.closest("#d20View")) return;
    const t = e.target;
    const hit = (a) => t.closest("[" + a + "]");
    let el;
    if ((el = hit("data-d20-tab"))) { tab = el.dataset.d20Tab; showTab(); return; }
    if ((el = hit("data-d20-pick"))) {
      const d = Number(el.dataset.d20Pick);
      picked = d === 0 || d === calendarDay().d ? null : d;
      const jump = tab !== "today" || !!el.closest("#d20Side");
      tab = "today"; showTab(); renderToday();
      if (jump) $("#d20Tabs").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if ((el = hit("data-d20-help"))) {
      const id = el.dataset.d20Help;
      if (state.redo[id]) delete state.redo[id];
      else { state.redo[id] = redoDate(); delete state.checked[id]; }
      save(); renderStatus(); refocus("data-d20-help", id); return;
    }
    if ((el = hit("data-d20-resolved"))) { const id = el.dataset.d20Resolved; delete state.redo[id]; state.checked[id] = 1; save(); renderStatus(); return; }
    if ((el = hit("data-d20-hint"))) { const id = el.dataset.d20Hint; if (state.shown[id]) delete state.shown[id]; else state.shown[id] = 1; save(true); renderToday(); refocus("data-d20-hint", id); return; }
    if ((el = hit("data-d20-cp"))) { const id = el.dataset.d20Cp, v = el.dataset.d20Val; if (state.cp[id] === v) delete state.cp[id]; else state.cp[id] = v; save(); renderCheckpoints(); return; }
    if ((el = hit("data-d20-drill"))) {
      const a = el.dataset.d20Drill;
      const advance = () => { const pool = DATA.drill.map((_, i) => i).filter((i) => !drillMissedOnly || state.drill[i] === "miss" || i === drillAt); const at = pool.indexOf(drillAt); drillAt = pool.length ? pool[(at + 1) % pool.length] : 0; drillShown = false; };
      if (a === "show") drillShown = true;
      else if (a === "skip") advance();
      else if (a === "got" || a === "miss") { const cur = drillAt; advance(); state.drill[cur] = a; save(true); }
      else if (a === "missed") { drillMissedOnly = !drillMissedOnly; drillShown = false; }
      else if (a === "reset") { if (!confirm("Clear your quiz score?")) return; state.drill = {}; drillAt = 0; drillShown = false; drillMissedOnly = false; save(true); }
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
      if (confirm("Erase every tick, log and note in the Infosys 20 Dec plan for " + user + "? Your other plans are not affected. This cannot be undone.")) {
        state = BLANK(); writeNow(); render(); toast("Progress erased");
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.target.id === "d20ErrP" || e.target.id === "d20ErrK")) { e.preventDefault(); $("#d20ErrAdd").click(); }
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
          if (!confirm("Replace " + user + "'s Infosys 20 Dec progress with this backup? Your other plans are not affected.")) return;
          state = sanitize(v.data); writeNow(); render(); toast("Backup restored");
        } catch (err) { toast("That file isn't a backup from this plan"); }
      };
      reader.readAsText(file); el.value = "";
      return;
    }
    if (!user || !el.matches) return;
    if (el.matches("[data-d20-pref]")) { state.preference = el.checked; save(); renderToday(); return; }
    if (el.matches("input[type=checkbox][data-d20-id]")) {
      const id = el.dataset.d20Id;
      if (el.checked) { state.checked[id] = 1; delete state.redo[id]; } else delete state.checked[id];
      save(); renderStatus(); refocus("data-d20-id", id);
    }
  });

  window.addEventListener("pagehide", flush);
  let seenDate = today();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
    else if (user && today() !== seenDate) { seenDate = today(); picked = null; renderStatus(); } // a new day began
  });

  window.Plans.register("d20", {
    setUser(n) {
      flush();
      user = n ? String(n).trim() : null;
      canStore = storageWorks();
      if (!canStore) warnStorage();
      tab = "today"; picked = null; drillAt = 0; drillShown = false; drillMissedOnly = false;
      load(); render();
    },
    flush,
    forgetUser(n) {
      const who = String(n).trim();
      try { localStorage.removeItem(KEY_PREFIX + who); localStorage.removeItem(OLD_R2_PREFIX + who); } catch (e) {}
    },
    _debug: { items: ALL, state: () => state }
  });
})();
