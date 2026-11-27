# Preparation Plan

A single-file study tracker for pre-joining prep: DSA, Java, Spring Boot, SQL, REST, React, Git, Python, interview prep and day-one working-engineer skills. 11 tracks, 223 items. No build step, no dependencies, no backend.

## Deploy to Vercel

**Option A — CLI (fastest)**

```bash
npm i -g vercel
cd New_strategy
vercel          # first run: creates a preview
vercel --prod   # then: publishes to your production URL
```

**Option B — GitHub**

1. Push this folder to a GitHub repo.
2. On vercel.com: **Add New → Project → Import** that repo.
3. Framework preset: **Other**. Leave build command and output directory empty.
4. Deploy.

Nothing else to configure — `index.html` at the root is served at `/`.

## How progress is saved

Ticks, notes, collapsed sections and the study log are stored in your browser's `localStorage` under the key `prime-ledger-v1`. Nothing is sent anywhere; there is no account and no server.

Two consequences worth understanding:

- **Progress is tied to one browser on one device, and to one URL.** Chrome on your laptop and Chrome on your phone keep separate ledgers.
- **The URL matters.** Every Vercel *preview* deployment gets its own address (`...-abc123.vercel.app`), which counts as a different site with its own storage. **Always open your production domain** (the one that stays the same across deploys) and bookmark it. Redeploying that domain never touches your saved progress.

Clearing browsing data / "cookies and site data" for that domain erases the ledger. So:

**Study log tab → Backup → Export backup** downloads a `.json` file with everything in it. Do this every few weeks, and before clearing browser data or switching laptops. **Import backup** on the new browser restores it.

If you open the page in incognito or with site data blocked, an amber warning appears at the top — in that mode nothing survives a refresh.

## Plans

The switcher at the top moves between three independent plans:

| Tab | What it is | Stored under (per user) |
|---|---|---|
| **Onboarding Training** | The original pre-joining ledger | `prime-ledger-v1-<name>` |
| **Deloitte NLA** | 331 sub-topics across six modules, a 2026 pattern overview, a "needs attention" summary, module notes and a study log | `deloitte-nla-v1-<name>` |
| **Infosys 20 Dec** | Plan for the Infosys in-person coding round (28 Nov – 20 Dec 2026) with five screens: Today (numbered steps), Full plan, Pattern quiz, My progress and Guide, plus the plan PDF. Content in `dec20/plan-data.js`, rendering in `dec20/plan-app.js` | `dec20-plan-v1-<name>` |

- The tab each person had open last is stored in `prep-view-v1-<name>`.
- No plan reads or writes another plan's key, so adding a plan never touches existing progress. The storage key names still say `prime-ledger` so existing data keeps loading.
- Deloitte and Infosys 20 Dec each have their own **Export / Import backup** buttons at the bottom of their tab. The Study log backup covers only the Onboarding Training tab.
- Deleting a profile from the "Continue as…" list removes that person's data from every plan.
- The earlier **Infosys R2** tab was replaced by Infosys 20 Dec. A saved R2 tab choice opens the new tab. Old R2 data (`infosys-r2-v1-<name>`) is left in the browser untouched and is removed only if that profile is deleted.
- Deloitte content lives in `NLA_MODULES`. Its item ids come from the item text (`module.section.slug`), so adding or reordering items is safe. Renaming an item clears only that item's tick.
- Assessment patterns shown in the Deloitte and Infosys tabs are reported candidate and third-party information, not official specifications. Each tab says so.

## Infosys internal training page (`/infosys`)

A separate page for someone **already selected** as an Infosys Systems Engineer, preparing for internal Foundation Program training (not recruitment, not SP/DSE, not the 20 Dec coding tab). It has three phases: **A** pre-joining preparation (Java coding, OOP, core Java, DBMS, SQL, MCQs), **B** Generic Foundation Training (FA1-style Java and FA2-style DBMS/SQL workspaces, OS/IT, SE & web, professional skills) and **C** the assigned technology stream (a user-built syllabus) plus the capstone. Alongside them are an internal assessment tracker (pass marks are configured by you, never hard-coded), a daily class/assignment tracker with weekly summaries, a revision dashboard, an MCQ engine, a SQL Lab and a Java practice log.

| File | What it holds |
|---|---|
| `infosys/index.html` | Page shell and styles |
| `infosys/se-content.js` | Phases, A/B modules (one checkbox per topic), v1→v2 `ALIASES`, stream examples, assessment types, reported benchmarks (research note only), sources |
| `infosys/se-mcq.js` | MCQ bank: 4 main categories (OOP, Java, DBMS, SQL) + "Foundation extras". Append new questions with new ids; never reuse an id |
| `infosys/se-sql.js` | **Generated** SQL Lab data. Edit `scripts/gen_infosys_sql.py` and run `python scripts/gen_infosys_sql.py infosys/se-sql.js`, which re-computes expected outputs by running each reference solution in SQLite |
| `infosys/se-app.js` | Router, state, migration, rendering |

- **Routing:** `vercel.json` rewrites `/infosys` and `/infosys/` to `infosys/index.html`. Views are hash routes (`#prep/oop`, `#foundation/fa1`, `#assess`, `#daily`, `#stream`, …), so back/forward and refresh work. Old links (`#syllabus/…`, `#interview`) redirect. Scripts load from absolute `/infosys/…` paths, so serve over HTTP.
- **Storage:** `infosys_se_preparation_v1-<name>`, with a schema version inside (`v: 2`). On first load of old v1 data, the raw JSON is copied to `…-<name>__v1-backup`. Matching topic ticks move to the new syllabus; MCQ, SQL Lab and Java practice history stay as they are; anything without a home (old recruitment topics, interview answers) goes to `state.legacy`. Both can be downloaded from **Sources & data**. Nothing reads or writes any other plan's key.
- **SQL Lab** runs SQLite 3.39 (sql.js from cdnjs). Oracle-only syntax (PL/SQL, ROWNUM, MINUS) won't run there, and the page says so.

## Local use

Just double-click `index.html`. It works offline and saves normally, but note that a `file://` page has its own storage separate from the deployed site — so use one or the other as your real ledger, and move between them with export/import.

## Editing the content

All the material lives in the `DATA` array in the first `<script>` block. Each track is:

```js
{
  id: "dsa", name: "DSA", tag: "revise + extend",
  blurb: "…",
  sections: [
    { n: "Section title", note: "optional coaching note", items: [
      { t: "Item title", d: "Description", k: [ LC("two-sum"), Y("search terms", "label") ], f: "focus" }
    ]}
  ]
}
```

- `LC(slug)` → LeetCode problem link, `Y(query, label)` → YouTube search link, `W(label, url)` → plain link.
- `f: "focus"` marks a weak spot, `f: "build"` marks something to actually build.

**Careful:** completion is stored by position — `trackId.sectionIndex.itemIndex`. Adding an item to the *end* of a section is safe. Inserting or reordering items shifts everything after it, so previously ticked items will appear against different rows. If you need to reorder, export a backup first.
