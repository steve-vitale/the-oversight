// NAV-log classifier for landing r113 (Q1 PRIMARY).
// Scans transcript files in a dir and classifies every `THEM: (no line)`
// line by the `YOU:` pick that produced it:
//   - NAV: preceded by a [menu:more] pick (paging a menu says nothing;
//     the game returns navigation:true with no line, and app.js just
//     refreshes the menu — no empty bubble, no dead air).
//   - GENUINE: preceded by any other pick, or by no pick at all (a spoken
//     choice that returned silence — the r53 shape — must stay visible).
// Also counts `NAV:` lines (the r113 driver's navigation log) and menu:more
// picks, so the panel bar can be checked: every page turn logged as NAV,
// none as THEM.
// Usage: node scripts/analyze-landing-r113-navlog.js [DIR]
//   DIR defaults to the r113 OUTDIR.
// Exit 0 always (this is a classifier, not a gate); the run note judges the
// numbers against the pre-registered bar. Prints a one-line verdict:
//   NAVLOG-CLASSIFY: noLine=<n> nav=<n> genuine=<n> navLines=<n> menuMore=<n>
// Prereg bar (binding): proof test scripts/test-landing-r113-navlog.js passes
// BEFORE the pilot; back-compat on the r112 corpus gives nav=86 genuine=0;
// on the r113 panel, noLine==0 AND menuMore>0 AND navLines==menuMore.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-07/landing-r113');

function classifyFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');
  let lastPick = null;
  const out = { noLine: 0, nav: 0, genuine: 0, navLines: 0, menuMore: 0, genuineSamples: [] };
  for (const line of lines) {
    const you = /^YOU: \[([^\]]+)\]/.exec(line);
    if (you) { lastPick = you[1]; if (lastPick === 'menu:more') out.menuMore++; continue; }
    if (/^YOU: \(leave\)/.test(line)) { lastPick = 'leave'; continue; }
    if (/^NAV: /.test(line)) { out.navLines++; continue; }
    if (/^THEM: \(no line\)/.test(line)) {
      out.noLine++;
      if (lastPick === 'menu:more') out.nav++;
      else {
        out.genuine++;
        if (out.genuineSamples.length < 10) out.genuineSamples.push(`pick=${lastPick || 'none'} :: ${line}`);
      }
    }
  }
  return out;
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => /transcript-.*\.txt$/.test(f)).sort();
  const pooled = { files: files.length, noLine: 0, nav: 0, genuine: 0, navLines: 0, menuMore: 0 };
  const perFile = {};
  for (const f of files) {
    const r = classifyFile(path.join(DIR, f));
    perFile[f] = r;
    pooled.noLine += r.noLine; pooled.nav += r.nav; pooled.genuine += r.genuine;
    pooled.navLines += r.navLines; pooled.menuMore += r.menuMore;
  }
  for (const [f, r] of Object.entries(perFile)) {
    if (r.noLine || r.navLines || r.menuMore) {
      console.log(`${f}: noLine=${r.noLine} nav=${r.nav} genuine=${r.genuine} navLines=${r.navLines} menuMore=${r.menuMore}`);
    }
  }
  console.log(`NAVLOG-CLASSIFY: files=${pooled.files} noLine=${pooled.noLine} nav=${pooled.nav} genuine=${pooled.genuine} navLines=${pooled.navLines} menuMore=${pooled.menuMore}`);
  if (pooled.genuine > 0) {
    console.log('GENUINE-EMPTY samples (spoken pick, no line — investigate):');
    for (const f of files) {
      const r = perFile[f];
      for (const s of r.genuineSamples) console.log(`  ${f}: ${s}`);
    }
  }
  return pooled;
}
if (require.main === module) main();
module.exports = { classifyFile };
