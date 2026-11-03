/* =====================================================================
   Infosys Internal Training — /infosys
   For a Systems Engineer who is already selected: pre-joining preparation
   (phase A), Generic Foundation Training (phase B), stream training and
   capstone (phase C), internal assessments, daily classes/assignments.

   Storage: "infosys_se_preparation_v1-<name>" (key name kept so existing
   data stays where it is; the schema inside is versioned, now v: 2).
   Before the v1 → v2 migration the raw v1 JSON is copied to
   "infosys_se_preparation_v1-<name>__v1-backup" and can be downloaded
   from Sources & data. Shares only the name list and this tab's active
   name with the home page; never touches another plan's key.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.SE_CONTENT, MQ = window.SE_MCQ, SQ = window.SE_SQL;
  if (!C || !MQ || !SQ) {
    document.getElementById("view").innerHTML = '<div class="warn">Some page files failed to load. Refresh the page; if it keeps happening, check your connection.</div>';
    return;
  }

  /* ------------------------------------------------------------ constants */
  const NS = "infosys_se_preparation_v1";
  const KEY = (u) => NS + "-" + u;
  const BACKUP_KEY = (u) => KEY(u) + "__v1-backup";
  const SCHEMA = 2;
  const PROFILES = "prime-ledger-profiles";
  const SESSION = "prime-ledger-session-user";
  const PROBE = NS + "-probe";
  const STATUS = [["ns", "Not Started"], ["ip", "In Progress"], ["done", "Completed"], ["rev", "Needs Revision"]];
  const STATUS_NAME = Object.fromEntries(STATUS);
  const DIFF = ["Easy", "Medium", "Hard"];
  const REV = [["none", "No revision planned"], ["due", "Revise again"], ["revised", "Revised"]];
  const SQL_OK = [["unchecked", "Not checked"], ["correct", "Correct"], ["partial", "Partially correct"], ["wrong", "Incorrect"]];
  const A_PHASES = [["A", "Pre-joining"], ["B", "Generic Foundation"], ["C", "Stream training"], ["K", "Capstone"]];
  const A_PHASE_NAME = Object.fromEntries(A_PHASES);
  const A_TYPES = C.ASSESS_TYPES;
  const A_TYPE_NAME = Object.fromEntries(A_TYPES);
  const A_OVERRIDE = [["auto", "Auto (from marks)"], ["pass", "Passed"], ["fail", "Not passed"], ["pending", "Pending"]];
  const RES_LABEL = { pass: "Passed", fail: "Not passed", pending: "Pending", noreq: "Pass mark not set" };
  const DAILY_AREAS = [["prep", "Pre-joining self-study"], ["fa1", "B1 Java (FA1)"], ["fa2", "B2 DBMS / SQL (FA2)"], ["osit", "B3 OS & IT"], ["seweb", "B4 SE & web"], ["prof", "B5 Professional skills"], ["stream", "Stream training"], ["capstone", "Capstone"], ["other", "Other"]];
  const DAILY_AREA_NAME = Object.fromEntries(DAILY_AREAS);
  const REV_AREAS = [["all", "All"], ["prep", "Pre-joining"], ["gjava", "Generic Java"], ["gdbms", "Generic DBMS"], ["stream", "Stream training"], ["capstone", "Capstone"]];
  const READY = [["0", "Not started"], ["1", "Exploring"], ["2", "Learning"], ["3", "Comfortable"], ["4", "Ready"]];
  const TASK_TYPES = ["Development task", "Milestone", "Code review", "Testing", "Presentation", "Submission", "Other"];
  const CAP_STATUS = [["", "—"], ["ns", "Not started"], ["ip", "In progress"], ["done", "Done"], ["rev", "Needs rework"]];
  const VIEWS = [
    ["dashboard", "Dashboard"], ["prep", "Pre-joining"], ["foundation", "Generic Foundation"], ["mcq", "MCQs"], ["sql", "SQL Lab"],
    ["coding", "Java practice"], ["assess", "Assessments"], ["daily", "Daily tracker"], ["stream", "My stream"], ["capstone", "Capstone"],
    ["revision", "Revision"], ["sources", "Sources & data"]
  ];
  const VIEW_NAME = Object.fromEntries(VIEWS);
  const LEGACY_ROUTES = { syllabus: "prep", interview: "dashboard" };
  const SQLJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/";

  /* ------------------------------------------------------------ helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const slug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "item";
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const opt = (pairs, cur) => pairs.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(l)}</option>`).join("");
  const bar = (p, cls) => `<div class="bar${cls ? " " + cls : ""}"><span style="width:${p}%"></span></div>`;
  const priBadge = (p) => `<span class="badge p-${p}">${esc(C.PRIORITY[p][0])}</span>`;
  const clsBadge = (s) => `<span class="badge c-${s}" title="${esc(C.CLASSES[s][1])}">${esc(C.CLASSES[s][0])}</span>`;
  const accClass = (p) => (p >= 75 ? "acc-ok" : p >= 50 ? "acc-mid" : "acc-bad");
  const pad2 = (n) => String(n).padStart(2, "0");
  const dstr = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  const today = () => dstr(new Date());
  const fmtDate = (s) => { if (!s) return ""; const d = new Date(s + "T00:00:00"); return isNaN(d) ? s : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); };
  const weekStart = (s) => { const d = new Date((s || today()) + "T00:00:00"); if (isNaN(d)) return "unknown"; const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return dstr(d); };
  const ago = (ms) => {
    if (!ms) return "never";
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 10) return "just now"; if (s < 60) return s + "s ago";
    const m = Math.round(s / 60); if (m < 60) return m + " min ago";
    const h = Math.round(m / 60); if (h < 24) return h + " h ago";
    return Math.round(h / 24) + " d ago";
  };
  const fmtTime = (sec) => { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); };
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const str = (v, max) => String(v == null ? "" : v).slice(0, max || 20000);

  /* ------------------------------------------------------------ content index */
  const PHASES = C.PHASES;
  const MODULES = C.MODULES;
  const MOD = {};
  const ITEMS = [];
  const ITEM = {};
  MODULES.forEach((m) => {
    MOD[m.key] = m;
    m.items = [];
    m.sections.forEach((sec) => {
      sec.mod = m;
      sec.id = m.key + "." + sec.key;
      sec.pri = sec.p || m.p;
      sec.list = sec.items.map((raw) => {
        const r = typeof raw === "string" ? { t: raw } : raw;
        const sl = slug(r.t);
        let id = sec.id + "." + sl;
        while (ITEM[id]) id += "-x";
        const it = { id, slug: sl, t: r.t, d: r.d || "", s: r.s || sec.s, sec, mod: m, pri: sec.pri, phase: m.phase };
        ITEM[id] = it; ITEMS.push(it); m.items.push(it);
        return it;
      });
    });
  });
  const phaseMods = (p) => MODULES.filter((m) => m.phase === p);
  const phaseItems = (p) => ITEMS.filter((it) => it.phase === p);
  const QBANK = MQ.Q;
  const QMAP = Object.fromEntries(QBANK.map((q) => [q.id, q]));
  const SUBJ = MQ.SUBJECTS;
  const MAIN = MQ.MAIN;
  const SUBJ_KEYS = Object.keys(SUBJ);
  const EXS = SQ.exercises;
  const EXMAP = Object.fromEntries(EXS.map((e) => [e.id, e]));

  /* ------------------------------------------------------------ state */
  const BLANK = () => ({
    v: SCHEMA, st: {}, open: {}, notes: {},
    mcq: { att: {}, saved: {}, rev: {}, quizzes: [], active: null },
    coding: [], sql: {}, scratch: "",
    assess: [], assessCfg: { target: 75, pass: {} },
    daily: [],
    stream: { name: "", custom: "", structure: "", passReq: "", notes: "", modules: [] },
    prefs: [],
    capstone: { title: "", tech: "", team: "", objective: "", problem: "", architecture: "", technologies: "", database: "", contribution: "", presentation: "", submission: "", final: "", lessons: "", tasks: [] },
    legacy: null, updated: null
  });
  let state = BLANK();
  let user = null;
  let canStore = true;
  let saveTimer = null;
  let lastSaveOk = true;
  let migratedNow = null;

  function sanitize(raw) {
    const s = BLANK();
    if (!isObj(raw)) return s;
    if (isObj(raw.st)) for (const k in raw.st) if (STATUS_NAME[raw.st[k]] && raw.st[k] !== "ns") s.st[k] = raw.st[k];
    if (isObj(raw.open)) for (const k in raw.open) if (raw.open[k]) s.open[k] = true;
    if (isObj(raw.notes)) for (const k in raw.notes) if (typeof raw.notes[k] === "string") s.notes[k] = raw.notes[k];
    if (isObj(raw.mcq)) {
      const m = raw.mcq;
      if (isObj(m.att)) for (const k in m.att) { const a = m.att[k]; if (isObj(a) && a.n > 0) s.mcq.att[k] = { n: +a.n || 0, c: Math.min(+a.c || 0, +a.n || 0), last: !!a.last, t: +a.t || 0 }; }
      if (isObj(m.saved)) for (const k in m.saved) if (m.saved[k]) s.mcq.saved[k] = 1;
      if (isObj(m.rev)) for (const k in m.rev) if (m.rev[k]) s.mcq.rev[k] = 1;
      if (Array.isArray(m.quizzes)) s.mcq.quizzes = m.quizzes.filter(isObj).slice(-50);
      if (isObj(m.active) && Array.isArray(m.active.ids)) {
        const ids = m.active.ids.filter((id) => QMAP[id]);
        if (ids.length) s.mcq.active = { ids, ans: isObj(m.active.ans) ? m.active.ans : {}, start: +m.active.start || Date.now(), dur: +m.active.dur || 600, subj: SUBJ_KEYS.includes(m.active.subj) ? m.active.subj : "all", diff: m.active.diff || "all", idx: Math.min(+m.active.idx || 0, ids.length - 1) };
      }
    }
    if (Array.isArray(raw.coding)) s.coding = raw.coding.filter((r) => isObj(r) && r.name).map((r) => ({
      id: str(r.id || uid(), 40), name: str(r.name, 200), topic: str(r.topic, 120), diff: DIFF.includes(r.diff) ? r.diff : "Easy",
      status: STATUS_NAME[r.status] ? r.status : "ns", time: str(r.time, 10), rev: REV.some((x) => x[0] === r.rev) ? r.rev : "none",
      notes: str(r.notes), mistakes: str(r.mistakes), created: +r.created || Date.now(), updated: +r.updated || Date.now()
    }));
    if (isObj(raw.sql)) for (const k in raw.sql) {
      const r = raw.sql[k]; if (!isObj(r)) continue;
      s.sql[k] = { status: STATUS_NAME[r.status] ? r.status : "ns", query: str(r.query), actual: str(r.actual), ok: SQL_OK.some((x) => x[0] === r.ok) ? r.ok : "unchecked", notes: str(r.notes), runs: +r.runs || 0, t: +r.t || 0, open: !!r.open };
    }
    if (typeof raw.scratch === "string") s.scratch = raw.scratch;
    if (Array.isArray(raw.assess)) s.assess = raw.assess.filter(isObj).map((r) => ({
      id: str(r.id || uid(), 40), name: str(r.name, 200), type: A_TYPE_NAME[r.type] ? r.type : "mock", phase: A_PHASE_NAME[r.phase] ? r.phase : "B",
      subject: str(r.subject, 80), date: str(r.date, 10), max: str(r.max, 10), got: str(r.got, 10), pass: str(r.pass, 10), attempt: str(r.attempt || "1", 4),
      override: A_OVERRIDE.some((x) => x[0] === r.override) ? r.override : "auto", weak: str(r.weak, 2000), notes: str(r.notes), nextRev: str(r.nextRev, 10),
      created: +r.created || Date.now()
    }));
    if (isObj(raw.assessCfg)) {
      const t = parseFloat(raw.assessCfg.target);
      s.assessCfg.target = isFinite(t) && t > 0 && t <= 100 ? t : 75;
      if (isObj(raw.assessCfg.pass)) for (const k in raw.assessCfg.pass) if (A_TYPE_NAME[k]) s.assessCfg.pass[k] = str(raw.assessCfg.pass[k], 6);
    }
    if (Array.isArray(raw.daily)) s.daily = raw.daily.filter(isObj).map((d) => ({
      id: str(d.id || uid(), 40), date: str(d.date, 10), area: DAILY_AREA_NAME[d.area] ? d.area : "other", topic: str(d.topic, 300), notes: str(d.notes),
      assign: str(d.assign, 2000), deadline: str(d.deadline, 10), status: STATUS_NAME[d.status] ? d.status : "ns", practice: !!d.practice, doubts: str(d.doubts, 4000), revision: !!d.revision,
      created: +d.created || Date.now()
    }));
    if (isObj(raw.stream)) {
      const r = raw.stream;
      ["name", "custom", "structure", "passReq", "notes"].forEach((k) => { s.stream[k] = str(r[k], k === "notes" || k === "structure" ? 20000 : 120); });
      if (Array.isArray(r.modules)) s.stream.modules = r.modules.filter(isObj).map((m) => ({
        id: str(m.id || uid(), 40), name: str(m.name || "Module", 200), open: m.open !== false, notes: str(m.notes),
        topics: Array.isArray(m.topics) ? m.topics.filter(isObj).map((t) => ({ id: str(t.id || uid(), 40), t: str(t.t, 300), st: STATUS_NAME[t.st] ? t.st : "ns" })).filter((t) => t.t) : []
      }));
    }
    if (Array.isArray(raw.prefs)) s.prefs = raw.prefs.filter(isObj).map((p) => ({ id: str(p.id || uid(), 40), name: str(p.name, 120), ready: READY.some((x) => x[0] === String(p.ready)) ? String(p.ready) : "0", notes: str(p.notes, 4000) }));
    if (isObj(raw.capstone)) {
      const c = raw.capstone;
      Object.keys(s.capstone).forEach((k) => { if (k !== "tasks") s.capstone[k] = str(c[k]); });
      if (Array.isArray(c.tasks)) s.capstone.tasks = c.tasks.filter(isObj).map((t) => ({ id: str(t.id || uid(), 40), type: TASK_TYPES.includes(t.type) ? t.type : "Development task", t: str(t.t, 300), owner: str(t.owner, 120), due: str(t.due, 10), status: STATUS_NAME[t.status] ? t.status : "ns", notes: str(t.notes) }));
    }
    if (isObj(raw.legacy)) s.legacy = raw.legacy;
    s.updated = +raw.updated || null;
    return s;
  }

  /* ---- v1 → v2 migration: keep everything, move what still applies ---- */
  const RANK = { ip: 1, rev: 2, done: 3 };
  function resolveOld(oldId) {
    if (ITEM[oldId]) return oldId;
    const a = C.ALIASES[oldId];
    if (a && ITEM[a]) return a;
    const parts = oldId.split(".");
    if (parts.length < 3) return null;
    const mod = parts[0], sl = parts.slice(2).join(".");
    const same = ITEMS.filter((it) => it.mod.key === mod && it.slug === sl);
    if (same.length === 1) return same[0].id;
    const inA = ITEMS.filter((it) => it.phase === "A" && it.slug === sl);
    if (inA.length === 1) return inA[0].id;
    return null;
  }
  function migrateV1(raw) {
    const out = Object.assign({}, raw);
    const st = {};
    const legacy = { from: 1, at: Date.now(), st: {}, notes: {}, ans: isObj(raw.ans) ? raw.ans : {}, pattern: raw.pattern || null };
    let moved = 0, kept = 0;
    if (isObj(raw.st)) for (const oldId in raw.st) {
      const v = raw.st[oldId];
      if (!RANK[v]) continue;
      const target = resolveOld(oldId);
      if (target) { if (!st[target] || RANK[v] > RANK[st[target]]) st[target] = v; moved++; }
      else { legacy.st[oldId] = v; kept++; }
    }
    const notes = {};
    if (isObj(raw.notes)) for (const k in raw.notes) { if (MOD[k]) notes[k] = raw.notes[k]; else legacy.notes[k] = raw.notes[k]; }
    const open = {};
    if (isObj(raw.open)) for (const k in raw.open) if (MOD[k]) open[k] = true;
    out.st = st; out.notes = notes; out.open = open; out.legacy = legacy; out.v = SCHEMA;
    delete out.ans; delete out.pattern;
    migratedNow = { moved, kept, answers: Object.keys(legacy.ans).length };
    return out;
  }

  function storageWorks() { try { localStorage.setItem(PROBE, "1"); localStorage.removeItem(PROBE); return true; } catch (e) { return false; } }
  function load() {
    state = BLANK(); migratedNow = null;
    if (!canStore || !user) return;
    let raw = null;
    try { raw = localStorage.getItem(KEY(user)); } catch (e) { console.error(e); }
    if (!raw) return;
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) { console.error(e); toast("Saved data couldn't be read; it was left untouched"); canStore = false; warnStorage(); return; }
    if (!parsed.v || parsed.v < SCHEMA) {
      try { if (!localStorage.getItem(BACKUP_KEY(user))) localStorage.setItem(BACKUP_KEY(user), raw); }
      catch (e) { console.error(e); toast("Couldn't back up old data, so it wasn't migrated. Free some storage and reload."); canStore = false; warnStorage(); state = sanitize(parsed); return; }
      parsed = migrateV1(parsed);
      state = sanitize(parsed);
      writeNow();
      return;
    }
    state = sanitize(parsed);
  }
  function touchProfile() {
    try {
      let arr = JSON.parse(localStorage.getItem(PROFILES) || "[]");
      if (!Array.isArray(arr)) arr = [];
      const p = arr.find((x) => x && x.name === user);
      if (p) p.updated = Date.now(); else arr.unshift({ name: user, updated: Date.now(), pct: 0 });
      arr.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      localStorage.setItem(PROFILES, JSON.stringify(arr));
    } catch (e) { /* convenience only */ }
  }
  function writeNow() {
    if (!user) return false;
    if (!canStore) { warnStorage(); return false; }
    try {
      state.updated = Date.now();
      localStorage.setItem(KEY(user), JSON.stringify(state));
      touchProfile();
      if (!lastSaveOk) toast("Saving works again");
      lastSaveOk = true;
      return true;
    } catch (e) {
      console.error(e);
      if (lastSaveOk) toast(e && e.name === "QuotaExceededError" ? "Storage is full. Export a backup, then trim notes." : "Couldn't save. Check your browser's storage settings.");
      lastSaveOk = false;
      return false;
    }
  }
  function save() { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = null; writeNow(); }, 350); }
  function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; writeNow(); } }
  function warnStorage() { $("#storageWarn").classList.remove("hidden"); }
  let toastTimer = null;
  function toast(msg) { const el = $("#status"); el.textContent = msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }

  /* ------------------------------------------------------------ stats */
  const stOf = (id) => state.st[id] || "ns";
  function stat(items) {
    const r = { total: items.length, done: 0, ip: 0, rev: 0, ns: 0 };
    items.forEach((it) => { r[stOf(it.id)]++; });
    r.pct = pct(r.done, r.total); r.pending = r.total - r.done;
    return r;
  }
  function mcqStats(filterFn) {
    let attempted = 0, correct = 0, qs = 0, touched = 0;
    QBANK.forEach((q) => {
      if (filterFn && !filterFn(q)) return;
      qs++;
      const a = state.mcq.att[q.id];
      if (a) { attempted += a.n; correct += a.c; touched++; }
    });
    return { qs, attempted, correct, wrong: attempted - correct, touched, acc: attempted ? Math.round((correct / attempted) * 100) : null };
  }
  const lastWrong = () => QBANK.filter((q) => state.mcq.att[q.id] && !state.mcq.att[q.id].last);
  const savedQs = () => QBANK.filter((q) => state.mcq.saved[q.id]);
  const revQs = () => QBANK.filter((q) => state.mcq.rev[q.id]);
  const streamTopics = () => state.stream.modules.flatMap((m) => m.topics);
  function streamStat() { const t = streamTopics(); const done = t.filter((x) => x.st === "done").length; return { total: t.length, done, rev: t.filter((x) => x.st === "rev").length, pct: pct(done, t.length) }; }
  const streamName = () => (state.stream.name === "__other" ? state.stream.custom : state.stream.name) || "";
  function capStat() { const t = state.capstone.tasks; const done = t.filter((x) => x.status === "done").length; return { total: t.length, done, pct: pct(done, t.length) }; }

  /* assessments */
  function aCalc(r) {
    const max = parseFloat(r.max), got = parseFloat(r.got);
    const has = isFinite(max) && max > 0 && isFinite(got);
    const p = has ? Math.round((got / max) * 1000) / 10 : null;
    const reqRaw = r.pass !== "" ? r.pass : (state.assessCfg.pass[r.type] || "");
    const req = parseFloat(reqRaw);
    const hasReq = isFinite(req);
    let res;
    if (r.override !== "auto") res = r.override;
    else if (!has) res = "pending";
    else if (hasReq) res = p >= req ? "pass" : "fail";
    else res = "noreq";
    return { pct: p, req: hasReq ? req : null, res, target: state.assessCfg.target, meets: p != null && p >= state.assessCfg.target };
  }
  function assessArea(r) {
    if (r.phase === "A") return "prep";
    if (r.phase === "C") return "stream";
    if (r.phase === "K") return "capstone";
    if (r.type === "gjava" || r.type === "jhands" || /java|oop|programming/i.test(r.subject)) return "gjava";
    if (r.type === "gdbms" || r.type === "shands" || /dbms|sql|database/i.test(r.subject)) return "gdbms";
    return "other";
  }
  const DAILY_REV_AREA = { prep: "prep", fa1: "gjava", fa2: "gdbms", stream: "stream", capstone: "capstone" };
  const isOverdue = (d) => !!d.assign.trim() && d.status !== "done" && !!d.deadline && d.deadline < today();
  const assignments = () => state.daily.filter((d) => d.assign.trim());
  const resPill = (res) => `<span class="pill ${res === "pass" ? "ok" : res === "fail" ? "bad" : res === "pending" ? "" : "mid"}">${RES_LABEL[res]}</span>`;
  const defaultPhase = (t) => (t === "stream" ? "C" : t === "cap" ? "K" : "B");

  /* ------------------------------------------------------------ header + nav */
  function renderHeader() {
    const a = stat(phaseItems("A")), b = stat(phaseItems("B")), s = streamStat();
    $("#hdrStats").innerHTML = `
      <div><div class="big">${a.pct}%</div><div class="cap">Pre-joining</div></div>
      <div><div class="big">${b.pct}%</div><div class="cap">Generic Foundation</div></div>
      <div><div class="big">${s.total ? s.pct + "%" : "—"}</div><div class="cap">Stream</div></div>`;
    if (user) {
      $("#userChip").classList.remove("hidden");
      $("#userAvatar").textContent = user.charAt(0).toUpperCase();
      $("#userLabel").textContent = user;
    }
  }
  function renderNav(cur) {
    const rev = ITEMS.filter((it) => stOf(it.id) === "rev").length + lastWrong().length;
    const od = state.daily.filter(isOverdue).length;
    $("#nav").innerHTML = VIEWS.map(([k, n]) => {
      let extra = "";
      if (k === "revision" && rev) extra = `<span class="n">${rev}</span>`;
      if (k === "daily" && od) extra = `<span class="n acc-bad">${od} late</span>`;
      return `<a href="#${k}"${k === cur ? ' aria-current="page"' : ""}>${esc(n)}${extra}</a>`;
    }).join("");
    const a = $('#nav a[aria-current="page"]');
    if (a) { const nav = $("#nav"); const l = a.offsetLeft - 8; if (l < nav.scrollLeft || l + a.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = l; }
  }

  /* ------------------------------------------------------------ router */
  let route = { v: "dashboard", arg: "" };
  function parseHash() {
    const h = decodeURIComponent((location.hash || "").replace(/^#\/?/, ""));
    const i = h.indexOf("/");
    let v = i >= 0 ? h.slice(0, i) : h;
    const arg = i >= 0 ? h.slice(i + 1) : "";
    if (LEGACY_ROUTES[v]) v = LEGACY_ROUTES[v];
    return { v: VIEW_NAME[v] ? v : "dashboard", arg };
  }
  function go() {
    flush();
    const prev = route.v;
    route = parseHash();
    document.title = VIEW_NAME[route.v] + " · Infosys Internal Training";
    renderNav(route.v);
    renderHeader();
    renderView();
    if (prev !== route.v) window.scrollTo(0, 0);
  }
  const VIEW_FN = {};
  function renderView() {
    if (!user) { $("#view").innerHTML = ""; return; }
    $("#view").innerHTML = (migratedNow ? migrationBanner() : "") + VIEW_FN[route.v]();
    if ((route.v === "prep" || route.v === "foundation") && route.arg) {
      const el = document.getElementById("mod-" + route.arg);
      if (el) setTimeout(() => el.scrollIntoView({ block: "start" }), 0);
    }
    if (route.v === "mcq") tickTimer();
  }
  function migrationBanner() {
    const m = migratedNow;
    return `<div class="callout" role="status"><b>Your page was updated for internal training.</b> ${m.moved} topic status${m.moved === 1 ? "" : "es"} carried over to the new syllabus. MCQ attempts, SQL Lab history and Java practice records are unchanged. ${m.kept ? m.kept + " status" + (m.kept === 1 ? "" : "es") + " from removed recruitment topics, " : ""}${m.answers ? m.answers + " interview answer" + (m.answers === 1 ? "" : "s") + ", " : ""}and a full copy of the old data are kept. Download them under <a href="#sources">Sources &amp; data</a>. <button class="linkbtn" data-act="dismiss-migration">Dismiss</button></div>`;
  }

  /* ================================================================ DASHBOARD */
  VIEW_FN.dashboard = function () {
    const a = stat(phaseItems("A")), b = stat(phaseItems("B")), s = streamStat();
    const jr = stat(MOD.coding.items.concat(MOD.oop.items, MOD.java.items, MOD.fa1.items));
    const jm = mcqStats((q) => q.s === "oop" || q.s === "java");
    const dr = stat(MOD.dbms.items.concat(MOD.sql.items, MOD.fa2.items));
    const sqlOk = EXS.filter((e) => (state.sql[e.id] || {}).ok === "correct").length;
    const dbPct = pct(dr.done + sqlOk, dr.total + EXS.length);
    const m = mcqStats((q) => MAIN.includes(q.s));
    const calcs = state.assess.map((r) => ({ r, c: aCalc(r) }));
    const passed = calcs.filter((x) => x.c.res === "pass").length;
    const decided = calcs.filter((x) => x.c.res === "pass" || x.c.res === "fail").length;
    const asg = assignments();
    const asgDone = asg.filter((d) => d.status === "done").length;
    const overdue = state.daily.filter(isOverdue);
    const cs = capStat();
    const cards = `
      <div class="grid g4">
        <div class="card stat"><div class="k">Pre-joining preparation</div><div class="v accent">${a.pct}%</div>${bar(a.pct)}<div class="s">${a.done} of ${a.total} checklist items</div></div>
        <div class="card stat"><div class="k">Generic Foundation</div><div class="v">${b.pct}%</div>${bar(b.pct)}<div class="s">${b.done} of ${b.total} checklist items</div></div>
        <div class="card stat"><div class="k">Java readiness</div><div class="v">${jr.pct}%</div>${bar(jr.pct)}<div class="s">A1–A3 + B1 items · Java/OOP MCQs ${jm.acc == null ? "—" : jm.acc + "%"}</div></div>
        <div class="card stat"><div class="k">DBMS / SQL readiness</div><div class="v">${dbPct}%</div>${bar(dbPct)}<div class="s">A4, A5, B2 items + SQL Lab ${sqlOk}/${EXS.length} correct</div></div>
        <div class="card stat"><div class="k">MCQ accuracy</div><div class="v ${m.acc == null ? "" : accClass(m.acc)}">${m.acc == null ? "—" : m.acc + "%"}</div><div class="s">${m.correct}/${m.attempted} correct · ${m.touched} of ${m.qs} tried</div></div>
        <div class="card stat"><div class="k">Assessments passed</div><div class="v">${passed}${decided ? `<span class="faint" style="font-size:16px"> / ${decided}</span>` : ""}</div><div class="s">${state.assess.length} recorded · uses your batch pass marks</div></div>
        <div class="card stat"><div class="k">Assignments completed</div><div class="v">${asgDone}${asg.length ? `<span class="faint" style="font-size:16px"> / ${asg.length}</span>` : ""}</div><div class="s ${overdue.length ? "acc-bad" : ""}">${overdue.length ? overdue.length + " overdue" : "none overdue"}</div></div>
        <div class="card stat"><div class="k">Stream training</div><div class="v">${s.total ? s.pct + "%" : "—"}</div>${s.total ? bar(s.pct) : ""}<div class="s">${streamName() ? esc(streamName()) + " · " + s.done + "/" + s.total + " topics" : "Stream not assigned yet"}</div></div>
      </div>`;

    const phaseCard = (ph) => {
      let rows, foot = "";
      if (ph.key === "C") {
        rows = `<a class="prow" href="#stream"><span class="pname">My technology stream${streamName() ? " · " + esc(streamName()) : ""}</span>${bar(s.pct)}<span class="pnum">${s.total ? s.done + "/" + s.total : "not set"}</span></a>
          <a class="prow" href="#capstone"><span class="pname">Capstone project</span>${bar(cs.pct)}<span class="pnum">${cs.total ? cs.done + "/" + cs.total : "no tasks"}</span></a>`;
      } else {
        const st = stat(phaseItems(ph.key));
        rows = phaseMods(ph.key).map((mo) => { const x = stat(mo.items); return `<a class="prow" href="#${ph.key === "A" ? "prep" : "foundation"}/${mo.key}"><span class="pname"><span class="faint mono">${mo.code}</span> ${esc(mo.name)}</span>${bar(x.pct, x.pct === 100 ? "green" : "")}<span class="pnum">${x.done}/${x.total}</span></a>`; }).join("");
        foot = `<p class="pnum" style="text-align:left;margin:8px 0 0">${st.done} of ${st.total} items · ${st.pct}%</p>`;
      }
      const tag = ph.key === "A" ? '<span class="pill ok">Prepare now</span>' : `<span class="pill">${esc(ph.when)}</span>`;
      return `<div class="card phase-card"><div class="phase-head"><div><div class="h-label" style="margin:0">Phase ${ph.key}</div><h3 class="phase-title">${esc(ph.name)}</h3></div>${tag}</div>
        <p class="muted" style="font-size:13px;margin:4px 0 10px">${esc(ph.blurb)}</p>${rows}${foot}</div>`;
    };

    const recent = calcs.slice().sort((x, y) => (y.r.date || "").localeCompare(x.r.date || "") || y.r.created - x.r.created).slice(0, 5);
    const assessHTML = recent.length ? `<ul class="plain">${recent.map(({ r, c }) => `<li><span><b>${esc(r.name || A_TYPE_NAME[r.type])}</b> <span class="faint" style="font-size:12px">· ${esc(A_PHASE_NAME[r.phase])}${r.date ? " · " + esc(fmtDate(r.date)) : ""}</span></span><span class="nowrap">${c.pct != null ? `<span class="mono">${c.pct}%</span> ` : ""}${resPill(c.res)}</span></li>`).join("")}</ul>`
      : `<div class="empty">No assessments recorded yet. Add mocks and actual results in <a href="#assess">Assessments</a>.</div>`;
    const upcoming = state.daily.filter((d) => d.assign.trim() && d.status !== "done").sort((x, y) => (x.deadline || "9999").localeCompare(y.deadline || "9999")).slice(0, 6);
    const upHTML = upcoming.length ? `<ul class="plain">${upcoming.map((d) => `<li><span>${esc(d.assign.length > 80 ? d.assign.slice(0, 78) + "…" : d.assign)} <span class="faint" style="font-size:12px">· ${esc(DAILY_AREA_NAME[d.area])}</span></span><span class="pill ${isOverdue(d) ? "bad" : ""}">${d.deadline ? (isOverdue(d) ? "overdue " : "due ") + esc(fmtDate(d.deadline)) : "no deadline"}</span></li>`).join("")}</ul>`
      : `<div class="empty">No pending assignments. Log classes and assignments in the <a href="#daily">Daily tracker</a>.</div>`;
    const weak = weakAreas("all").slice(0, 5);
    const weakHTML = weak.length ? `<ul class="plain">${weak.map((w) => `<li><span>${w.html}</span><a class="btn sm" href="${w.link}">${w.cta} →</a></li>`).join("")}</ul>` : '<div class="empty">No weak areas detected yet.</div>';

    return `
      <div class="vhead"><div><h2>Training readiness</h2><p>Each phase is tracked separately; there is no single combined percentage. Every number comes from your own ticks, MCQ attempts, practice logs and the results you record.</p></div></div>
      ${cards}
      <div class="grid g3 phase-grid">${PHASES.map(phaseCard).join("")}</div>
      <div class="grid g2">
        <div class="card"><h2>Internal assessments · ${passed} passed</h2>${assessHTML}<p style="margin:8px 0 0"><a href="#assess">Open assessment tracker →</a></p></div>
        <div class="card"><h2>Pending assignments${overdue.length ? ` · <span class="acc-bad">${overdue.length} overdue</span>` : ""}</h2>${upHTML}<p style="margin:8px 0 0"><a href="#daily">Open daily tracker →</a></p></div>
      </div>
      <div class="grid g3">
        <div class="card"><h2>My technology stream</h2>${streamName() ? `<p style="margin:0 0 6px;font-size:15px"><b>${esc(streamName())}</b></p>${bar(s.pct)}<p class="muted" style="font-size:13px;margin:6px 0 0">${s.done}/${s.total} topics · ${s.rev} need revision</p>` : `<p class="muted" style="font-size:13.5px;margin:0">Not assigned yet. Record your preferred streams and readiness meanwhile.</p>`}<p style="margin:8px 0 0"><a href="#stream">Open My stream →</a></p></div>
        <div class="card"><h2>Capstone project</h2>${state.capstone.title ? `<p style="margin:0 0 6px;font-size:15px"><b>${esc(state.capstone.title)}</b></p>` : '<p class="muted" style="font-size:13.5px;margin:0 0 6px">No project recorded yet.</p>'}${cs.total ? bar(cs.pct) + `<p class="muted" style="font-size:13px;margin:6px 0 0">${cs.done}/${cs.total} tasks done${state.capstone.final ? " · final: " + esc(state.capstone.final) : ""}</p>` : ""}<p style="margin:8px 0 0"><a href="#capstone">Open Capstone →</a></p></div>
        <div class="card"><h2>Revision dashboard</h2>${weakHTML}<p style="margin:8px 0 0"><a href="#revision">Open Revision →</a></p></div>
      </div>
      <div class="card"><h2>Research and training sources</h2><p class="muted" style="font-size:13.5px;margin:0">Infosys publishes the programme's broad structure (generic training, then stream-specific training, plus soft skills) but not a topic syllabus or pass rules. Topics here are labelled official, trainee-reported, fundamental or batch-dependent. Your batch's training instructions override everything on this page. <a href="#sources">See sources →</a></p></div>`;
  };

  /* ================================================================ SYLLABUS (phases A and B) */
  const filt = { q: "", status: "all", pri: "all", cls: "all" };
  function itemMatches(it) {
    if (filt.status !== "all") { const s = stOf(it.id); if (filt.status === "pending" ? s === "done" : s !== filt.status) return false; }
    if (filt.pri !== "all" && it.pri !== filt.pri) return false;
    if (filt.cls !== "all" && it.s !== filt.cls) return false;
    if (filt.q) { const hay = (it.t + " " + it.d + " " + it.sec.n + " " + it.mod.name).toLowerCase(); if (!filt.q.split(/\s+/).every((w) => hay.includes(w))) return false; }
    return true;
  }
  const filtering = () => !!(filt.q || filt.status !== "all" || filt.pri !== "all" || filt.cls !== "all");
  function hl(text) {
    const t = esc(text);
    if (!filt.q) return t;
    const words = filt.q.split(/\s+/).filter((w) => w.length > 1).map((w) => esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return words.length ? t.replace(new RegExp("(" + words.join("|") + ")", "gi"), "<mark>$1</mark>") : t;
  }
  function itemHTML(it, noHl) {
    const s = stOf(it.id);
    const H = noHl ? esc : hl;
    return `<div class="item ${s}" data-row="${esc(it.id)}">
      <input type="checkbox" data-item="${esc(it.id)}"${s === "done" ? " checked" : ""} aria-label="Completed: ${esc(it.t)}">
      <div><div class="it">${H(it.t)}${it.s !== it.sec.s ? " " + clsBadge(it.s) : ""}</div>${it.d ? `<div class="hint">${H(it.d)}</div>` : ""}</div>
      <select data-st="${esc(it.id)}" aria-label="Status: ${esc(it.t)}">${opt(STATUS, s)}</select>
    </div>`;
  }
  function sectionHTML(sec, list) {
    const st = stat(sec.list);
    let extra = "";
    if (sec.subj) { const ms = mcqStats((q) => q.s === sec.subj); extra = `<span class="scount">${ms.touched}/${ms.qs} tried${ms.acc != null ? ` · <span class="${accClass(ms.acc)}">${ms.acc}%</span>` : ""}</span><a class="btn sm" href="#mcq/${sec.subj}">Practise →</a>`; }
    if (sec.lab) extra = `<a class="btn sm" href="#sql">Open SQL Lab →</a>`;
    return `<div class="sec"><div class="shead"><span class="stitle">${esc(sec.n)}</span>${clsBadge(sec.s)}${sec.pri !== sec.mod.p ? priBadge(sec.pri) : ""}${extra}<span class="scount" data-sec-count="${esc(sec.id)}">${st.done}/${st.total}</span></div>
      <div class="items">${list.map((it) => itemHTML(it)).join("")}</div></div>`;
  }
  function moduleHTML(m) {
    const st = stat(m.items);
    const f = filtering();
    const secs = m.sections.map((sec) => ({ sec, list: f ? sec.list.filter(itemMatches) : sec.list })).filter((x) => x.list.length);
    if (f && !secs.length) return "";
    const open = f || state.open[m.key];
    const matchN = f ? secs.reduce((n, x) => n + x.list.length, 0) : 0;
    let actions = "";
    if (m.mcq) actions = `<a class="btn sm primary" href="#mcq">Open MCQ practice →</a>`;
    if (m.sqlLab) actions = `<a class="btn sm primary" href="#sql">Open SQL Lab →</a>`;
    if (m.key === "coding") actions = `<a class="btn sm primary" href="#coding">Log a Java program →</a>`;
    if (m.key === "seweb" || m.key === "osit") actions = `<a class="btn sm" href="#mcq/fx">Foundation extras MCQs →</a>`;
    return `<section class="mod${open ? " open" : ""}" id="mod-${m.key}">
      <button class="mhead" data-act="mod-toggle" data-mod="${m.key}" aria-expanded="${open ? "true" : "false"}">
        <span class="mnum">${esc(m.code)}</span>
        <span class="mtitle">${esc(m.title)}${priBadge(m.p)}${m.component ? ' <span class="badge c-add">Training component</span>' : ""}${f ? ` <span class="faint" style="font-weight:500;font-size:12.5px">· ${matchN} match${matchN === 1 ? "" : "es"}</span>` : ""}</span>
        <span class="mmeta">${bar(st.pct, st.pct === 100 ? "green" : "")}<span class="mcount" data-mod-count="${m.key}">${st.done}/${st.total}</span></span>
        <span class="chev" aria-hidden="true">▶</span>
      </button>
      <div class="mbody">${open ? `
        <div class="mblurb"><p>${esc(m.blurb)}</p>${actions}</div>
        ${m.workspace && !f ? workspaceHTML(m) : ""}
        ${secs.map((x) => sectionHTML(x.sec, x.list)).join("")}
        ${m.workspace ? "" : `<div class="mnotes"><label class="f" for="note-${m.key}">Module notes</label><textarea id="note-${m.key}" data-note="${m.key}" rows="2" placeholder="Weak spots, links, reminders for ${esc(m.name)}…">${esc(state.notes[m.key] || "")}</textarea></div>`}` : ""}
      </div>
    </section>`;
  }

  /* B1 / B2 workspace: class notes, assignments, practice, mocks, actual result, retests, revision */
  function workspaceHTML(m) {
    const area = m.key;
    const isJava = m.workspace === "java";
    const revArea = isJava ? "gjava" : "gdbms";
    const days = state.daily.filter((d) => d.area === area);
    const asg = days.filter((d) => d.assign.trim());
    const asgDone = asg.filter((d) => d.status === "done").length;
    const od = asg.filter(isOverdue).length;
    const recs = state.assess.filter((r) => assessArea(r) === revArea).map((r) => ({ r, c: aCalc(r) }));
    const byDate = (x, y) => (y.r.date || "").localeCompare(x.r.date || "") || y.r.created - x.r.created;
    const mocks = recs.filter((x) => x.r.type === "mock").sort(byDate);
    const actual = recs.filter((x) => x.r.type !== "mock").sort(byDate);
    const retests = recs.filter((x) => x.r.type === "retest" || (+x.r.attempt || 1) > 1).length;
    const latest = actual.find((x) => x.c.pct != null);
    const practice = isJava
      ? { v: state.coding.filter((r) => r.status === "done").length + " / " + state.coding.length, s: "Java programs solved / logged", link: "#coding" }
      : { v: EXS.filter((e) => (state.sql[e.id] || {}).ok === "correct").length + " / " + EXS.length, s: "SQL Lab exercises correct", link: "#sql" };
    const revItems = m.items.filter((it) => stOf(it.id) === "rev");
    const weakTxt = recs.map((x) => x.r.weak.trim()).filter(Boolean);
    const subj = isJava ? "Java" : "DBMS / SQL";
    return `<div class="workspace">
      <div class="tiles">
        <a class="tile" href="#daily" data-act="goto-daily" data-area="${area}"><span class="k">Daily assignments</span><span class="v">${asgDone}/${asg.length}</span><span class="s ${od ? "acc-bad" : ""}">${od ? od + " overdue" : days.length + " class log" + (days.length === 1 ? "" : "s")}</span></a>
        <a class="tile" href="${practice.link}"><span class="k">Practice</span><span class="v">${practice.v}</span><span class="s">${practice.s}</span></a>
        <a class="tile" href="#assess" data-act="goto-assess" data-type="mock" data-subject="${subj}"><span class="k">Mock assessments</span><span class="v">${mocks.length}</span><span class="s">${mocks[0] && mocks[0].c.pct != null ? "latest " + mocks[0].c.pct + "%" : "none recorded"}</span></a>
        <a class="tile" href="#assess" data-act="goto-assess" data-type="${isJava ? "gjava" : "gdbms"}" data-subject="${subj}"><span class="k">Actual assessment</span><span class="v">${latest ? latest.c.pct + "%" : "—"}</span><span class="s">${latest ? RES_LABEL[latest.c.res] : "not recorded"}</span></a>
        <a class="tile" href="#assess"><span class="k">Retest attempts</span><span class="v">${retests}</span><span class="s">recorded</span></a>
        <a class="tile" href="#revision/${revArea}"><span class="k">Needs revision</span><span class="v">${revItems.length}</span><span class="s">topics flagged${weakTxt.length ? " + " + weakTxt.length + " weak-topic note" + (weakTxt.length === 1 ? "" : "s") : ""}</span></a>
      </div>
      <div class="ws-notes"><label class="f" for="note-${m.key}">Class notes</label><textarea id="note-${m.key}" data-note="${m.key}" rows="3" placeholder="What the trainer emphasised, patterns, links to course material…">${esc(state.notes[m.key] || "")}</textarea></div>
      ${weakTxt.length ? `<div class="ws-notes"><label class="f">Weak topics from your assessments</label><ul class="plain">${weakTxt.slice(0, 5).map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}
    </div>`;
  }

  function phaseView(ph) {
    if (route.arg && MOD[route.arg] && MOD[route.arg].phase === ph && !state.open[route.arg]) { state.open[route.arg] = true; save(); }
    const items = phaseItems(ph);
    const f = filtering();
    const P = PHASES.find((x) => x.key === ph);
    const st = stat(items);
    const intro = ph === "B"
      ? `<div class="note" style="margin-bottom:14px"><b>Follow your batch's material first.</b> Infosys hasn't published a topic list or pass rules for generic training. B1–B2 follow what trainees report (separate Java and DBMS assessments with objective and hands-on parts); B3–B5 are additional topics older accounts mention. Record your real schedule in the <a href="#daily">Daily tracker</a> and your real results in <a href="#assess">Assessments</a>.</div>`
      : `<div class="note" style="margin-bottom:14px">Everything here is meant to be done <b>before joining</b>. Java coding, OOP, core Java, DBMS and SQL carry straight into the generic Java and DBMS assessments, so depth matters more than speed.</div>`;
    return `
      <div class="vhead"><div><h2>Phase ${ph} · ${esc(P.name)}</h2><p>${esc(P.blurb)}</p></div><div class="totals" data-phase-total><div class="big" style="font-size:30px">${st.pct}%</div><div class="cap">${st.done} of ${st.total} items</div></div></div>
      ${intro}
      <div class="toolbar">
        <input type="search" class="grow" id="synSearch" placeholder="Search topics, e.g. HashMap, normalization, joins" value="${esc(filt.q)}" aria-label="Search topics">
        <select id="synStatus" aria-label="Filter by status">${opt([["all", "All statuses"], ["pending", "Pending (not completed)"], ["ns", "Not Started"], ["ip", "In Progress"], ["done", "Completed"], ["rev", "Needs Revision"]], filt.status)}</select>
        <select id="synPri" aria-label="Filter by priority">${opt([["all", "All priorities"], ["vhigh", "Very high"], ["high", "High"], ["medium", "Medium"], ["additional", "Additional"]], filt.pri)}</select>
        <select id="synCls" aria-label="Filter by source">${opt([["all", "All sources"], ["off", "Official"], ["rep", "Trainee-reported"], ["fund", "Fundamentals"], ["add", "Batch-dependent"]], filt.cls)}</select>
        <button class="btn" data-act="expand-all" data-phase="${ph}">Expand all</button>
        <button class="btn" data-act="collapse-all" data-phase="${ph}">Collapse all</button>
        ${f ? '<button class="btn on" data-act="clear-filters">Clear filters</button>' : ""}
      </div>
      <div class="legend"><span>${priBadge("vhigh")} ${priBadge("medium")} ${priBadge("additional")} study priority</span><span>${clsBadge("off")} ${clsBadge("rep")} ${clsBadge("fund")} ${clsBadge("add")}</span>${f ? `<span data-matchcount><b>${items.filter(itemMatches).length}</b> of ${items.length} topics match</span>` : ""}</div>
      <div id="synModules" data-phase="${ph}">${modulesFor(ph)}</div>`;
  }
  function modulesFor(ph) { return phaseMods(ph).map(moduleHTML).join("") || '<div class="card empty">No topics match these filters.</div>'; }
  VIEW_FN.prep = () => phaseView("A");
  VIEW_FN.foundation = () => phaseView("B");
  function rerenderModules() {
    const box = $("#synModules"); if (!box) return;
    const ph = box.dataset.phase;
    box.innerHTML = modulesFor(ph);
    const leg = $(".legend");
    if (leg) {
      const old = leg.querySelector("[data-matchcount]"); if (old) old.remove();
      if (filtering()) { const its = phaseItems(ph); leg.insertAdjacentHTML("beforeend", `<span data-matchcount><b>${its.filter(itemMatches).length}</b> of ${its.length} topics match</span>`); }
    }
  }
  function setStatus(id, s) {
    const it = ITEM[id];
    if (!it) return;
    if (s === "ns") delete state.st[id]; else state.st[id] = s;
    save();
    $$(`[data-row="${CSS.escape(id)}"]`).forEach((row) => {
      row.className = "item " + s;
      const cb = row.querySelector("input[type=checkbox]"); if (cb) cb.checked = s === "done";
      const sel = row.querySelector("select"); if (sel) sel.value = s;
    });
    renderHeader();
    const ss = stat(it.sec.list);
    $$(`[data-sec-count="${CSS.escape(it.sec.id)}"]`).forEach((el) => { el.textContent = ss.done + "/" + ss.total; });
    const ms = stat(it.mod.items);
    $$(`[data-mod-count="${CSS.escape(it.mod.key)}"]`).forEach((el) => {
      el.textContent = ms.done + "/" + ms.total;
      const b = el.parentElement.querySelector(".bar"); if (b) { b.classList.toggle("green", ms.pct === 100); b.firstElementChild.style.width = ms.pct + "%"; }
    });
    const tot = $("[data-phase-total]");
    if (tot) { const ps = stat(phaseItems(it.phase)); tot.innerHTML = `<div class="big" style="font-size:30px">${ps.pct}%</div><div class="cap">${ps.done} of ${ps.total} items</div>`; }
    renderNav(route.v);
  }

  /* ================================================================ MCQ */
  const mq = { subj: "all", diff: "all", mode: "practice", deck: [], idx: 0, pick: [], submitted: false, score: { n: 0, c: 0 }, qn: 10, qmin: 10 };
  let quizResult = null;
  const subjOk = (q, subj) => (subj === "all" ? MAIN.includes(q.s) : q.s === subj);
  function poolFor(subj, mode) {
    let pool = QBANK.filter((q) => subjOk(q, subj) && (mq.diff === "all" || q.d === mq.diff));
    if (mode === "incorrect") pool = pool.filter((q) => state.mcq.att[q.id] && !state.mcq.att[q.id].last);
    if (mode === "saved") pool = pool.filter((q) => state.mcq.saved[q.id]);
    if (mode === "revise") pool = pool.filter((q) => state.mcq.rev[q.id]);
    return pool;
  }
  function buildDeck() {
    const pool = poolFor(mq.subj, mq.mode);
    mq.deck = shuffle(pool.filter((q) => !state.mcq.att[q.id])).concat(shuffle(pool.filter((q) => state.mcq.att[q.id]))).map((q) => q.id);
    mq.idx = 0; mq.pick = []; mq.submitted = false; mq.score = { n: 0, c: 0 };
  }
  function recordAttempt(q, ok) {
    const a = state.mcq.att[q.id] || { n: 0, c: 0, last: false, t: 0 };
    a.n++; if (ok) a.c++; a.last = ok; a.t = Date.now();
    state.mcq.att[q.id] = a;
  }
  const isRight = (q, picks) => picks.length === q.a.length && q.a.every((i) => picks.includes(i));
  const LETTER = "ABCD";
  const diffPill = (d) => `<span class="pill ${d === "hard" ? "bad" : d === "medium" ? "mid" : ""}">${esc(d)}</span>`;

  VIEW_FN.mcq = function () {
    if (route.arg && (SUBJ[route.arg] || route.arg === "all") && route.arg !== mq.subj && !state.mcq.active) { mq.subj = route.arg; mq.deck = []; }
    const active = state.mcq.active;
    if (active) { mq.mode = "quiz"; mq.subj = active.subj; mq.diff = active.diff || "all"; }
    if (quizResult) mq.mode = "quiz";
    const counts = { practice: poolFor(mq.subj, "practice").length, incorrect: poolFor(mq.subj, "incorrect").length, saved: poolFor(mq.subj, "saved").length, revise: poolFor(mq.subj, "revise").length };
    const subjBtns = [["all", "All 4 main"]].concat(SUBJ_KEYS.map((k) => [k, SUBJ[k]])).map(([k, n]) =>
      `<button class="btn sm${mq.subj === k ? " on" : ""}" data-act="mq-subj" data-v="${k}"${active ? " disabled" : ""}>${esc(n)} <span class="faint">${QBANK.filter((q) => subjOk(q, k)).length}</span></button>`).join("");
    const diffBtns = [["all", "Any"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]].map(([k, n]) =>
      `<button class="btn sm${mq.diff === k ? " on" : ""}" data-act="mq-diff" data-v="${k}"${active ? " disabled" : ""}>${n}</button>`).join("");
    const modeBtns = [["practice", "Random practice"], ["incorrect", "Retry incorrect"], ["saved", "Saved"], ["revise", "Marked for revision"], ["quiz", "Timed practice"]].map(([k, n]) =>
      `<button class="btn sm${mq.mode === k ? " on" : ""}" data-act="mq-mode" data-v="${k}"${active ? " disabled" : ""}>${esc(n)}${counts[k] != null ? ` <span class="faint">${counts[k]}</span>` : ""}</button>`).join("");
    let main;
    if (active) main = quizHTML();
    else if (quizResult) main = quizResultHTML();
    else if (mq.mode === "quiz") main = quizSetupHTML();
    else main = practiceHTML();
    const mainN = QBANK.filter((q) => MAIN.includes(q.s)).length;
    return `
      <div class="vhead"><div><h2>Technical MCQs</h2><p>${mainN} questions in the four main categories (OOP with Java, Advanced Java, DBMS, SQL) plus ${QBANK.length - mainN} Foundation extras for OS, software engineering and HTML/CSS. Each has a topic, a difficulty and an explanation that appears after you submit. These are practice questions, not Infosys questions.</p></div></div>
      <div class="grid g-side">
        <div class="stack"><div class="card"><h2>Category</h2><div class="seg">${subjBtns}</div>
          <h2 style="margin-top:16px">Difficulty</h2><div class="seg">${diffBtns}</div>
          <h2 style="margin-top:16px">Mode</h2><div class="seg">${modeBtns}</div>
          ${active ? '<p class="muted" style="font-size:12.5px;margin:10px 0 0">Timed practice is running. Submit it to change these settings.</p>' : ""}</div></div>
        <div class="stack"><div>${main}</div>${mcqStatsCard()}</div>
      </div>`;
  };
  function mcqStatsCard() {
    const row = (k, label) => { const s = mcqStats((q) => subjOk(q, k)); return `<tr><td>${label}</td><td class="n">${s.touched}/${s.qs}</td><td class="n">${s.correct}</td><td class="n">${s.wrong}</td><td class="n ${s.acc == null ? "" : accClass(s.acc)}">${s.acc == null ? "—" : s.acc + "%"}</td></tr>`; };
    const qz = state.mcq.quizzes.slice(-5).reverse();
    return `<div class="card"><h2>Accuracy by category</h2>
      <div class="tscroll"><table class="t"><thead><tr><th>Category</th><th class="n">Tried</th><th class="n">✓</th><th class="n">✗</th><th class="n">Acc.</th></tr></thead><tbody>
      ${SUBJ_KEYS.map((k) => row(k, `<a href="#mcq/${k}">${esc(SUBJ[k])}</a>`)).join("")}${row("all", "<b>4 main categories</b>")}</tbody></table></div>
      <p class="faint" style="font-size:12px;margin:8px 0 0">✓ and ✗ count every attempt, including retries. Saved: ${savedQs().length} · Marked for revision: ${revQs().length} · Last attempt wrong: ${lastWrong().length}</p>
      ${qz.length ? `<h3>Recent timed practice</h3><ul class="plain">${qz.map((z) => `<li><span>${esc(z.subj === "all" ? "4 main categories" : SUBJ[z.subj] || "Earlier set")} · ${z.n} Q</span><span class="mono ${accClass(pct(z.correct, z.n))}">${z.correct}/${z.n} · ${fmtTime(z.secs)}</span></li>`).join("")}</ul>` : ""}
    </div>`;
  }
  function questionBody(q, picks, reveal) {
    const multi = q.a.length > 1;
    const opts = q.o.map((o, i) => {
      let cls = picks.includes(i) ? " sel" : "";
      if (reveal) cls = q.a.includes(i) ? " right" : picks.includes(i) ? " wrong" : "";
      return `<button class="opt${cls}" data-act="mq-pick" data-i="${i}"${reveal ? " disabled" : ""} aria-pressed="${picks.includes(i)}"><span class="ol">${LETTER[i]}</span><span>${esc(o)}</span></button>`;
    }).join("");
    return `<p class="qtext">${esc(q.q)}</p>${q.c ? `<pre class="codeblock">${esc(q.c)}</pre>` : ""}
      ${multi ? '<p class="muted" style="font-size:12.5px;margin:-4px 0 6px"><b>Select all that apply.</b> More than one option is correct.</p>' : ""}
      <div class="opts" role="group" aria-label="Answer options">${opts}</div>`;
  }
  function flagBtns(q) {
    return `<button class="btn sm flagbtn" data-act="mq-save" data-id="${q.id}" aria-pressed="${!!state.mcq.saved[q.id]}">☆ ${state.mcq.saved[q.id] ? "Saved" : "Save"}</button>
      <button class="btn sm flagbtn" data-act="mq-rev" data-id="${q.id}" aria-pressed="${!!state.mcq.rev[q.id]}">⚑ ${state.mcq.rev[q.id] ? "Marked for revision" : "Mark for revision"}</button>`;
  }
  function practiceHTML() {
    if (!mq.deck.length) buildDeck();
    if (!mq.deck.length) {
      const msg = { incorrect: "No questions whose last attempt was wrong in this selection.", saved: "No saved questions yet. Use ☆ Save on any question.", revise: "No questions marked for revision yet. Use ⚑ on any question." }[mq.mode] || "No questions in this selection.";
      return `<div class="card empty">${msg}</div>`;
    }
    if (mq.idx >= mq.deck.length) {
      return `<div class="card"><h2>Set complete</h2><p style="font-size:15px;margin:0 0 12px">You answered <b>${mq.score.c} of ${mq.score.n}</b> correctly${mq.score.n ? ` (${pct(mq.score.c, mq.score.n)}%)` : ""}.</p>
        <div class="qactions"><button class="btn primary" data-act="mq-restart">Practise again (new order)</button>${lastWrong().length ? '<button class="btn" data-act="mq-mode" data-v="incorrect">Retry incorrect</button>' : ""}</div></div>`;
    }
    const q = QMAP[mq.deck[mq.idx]];
    const a = state.mcq.att[q.id];
    let verdict = "";
    if (mq.submitted) { const ok = isRight(q, mq.pick); verdict = `<div class="verdict ${ok ? "ok" : "bad"}"><b>${ok ? "Correct" : "Incorrect"} — answer: ${q.a.map((i) => LETTER[i]).join(", ")}</b>${esc(q.x)}</div>`; }
    return `<div class="card qcard">
      <div class="qmeta"><span>${esc(SUBJ[q.s])} · ${esc(q.tp)} ${diffPill(q.d)}</span><span>Question ${mq.idx + 1} of ${mq.deck.length} · this set ${mq.score.c}/${mq.score.n}${a ? ` · you: ${a.c}/${a.n} before` : " · new"}</span></div>
      ${questionBody(q, mq.pick, mq.submitted)}${verdict}
      <div class="qactions">${mq.submitted ? '<button class="btn primary" data-act="mq-next">Next question →</button>' : `<button class="btn primary" data-act="mq-submit"${mq.pick.length ? "" : " disabled"}>Submit answer</button><button class="btn" data-act="mq-skip">Skip</button>`}${flagBtns(q)}</div>
    </div>`;
  }
  function quizSetupHTML() {
    const pool = poolFor(mq.subj, "practice");
    const sizes = [5, 10, 15, 20, 30, 40].filter((x) => x <= pool.length);
    if (pool.length && pool.length < 40 && !sizes.includes(pool.length)) sizes.push(pool.length);
    const n = sizes.includes(mq.qn) ? mq.qn : sizes[Math.min(1, sizes.length - 1)];
    return `<div class="card"><h2>Timed practice</h2>
      <p class="muted" style="font-size:13.5px;margin:0 0 12px">Simulates an objective assessment: answers stay hidden until you submit, or until the timer runs out and it submits itself. Unseen questions are picked first, and a running set survives a page refresh.</p>
      <div class="form" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:560px">
        <div><label class="f">Category</label><div class="mono" style="padding:7px 0">${esc(mq.subj === "all" ? "4 main" : SUBJ[mq.subj])} · ${esc(mq.diff)}</div></div>
        <div><label class="f" for="qzN">Questions</label><select id="qzN">${opt(sizes.map((x) => [String(x), String(x)]), String(n))}</select></div>
        <div><label class="f" for="qzMin">Minutes</label><input type="number" id="qzMin" min="1" max="180" value="${mq.qmin}"></div>
      </div>
      <div class="qactions" style="margin-top:14px"><button class="btn primary" data-act="qz-start"${pool.length ? "" : " disabled"}>Start timed practice</button><span class="faint" style="font-size:12.5px">${pool.length} questions available</span></div>
    </div>`;
  }
  function quizHTML() {
    const z = state.mcq.active;
    const q = QMAP[z.ids[z.idx]];
    const picks = z.ans[q.id] || [];
    const answered = z.ids.filter((id) => (z.ans[id] || []).length).length;
    const pal = z.ids.map((id, i) => `<button data-act="qz-go" data-i="${i}" class="${(z.ans[id] || []).length ? "answered" : ""}${i === z.idx ? " cur" : ""}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("");
    return `<div class="card qcard">
      <div class="qmeta"><span>Timed practice · ${answered}/${z.ids.length} answered</span><span class="timer" id="quizTimer">--:--</span></div>
      <div class="palette">${pal}</div>
      <div class="qmeta"><span>${esc(SUBJ[q.s])} · ${esc(q.tp)} ${diffPill(q.d)}</span><span>Question ${z.idx + 1} of ${z.ids.length}</span></div>
      ${questionBody(q, picks, false)}
      <div class="qactions">
        <button class="btn" data-act="qz-prev"${z.idx ? "" : " disabled"}>← Previous</button>
        <button class="btn" data-act="qz-next"${z.idx < z.ids.length - 1 ? "" : " disabled"}>Next →</button>
        <button class="btn primary" data-act="qz-submit">Submit</button>${flagBtns(q)}
        <button class="btn sm danger" data-act="qz-abandon" style="margin-left:auto">Abandon</button>
      </div></div>`;
  }
  function quizResultHTML() {
    const r = quizResult;
    const list = r.ids.map((id, i) => {
      const q = QMAP[id]; const picks = r.ans[id] || []; const ok = isRight(q, picks);
      return `<details class="rec" style="padding:0"><summary class="rec-head" style="cursor:pointer;list-style:none;grid-template-columns:auto minmax(0,1fr) auto">
        <span class="pill ${ok ? "ok" : "bad"}">${i + 1} ${ok ? "✓" : picks.length ? "✗" : "—"}</span><span style="font-size:13.5px">${esc(q.q)}</span><span class="faint mono" style="font-size:11px">${esc(SUBJ[q.s])}</span></summary>
        <div style="padding:0 12px 12px">${questionBody(q, picks, true)}<div class="verdict ${ok ? "ok" : "bad"}"><b>${ok ? "Correct" : picks.length ? "Incorrect" : "Not answered"} — answer: ${q.a.map((x) => LETTER[x]).join(", ")}</b>${esc(q.x)}</div><div class="qactions">${flagBtns(q)}</div></div></details>`;
    }).join("");
    return `<div class="card"><h2>Timed practice result</h2>
      <p style="font-size:16px;margin:0 0 4px"><b class="${accClass(pct(r.correct, r.ids.length))}">${r.correct} / ${r.ids.length}</b> correct (${pct(r.correct, r.ids.length)}%) in ${fmtTime(r.secs)}${r.timedOut ? " (time ran out)" : ""}.</p>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Open a question to see its explanation. Wrong answers now appear in “Retry incorrect”.</p>
      <div class="qactions" style="margin-bottom:12px"><button class="btn primary" data-act="qz-again">New timed practice</button><button class="btn" data-act="mq-mode" data-v="incorrect">Retry incorrect</button></div>${list}</div>`;
  }
  function startQuiz() {
    const n = parseInt(($("#qzN") || {}).value, 10) || mq.qn;
    const min = Math.max(1, Math.min(180, parseInt(($("#qzMin") || {}).value, 10) || mq.qmin));
    mq.qn = n; mq.qmin = min;
    const pool = poolFor(mq.subj, "practice");
    const ids = shuffle(pool.filter((q) => !state.mcq.att[q.id])).concat(shuffle(pool.filter((q) => state.mcq.att[q.id]))).slice(0, n).map((q) => q.id);
    if (!ids.length) return;
    state.mcq.active = { ids, ans: {}, start: Date.now(), dur: min * 60, subj: mq.subj, diff: mq.diff, idx: 0 };
    quizResult = null; writeNow(); renderView();
  }
  function submitQuiz(timedOut) {
    const z = state.mcq.active; if (!z) return;
    let correct = 0;
    z.ids.forEach((id) => { const q = QMAP[id]; const ok = isRight(q, z.ans[id] || []); if (ok) correct++; recordAttempt(q, ok); });
    const secs = Math.min(z.dur, (Date.now() - z.start) / 1000);
    state.mcq.quizzes.push({ t: Date.now(), subj: z.subj, n: z.ids.length, correct, secs: Math.round(secs), dur: z.dur });
    if (state.mcq.quizzes.length > 50) state.mcq.quizzes = state.mcq.quizzes.slice(-50);
    quizResult = { ids: z.ids, ans: z.ans, correct, secs, timedOut: !!timedOut };
    state.mcq.active = null; writeNow(); renderNav(route.v);
    if (route.v === "mcq") renderView();
    toast(timedOut ? "Time's up. Submitted." : "Submitted");
  }
  let timerHandle = null;
  function tickTimer() {
    clearInterval(timerHandle); timerHandle = null;
    const z = state.mcq.active; if (!z) return;
    const step = () => {
      const left = z.dur - (Date.now() - z.start) / 1000;
      const el = $("#quizTimer");
      if (left <= 0) { clearInterval(timerHandle); timerHandle = null; submitQuiz(true); return; }
      if (el) { el.textContent = fmtTime(left); el.classList.toggle("low", left < 60); }
      if (route.v !== "mcq") { clearInterval(timerHandle); timerHandle = null; }
    };
    step();
    if (state.mcq.active) timerHandle = setInterval(step, 1000);
  }
  function checkExpiredQuiz() { const z = state.mcq.active; if (z && Date.now() - z.start >= z.dur * 1000) submitQuiz(true); }

  /* ================================================================ JAVA PRACTICE LOG */
  const cf = { status: "all", q: "" };
  let openRec = null;
  const codingTopics = () => MOD.coding.sections.map((s) => s.n).concat(["OOP practical", "Collections", "Exceptions", "FA1 hands-on practice", "Other"]);
  VIEW_FN.coding = function () {
    const recs = state.coding;
    const by = (s) => recs.filter((r) => r.status === s).length;
    const times = recs.map((r) => parseFloat(r.time)).filter((x) => x > 0);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
    const topics = codingTopics();
    const list = recs.filter((r) => (cf.status === "all" || (cf.status === "revdue" ? r.rev === "due" : r.status === cf.status)) && (!cf.q || (r.name + " " + r.topic + " " + r.notes + " " + r.mistakes).toLowerCase().includes(cf.q))).sort((a, b) => b.updated - a.updated);
    return `
      <div class="vhead"><div><h2>Java practice log</h2><p>Log each Java program you write, before joining and for FA1 hands-on practice: approach, mistakes, time taken and when to revise it. Name suggestions come from the A1 and A2 checklists.</p></div></div>
      <div class="grid g5">
        <div class="card stat"><div class="k">Logged</div><div class="v">${recs.length}</div></div>
        <div class="card stat"><div class="k">Completed</div><div class="v acc-ok">${by("done")}</div></div>
        <div class="card stat"><div class="k">In progress</div><div class="v">${by("ip")}</div></div>
        <div class="card stat"><div class="k">Needs revision</div><div class="v">${by("rev") + recs.filter((r) => r.rev === "due" && r.status !== "rev").length}</div></div>
        <div class="card stat"><div class="k">Avg. time</div><div class="v">${avg == null ? "—" : avg + "m"}</div></div>
      </div>
      <div class="card" style="margin-bottom:14px"><h2>Add a program</h2>
        <div class="form">
          <div class="span2"><label class="f" for="cpName">Problem name</label><input type="text" id="cpName" list="codingProblems" placeholder="e.g. Palindrome number" maxlength="120"></div>
          <div class="span2"><label class="f" for="cpTopic">Topic</label><select id="cpTopic">${topics.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>
          <div><label class="f" for="cpDiff">Difficulty</label><select id="cpDiff">${DIFF.map((d) => `<option>${d}</option>`).join("")}</select></div>
          <div><label class="f" for="cpStatus">Attempt status</label><select id="cpStatus">${opt(STATUS, "done")}</select></div>
          <div><label class="f" for="cpTime">Time taken (min)</label><input type="number" id="cpTime" min="0" max="600" placeholder="15"></div>
          <div class="span2"><label class="f" for="cpRev">Revision status</label><select id="cpRev">${opt(REV, "none")}</select></div>
          <div class="span3"><label class="f" for="cpNotes">Java solution notes</label><textarea id="cpNotes" class="code" rows="3" placeholder="Approach, key lines, complexity…"></textarea></div>
          <div class="span3"><label class="f" for="cpMist">Mistakes</label><textarea id="cpMist" rows="3" placeholder="Off-by-one, missed edge case, wrong loop bound…"></textarea></div>
          <div class="span6"><button class="btn primary" data-act="cp-add">Add to practice log</button></div>
        </div>
      </div>
      <div class="toolbar">
        <input type="search" class="grow" id="cpSearch" placeholder="Search your log" value="${esc(cf.q)}" aria-label="Search practice log">
        <select id="cpFilter" aria-label="Filter practice log">${opt([["all", "All"], ["ns", "Not Started"], ["ip", "In Progress"], ["done", "Completed"], ["rev", "Needs Revision"], ["revdue", "Revise again"]], cf.status)}</select>
      </div>
      <div id="cpList">${list.length ? list.map(recHTML).join("") : `<div class="card empty">${recs.length ? "Nothing matches this filter." : "No programs logged yet. Start with the number programs in A1."}</div>`}</div>`;
  };
  function recHTML(r) {
    const open = openRec === r.id;
    const topics = codingTopics();
    return `<div class="rec" data-rec="${esc(r.id)}">
      <div class="rec-head">
        <div><button class="rec-title" data-act="cp-open" data-id="${esc(r.id)}" aria-expanded="${open}">${esc(r.name)}</button>
          <div class="rec-sub">${esc(r.topic)} · ${esc(r.diff)}${r.time ? " · " + esc(r.time) + " min" : ""} · updated ${ago(r.updated)}</div></div>
        <div class="rec-ctl">
          <select data-cp="${esc(r.id)}" data-f="status" aria-label="Attempt status">${opt(STATUS, r.status)}</select>
          <select data-cp="${esc(r.id)}" data-f="rev" aria-label="Revision status">${opt(REV, r.rev)}</select>
          <button class="btn sm" data-act="cp-open" data-id="${esc(r.id)}">${open ? "Close" : "Details"}</button>
        </div>
      </div>
      ${open ? `<div class="rec-body">
        <div><label class="f">Problem name</label><input type="text" data-cp="${esc(r.id)}" data-f="name" value="${esc(r.name)}" style="width:100%"></div>
        <div class="row3"><div><label class="f">Topic</label><select data-cp="${esc(r.id)}" data-f="topic" style="width:100%">${topics.concat(topics.includes(r.topic) ? [] : [r.topic]).map((t) => `<option${t === r.topic ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div>
          <div><label class="f">Difficulty</label><select data-cp="${esc(r.id)}" data-f="diff" style="width:100%">${DIFF.map((d) => `<option${d === r.diff ? " selected" : ""}>${d}</option>`).join("")}</select></div>
          <div><label class="f">Time (min)</label><input type="number" min="0" data-cp="${esc(r.id)}" data-f="time" value="${esc(r.time)}" style="width:100%"></div></div>
        <div><label class="f">Java solution notes</label><textarea class="code" rows="5" data-cp="${esc(r.id)}" data-f="notes">${esc(r.notes)}</textarea></div>
        <div><label class="f">Mistakes</label><textarea rows="5" data-cp="${esc(r.id)}" data-f="mistakes">${esc(r.mistakes)}</textarea></div>
        <div><button class="btn sm danger" data-act="cp-del" data-id="${esc(r.id)}">Delete entry</button></div>
      </div>` : ""}
    </div>`;
  }
  function addCoding() {
    const name = $("#cpName").value.trim();
    if (!name) { $("#cpName").focus(); toast("Enter a problem name"); return; }
    state.coding.push({ id: uid(), name, topic: $("#cpTopic").value, diff: $("#cpDiff").value, status: $("#cpStatus").value, time: $("#cpTime").value.trim(), rev: $("#cpRev").value, notes: $("#cpNotes").value, mistakes: $("#cpMist").value, created: Date.now(), updated: Date.now() });
    writeNow(); renderView(); toast("Added “" + name + "”");
  }

  /* ================================================================ SQL LAB */
  const sqlEngine = { state: "idle", SQL: null, err: "", promise: null };
  const sqlOut = {};
  function loadSqlEngine() {
    if (sqlEngine.state === "ready") return Promise.resolve(sqlEngine.SQL);
    if (sqlEngine.promise) return sqlEngine.promise;
    sqlEngine.state = "loading"; paintEngine();
    sqlEngine.promise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SQLJS_BASE + "sql-wasm.js"; s.crossOrigin = "anonymous";
      s.onload = () => { if (typeof window.initSqlJs !== "function") { reject(new Error("engine script loaded without initSqlJs")); return; } window.initSqlJs({ locateFile: (f) => SQLJS_BASE + f }).then(resolve, reject); };
      s.onerror = () => reject(new Error("couldn't download the SQL engine"));
      document.head.appendChild(s);
    }).then((SQL) => { sqlEngine.SQL = SQL; sqlEngine.state = "ready"; paintEngine(); return SQL; },
      (e) => { sqlEngine.state = "failed"; sqlEngine.err = (e && e.message) || String(e); sqlEngine.promise = null; paintEngine(); throw e; });
    return sqlEngine.promise;
  }
  function engineText() {
    return { idle: "SQLite engine loads the first time you press Run (about 1 MB, from cdnjs).", loading: "Loading SQLite engine…", ready: "SQLite engine ready. Each run starts from a fresh copy of the sample tables.", failed: "Couldn't load the SQL engine (" + sqlEngine.err + "). You can still write queries and compare them with the expected output by hand." }[sqlEngine.state];
  }
  function paintEngine() { $$("[data-engine]").forEach((el) => { el.textContent = engineText(); el.className = "pill" + (sqlEngine.state === "ready" ? " ok" : sqlEngine.state === "failed" ? " bad" : ""); }); }
  const norm = (v) => (typeof v === "number" && Math.abs(v - Math.round(v)) < 1e-6 ? Math.round(v) : v);
  function dataTable(cols, rows, max) {
    const shown = max ? rows.slice(0, max) : rows;
    return `<div class="tscroll"><table class="t data"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${shown.map((r) => `<tr>${r.map((v) => v === null ? '<td class="null">NULL</td>' : `<td>${esc(norm(v))}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${cols.length || 1}" class="faint">(no rows)</td></tr>`}</tbody></table></div>${max && rows.length > max ? `<p class="faint" style="font-size:12px;margin:4px 0 0">${rows.length - max} more rows not shown</p>` : ""}`;
  }
  function runSql(sqlText, verify) {
    const db = new sqlEngine.SQL.Database();
    try {
      db.exec(SQ.schema);
      let res = db.exec(sqlText);
      if (verify) res = db.exec(verify);
      const last = res.length ? res[res.length - 1] : null;
      return { cols: last ? last.columns : [], rows: last ? last.values.map((r) => r.map(norm)) : [], none: !last };
    } finally { db.close(); }
  }
  function compare(ex, got) {
    const exp = ex.expected;
    const key = (r) => JSON.stringify(r.map((v) => (typeof v === "number" ? v : v === null ? null : String(v))));
    const a = exp.rows.map(key), b = got.rows.map(key);
    if (got.cols.length !== exp.cols.length) return { ok: false, why: `Expected ${exp.cols.length} column(s), got ${got.cols.length}.` };
    if (a.length !== b.length) return { ok: false, why: `Expected ${a.length} row(s), got ${b.length}.` };
    const same = ex.ordered ? a.every((x, i) => x === b[i]) : a.slice().sort().join("|") === b.slice().sort().join("|");
    if (!same) {
      if (ex.ordered && a.slice().sort().join("|") === b.slice().sort().join("|")) return { ok: false, why: "Right rows, wrong order. Check your ORDER BY." };
      return { ok: false, why: "Row values differ from the expected output." };
    }
    const names = exp.cols.every((c, i) => String(got.cols[i]).toLowerCase() === c.toLowerCase());
    return { ok: true, why: names ? "Matches the expected output." : "Values match. Column names differ (" + got.cols.join(", ") + "); use aliases to match exactly." };
  }
  function sqlRec(id) { return state.sql[id] || (state.sql[id] = { status: "ns", query: "", actual: "", ok: "unchecked", notes: "", runs: 0, t: 0, open: false }); }
  const showSol = {};
  VIEW_FN.sql = function () {
    const tried = EXS.filter((e) => state.sql[e.id] && (state.sql[e.id].runs || state.sql[e.id].query.trim())).length;
    const ok = EXS.filter((e) => (state.sql[e.id] || {}).ok === "correct").length;
    const rev = EXS.filter((e) => { const r = state.sql[e.id]; return r && (r.status === "rev" || r.ok === "wrong" || r.ok === "partial"); }).length;
    const tables = Object.keys(SQ.tables).map((t) => `<div class="tbl"><h4>${esc(t)}</h4>${dataTable(SQ.tables[t].cols, SQ.tables[t].rows)}</div>`).join("");
    return `
      <div class="vhead"><div><h2>SQL Lab</h2><p>${EXS.length} hands-on exercises for A5 and FA2-style SQL practice, all on one sample schema with expected outputs. Your query runs in the browser and is checked automatically.</p></div></div>
      <div class="note" style="margin-bottom:14px"><b>Dialect:</b> the Lab runs <b>SQLite 3.39</b>. Standard SQL (joins incl. RIGHT/FULL, subqueries, GROUP BY/HAVING, CASE, views, window functions) works. Oracle-specific syntax (PL/SQL blocks, ROWNUM, MINUS, TO_DATE, CREATE OR REPLACE VIEW) does <b>not</b> run here. If your training environment is Oracle or MySQL, the vendor notes in each exercise show the differences.</div>
      <div class="grid g4">
        <div class="card stat"><div class="k">Attempted</div><div class="v">${tried}/${EXS.length}</div></div>
        <div class="card stat"><div class="k">Correct</div><div class="v acc-ok">${ok}</div></div>
        <div class="card stat"><div class="k">To revise</div><div class="v">${rev}</div></div>
        <div class="card stat"><div class="k">Engine</div><div class="s" style="margin-top:8px"><span data-engine class="pill">${esc(engineText())}</span></div></div>
      </div>
      <div class="card" style="margin-bottom:14px">
        <details class="tables"><summary>Sample tables: departments, employees, employee_contacts, customers, orders</summary>${tables}
          <details style="margin-top:12px"><summary class="muted" style="font-size:12.5px;cursor:pointer">Show CREATE TABLE / INSERT script</summary><pre class="codeblock" style="margin-top:8px">${esc(SQ.schema)}</pre></details>
        </details>
      </div>
      ${EXS.map(exHTML).join("")}
      <div class="card" style="margin-top:14px"><h2>Scratch pad</h2>
        <p class="muted" style="font-size:13px;margin:0 0 8px">Try anything against a fresh copy of the sample tables. Not tracked as an exercise.</p>
        <textarea class="code" id="scratchSql" rows="4" data-scratch placeholder="SELECT * FROM employees WHERE salary > 60000;">${esc(state.scratch)}</textarea>
        <div class="qactions" style="margin-top:8px"><button class="btn primary" data-act="sql-scratch">Run</button></div>
        <div id="scratchOut" style="margin-top:10px"></div>
      </div>`;
  };
  function exHTML(ex, i) {
    const r = state.sql[ex.id] || { status: "ns", ok: "unchecked", query: "", actual: "", notes: "", runs: 0, open: false };
    const okPill = { correct: '<span class="pill ok">correct</span>', wrong: '<span class="pill bad">incorrect</span>', partial: '<span class="pill mid">partial</span>', unchecked: "" }[r.ok];
    const open = !!r.open;
    return `<div class="rec" id="ex-${esc(ex.id)}">
      <div class="rec-head">
        <div><button class="rec-title" data-act="ex-open" data-id="${esc(ex.id)}" aria-expanded="${open}">${i + 1}. ${esc(ex.title)}</button>
          <div class="rec-sub">${esc(ex.topic)} · tables: ${ex.tables.map(esc).join(", ")}${r.runs ? ` · ${r.runs} run${r.runs === 1 ? "" : "s"}` : ""}</div></div>
        <div class="rec-ctl">${okPill}<select data-sqlf="status" data-id="${esc(ex.id)}" aria-label="Status">${opt(STATUS, r.status)}</select><button class="btn sm" data-act="ex-open" data-id="${esc(ex.id)}">${open ? "Close" : "Open"}</button></div>
      </div>
      ${open ? `<div class="rec-body ex-body">
        <div><b style="font-size:14px">Task.</b> <span style="font-size:14px">${esc(ex.task)}</span></div>
        <div><label class="f">Expected result</label>${dataTable(ex.expected.cols, ex.expected.rows)}<p class="faint" style="font-size:12px;margin:4px 0 0">${ex.ordered ? "Row order matters for this one." : "Any row order is accepted."}</p></div>
        <div><label class="f" for="q-${esc(ex.id)}">Your query</label><textarea class="code" id="q-${esc(ex.id)}" rows="6" data-sqlf="query" data-id="${esc(ex.id)}" placeholder="Write your SQL here…" spellcheck="false">${esc(r.query)}</textarea>
          <div class="qactions" style="margin-top:8px"><button class="btn primary" data-act="ex-run" data-id="${esc(ex.id)}">Run &amp; check</button><button class="btn" data-act="ex-sol" data-id="${esc(ex.id)}">${showSol[ex.id] ? "Hide" : "Show"} reference solution</button><span data-engine class="pill${sqlEngine.state === "ready" ? " ok" : sqlEngine.state === "failed" ? " bad" : ""}" style="white-space:normal">${esc(engineText())}</span></div></div>
        <div data-out="${esc(ex.id)}">${sqlOut[ex.id] || ""}</div>
        ${showSol[ex.id] ? `<div><label class="f">Reference solution (standard SQL, run in SQLite)</label><pre class="codeblock">${esc(ex.solution)}</pre>${ex.notes ? `<div class="note">${esc(ex.notes)}</div>` : ""}</div>` : ""}
        <div class="row-auto">
          <div><label class="f">Actual result (filled in by Run; editable)</label><textarea rows="3" data-sqlf="actual" data-id="${esc(ex.id)}">${esc(r.actual)}</textarea></div>
          <div><label class="f">Revision notes</label><textarea rows="3" data-sqlf="notes" data-id="${esc(ex.id)}" placeholder="What to remember next time">${esc(r.notes)}</textarea></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><label class="f" style="margin:0" for="ok-${esc(ex.id)}">Query correctness</label><select id="ok-${esc(ex.id)}" data-sqlf="ok" data-id="${esc(ex.id)}">${opt(SQL_OK, r.ok)}</select></div>
      </div>` : ""}
    </div>`;
  }
  function runExercise(id) {
    const ex = EXMAP[id]; const r = sqlRec(id);
    const ta = $(`[data-sqlf="query"][data-id="${CSS.escape(id)}"]`);
    if (ta) r.query = ta.value;
    if (!r.query.trim()) { toast("Write a query first"); return; }
    const box = $(`[data-out="${CSS.escape(id)}"]`);
    if (box) box.innerHTML = '<div class="res-box">Running…</div>';
    loadSqlEngine().then(() => {
      let html, verdict;
      try {
        const got = runSql(r.query, ex.verify);
        if (got.none) { html = `<div class="res-box bad"><b>No result set.</b> The statement ran but returned no rows to compare${ex.verify ? "" : ". Did you forget the SELECT?"}</div>`; verdict = "wrong"; r.actual = "(no result set)"; }
        else {
          const c = compare(ex, got);
          verdict = c.ok ? "correct" : "wrong";
          html = `<div class="res-box ${c.ok ? "ok" : "bad"}"><b>${c.ok ? "✓ Correct." : "✗ Not matching yet."}</b> ${esc(c.why)}${ex.verify ? ` <span class="faint">(checked with: ${esc(ex.verify)})</span>` : ""}<div style="margin-top:8px">${dataTable(got.cols, got.rows, 40)}</div></div>`;
          r.actual = got.cols.join(" | ") + "\n" + got.rows.slice(0, 30).map((row) => row.map((v) => (v === null ? "NULL" : v)).join(" | ")).join("\n") + (got.rows.length > 30 ? "\n…" : "");
        }
      } catch (e) {
        html = `<div class="res-box bad"><b>SQL error:</b> <span class="mono">${esc(e.message || e)}</span>${/syntax|near/i.test(e.message || "") ? '<div class="faint" style="margin-top:4px">Using Oracle- or MySQL-only syntax? The Lab runs SQLite; see the dialect note above.</div>' : ""}</div>`;
        verdict = "wrong"; r.actual = "Error: " + (e.message || e);
      }
      r.runs++; r.t = Date.now(); r.ok = verdict;
      if (verdict === "correct") { if (r.status !== "rev") r.status = "done"; } else if (r.status === "ns") r.status = "ip";
      sqlOut[id] = html;
      writeNow();
      const card = document.getElementById("ex-" + id);
      if (card) card.outerHTML = exHTML(ex, EXS.indexOf(ex));
      renderNav(route.v);
    }, () => { if (box) box.innerHTML = `<div class="res-box bad">${esc(engineText())}</div>`; });
  }
  function runScratch() {
    const ta = $("#scratchSql"); if (!ta) return;
    state.scratch = ta.value; save();
    const out = $("#scratchOut");
    if (!ta.value.trim()) return;
    out.innerHTML = '<div class="res-box">Running…</div>';
    loadSqlEngine().then(() => {
      try { const got = runSql(ta.value); out.innerHTML = got.none ? '<div class="res-box">Statement ran; no result set returned.</div>' : `<div class="res-box">${dataTable(got.cols, got.rows, 100)}</div>`; }
      catch (e) { out.innerHTML = `<div class="res-box bad"><b>SQL error:</b> <span class="mono">${esc(e.message || e)}</span></div>`; }
    }, () => { out.innerHTML = `<div class="res-box bad">${esc(engineText())}</div>`; });
  }

  /* ================================================================ ASSESSMENTS */
  const af = { phase: "all" };
  let openAssess = null;
  let prefill = null;
  VIEW_FN.assess = function () {
    const cfg = state.assessCfg;
    const calcs = state.assess.map((r) => ({ r, c: aCalc(r) }));
    const scored = calcs.filter((x) => x.c.pct != null);
    const avg = scored.length ? Math.round(scored.reduce((a, x) => a + x.c.pct, 0) / scored.length) : null;
    const pf = prefill && prefill.kind === "assess" ? prefill : null;
    if (pf) prefill = null;
    const pType = pf ? pf.type : "gjava";
    const list = calcs.filter((x) => af.phase === "all" || x.r.phase === af.phase).sort((x, y) => (y.r.date || "").localeCompare(x.r.date || "") || y.r.created - x.r.created);
    const passCfg = A_TYPES.map(([k, n]) => `<div><label class="f" for="pc-${k}">${esc(n)}</label><input type="number" min="0" max="100" step="0.5" id="pc-${k}" data-passcfg="${k}" value="${esc(cfg.pass[k] || "")}" placeholder="not set" style="width:100%"></div>`).join("");
    return `
      <div class="vhead"><div><h2>Internal assessment tracker</h2><p>Record every mock, actual assessment and retest across the pre-test, generic Java/DBMS assessments, stream assessments and the capstone. The percentage is calculated as marks obtained ÷ maximum marks × 100.</p></div></div>
      <div class="grid g4">
        <div class="card stat"><div class="k">Recorded</div><div class="v">${state.assess.length}</div></div>
        <div class="card stat"><div class="k">Passed</div><div class="v acc-ok">${calcs.filter((x) => x.c.res === "pass").length}</div><div class="s">${calcs.filter((x) => x.c.res === "fail").length} not passed · ${calcs.filter((x) => x.c.res === "pending").length} pending</div></div>
        <div class="card stat"><div class="k">Average score</div><div class="v">${avg == null ? "—" : avg + "%"}</div><div class="s">${scored.length} scored</div></div>
        <div class="card stat"><div class="k">Below ${esc(cfg.target)}% target</div><div class="v">${scored.filter((x) => !x.c.meets).length}</div><div class="s">personal study target</div></div>
      </div>
      <div class="grid g2">
        <div class="card"><h2>Your batch settings</h2>
          <p class="muted" style="font-size:13px;margin:0 0 10px">Enter the pass requirement for each assessment type <b>after you receive your batch's official instructions</b>. Leave a field blank until you know it; records then show “Pass mark not set”. A pass mark on an individual record overrides these.</p>
          <div class="form" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${passCfg}</div>
          <div style="margin-top:12px;max-width:260px"><label class="f" for="targetPct">Personal preparation target (%)</label><input type="number" id="targetPct" min="1" max="100" value="${esc(cfg.target)}" style="width:100%"></div>
          <p class="faint" style="font-size:12px;margin:6px 0 0">The default 75% target is a study goal, not an Infosys passing rule.</p>
        </div>
        <div class="card"><h2>Research note: reported benchmarks</h2>
          <div class="callout" style="margin:0 0 10px"><b>Not your batch's rules.</b> These come from trainee posts and press coverage. They are never used to work out your pass/fail status, and Infosys can change its assessments between batches.</div>
          <ul class="plain">${C.REPORTED_BENCHMARKS.map((b) => `<li style="display:block"><b style="font-size:12.5px">${esc(b.src)}</b><div class="muted" style="font-size:13px">${esc(b.text)}</div></li>`).join("")}</ul>
        </div>
      </div>
      <div class="card" style="margin-bottom:14px"><h2>Record an assessment</h2>
        <div class="form">
          <div class="span2"><label class="f" for="asName">Assessment name</label><input type="text" id="asName" maxlength="160" placeholder="e.g. Generic Java mock 1"></div>
          <div class="span2"><label class="f" for="asType">Type</label><select id="asType">${opt(A_TYPES, pType)}</select></div>
          <div><label class="f" for="asPhase">Phase</label><select id="asPhase">${opt(A_PHASES, pf && pf.phase ? pf.phase : defaultPhase(pType))}</select></div>
          <div><label class="f" for="asSubject">Subject</label><input type="text" id="asSubject" list="subjectList" maxlength="80" value="${pf && pf.subject ? esc(pf.subject) : ""}" placeholder="Java"></div>
          <div><label class="f" for="asDate">Date</label><input type="date" id="asDate" value="${today()}"></div>
          <div><label class="f" for="asMax">Maximum marks</label><input type="number" id="asMax" min="0" step="0.5" placeholder="100"></div>
          <div><label class="f" for="asGot">Marks obtained</label><input type="number" id="asGot" min="0" step="0.5" placeholder="blank if pending"></div>
          <div><label class="f" for="asPass">Pass mark % (optional)</label><input type="number" id="asPass" min="0" max="100" step="0.5" placeholder="batch setting"></div>
          <div><label class="f" for="asAttempt">Attempt no.</label><input type="number" id="asAttempt" min="1" max="20" value="1"></div>
          <div><label class="f" for="asOverride">Result</label><select id="asOverride">${opt(A_OVERRIDE, "auto")}</select></div>
          <div class="span3"><label class="f" for="asWeak">Weak topics</label><textarea id="asWeak" rows="2" placeholder="e.g. HashMap internals, correlated subqueries"></textarea></div>
          <div class="span2"><label class="f" for="asNotes">Notes</label><textarea id="asNotes" rows="2" placeholder="Pattern, what went well or badly"></textarea></div>
          <div><label class="f" for="asNext">Next revision date</label><input type="date" id="asNext"></div>
          <div class="span6"><button class="btn primary" data-act="as-add">Add assessment record</button></div>
        </div>
      </div>
      <div class="toolbar"><span class="h-label" style="margin:0 6px 0 0">Show</span><div class="seg">${[["all", "All"]].concat(A_PHASES).map(([k, n]) => `<button class="btn sm${af.phase === k ? " on" : ""}" data-act="as-filter" data-v="${k}">${esc(n)}</button>`).join("")}</div></div>
      <div id="asList">${list.length ? list.map(({ r, c }) => assessRecHTML(r, c)).join("") : '<div class="card empty">No assessment records yet.</div>'}</div>`;
  };
  function assessRecHTML(r, c) {
    const open = openAssess === r.id;
    const F = (f, label, type, extra) => `<div><label class="f">${label}</label><input type="${type || "text"}" data-as="${esc(r.id)}" data-f="${f}" value="${esc(r[f])}" ${extra || ""} style="width:100%"></div>`;
    return `<div class="rec" data-assess="${esc(r.id)}">
      <div class="rec-head">
        <div><button class="rec-title" data-act="as-open" data-id="${esc(r.id)}" aria-expanded="${open}">${esc(r.name || A_TYPE_NAME[r.type])}</button>
          <div class="rec-sub">${esc(A_TYPE_NAME[r.type])} · ${esc(A_PHASE_NAME[r.phase])}${r.subject ? " · " + esc(r.subject) : ""}${r.date ? " · " + esc(fmtDate(r.date)) : ""} · attempt ${esc(r.attempt || "1")}${r.nextRev ? " · revise by " + esc(fmtDate(r.nextRev)) : ""}</div></div>
        <div class="rec-ctl">${c.pct != null ? `<span class="pill mono ${c.meets ? "ok" : "mid"}" data-pct title="Personal target ${esc(c.target)}%">${esc(r.got)}/${esc(r.max)} · ${c.pct}%</span>` : ""}<span data-res>${resPill(c.res)}</span>${c.req != null ? `<span class="faint mono" style="font-size:11px">pass ≥ ${c.req}%</span>` : ""}<button class="btn sm" data-act="as-open" data-id="${esc(r.id)}">${open ? "Close" : "Edit"}</button></div>
      </div>
      ${open ? `<div class="rec-body">
        ${F("name", "Assessment name")}
        <div class="row3"><div><label class="f">Type</label><select data-as="${esc(r.id)}" data-f="type" style="width:100%">${opt(A_TYPES, r.type)}</select></div>
          <div><label class="f">Phase</label><select data-as="${esc(r.id)}" data-f="phase" style="width:100%">${opt(A_PHASES, r.phase)}</select></div>
          ${F("subject", "Subject", "text", 'list="subjectList"')}</div>
        <div class="row3">${F("date", "Date", "date")}${F("max", "Max marks", "number", 'min="0" step="0.5"')}${F("got", "Marks obtained", "number", 'min="0" step="0.5"')}</div>
        <div class="row3">${F("pass", "Pass mark % (this record)", "number", 'min="0" max="100" step="0.5" placeholder="batch setting"')}${F("attempt", "Attempt no.", "number", 'min="1"')}<div><label class="f">Result</label><select data-as="${esc(r.id)}" data-f="override" style="width:100%">${opt(A_OVERRIDE, r.override)}</select></div></div>
        <div><label class="f">Weak topics</label><textarea rows="3" data-as="${esc(r.id)}" data-f="weak">${esc(r.weak)}</textarea></div>
        <div><label class="f">Notes</label><textarea rows="3" data-as="${esc(r.id)}" data-f="notes">${esc(r.notes)}</textarea></div>
        <div class="row3">${F("nextRev", "Next revision date", "date")}<div></div><div style="align-self:end;text-align:right"><button class="btn sm danger" data-act="as-del" data-id="${esc(r.id)}">Delete record</button></div></div>
      </div>` : ""}
    </div>`;
  }
  function addAssessment() {
    const v = (id) => ($(id) ? $(id).value.trim() : "");
    const type = v("#asType");
    const max = v("#asMax"), got = v("#asGot");
    if (got && max && parseFloat(got) > parseFloat(max)) { toast("Marks obtained can't be more than maximum marks"); return; }
    if (got && !max) { toast("Enter the maximum marks too"); $("#asMax").focus(); return; }
    state.assess.push({ id: uid(), name: v("#asName") || A_TYPE_NAME[type], type, phase: v("#asPhase"), subject: v("#asSubject"), date: v("#asDate"), max, got, pass: v("#asPass"), attempt: v("#asAttempt") || "1", override: v("#asOverride") || "auto", weak: v("#asWeak"), notes: v("#asNotes"), nextRev: v("#asNext"), created: Date.now() });
    writeNow(); renderView(); renderNav(route.v); toast("Assessment recorded");
  }

  /* ================================================================ DAILY TRACKER */
  const df = { show: "all" };
  let openDaily = null;
  VIEW_FN.daily = function () {
    const pf = prefill && prefill.kind === "daily" ? prefill : null;
    if (pf) prefill = null;
    if (route.arg === "overdue") df.show = "overdue";
    const all = state.daily;
    const asg = assignments();
    const od = all.filter(isOverdue);
    const filtered = all.filter((d) => df.show === "all" || (df.show === "pending" ? d.assign.trim() && d.status !== "done" : df.show === "overdue" ? isOverdue(d) : df.show === "rev" ? d.revision || d.status === "rev" : df.show === "doubts" ? !!d.doubts.trim() : true));
    const weeks = {};
    filtered.forEach((d) => { const w = weekStart(d.date); (weeks[w] = weeks[w] || []).push(d); });
    const weekHTML = Object.keys(weeks).sort().reverse().map((w) => {
      const ds = weeks[w].sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.created - a.created);
      const wa = ds.filter((d) => d.assign.trim());
      const wod = wa.filter(isOverdue).length;
      return `<div class="week"><div class="week-head"><b>Week of ${esc(fmtDate(w))}</b><span class="muted">${ds.length} session${ds.length === 1 ? "" : "s"} · assignments ${wa.filter((d) => d.status === "done").length}/${wa.length} done${wod ? ` · <span class="acc-bad">${wod} overdue</span>` : ""} · practice ${ds.filter((d) => d.practice).length}/${ds.length} · ${ds.filter((d) => d.revision).length} to revise · ${ds.filter((d) => d.doubts.trim()).length} with doubts</span></div>
        ${ds.map(dailyRecHTML).join("")}</div>`;
    }).join("");
    return `
      <div class="vhead"><div><h2>Daily training and assignment tracker</h2><p>One entry per class session: what was taught, the assignment and its deadline, whether you practised, and your doubts. Weekly summaries help you catch pending assignments before they pile up.</p></div></div>
      <div class="grid g4">
        <div class="card stat"><div class="k">Sessions logged</div><div class="v">${all.length}</div></div>
        <div class="card stat"><div class="k">Assignments done</div><div class="v acc-ok">${asg.filter((d) => d.status === "done").length}<span class="faint" style="font-size:16px"> / ${asg.length}</span></div></div>
        <div class="card stat"><div class="k">Overdue</div><div class="v ${od.length ? "acc-bad" : ""}">${od.length}</div></div>
        <div class="card stat"><div class="k">Marked for revision</div><div class="v">${all.filter((d) => d.revision || d.status === "rev").length}</div></div>
      </div>
      <div class="card" style="margin-bottom:14px"><h2>Log a session</h2>
        <div class="form">
          <div><label class="f" for="dDate">Date</label><input type="date" id="dDate" value="${today()}"></div>
          <div class="span2"><label class="f" for="dArea">Module / area</label><select id="dArea">${opt(DAILY_AREAS, pf ? pf.area : "fa1")}</select></div>
          <div class="span3"><label class="f" for="dTopic">Topic taught</label><input type="text" id="dTopic" maxlength="200" placeholder="e.g. Collections: ArrayList vs LinkedList"></div>
          <div class="span3"><label class="f" for="dNotes">Trainer / class notes</label><textarea id="dNotes" rows="2"></textarea></div>
          <div class="span3"><label class="f" for="dAssign">Assignment given</label><textarea id="dAssign" rows="2" placeholder="Leave blank if none"></textarea></div>
          <div><label class="f" for="dDeadline">Assignment deadline</label><input type="date" id="dDeadline"></div>
          <div><label class="f" for="dStatus">Assignment status</label><select id="dStatus">${opt(STATUS, "ns")}</select></div>
          <div class="span2"><label class="f" for="dDoubts">Doubts</label><input type="text" id="dDoubts" maxlength="400" placeholder="Questions to ask the trainer"></div>
          <div class="span2 checks"><label><input type="checkbox" id="dPractice"> Practice completed</label><label><input type="checkbox" id="dRevision"> Revision required</label></div>
          <div class="span6"><button class="btn primary" data-act="d-add">Add session</button></div>
        </div>
      </div>
      <div class="toolbar"><span class="h-label" style="margin:0 6px 0 0">Show</span><div class="seg">${[["all", "All"], ["pending", "Pending assignments"], ["overdue", "Overdue"], ["rev", "Needs revision"], ["doubts", "With doubts"]].map(([k, n]) => `<button class="btn sm${df.show === k ? " on" : ""}" data-act="d-filter" data-v="${k}">${n}</button>`).join("")}</div></div>
      ${weekHTML || `<div class="card empty">${all.length ? "Nothing matches this filter." : "No sessions logged yet. Once training starts, add one entry per class."}</div>`}`;
  };
  function dailyRecHTML(d) {
    const open = openDaily === d.id;
    return `<div class="rec${isOverdue(d) ? " overdue" : ""}" data-daily="${esc(d.id)}">
      <div class="rec-head">
        <div><button class="rec-title" data-act="d-open" data-id="${esc(d.id)}" aria-expanded="${open}">${esc(d.topic || "(no topic)")}</button>
          <div class="rec-sub">${esc(fmtDate(d.date))} · ${esc(DAILY_AREA_NAME[d.area])}${d.assign.trim() ? ` · assignment${d.deadline ? " due " + esc(fmtDate(d.deadline)) : ""}` : ""}${d.practice ? " · practised" : ""}${d.revision ? " · revise" : ""}${d.doubts.trim() ? " · doubts" : ""}</div></div>
        <div class="rec-ctl">${isOverdue(d) ? '<span class="pill bad">overdue</span>' : ""}${d.assign.trim() ? `<select data-dl="${esc(d.id)}" data-f="status" aria-label="Assignment status">${opt(STATUS, d.status)}</select>` : '<span class="faint" style="font-size:12px">no assignment</span>'}<button class="btn sm" data-act="d-open" data-id="${esc(d.id)}">${open ? "Close" : "Edit"}</button></div>
      </div>
      ${open ? `<div class="rec-body">
        <div class="row3"><div><label class="f">Date</label><input type="date" data-dl="${esc(d.id)}" data-f="date" value="${esc(d.date)}" style="width:100%"></div>
          <div><label class="f">Area</label><select data-dl="${esc(d.id)}" data-f="area" style="width:100%">${opt(DAILY_AREAS, d.area)}</select></div>
          <div><label class="f">Deadline</label><input type="date" data-dl="${esc(d.id)}" data-f="deadline" value="${esc(d.deadline)}" style="width:100%"></div></div>
        <div><label class="f">Topic taught</label><input type="text" data-dl="${esc(d.id)}" data-f="topic" value="${esc(d.topic)}" style="width:100%"></div>
        <div><label class="f">Trainer / class notes</label><textarea rows="3" data-dl="${esc(d.id)}" data-f="notes">${esc(d.notes)}</textarea></div>
        <div><label class="f">Assignment given</label><textarea rows="3" data-dl="${esc(d.id)}" data-f="assign">${esc(d.assign)}</textarea></div>
        <div><label class="f">Doubts</label><textarea rows="2" data-dl="${esc(d.id)}" data-f="doubts">${esc(d.doubts)}</textarea></div>
        <div class="checks" style="align-self:end"><label><input type="checkbox" data-dl="${esc(d.id)}" data-f="practice"${d.practice ? " checked" : ""}> Practice completed</label><label><input type="checkbox" data-dl="${esc(d.id)}" data-f="revision"${d.revision ? " checked" : ""}> Revision required</label>
          <button class="btn sm danger" data-act="d-del" data-id="${esc(d.id)}" style="margin-left:auto">Delete</button></div>
      </div>` : ""}
    </div>`;
  }
  function addDaily() {
    const v = (id) => $(id).value.trim();
    if (!v("#dTopic") && !v("#dAssign")) { toast("Add a topic or an assignment"); $("#dTopic").focus(); return; }
    state.daily.push({ id: uid(), date: v("#dDate") || today(), area: v("#dArea"), topic: v("#dTopic"), notes: v("#dNotes"), assign: v("#dAssign"), deadline: v("#dDeadline"), status: v("#dStatus"), practice: $("#dPractice").checked, doubts: v("#dDoubts"), revision: $("#dRevision").checked, created: Date.now() });
    writeNow(); renderView(); renderNav(route.v); toast("Session logged");
  }

  /* ================================================================ MY STREAM */
  const findMod = (id) => state.stream.modules.find((m) => m.id === id);
  VIEW_FN.stream = function () {
    const S = state.stream;
    const s = streamStat();
    const known = C.STREAM_EXAMPLES.includes(S.name);
    const sel = S.name === "__other" ? "__other" : known ? S.name : S.name ? "__other" : "";
    const recs = state.assess.filter((r) => r.phase === "C").map((r) => ({ r, c: aCalc(r) }));
    const asg = state.daily.filter((d) => d.area === "stream" && d.assign.trim());
    const weak = streamTopics().filter((t) => t.st === "rev");
    const mods = S.modules.map((m) => {
      const done = m.topics.filter((t) => t.st === "done").length;
      return `<section class="mod${m.open ? " open" : ""}" data-smod="${esc(m.id)}">
        <div class="mhead as-div"><button class="chevbtn" data-act="sm-toggle" data-id="${esc(m.id)}" aria-expanded="${m.open}" aria-label="Show or hide topics"><span class="chev">▶</span></button>
          <input type="text" class="mname" data-sm="${esc(m.id)}" data-f="name" value="${esc(m.name)}" aria-label="Module name">
          <span class="mmeta">${bar(pct(done, m.topics.length))}<span class="mcount">${done}/${m.topics.length}</span></span>
          <button class="btn sm danger" data-act="sm-del" data-id="${esc(m.id)}" aria-label="Delete module">×</button></div>
        <div class="mbody">
          <div class="items single">${m.topics.map((t) => `<div class="item ${t.st}"><input type="checkbox" data-stt="${esc(t.id)}" data-m="${esc(m.id)}"${t.st === "done" ? " checked" : ""} aria-label="Completed: ${esc(t.t)}"><div class="it">${esc(t.t)}</div><div class="rec-ctl"><select data-stt-st="${esc(t.id)}" data-m="${esc(m.id)}" aria-label="Status">${opt(STATUS, t.st)}</select><button class="btn sm danger" data-act="stt-del" data-id="${esc(t.id)}" data-m="${esc(m.id)}" aria-label="Delete topic">×</button></div></div>`).join("") || '<div class="empty">No topics yet.</div>'}</div>
          <div class="mnotes"><label class="f">Add topics (one per line, pasted from your course outline)</label><textarea rows="2" data-newtopics="${esc(m.id)}" placeholder="e.g. Spring Boot basics&#10;REST controllers&#10;JPA repositories"></textarea>
            <div class="qactions" style="margin-top:6px"><button class="btn sm primary" data-act="stt-add" data-m="${esc(m.id)}">Add topics</button></div>
            <label class="f" style="margin-top:10px">Module notes / practical exercises</label><textarea rows="2" data-sm="${esc(m.id)}" data-f="notes">${esc(m.notes)}</textarea></div>
        </div></section>`;
    }).join("");
    const prefs = state.prefs.map((p, i) => `<div class="rec"><div class="rec-head pref-row">
        <span class="pill mono">#${i + 1}</span>
        <div class="row-auto" style="gap:8px"><input type="text" list="streamList" data-pf="${esc(p.id)}" data-f="name" value="${esc(p.name)}" placeholder="Stream name" aria-label="Preferred stream"><select data-pf="${esc(p.id)}" data-f="ready" aria-label="Readiness">${opt(READY, p.ready)}</select><input type="text" data-pf="${esc(p.id)}" data-f="notes" value="${esc(p.notes)}" placeholder="What to learn / why" aria-label="Notes"></div>
        <div class="rec-ctl"><button class="btn sm" data-act="pf-up" data-id="${esc(p.id)}"${i ? "" : " disabled"} aria-label="Move up">↑</button><button class="btn sm danger" data-act="pf-del" data-id="${esc(p.id)}" aria-label="Remove">×</button></div></div></div>`).join("");
    return `
      <div class="vhead"><div><h2>My assigned technology stream</h2><p>Build your stream syllabus from the material Infosys gives your batch: modules, topics, practical work, assessments and weak areas. Nothing is preloaded, because streams and their content vary.</p></div>${s.total ? `<div class="totals"><div class="big" style="font-size:30px">${s.pct}%</div><div class="cap">${s.done} of ${s.total} topics</div></div>` : ""}</div>
      <div class="callout" style="margin-bottom:14px">${esc(C.STREAM_NOTE)}</div>
      <div class="grid g2">
        <div class="card"><h2>Assigned stream</h2>
          <div class="form" style="grid-template-columns:1fr 1fr">
            <div><label class="f" for="streamSel">Stream</label><select id="streamSel">${opt([["", "Not assigned yet"]].concat(C.STREAM_EXAMPLES.map((x) => [x, x]), [["__other", "Other (type the name)"]]), sel)}</select></div>
            <div><label class="f" for="streamCustom">Other / exact name</label><input type="text" id="streamCustom" data-stream="custom" maxlength="120" value="${esc(S.custom)}" placeholder="e.g. Java + Angular"${sel === "__other" ? "" : " disabled"}></div>
            <div style="grid-column:1 / -1"><label class="f" for="streamStructure">Assessment structure for my batch</label><textarea id="streamStructure" data-stream="structure" rows="2" placeholder="e.g. FA1 after module 2, FA2 after module 4; objective + hands-on; retest rules…">${esc(S.structure)}</textarea></div>
            <div style="grid-column:1 / -1"><label class="f" for="streamPass">Passing requirement (from your instructions)</label><input type="text" id="streamPass" data-stream="passReq" maxlength="120" value="${esc(S.passReq)}" placeholder="as given in your batch instructions"></div>
          </div>
          <p class="faint" style="font-size:12px;margin:10px 0 0">The list is examples only, not a guaranteed or complete set of Infosys streams.</p>
        </div>
        <div class="card"><h2>Stream activity</h2>
          <ul class="plain">
            <li><span>Topics completed</span><span class="pnum">${s.done}/${s.total}</span></li>
            <li><span>Topics needing revision</span><span class="pnum">${s.rev}</span></li>
            <li><span>Assignments (Daily tracker, area “Stream”)</span><span class="pnum">${asg.filter((d) => d.status === "done").length}/${asg.length}${asg.filter(isOverdue).length ? " · " + asg.filter(isOverdue).length + " overdue" : ""}</span></li>
            <li><span>Stream assessments recorded</span><span class="pnum">${recs.length} · ${recs.filter((x) => x.c.res === "pass").length} passed</span></li>
          </ul>
          <div class="qactions" style="margin-top:10px"><a class="btn sm" href="#daily" data-act="goto-daily" data-area="stream">+ Log class / assignment</a><a class="btn sm" href="#assess" data-act="goto-assess" data-type="stream" data-subject="Stream">+ Record FA1 / FA2 / other</a></div>
          ${recs.length ? `<h3>Assessments</h3><ul class="plain">${recs.map(({ r, c }) => `<li><span>${esc(r.name)} <span class="faint" style="font-size:12px">attempt ${esc(r.attempt)}</span></span><span class="nowrap">${c.pct != null ? `<span class="mono">${c.pct}%</span> ` : ""}${resPill(c.res)}</span></li>`).join("")}</ul>` : ""}
          ${weak.length ? `<h3>Weak areas</h3><ul class="plain">${weak.map((t) => `<li>${esc(t.t)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
      <div class="vhead" style="margin-top:8px"><div><h2 style="font-size:20px">Stream syllabus</h2><p>Add a module for each course unit, then paste its topics.</p></div>
        <div class="toolbar" style="margin:0"><input type="text" id="newModName" placeholder="New module name, e.g. Module 1: Spring Core" maxlength="120" aria-label="New module name"><button class="btn primary" data-act="sm-add">+ Add module</button></div></div>
      ${mods || '<div class="card empty">No stream modules yet. Once your stream is announced, add its modules here.</div>'}
      <div class="card" style="margin-top:14px"><h2>Stream notes</h2><textarea data-stream="notes" rows="3" placeholder="Trainer guidance, environment setup, useful links…" aria-label="Stream notes">${esc(S.notes)}</textarea></div>
      <div class="card" style="margin-top:14px"><h2>Preferred technology streams</h2>
        <p class="muted" style="font-size:13px;margin:0 0 10px">Record your preferences in order and track your readiness for each. This is for your own planning; it doesn't affect allocation.</p>
        ${prefs || '<div class="empty" style="padding:8px">No preferences recorded.</div>'}
        <div class="toolbar" style="margin:10px 0 0"><input type="text" id="newPref" list="streamList" placeholder="Add a preferred stream" maxlength="120" aria-label="Preferred stream to add"><button class="btn" data-act="pf-add">+ Add preference</button></div>
      </div>`;
  };

  /* ================================================================ CAPSTONE */
  let openTask = null;
  VIEW_FN.capstone = function () {
    const cp = state.capstone; const cs = capStat();
    const F = (f, label, rows, ph) => rows
      ? `<div class="span3"><label class="f" for="cp-${f}">${label}</label><textarea id="cp-${f}" data-cap="${f}" rows="${rows}" placeholder="${esc(ph || "")}">${esc(cp[f])}</textarea></div>`
      : `<div class="span2"><label class="f" for="cp-${f}">${label}</label><input type="text" id="cp-${f}" data-cap="${f}" value="${esc(cp[f])}" placeholder="${esc(ph || "")}"></div>`;
    const S = (f, label) => `<div class="span2"><label class="f" for="cp-${f}">${label}</label><select id="cp-${f}" data-cap="${f}">${opt(CAP_STATUS, cp[f])}</select></div>`;
    const byType = TASK_TYPES.map((t) => [t, cp.tasks.filter((x) => x.type === t)]).filter((x) => x[1].length);
    const tasks = byType.map(([t, list]) => `<h3>${esc(t)} · ${list.filter((x) => x.status === "done").length}/${list.length}</h3>${list.map(taskHTML).join("")}`).join("");
    return `
      <div class="vhead"><div><h2>Capstone project</h2><p>The team project at the end of stream training. Track the brief, your contribution, milestones, reviews, testing, the presentation and final submission.</p></div>${cs.total ? `<div class="totals"><div class="big" style="font-size:30px">${cs.pct}%</div><div class="cap">${cs.done} of ${cs.total} tasks</div></div>` : ""}</div>
      <div class="card" style="margin-bottom:14px"><h2>Project details</h2>
        <div class="form">
          ${F("title", "Project title", 0, "e.g. Library Management System")}${F("tech", "Assigned technology", 0, streamName() || "e.g. Java Full Stack")}${F("team", "Team members", 0, "Names, roles")}
          ${F("objective", "Project objective", 2)}${F("problem", "Problem statement", 2)}
          ${F("architecture", "Architecture", 3, "Layers, modules, data flow")}${F("technologies", "Technologies", 3, "Languages, frameworks, tools")}
          ${F("database", "Database", 2, "Tables, relationships")}${F("contribution", "My individual contribution", 2, "What you built yourself")}
          ${S("presentation", "Presentation")}${S("submission", "Final submission")}
          <div class="span2"><label class="f" for="cp-final">Final assessment status</label><input type="text" id="cp-final" data-cap="final" value="${esc(cp.final)}" placeholder="e.g. Evaluated: 26/30"></div>
          ${F("lessons", "Lessons learned", 3)}
        </div>
      </div>
      <div class="card"><h2>Tasks, milestones, reviews and testing</h2>
        <div class="form" style="margin-bottom:12px">
          <div class="span2"><label class="f" for="tkTitle">Task</label><input type="text" id="tkTitle" maxlength="200" placeholder="e.g. Build login API"></div>
          <div><label class="f" for="tkType">Type</label><select id="tkType">${TASK_TYPES.map((t) => `<option>${t}</option>`).join("")}</select></div>
          <div><label class="f" for="tkOwner">Owner</label><input type="text" id="tkOwner" maxlength="80" placeholder="Me"></div>
          <div><label class="f" for="tkDue">Due</label><input type="date" id="tkDue"></div>
          <div style="align-self:end"><button class="btn primary" data-act="tk-add" style="width:100%">+ Add</button></div>
        </div>
        ${tasks || '<div class="empty">No tasks yet. Add development tasks, milestones, code reviews, tests, the presentation and submission.</div>'}
      </div>`;
  };
  function taskHTML(t) {
    const open = openTask === t.id;
    const late = t.status !== "done" && t.due && t.due < today();
    return `<div class="rec${late ? " overdue" : ""}"><div class="rec-head">
      <div><button class="rec-title" data-act="tk-open" data-id="${esc(t.id)}" aria-expanded="${open}">${esc(t.t)}</button><div class="rec-sub">${t.owner ? esc(t.owner) + " · " : ""}${t.due ? (late ? "overdue · " : "due ") + esc(fmtDate(t.due)) : "no due date"}</div></div>
      <div class="rec-ctl"><select data-tk="${esc(t.id)}" data-f="status" aria-label="Status">${opt(STATUS, t.status)}</select><button class="btn sm" data-act="tk-open" data-id="${esc(t.id)}">${open ? "Close" : "Edit"}</button></div></div>
      ${open ? `<div class="rec-body">
        <div><label class="f">Task</label><input type="text" data-tk="${esc(t.id)}" data-f="t" value="${esc(t.t)}" style="width:100%"></div>
        <div class="row3"><div><label class="f">Type</label><select data-tk="${esc(t.id)}" data-f="type" style="width:100%">${TASK_TYPES.map((x) => `<option${x === t.type ? " selected" : ""}>${x}</option>`).join("")}</select></div>
          <div><label class="f">Owner</label><input type="text" data-tk="${esc(t.id)}" data-f="owner" value="${esc(t.owner)}" style="width:100%"></div>
          <div><label class="f">Due</label><input type="date" data-tk="${esc(t.id)}" data-f="due" value="${esc(t.due)}" style="width:100%"></div></div>
        <div style="grid-column:1 / -1"><label class="f">Notes</label><textarea rows="2" data-tk="${esc(t.id)}" data-f="notes">${esc(t.notes)}</textarea></div>
        <div><button class="btn sm danger" data-act="tk-del" data-id="${esc(t.id)}">Delete task</button></div></div>` : ""}</div>`;
  }

  /* ================================================================ REVISION */
  let revArea = "all";
  function weakAreas(area) {
    const W = [];
    const add = (areas, sev, html, link, cta) => { if (area === "all" || areas.includes(area)) W.push({ sev, html, link, cta }); };
    const subjArea = (s) => (s === "oop" || s === "java" ? ["prep", "gjava"] : s === "fx" ? ["other"] : ["prep", "gdbms"]);
    SUBJ_KEYS.forEach((k) => {
      const s = mcqStats((q) => q.s === k);
      if (s.attempted >= 5 && s.acc < 70) add(subjArea(k), 100 - s.acc, `<b>${esc(SUBJ[k])} MCQs</b>: ${s.acc}% accuracy over ${s.attempted} attempts`, `#mcq/${k}`, "Practise");
    });
    const topicAcc = {};
    QBANK.forEach((q) => { const a = state.mcq.att[q.id]; if (!a) return; const k = q.s + "|" + q.tp; const t = topicAcc[k] || (topicAcc[k] = { s: q.s, tp: q.tp, n: 0, c: 0 }); t.n += a.n; t.c += a.c; });
    Object.values(topicAcc).forEach((t) => { const p = pct(t.c, t.n); if (t.n >= 2 && p < 60) add(subjArea(t.s), 90 - p, `<b>${esc(SUBJ[t.s])} · ${esc(t.tp)}</b>: ${t.c}/${t.n} correct (${p}%)`, `#mcq/${t.s}`, "Practise"); });
    const wrongJ = lastWrong().filter((q) => q.s === "oop" || q.s === "java").length;
    const wrongD = lastWrong().filter((q) => q.s === "dbms" || q.s === "sql").length;
    if (wrongJ) add(["prep", "gjava"], 30 + wrongJ, `<b>${wrongJ} Java/OOP MCQ${wrongJ === 1 ? "" : "s"}</b> answered incorrectly last time`, "#mcq", "Retry");
    if (wrongD) add(["prep", "gdbms"], 30 + wrongD, `<b>${wrongD} DBMS/SQL MCQ${wrongD === 1 ? "" : "s"}</b> answered incorrectly last time`, "#mcq", "Retry");
    const javaOpen = state.coding.filter((r) => r.status === "ip" || r.status === "rev" || r.rev === "due");
    if (javaOpen.length) add(["prep", "gjava"], 35 + javaOpen.length, `<b>Java practice</b>: ${javaOpen.length} program${javaOpen.length === 1 ? "" : "s"} incomplete or due for revision`, "#coding", "Open");
    const sqlBad = EXS.filter((e) => { const r = state.sql[e.id]; return r && (r.ok === "wrong" || r.ok === "partial" || r.status === "rev"); });
    if (sqlBad.length) add(["prep", "gdbms"], 40 + sqlBad.length, `<b>SQL</b>: ${sqlBad.length} exercise${sqlBad.length === 1 ? "" : "s"} incorrect or flagged`, "#sql", "Open lab");
    state.assess.forEach((r) => {
      const c = aCalc(r); const ar = assessArea(r);
      const weakTxt = r.weak ? " · weak: " + esc(r.weak.slice(0, 80)) : "";
      if (c.res === "fail") add([ar], 95, `<b>${esc(r.name)}</b>: not passed (${c.pct != null ? c.pct + "%" : "no score"}${c.req != null ? ", needs " + c.req + "%" : ""})${weakTxt}`, "#assess", "Review");
      else if (c.pct != null && !c.meets) add([ar], r.type === "mock" ? 70 : 60, `<b>${esc(r.name)}</b>${r.type === "mock" ? " (mock)" : ""}: ${c.pct}%, below your ${esc(c.target)}% target${weakTxt}`, "#assess", "Review");
    });
    const group = (list) => { const g = {}; list.forEach((d) => { const a = DAILY_REV_AREA[d.area] || "other"; (g[a] = g[a] || []).push(d); }); return g; };
    const names = (l) => esc(l.map((d) => DAILY_AREA_NAME[d.area]).filter((v, i, s) => s.indexOf(v) === i).join(", "));
    Object.entries(group(state.daily.filter(isOverdue))).forEach(([a, l]) => add([a], 92, `<b>${l.length} overdue assignment${l.length === 1 ? "" : "s"}</b> (${names(l)})`, "#daily/overdue", "Open"));
    Object.entries(group(state.daily.filter((d) => d.assign.trim() && d.status !== "done" && !isOverdue(d)))).forEach(([a, l]) => add([a], 45, `<b>${l.length} unfinished assignment${l.length === 1 ? "" : "s"}</b> (${names(l)})`, "#daily", "Open"));
    const revMods = {};
    ITEMS.filter((it) => stOf(it.id) === "rev").forEach((it) => { (revMods[it.mod.key] = revMods[it.mod.key] || []).push(it); });
    Object.entries(revMods).forEach(([k, l]) => {
      const m = MOD[k]; const a = m.phase === "A" ? ["prep"] : k === "fa1" ? ["gjava"] : k === "fa2" ? ["gdbms"] : ["other"];
      add(a, 50 + l.length, `<b>${esc(m.code)} ${esc(m.name)}</b>: ${l.length} topic${l.length === 1 ? "" : "s"} marked Needs Revision`, `#${m.phase === "A" ? "prep" : "foundation"}/${k}`, "Open");
    });
    const srev = streamTopics().filter((t) => t.st === "rev");
    if (srev.length) add(["stream"], 55 + srev.length, `<b>Stream</b>: ${srev.length} topic${srev.length === 1 ? "" : "s"} marked Needs Revision`, "#stream", "Open");
    const capLate = state.capstone.tasks.filter((t) => t.status === "rev" || (t.status !== "done" && t.due && t.due < today()));
    if (capLate.length) add(["capstone"], 80, `<b>Capstone</b>: ${capLate.length} task${capLate.length === 1 ? "" : "s"} overdue or needing rework`, "#capstone", "Open");
    if (stat(phaseItems("A")).pct >= 15) phaseMods("A").forEach((m) => { const s = stat(m.items); if (s.pct < 40) add(["prep"], 30 - s.pct / 4, `<b>${esc(m.code)} ${esc(m.name)}</b> is only ${s.pct}% complete`, `#prep/${m.key}`, "Open"); });
    return W.sort((a, b) => b.sev - a.sev);
  }
  VIEW_FN.revision = function () {
    revArea = REV_AREAS.some((x) => x[0] === route.arg) ? route.arg : "all";
    const weak = weakAreas(revArea);
    const inArea = (it) => revArea === "all" || (revArea === "prep" && it.phase === "A") || (revArea === "gjava" && it.mod.key === "fa1") || (revArea === "gdbms" && it.mod.key === "fa2");
    const revItems = ["stream", "capstone"].includes(revArea) ? [] : ITEMS.filter((it) => stOf(it.id) === "rev" && inArea(it));
    const groups = {};
    revItems.forEach((it) => { (groups[it.mod.key] = groups[it.mod.key] || []).push(it); });
    const showMcq = ["all", "prep", "gjava", "gdbms"].includes(revArea);
    const qFilter = (q) => revArea === "all" || revArea === "prep" || (revArea === "gjava" ? q.s === "oop" || q.s === "java" : q.s === "dbms" || q.s === "sql");
    const wrongQ = showMcq ? lastWrong().filter(qFilter) : [];
    const flaggedQ = showMcq ? revQs().filter((q) => qFilter(q) && !wrongQ.includes(q)) : [];
    const nextRevs = state.assess.filter((r) => r.nextRev && (revArea === "all" || assessArea(r) === revArea)).sort((a, b) => a.nextRev.localeCompare(b.nextRev));
    return `
      <div class="vhead"><div><h2>Revision dashboard</h2><p>Weak areas worked out from incorrect MCQs, incomplete Java programs, incorrect SQL queries, low mock and assessment scores, unfinished assignments and topics marked Needs Revision.</p></div></div>
      <div class="toolbar"><span class="h-label" style="margin:0 6px 0 0">Area</span><div class="seg">${REV_AREAS.map(([k, n]) => `<a class="btn sm${revArea === k ? " on" : ""}" href="#revision/${k}">${esc(n)}</a>`).join("")}</div></div>
      <div class="grid g2">
        <div class="card"><h2>Weak areas · ${weak.length}</h2>${weak.length ? `<ul class="plain">${weak.slice(0, 15).map((w) => `<li><span>${w.html}</span><a class="btn sm" href="${w.link}">${w.cta} →</a></li>`).join("")}</ul>` : '<div class="empty">Nothing flagged in this area yet.</div>'}
          <p class="faint" style="font-size:12px;margin:8px 0 0">Rules: MCQ category under 70% (5+ attempts) or topic under 60% (2+); results not passed or below your target; overdue or unfinished assignments; incomplete Java programs; incorrect SQL; flagged topics; capstone tasks overdue.</p></div>
        <div class="card"><h2>MCQs to revise · ${wrongQ.length + flaggedQ.length}</h2>
          ${wrongQ.length || flaggedQ.length ? `<div class="qactions" style="margin-bottom:10px">${wrongQ.length ? `<a class="btn sm primary" href="#mcq" data-act="mq-goto-mode" data-v="incorrect">Retry incorrect</a>` : ""}${revQs().length ? `<a class="btn sm" href="#mcq" data-act="mq-goto-mode" data-v="revise">Practise ${revQs().length} marked</a>` : ""}</div>
            <ul class="plain">${wrongQ.concat(flaggedQ).slice(0, 10).map((q) => `<li><span style="font-size:13px">${esc(q.q.length > 110 ? q.q.slice(0, 108) + "…" : q.q)}</span><span class="pill ${wrongQ.includes(q) ? "bad" : "mid"}">${esc(SUBJ[q.s])}</span></li>`).join("")}</ul>`
          : '<div class="empty">No incorrect or flagged questions in this area.</div>'}</div>
      </div>
      <div class="grid g2">
        <div class="card"><h2>Topics needing revision · ${revItems.length}</h2>${revItems.length ? Object.keys(groups).map((k) => `<h3>${esc(MOD[k].code)} ${esc(MOD[k].name)}</h3><div class="items single boxed">${groups[k].map((it) => itemHTML(it, true)).join("")}</div>`).join("") : '<div class="empty">Nothing flagged. Set a topic\'s status to "Needs Revision" to list it here.</div>'}</div>
        <div class="card"><h2>Scheduled assessment revision</h2>${nextRevs.length ? `<ul class="plain">${nextRevs.map((r) => `<li><span><b>${esc(r.name)}</b>${r.weak ? ` <span class="muted" style="font-size:12.5px">· ${esc(r.weak.slice(0, 90))}</span>` : ""}</span><span class="pill ${r.nextRev < today() ? "bad" : ""}">${esc(fmtDate(r.nextRev))}</span></li>`).join("")}</ul>` : '<div class="empty">Set a “next revision date” on assessment records to schedule revision.</div>'}</div>
      </div>`;
  };

  /* ================================================================ SOURCES & DATA */
  VIEW_FN.sources = function () {
    const counts = {}; ITEMS.forEach((it) => { counts[it.s] = (counts[it.s] || 0) + 1; });
    const groups = Object.keys(C.SOURCE_CLASSES).map((k) => {
      const list = C.SOURCES.filter((s) => s.cls === k);
      return `<h3>${esc(C.SOURCE_CLASSES[k])}</h3><div class="tscroll"><table class="t"><thead><tr><th>Source</th><th>Date</th><th>Reliability</th><th>Supports</th></tr></thead><tbody>${list.map((s) => `<tr><td><b>${esc(s.name)}</b>${s.url ? `<div style="font-size:12px;word-break:break-all"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a></div>` : ""}</td><td style="white-space:nowrap">${esc(s.date)}</td><td>${esc(s.rel)}</td><td class="muted">${esc(s.topics)}</td></tr>`).join("")}</tbody></table></div>`;
    }).join("");
    let hasBackup = false; try { hasBackup = !!localStorage.getItem(BACKUP_KEY(user)); } catch (e) {}
    const lg = state.legacy;
    const lgN = (o) => Object.keys((lg && lg[o]) || {}).length;
    return `
      <div class="vhead"><div><h2>Research &amp; training sources</h2><p>Where this page's structure comes from, how reliable each source is, and your data controls.</p></div></div>
      <div class="card" style="margin-bottom:14px"><h2>How to read this page</h2>
        <ul class="plain">${Object.keys(C.CLASSES).map((k) => `<li><span>${clsBadge(k)} ${esc(C.CLASSES[k][1])}</span><span class="pnum">${counts[k] || 0} topics</span></li>`).join("")}</ul>
        <div class="note" style="margin-top:10px">Infosys publishes that the Foundation Program combines generic training, stream-specific technology training and soft skills. It does <b>not</b> publish a topic syllabus, assessment pattern, pass marks or allocation rules. Marks, question counts, pass percentages and attempt limits quoted anywhere on this page come from trainee or press reports and are <b>never</b> applied as policy. Your batch's training instructions decide everything. The MCQs are practice questions written for this tracker.</div>
      </div>
      <div class="card" style="margin-bottom:14px"><h2>Sources</h2>${groups}
        <p class="faint" style="font-size:12px;margin:8px 0 0">Research done November 2026. Infosys pages, Reddit threads and Business Standard refused automated access, so they're linked for you to read and only search-snippet or press-covered facts are used.</p></div>
      <div class="card"><h2>Your data</h2>
        <p style="font-size:13.5px;margin:0 0 10px">Saved in this browser under <span class="mono">${esc(KEY(user))}</span> (schema v${SCHEMA}). It is separate from the home page plans (Onboarding, Deloitte NLA, Infosys R2), and nothing is sent to a server. Last saved: <b>${ago(state.updated)}</b>.</p>
        <div class="qactions"><button class="btn" data-act="export">Export backup (.json)</button><label class="btn" style="cursor:pointer">Import backup<input type="file" accept="application/json,.json" id="importFile" class="hidden"></label><button class="btn danger" data-act="reset">Reset this page's progress</button></div>
        ${hasBackup || lg ? `<h3>Earlier version (recruitment-prep layout)</h3><p class="muted" style="font-size:13px;margin:0 0 8px">When this page was restructured, your old data was copied before anything changed.${lg ? ` Also kept: ${lgN("st")} status${lgN("st") === 1 ? "" : "es"} for removed recruitment topics, ${lgN("ans")} interview answer${lgN("ans") === 1 ? "" : "s"} and ${lgN("notes")} note${lgN("notes") === 1 ? "" : "s"} from removed modules.` : ""} Importing the pre-migration file restores the old data, which is then migrated again.</p>
          <div class="qactions">${hasBackup ? '<button class="btn" data-act="export-v1">Download pre-migration backup</button>' : ""}${lgN("ans") ? '<button class="btn" data-act="export-legacy">Download old interview answers</button>' : ""}</div>` : ""}
        <p class="faint" style="font-size:12px;margin:10px 0 0">Progress is tied to this browser and this site address. Export a backup before clearing browser data or switching devices.</p>
      </div>`;
  };
  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function exportData() { flush(); download("infosys-training-" + slug(user) + "-" + today() + ".json", { app: NS, schema: SCHEMA, user, exported: new Date().toISOString(), state }); toast("Backup downloaded"); }
  function importData(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(fr.result);
        if (!data || data.app !== NS || !isObj(data.state)) { toast("That file isn't a backup from this page"); return; }
        if (!confirm("Replace your current progress on this page with this backup" + (data.user ? " (from “" + data.user + "”)" : "") + "?")) return;
        let st = data.state;
        if (!st.v || st.v < SCHEMA) { try { localStorage.setItem(BACKUP_KEY(user), JSON.stringify(st)); } catch (e) { /* best effort */ } st = migrateV1(st); }
        state = sanitize(st);
        writeNow(); go(); toast("Backup restored");
      } catch (e) { toast("Couldn't read that file"); }
    };
    fr.readAsText(file);
  }

  /* ================================================================ EVENTS */
  const view = $("#view");
  const findAssess = (id) => state.assess.find((x) => x.id === id);
  const findDaily = (id) => state.daily.find((x) => x.id === id);
  const findTask = (id) => state.capstone.tasks.find((x) => x.id === id);
  view.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || !view.contains(b)) return;
    const act = b.dataset.act, id = b.dataset.id;
    switch (act) {
      case "dismiss-migration": migratedNow = null; renderView(); return;
      case "mod-toggle": {
        const k = b.dataset.mod; const sec = b.closest(".mod");
        if (filtering()) { sec.classList.toggle("open"); b.setAttribute("aria-expanded", sec.classList.contains("open")); return; }
        if (state.open[k]) delete state.open[k]; else state.open[k] = true;
        save(); sec.outerHTML = moduleHTML(MOD[k]); return;
      }
      case "expand-all": phaseMods(b.dataset.phase).forEach((m) => { state.open[m.key] = true; }); save(); rerenderModules(); return;
      case "collapse-all": phaseMods(b.dataset.phase).forEach((m) => { delete state.open[m.key]; }); save(); rerenderModules(); return;
      case "clear-filters": filt.q = ""; filt.status = filt.pri = filt.cls = "all"; renderView(); return;
      case "goto-daily": e.preventDefault(); prefill = { kind: "daily", area: b.dataset.area }; if (route.v === "daily") renderView(); else location.hash = "#daily"; return;
      case "goto-assess": e.preventDefault(); prefill = { kind: "assess", type: b.dataset.type, subject: b.dataset.subject || "", phase: defaultPhase(b.dataset.type) }; if (route.v === "assess") renderView(); else location.hash = "#assess"; return;

      case "mq-subj": mq.subj = b.dataset.v; mq.deck = []; quizResult = null; history.replaceState(null, "", "#mcq" + (mq.subj === "all" ? "" : "/" + mq.subj)); route.arg = mq.subj; renderView(); return;
      case "mq-diff": mq.diff = b.dataset.v; mq.deck = []; quizResult = null; renderView(); return;
      case "mq-mode": mq.mode = b.dataset.v; mq.deck = []; quizResult = null; if (route.v !== "mcq") location.hash = "#mcq"; else renderView(); return;
      case "mq-goto-mode": e.preventDefault(); mq.mode = b.dataset.v; mq.subj = "all"; mq.diff = "all"; mq.deck = []; quizResult = null; location.hash = "#mcq"; return;
      case "mq-pick": {
        const i = +b.dataset.i;
        if (state.mcq.active) {
          const z = state.mcq.active; const q = QMAP[z.ids[z.idx]];
          let p = (z.ans[q.id] || []).slice();
          p = q.a.length > 1 ? (p.includes(i) ? p.filter((x) => x !== i) : p.concat(i)) : [i];
          z.ans[q.id] = p; save(); renderView(); return;
        }
        if (mq.submitted) return;
        const q = QMAP[mq.deck[mq.idx]];
        mq.pick = q.a.length > 1 ? (mq.pick.includes(i) ? mq.pick.filter((x) => x !== i) : mq.pick.concat(i)) : [i];
        renderView(); return;
      }
      case "mq-submit": { const q = QMAP[mq.deck[mq.idx]]; if (!mq.pick.length) return; const ok = isRight(q, mq.pick); recordAttempt(q, ok); mq.submitted = true; mq.score.n++; if (ok) mq.score.c++; writeNow(); renderNav(route.v); renderView(); return; }
      case "mq-next": case "mq-skip": mq.idx++; mq.pick = []; mq.submitted = false; renderView(); return;
      case "mq-restart": buildDeck(); renderView(); return;
      case "mq-save": case "mq-rev": { const bag = act === "mq-save" ? state.mcq.saved : state.mcq.rev; if (bag[id]) delete bag[id]; else bag[id] = 1; save(); renderNav(route.v); renderView(); return; }
      case "qz-start": startQuiz(); return;
      case "qz-go": state.mcq.active.idx = +b.dataset.i; save(); renderView(); return;
      case "qz-prev": state.mcq.active.idx = Math.max(0, state.mcq.active.idx - 1); save(); renderView(); return;
      case "qz-next": state.mcq.active.idx = Math.min(state.mcq.active.ids.length - 1, state.mcq.active.idx + 1); save(); renderView(); return;
      case "qz-submit": { const z = state.mcq.active; const left = z.ids.filter((x) => !(z.ans[x] || []).length).length; if (left && !confirm(left + " question(s) unanswered. Submit anyway?")) return; submitQuiz(false); return; }
      case "qz-abandon": if (confirm("Abandon this timed practice? Nothing from it will be recorded.")) { state.mcq.active = null; writeNow(); tickTimer(); renderView(); } return;
      case "qz-again": quizResult = null; mq.mode = "quiz"; renderView(); return;

      case "cp-add": addCoding(); return;
      case "cp-open": openRec = openRec === id ? null : id; renderView(); return;
      case "cp-del": { const r = state.coding.find((x) => x.id === id); if (r && confirm("Delete “" + r.name + "” from your log?")) { state.coding = state.coding.filter((x) => x !== r); writeNow(); renderView(); } return; }

      case "ex-open": { const r = sqlRec(id); r.open = !r.open; save(); const ex = EXMAP[id]; const card = document.getElementById("ex-" + id); if (card) card.outerHTML = exHTML(ex, EXS.indexOf(ex)); return; }
      case "ex-run": runExercise(id); return;
      case "ex-sol": { showSol[id] = !showSol[id]; const ta = $(`[data-sqlf="query"][data-id="${CSS.escape(id)}"]`); if (ta) { sqlRec(id).query = ta.value; save(); } const ex = EXMAP[id]; const card = document.getElementById("ex-" + id); if (card) card.outerHTML = exHTML(ex, EXS.indexOf(ex)); return; }
      case "sql-scratch": runScratch(); return;

      case "as-add": addAssessment(); return;
      case "as-open": openAssess = openAssess === id ? null : id; renderView(); return;
      case "as-filter": af.phase = b.dataset.v; renderView(); return;
      case "as-del": { const r = findAssess(id); if (r && confirm("Delete the record “" + r.name + "”?")) { state.assess = state.assess.filter((x) => x !== r); writeNow(); renderView(); renderNav(route.v); } return; }

      case "d-add": addDaily(); return;
      case "d-open": openDaily = openDaily === id ? null : id; renderView(); return;
      case "d-filter": df.show = b.dataset.v; if (route.arg) history.replaceState(null, "", "#daily"); route.arg = ""; renderView(); return;
      case "d-del": { const d = findDaily(id); if (d && confirm("Delete this session entry?")) { state.daily = state.daily.filter((x) => x !== d); writeNow(); renderView(); renderNav(route.v); } return; }

      case "sm-add": { const n = $("#newModName").value.trim(); if (!n) { $("#newModName").focus(); toast("Enter a module name"); return; } state.stream.modules.push({ id: uid(), name: n, open: true, notes: "", topics: [] }); writeNow(); renderView(); return; }
      case "sm-toggle": { const m = findMod(id); if (m) { m.open = !m.open; save(); renderView(); } return; }
      case "sm-del": { const m = findMod(id); if (m && confirm("Delete module “" + m.name + "” and its " + m.topics.length + " topic(s)?")) { state.stream.modules = state.stream.modules.filter((x) => x !== m); writeNow(); renderView(); renderHeader(); } return; }
      case "stt-add": {
        const m = findMod(b.dataset.m); const ta = $(`[data-newtopics="${CSS.escape(b.dataset.m)}"]`);
        if (!m || !ta) return;
        const lines = ta.value.split(/\r?\n/).map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean);
        if (!lines.length) { toast("Type or paste topics, one per line"); return; }
        const have = new Set(m.topics.map((t) => t.t.toLowerCase()));
        let n = 0; lines.forEach((t) => { if (!have.has(t.toLowerCase())) { m.topics.push({ id: uid(), t: t.slice(0, 300), st: "ns" }); have.add(t.toLowerCase()); n++; } });
        writeNow(); renderView(); renderHeader(); toast(n + " topic" + (n === 1 ? "" : "s") + " added" + (lines.length > n ? " (duplicates skipped)" : "")); return;
      }
      case "stt-del": { const m = findMod(b.dataset.m); if (m) { m.topics = m.topics.filter((t) => t.id !== id); writeNow(); renderView(); renderHeader(); } return; }
      case "pf-add": { const n = $("#newPref").value.trim(); if (!n) { $("#newPref").focus(); return; } state.prefs.push({ id: uid(), name: n, ready: "0", notes: "" }); writeNow(); renderView(); return; }
      case "pf-up": { const i = state.prefs.findIndex((p) => p.id === id); if (i > 0) { const t = state.prefs[i - 1]; state.prefs[i - 1] = state.prefs[i]; state.prefs[i] = t; writeNow(); renderView(); } return; }
      case "pf-del": state.prefs = state.prefs.filter((p) => p.id !== id); writeNow(); renderView(); return;

      case "tk-add": { const t = $("#tkTitle").value.trim(); if (!t) { $("#tkTitle").focus(); toast("Enter a task"); return; } state.capstone.tasks.push({ id: uid(), type: $("#tkType").value, t, owner: $("#tkOwner").value.trim(), due: $("#tkDue").value, status: "ns", notes: "" }); writeNow(); renderView(); return; }
      case "tk-open": openTask = openTask === id ? null : id; renderView(); return;
      case "tk-del": { const t = findTask(id); if (t && confirm("Delete task “" + t.t + "”?")) { state.capstone.tasks = state.capstone.tasks.filter((x) => x !== t); writeNow(); renderView(); } return; }

      case "export": exportData(); return;
      case "export-v1": { let raw = null; try { raw = localStorage.getItem(BACKUP_KEY(user)); } catch (err) { /* ignore */ } if (raw) { download("infosys-se-pre-migration-" + slug(user) + ".json", { app: NS, schema: 1, user, exported: new Date().toISOString(), state: JSON.parse(raw) }); toast("Pre-migration backup downloaded"); } return; }
      case "export-legacy": download("infosys-se-old-interview-answers-" + slug(user) + ".json", { user, answers: (state.legacy || {}).ans || {} }); return;
      case "reset": if (confirm("Delete ALL progress on this page (ticks, MCQ history, practice, SQL, assessments, daily log, stream, capstone)? Other plans are not affected.") && confirm("This cannot be undone. Really reset?")) { state = BLANK(); writeNow(); go(); toast("Progress reset"); } return;
    }
  });

  view.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("input[type=checkbox][data-item]")) { setStatus(t.dataset.item, t.checked ? "done" : "ns"); return; }
    if (t.matches("select[data-st]")) { setStatus(t.dataset.st, t.value); return; }
    if (t.id === "synStatus") { filt.status = t.value; rerenderModules(); return; }
    if (t.id === "synPri") { filt.pri = t.value; rerenderModules(); return; }
    if (t.id === "synCls") { filt.cls = t.value; rerenderModules(); return; }
    if (t.id === "cpFilter") { cf.status = t.value; renderView(); return; }
    if (t.matches("[data-cp]")) { const r = state.coding.find((x) => x.id === t.dataset.cp); if (!r) return; r[t.dataset.f] = t.value; r.updated = Date.now(); save(); if (t.tagName === "SELECT" || t.dataset.f === "name") renderView(); return; }
    if (t.matches("select[data-sqlf]")) { sqlRec(t.dataset.id)[t.dataset.sqlf] = t.value; save(); renderNav(route.v); return; }
    if (t.id === "importFile" && t.files && t.files[0]) { importData(t.files[0]); t.value = ""; return; }
    if (t.id === "asType") { const ph = $("#asPhase"); if (ph) ph.value = defaultPhase(t.value) === "B" && (ph.value === "A") ? "A" : defaultPhase(t.value); return; }
    if (t.matches("[data-as]")) { const r = findAssess(t.dataset.as); if (!r) return; r[t.dataset.f] = t.value; writeNow(); renderView(); renderNav(route.v); return; }
    if (t.matches("[data-passcfg]")) { const v = t.value.trim(); if (v === "") delete state.assessCfg.pass[t.dataset.passcfg]; else state.assessCfg.pass[t.dataset.passcfg] = v; writeNow(); renderView(); return; }
    if (t.id === "targetPct") { const v = parseFloat(t.value); state.assessCfg.target = isFinite(v) && v > 0 && v <= 100 ? v : 75; writeNow(); renderView(); return; }
    if (t.matches("[data-dl]")) { const d = findDaily(t.dataset.dl); if (!d) return; d[t.dataset.f] = t.type === "checkbox" ? t.checked : t.value; writeNow(); if (t.tagName === "SELECT" || t.type === "checkbox" || t.type === "date") { renderView(); renderNav(route.v); } return; }
    if (t.id === "streamSel") { state.stream.name = t.value; writeNow(); renderView(); renderHeader(); return; }
    if (t.matches("input[data-stt]")) { const m = findMod(t.dataset.m); const tp = m && m.topics.find((x) => x.id === t.dataset.stt); if (tp) { tp.st = t.checked ? "done" : "ns"; writeNow(); renderView(); renderHeader(); } return; }
    if (t.matches("select[data-stt-st]")) { const m = findMod(t.dataset.m); const tp = m && m.topics.find((x) => x.id === t.dataset.sttSt); if (tp) { tp.st = t.value; writeNow(); renderView(); renderHeader(); } return; }
    if (t.matches("select[data-pf]")) { const p = state.prefs.find((x) => x.id === t.dataset.pf); if (p) { p[t.dataset.f] = t.value; writeNow(); } return; }
    if (t.matches("select[data-tk]")) { const tk = findTask(t.dataset.tk); if (tk) { tk[t.dataset.f] = t.value; writeNow(); renderView(); } return; }
    if (t.matches("input[type=date][data-tk]")) { const tk = findTask(t.dataset.tk); if (tk) { tk.due = t.value; writeNow(); renderView(); } return; }
    if (t.matches("select[data-cap]")) { state.capstone[t.dataset.cap] = t.value; writeNow(); return; }
  });

  let searchTimer = null;
  view.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "synSearch") { clearTimeout(searchTimer); searchTimer = setTimeout(() => { filt.q = t.value.trim().toLowerCase(); rerenderModules(); }, 160); return; }
    if (t.id === "cpSearch") { clearTimeout(searchTimer); searchTimer = setTimeout(() => { cf.q = t.value.trim().toLowerCase(); const pos = t.selectionStart; renderView(); const n = $("#cpSearch"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 200); return; }
    if (t.matches("textarea[data-note]")) { if (t.value) state.notes[t.dataset.note] = t.value; else delete state.notes[t.dataset.note]; save(); return; }
    if (t.matches("textarea[data-cp], input[data-cp]")) { const r = state.coding.find((x) => x.id === t.dataset.cp); if (r) { r[t.dataset.f] = t.value; r.updated = Date.now(); save(); } return; }
    if (t.matches("textarea[data-sqlf]")) { sqlRec(t.dataset.id)[t.dataset.sqlf] = t.value; save(); return; }
    if (t.matches("[data-scratch]")) { state.scratch = t.value; save(); return; }
    if (t.matches("textarea[data-as]")) { const r = findAssess(t.dataset.as); if (r) { r[t.dataset.f] = t.value; save(); } return; }
    if (t.matches("textarea[data-dl], input[type=text][data-dl]")) { const d = findDaily(t.dataset.dl); if (d) { d[t.dataset.f] = t.value; save(); } return; }
    if (t.matches("[data-stream]")) { state.stream[t.dataset.stream] = t.value; save(); if (t.dataset.stream === "custom") renderHeader(); return; }
    if (t.matches("input[data-sm], textarea[data-sm]")) { const m = findMod(t.dataset.sm); if (m) { m[t.dataset.f] = t.value; save(); } return; }
    if (t.matches("input[data-pf]")) { const p = state.prefs.find((x) => x.id === t.dataset.pf); if (p) { p[t.dataset.f] = t.value; save(); } return; }
    if (t.matches("input[type=text][data-tk], textarea[data-tk]")) { const tk = findTask(t.dataset.tk); if (tk) { tk[t.dataset.f] = t.value; save(); } return; }
    if (t.matches("input[data-cap], textarea[data-cap]")) { state.capstone[t.dataset.cap] = t.value; save(); return; }
  });
  view.addEventListener("keydown", (e) => {
    const t = e.target;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && t.matches('textarea[data-sqlf="query"]')) { e.preventDefault(); runExercise(t.dataset.id); }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && t.id === "scratchSql") { e.preventDefault(); runScratch(); }
    if (e.key === "Enter" && t.id === "newModName") { e.preventDefault(); $('[data-act="sm-add"]').click(); }
    if (e.key === "Enter" && t.id === "newPref") { e.preventDefault(); $('[data-act="pf-add"]').click(); }
  });

  window.addEventListener("hashchange", go);
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("storage", (e) => {
    if (!user || e.key !== KEY(user) || !e.newValue || saveTimer) return;
    try { const p = JSON.parse(e.newValue); if (p.v === SCHEMA) { state = sanitize(p); renderHeader(); renderNav(route.v); if (["dashboard", "revision", "sources"].includes(route.v)) renderView(); } } catch (err) { /* ignore */ }
  });

  /* ================================================================ LOGIN */
  function profiles() { try { const a = JSON.parse(localStorage.getItem(PROFILES) || "[]"); return Array.isArray(a) ? a.filter((p) => p && p.name) : []; } catch (e) { return []; } }
  function showLogin() {
    flush();
    $("#loginModal").classList.remove("hidden");
    $("#nameInput").value = ""; $("#startBtn").disabled = true;
    const ps = profiles(); const list = $("#profileList");
    if (ps.length) {
      list.classList.remove("hidden");
      list.innerHTML = '<label class="f">Continue as…</label>' + ps.map((p) => {
        let has = false; try { has = !!localStorage.getItem(KEY(p.name)); } catch (e) { /* ignore */ }
        return `<button data-pick="${esc(p.name)}"><span class="avatar">${esc(p.name.charAt(0).toUpperCase())}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</span><span class="faint mono" style="font-size:11px">${has ? "training progress saved" : "no progress here yet"}</span></button>`;
      }).join("");
    } else list.classList.add("hidden");
    setTimeout(() => $("#nameInput").focus(), 60);
  }
  function activate(name) {
    flush();
    user = String(name).trim().slice(0, 40);
    if (!user) return;
    try { sessionStorage.setItem(SESSION, user); } catch (e) { /* ignore */ }
    canStore = storageWorks();
    load();
    checkExpiredQuiz();
    $("#loginModal").classList.add("hidden");
    mq.deck = []; quizResult = null; openRec = openAssess = openDaily = openTask = null;
    go();
  }
  $("#nameInput").addEventListener("input", function () { $("#startBtn").disabled = !this.value.trim(); });
  $("#nameInput").addEventListener("keydown", function (e) { if (e.key === "Enter" && this.value.trim()) activate(this.value); });
  $("#startBtn").addEventListener("click", () => { const v = $("#nameInput").value; if (v.trim()) activate(v); });
  $("#profileList").addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (b) activate(b.dataset.pick); });
  $("#userChip").addEventListener("click", showLogin);
  $("#loginModal").addEventListener("keydown", (e) => { if (e.key === "Escape" && user) $("#loginModal").classList.add("hidden"); });

  $("#codingProblems").innerHTML = MOD.coding.items.concat(MOD.oop.sections.find((s) => s.key === "practical").list).map((it) => `<option value="${esc(it.t)}"></option>`).join("");
  $("#streamList").innerHTML = C.STREAM_EXAMPLES.map((s) => `<option value="${esc(s)}"></option>`).join("");
  $("#subjectList").innerHTML = ["Java", "OOP", "DBMS", "SQL", "DBMS / SQL", "Operating systems", "Software engineering", "HTML / CSS", "Stream", "Capstone"].map((s) => `<option value="${esc(s)}"></option>`).join("");

  /* ================================================================ BOOT */
  canStore = storageWorks();
  if (!canStore) warnStorage();
  let sessionUser = null;
  try { sessionUser = sessionStorage.getItem(SESSION); } catch (e) { /* ignore */ }
  route = parseHash();
  renderNav(route.v);
  renderHeader();
  if (sessionUser && sessionUser.trim()) activate(sessionUser);
  else showLogin();

  window.__SE = {
    counts: () => ({ items: ITEMS.length, A: phaseItems("A").length, B: phaseItems("B").length, mcq: QBANK.length, sql: EXS.length, modules: MODULES.length }),
    key: () => (user ? KEY(user) : null),
    aliasCheck: () => Object.entries(C.ALIASES).filter(([, v]) => !ITEM[v]).map(([k]) => k)
  };
})();
