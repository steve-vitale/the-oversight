#!/usr/bin/env node
// test-day99demand-b.js — proof for sim-day99demand-b.
// Judges a screen corpus by the prereg's hit definition:
//   HIT seed = surviving seed (daysAlive == 100, lastSnapDay == 100)
//     with a treeline DEMAND line dated 99 AND a raidRecord TAKE dated 100.
//   PARTIAL seed = demand dated 99 without a take dated 100 (reported, not GO).
// Demand lines are raidSayLines containing 'Shouts from the treeline';
// take lines contain "didn't wait". Takes are raidRecords (raid-unanswered).
// lastSnapDay is derived from the last spoilDays entry's day (the
// analyzer's definition), falling back to a lastSnapDay field if present.
//
// Behaviour (by design, stated in the prereg):
//   * Default mode (--corpus DIR): exit 0 iff at least one HIT seed,
//     exit 1 otherwise. So it FAILS on a corpus without a day-99 demand
//     and PASSES on one with it — the failure IS the NO-GO signal,
//     not an instrument failure.
//   * --selftest: builds synthetic positive + negative corpora under
//     /tmp and asserts PASS-on-positive / FAIL-on-negative, plus a
//     negative control on the raidday100 screen corpus (must FAIL:
//     0 day-99 demands in 10100-10139). Exits 0 iff all selftest
//     assertions hold.
//   * Hygiene: fails loudly on any modified tracked file under src/
//     or any modified tracked file outside this run's own files
//     (scripts/*day99demand* and evidence/2026-10-27/sim-day99demand-b*).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function lastSnapDayOf(doc) {
  if (typeof doc.lastSnapDay === 'number') return doc.lastSnapDay;
  const sd = doc.spoilDays;
  if (Array.isArray(sd) && sd.length) return sd[sd.length - 1].day;
  return null;
}
function analyzeFile(file) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const say = Array.isArray(doc.raidSayLines) ? doc.raidSayLines : [];
  const demandDays = say.filter(l => /Shouts from the treeline/.test(l.line || '')).map(l => l.day);
  const takeDays = (Array.isArray(doc.raidRecords) ? doc.raidRecords : []).map(r => r.day);
  const lsd = lastSnapDayOf(doc);
  const hit = doc.daysAlive === 100 && lsd === 100 && demandDays.includes(99) && takeDays.includes(100);
  const partial = demandDays.includes(99) && !takeDays.includes(100);
  return { seed: doc.seed, daysAlive: doc.daysAlive, lastSnapDay: lsd,
    endReason: doc.endReason, demandDays, takeDays, hit, partial,
    waveReach: doc.waveReach || [], national: !!doc.national, table: !!doc.table, win: !!doc.win,
    deaths: doc.deaths || 0, deathCauses: doc.deathCauses || {},
    policy: doc.policy, raiddorOn: doc.raiddorOn };
}
function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const seeds = files.map(f => analyzeFile(path.join(dir, f)));
  return { files, seeds, hits: seeds.filter(s => s.hit), partials: seeds.filter(s => s.partial) };
}
function checkHygiene() {
  const failures = [];
  try {
    const out = execSync('git status --porcelain', { encoding: 'utf8', cwd: path.join(__dirname, '..') });
    for (const line of out.split('\n')) {
      if (!line.trim()) continue;
      const file = line.slice(3).trim();
      const modified = line[0] === 'M' || line[1] === 'M';
      if (!modified) continue;
      if (file.startsWith('src/')) failures.push('modified src file: ' + file);
      else if (!(file.startsWith('scripts/') && file.includes('day99demand')) &&
               !(file.startsWith('evidence/2026-10-27/sim-day99demand-b'))) {
        failures.push('modified tracked file outside this run: ' + file);
      }
    }
  } catch (e) { failures.push('hygiene check could not run: ' + e.message); }
  return failures;
}
function runCorpus(dir, label) {
  if (!fs.existsSync(dir)) { console.log(`[${label}] corpus dir missing: ${dir}`); return { ok: false, hits: [] }; }
  const { files, seeds, hits, partials } = analyzeDir(dir);
  const badPolicy = seeds.filter(s => s.policy !== 'competent-nofeast');
  const badRaiddor = seeds.filter(s => s.raiddorOn !== true);
  console.log(`[${label}] files=${files.length} seeds=${seeds.length} hits=${hits.length} partials=${partials.length}`);
  for (const h of hits) console.log(`  HIT seed=${h.seed} demandDays=[${h.demandDays}] takeDays=[${h.takeDays}] daysAlive=${h.daysAlive} lastSnapDay=${h.lastSnapDay}`);
  for (const p of partials) console.log(`  PARTIAL seed=${p.seed} demandDays=[${p.demandDays}] takeDays=[${p.takeDays}] daysAlive=${p.daysAlive} lastSnapDay=${p.lastSnapDay} end=${p.endReason}`);
  if (badPolicy.length) console.log(`  POLICY FAILURES: ${badPolicy.map(s => s.seed)}`);
  if (badRaiddor.length) console.log(`  RAIDDOOR-OFF FILES: ${badRaiddor.map(s => s.seed)}`);
  const ok = hits.length >= 1 && badPolicy.length === 0 && badRaiddor.length === 0;
  return { ok, hits, partials, seeds };
}
function writeSynthetic(dir, demandDay, takeDay) {
  fs.mkdirSync(dir, { recursive: true });
  const doc = { seed: 99999, policy: 'competent-nofeast', raiddorOn: true, daysAlive: 100,
    endReason: 'survived', spoilDays: [{ day: 99 }, { day: 100 }],
    raidSayLines: [
      { day: demandDay, line: '🌙 Night. Shouts from the treeline — X of Y with 4 others, and they\'re not here to talk.' },
      { day: takeDay, line: '🌙 You weren\'t at the treeline. X of Y didn\'t wait — they hit the stores and melted back into the dark with 1,000 kcal.' },
    ],
    raidRecords: [{ day: takeDay, caller: 'villageAgencyDaily', path: 'raid-unanswered', asked: 800, totalKcal: 1000 }],
    waveReach: [1, 2, 3], national: false, table: false, win: false, deaths: 0, deathCauses: {} };
  fs.writeFileSync(path.join(dir, 'synth-s99999.json'), JSON.stringify(doc));
}
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) {
    const base = fs.mkdtempSync(path.join('/tmp', 'day99demand-selftest-'));
    const pos = path.join(base, 'pos'), neg = path.join(base, 'neg');
    writeSynthetic(pos, 99, 100);
    writeSynthetic(neg, 98, 99);
    const rPos = runCorpus(pos, 'selftest-positive');
    const rNeg = runCorpus(neg, 'selftest-negative');
    const raidday100 = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-raidday100-b-screen-corpus');
    const rCtl = runCorpus(raidday100, 'control-raidday100-10100-10139');
    const hyg = checkHygiene();
    console.log('hygiene failures: ' + (hyg.length ? hyg.join('; ') : 'none'));
    const pass = rPos.ok === true && rNeg.ok === false && rCtl.ok === false && hyg.length === 0;
    console.log(pass ? 'SELFTEST PASS: PASS-on-positive, FAIL-on-negative, FAIL-on-control, hygiene clean'
                     : 'SELFTEST FAIL');
    process.exit(pass ? 0 : 1);
  }
  const ci = args.indexOf('--corpus');
  const dir = ci >= 0 ? args[ci + 1] : path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-day99demand-b-screen-corpus');
  const r = runCorpus(dir, 'day99demand-screen');
  const hyg = checkHygiene();
  console.log('hygiene failures: ' + (hyg.length ? hyg.join('; ') : 'none'));
  if (r.ok && hyg.length === 0) { console.log('PROOF PASS: day-99 demand + day-100 take seed found'); process.exit(0); }
  console.log('PROOF FAIL: no HIT seed in corpus (or hygiene failure) — this failure is the NO-GO signal when the screen finds nothing');
  process.exit(1);
}
main();
