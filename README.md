# Prime Readiness Ledger

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
