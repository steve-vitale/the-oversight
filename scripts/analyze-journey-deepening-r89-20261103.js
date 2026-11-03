// analyze-journey-deepening-r89-20261103.js -- R89 MEAT-CHAIN + M5 analyzer
// (tooling only, zero game code). Reads per-seed JSONs and transcript files
// written by scripts/journey-deepening-r89-20261103.js and reports the
// pre-registered MEAT-DINNER verdict, the MEAT-STAGE diagnostic table, and
// descriptive M5. Transcript sense is judged by a human reading the files;
// the scan here only flags verbatim repeats (>=3 same NPC line in one
// sitting) as a senselessness proxy.
//
// Usage: node scripts/analyze-journey-deepening-r89-20261103.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports meatVerdict and scanTranscript.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-03');

function meatVerdict(s) {
  const m = (s && s.meat) || {};
  const kills = (m.kills || []).length;
  const tests = (m.tests || []).length;
  const reveals = (m.reveals || []).length;
  const dinners = (m.dinners || []).length;
  // HAUL: distinct meat items ever seen in any census container.
  let haulItems = 0;
  try {
    const seen = new Set();
    for (const c of (m.censuses || [])) {
      for (const cont of ['inv', 'pantry', 'counter']) {
        for (const it of (c[cont] || [])) seen.add(c.day + '|' + cont + '|' + it.plantId + '|' + it.foodState);
      }
    }
    haulItems = seen.size;
  } catch (e) { haulItems = -1; }
  const lastCensus = (m.censuses || [])[(m.censuses || []).length - 1] || null;
  return { kills, haulItems, tests, reveals, dinners,
    dinner: dinners >= 1, lastCensus,
    wrapErrors: (m.wrapErrors || []).length };
}

function scanTranscript(text) {
  const lines = String(text || '').split('\n');
  const themLines = [];
  for (const l of lines) {
    const m = /^THEM: (.*)$/.exec(l);
    if (m) themLines.push(m[1]);
  }
  const counts = {};
  for (const l of themLines) counts[l] = (counts[l] || 0) + 1;
  let maxRepeat = 0, maxLine = null;
  for (const [l, n] of Object.entries(counts)) {
    if (n > maxRepeat) { maxRepeat = n; maxLine = l; }
  }
  return { themLines: themLines.length, maxRepeat, maxLine, loop: maxRepeat >= 3 };
}

if (require.main === module) {
  const dir = process.argv[2] || process.env.R89_EVIDIR || DEFAULT_EVIDIR;
  let tfiles = [], sfiles = [];
  try {
    tfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r89-transcript-\d+-day\d+\.txt$/.test(f)).sort();
    sfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r89-seed\d+\.json$/.test(f)).sort();
  } catch (e) { console.log('EVIDIR read failed: ' + e.message); process.exit(1); }
  if (!sfiles.length) { console.log('No r89 seed JSONs in ' + dir); process.exit(1); }
  console.log('=== R89 MEAT-CHAIN PANEL ===');
  let dinnerSeeds = 0, villagesAlive = 0, mislabels = 0;
  for (const f of sfiles) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const v = meatVerdict(s);
      if (v.dinner) dinnerSeeds++;
      const alive = (s.census || []).filter(c => c.alive).length;
      if (alive > 0) villagesAlive++;
      mislabels += ((s.deathHonesty || {}).mislabels || []).length;
      const lc = v.lastCensus;
      const lcStr = lc ? `lastCensus d${lc.day} inv=${lc.inv.length} pantry=${lc.pantry.length} counter=${lc.counter.length} safe=${(lc.foodSafe || []).join(',') || '-'}` : 'no-census';
      console.log(`${f}: end=${s.endReason || null} maxDay=${s.maxGameDay || null} alive=${alive}/${(s.census || []).length} KILL=${v.kills} HAUL=${v.haulItems} TEST=${v.tests} REVEAL=${v.reveals} DINNER=${v.dinners} wrapErr=${v.wrapErrors} mislabels=${((s.deathHonesty || {}).mislabels || []).length}`);
      console.log(`   ${lcStr}`);
      if ((v.dinners || 0) > 0) {
        const m = s.meat || {};
        console.log('   dinners: ' + JSON.stringify((m.dinners || []).slice(0, 5)));
      }
      if ((v.tests || 0) > 0) {
        const m = s.meat || {};
        console.log('   tests: ' + JSON.stringify((m.tests || []).slice(0, 5)));
      }
    } catch (e) { console.log(`${f}: JSON read failed: ${e.message}`); }
  }
  let loopFiles = [];
  for (const f of tfiles) {
    const sc = scanTranscript(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (sc.loop) loopFiles.push({ file: f, maxRepeat: sc.maxRepeat, line: (sc.maxLine || '').slice(0, 120) });
    console.log(`${f}: them=${sc.themLines} maxRepeat=${sc.maxRepeat}`);
  }
  console.log('--- verdicts ---');
  console.log(`MEAT-DINNER: ${dinnerSeeds >= 1 ? 'GO' : 'NO-GO'} (dinnerSeeds=${dinnerSeeds}/${sfiles.length})`);
  console.log(`M4 transcripts=${tfiles.length} loopFiles=${loopFiles.length}`);
  if (loopFiles.length) console.log('LOOP FILES: ' + JSON.stringify(loopFiles));
  console.log(`M5 winnable (descriptive): villagesAlive=${villagesAlive}/${sfiles.length} mislabels=${mislabels}`);
}
module.exports = { meatVerdict, scanTranscript };
