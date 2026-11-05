// R107 COMMIT-OFFER (journey-landing r107, 2026-11-05) — read-only transcript
// analysis. For each ask_favor sitting in a landing panel's saved transcripts:
// was dlg:commit ever offered in a menu? was it picked? what was the final
// resolution? If 'stated' after a commit pick, capture the refusal line spoken
// right after the pick (away guard / open-commitment / unsupported).
// Method proven on the r106 corpus pre-panel (27 ask_favor sittings: offered
// 20, promised 18, offered-but-stated 2 — both the R72 away-guard line —
// never-offered 7, want never engaged). Usage:
//   node scripts/analyze-landing-r107-commit-offer.js <panel-OUTDIR>
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-landing-r107-commit-offer.js <panel-OUTDIR>'); process.exit(1); }
const files = fs.readdirSync(dir)
  .filter(f => /^journey-landing-r62-transcript-\d+-day\d+\.txt$/.test(f)).sort();
let sittings = 0, offered = 0, picked = 0, promised = 0, statedAfterPick = 0, neverOffered = 0;
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
  if (!menuOffered) neverOffered++;
  rows.push({ seed: seed[1], day: seed[2], offered: menuOffered, picked: pickedCommit,
    resolution: res, refusal });
}
console.log(`R107 COMMIT-OFFER: sittings=${sittings} offered=${offered} picked=${picked} promised=${promised} statedAfterPick=${statedAfterPick} neverOffered=${neverOffered}`);
for (const r of rows) {
  console.log(`  ${r.seed} d${r.day} offered=${r.offered} picked=${r.picked} resolution=${r.resolution}` +
    (r.refusal ? ` refusal="${r.refusal}"` : ''));
}
