// R107 COMMIT-OFFER (journey-landing r107, 2026-11-05) — read-only transcript
// analysis. For each ask_favor sitting in a landing panel's saved transcripts:
// was dlg:commit ever offered in a menu? was it picked? what was the final
// resolution? If 'stated' after a commit pick, capture the refusal line spoken
// right after the pick (away guard / open-commitment / unsupported).
// Method proven on the r106 corpus pre-panel (27 ask_favor sittings: offered
// 20, promised 18, offered-but-stated 2 — both the R72 away-guard line —
// never-offered 7, want never engaged). Usage:
//   node scripts/analyze-landing-r107-commit-offer.js <panel-OUTDIR>
// R122 REVISION (journey-landing r122): settled-favor exclusion — a sitting
// is SETTLED when a THEM line speaks one of the engine's own settled-favor
// lines (moot opener "Never mind … — we got it handled. Thanks anyway.",
// handled pool "It's handled. Really…", "No, really, it's fine. Forget I
// even asked.", "All sorted. Some things just work out.", or "It's already
// handled. Thank you for asking."). Those lines fire only for settled favor
// states (convo-wants.js:716,2013,743-750; convo-dialogue.js:450), so the
// rule reads the engine's own settled state. Settled sittings are reported
// separately (settled=N) and do NOT count as never-offered.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-landing-r107-commit-offer.js <panel-OUTDIR>'); process.exit(1); }
const files = fs.readdirSync(dir)
  .filter(f => /^journey-landing-r62-transcript-\d+-day\d+\.txt$/.test(f)).sort();
let sittings = 0, offered = 0, picked = 0, promised = 0, statedAfterPick = 0, neverOffered = 0, settled = 0;
const rows = [];
for (const f of files) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  const fin = lines.find(l => l.startsWith('want final:'));
  const m = fin && fin.match(/id=(\S+) stage=(\d+) resolution=(\S+)/);
  if (!m || m[1] !== 'ask_favor') continue;
  sittings++;
  const seed = f.match(/transcript-(\d+)-day(\d+)/);
  const menuOffered = lines.some(l => l.startsWith('menu (') && l.includes('[dlg:commit]'));
  const pickIdx = lines.findIndex(l => l.startsWith('YOU: [dlg:commit]'));
  const pickedCommit = pickIdx >= 0;
  // R122 SETTLED-FAVOR EXCLUSION: the engine's own settled-favor lines,
  // spoken by THEM in this sitting. A settled favor has nothing to commit
  // to — offering one would be the lie — so it never counts as never-offered.
  const SETTLED_LINES = [
    'we got it handled. Thanks anyway.',            // moot opener (convo-wants.js:716,2013)
    "It's handled. Really",                        // handled pool (convo-wants.js:747)
    "No, really, it's fine. Forget I even asked.", // handled pool (convo-wants.js:748)
    'All sorted. Some things just work out.',      // handled pool (convo-wants.js:749)
    "It's already handled. Thank you for asking.", // settled favor (convo-dialogue.js:450)
  ];
  const settledFavor = lines.some(l => l.startsWith('THEM: ') && SETTLED_LINES.some(s => l.includes(s)));
  // Refusal line (only meaningful when the pick did NOT promise): the first
  // THEM: line after the commit pick — the handler speaks the refusal
  // immediately on the refused turn. On a promised pick the next THEM line is
  // the commit beat, not a refusal, so it is not captured.
  const res = m[3];
  let refusal = null;
  if (pickedCommit && res !== 'promised') {
    for (let i = pickIdx + 1; i < lines.length; i++) {
      if (lines[i].startsWith('THEM: ')) { refusal = lines[i].slice(6).trim().slice(0, 160); break; }
      if (lines[i].startsWith('menu (')) break;
    }
  }
  if (menuOffered) offered++;
  if (pickedCommit) picked++;
  if (res === 'promised') promised++;
  if (pickedCommit && res === 'stated') statedAfterPick++;
  if (settledFavor) settled++;
  if (!menuOffered && !settledFavor) neverOffered++;
  rows.push({ seed: seed[1], day: seed[2], offered: menuOffered, picked: pickedCommit,
    resolution: res, refusal, settled: settledFavor });
}
console.log(`R107 COMMIT-OFFER: sittings=${sittings} offered=${offered} picked=${picked} promised=${promised} statedAfterPick=${statedAfterPick} neverOffered=${neverOffered} settled=${settled}`);
for (const r of rows) {
  console.log(`  ${r.seed} d${r.day} offered=${r.offered} picked=${r.picked} resolution=${r.resolution}` +
    (r.settled ? ' settled=true' : '') +
    (r.refusal ? ` refusal="${r.refusal}"` : ''));
}
