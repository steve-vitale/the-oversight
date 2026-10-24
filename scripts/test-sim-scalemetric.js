// test-sim-scalemetric.js — proof test for the sim-scalemetric MEASUREMENT DIAG.
// Proves: (T1) corpus completeness + anchor; (T2) recomputation matches the three arms'
// published evidence totals; (T3) the pre-registered decision rule evaluates as reported
// (B1 separates, B2/B4/B5 do not, B3 passes everywhere); (T4) decay inventories;
// (T5) the analyzer re-derives its numbers from the corpus files (independent recount
// in this test agrees with `node scripts/analyze-scale-costbar.js --json`).
// Run: node scripts/test-sim-scalemetric.js  (no game load; corpus analysis only)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-24');
const RO = { village: 0, regional: 1, national: 2, global: 3 };
const BANDS = [
  { id: 'leanlink-pilot', dir: 'perseed-leanlink', seeds: [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508] },
  { id: 'leanlinkrescue-pilot', dir: 'perseed-leanlinkrescue', seeds: [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508] },
  { id: 'leanlinkcap5-pilot', dir: 'perseed-leanlinkcap5', seeds: [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508] },
  { id: 'leanlinkcap5-confirm', dir: 'perseed-leanlinkcap5', seeds: [73509, 73510, 73511, 73512, 73513, 73514, 73515, 73516] },
];
const median = xs => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}
function load(band, seed, arm) {
  return JSON.parse(fs.readFileSync(path.join(EVID, band.dir, `s${seed}-${arm}.json`), 'utf8'));
}

// T1: completeness + anchor (probe/sense/logs are NOT top-level s735*.json and are excluded).
for (const b of BANDS) {
  for (const s of b.seeds) for (const a of ['control', 'armed']) {
    const j = load(b, s, a);
    check(`T1 ${b.id} s${s}-${a} anchor`, j.anchor12 === '34101b3cde24', j.anchor12);
  }
  const top = fs.readdirSync(path.join(EVID, b.dir)).filter(f => /^s735\d+-(control|armed)\.json$/.test(f));
  const expect = b.id === 'leanlinkcap5-pilot' || b.id === 'leanlinkcap5-confirm' ? 32 : 16;
  // cap5 dir holds pilot+confirm together; per-band files are 16, dir total is 32.
  check(`T1 ${b.id} file count`, b.dir === 'perseed-leanlinkcap5' ? top.length === 32 : top.length === 16, `${top.length} files`);
}

// Independent recount (separate code path from the analyzer).
function recount(band, arm) {
  const rows = band.seeds.map(s => load(band, s, arm));
  const ever = j => {
    let e = 'village';
    for (const w of (j.trustWeekly || [])) if (RO[w.rank] > RO[e]) e = w.rank;
    return e;
  };
  return {
    median: median(rows.map(j => j.gameDays)),
    lost: rows.filter(j => j.endReason === 'village-lost').length,
    deaths: rows.reduce((a, j) => a + j.deathTotals.total, 0),
    scholar: rows.reduce((a, j) => a + j.deathTotals.scholar, 0),
    starv: rows.reduce((a, j) => a + ((j.deathTotals.byCause || {}).starvation || 0), 0),
    villCombat: rows.reduce((a, j) => a + j.deathTotals.villagerCombat, 0),
    natEnd: rows.filter(j => RO[j.scaleRank] >= 2).length,
    natEver: rows.filter(j => RO[ever(j)] >= 2).length,
    decays: rows.filter(j => RO[ever(j)] > RO[j.scaleRank]).map(j => j.seed),
    dpd: rows.reduce((a, j) => a + j.deathTotals.total, 0) / rows.reduce((a, j) => a + j.gameDays, 0),
  };
}

// T2: published totals from sim-leanlink.md, sim-leanlink-rescue.md, sim-leanlink-cap5.md.
const PUBLISHED = {
  'leanlink-pilot': { control: { median: 180.5, deaths: 302, scholar: 65, starv: 3, natEnd: 0 }, armed: { median: 139, deaths: 274, scholar: 65, starv: 4, natEnd: 3 } },
  'leanlinkrescue-pilot': { control: { median: 180.5, deaths: 302, scholar: 65, starv: 3, natEnd: 0 }, armed: { median: 173.5, deaths: 313, scholar: 63, starv: 3, natEnd: 2 } },
  'leanlinkcap5-pilot': { control: { median: 180.5, deaths: 302, scholar: 65, starv: 3, natEnd: 0 }, armed: { median: 162.5, deaths: 286, scholar: 60, starv: 3, natEnd: 4 } },
  'leanlinkcap5-confirm': { control: { median: 181, deaths: 278, scholar: 51, starv: 1, natEnd: 0 }, armed: { median: 178, deaths: 334, scholar: 63, starv: 3, natEnd: 4 } },
};
for (const b of BANDS) {
  for (const arm of ['control', 'armed']) {
    const r = recount(b, arm);
    const p = PUBLISHED[b.id][arm];
    for (const k of ['median', 'deaths', 'scholar', 'starv', 'natEnd']) {
      check(`T2 ${b.id} ${arm} ${k}`, r[k] === p[k], `recomputed ${r[k]} published ${p[k]}`);
    }
  }
}

// T3: decision rule.
const R = {};
for (const b of BANDS) R[b.id] = { control: recount(b, 'control'), armed: recount(b, 'armed') };
const ratio = id => R[id].armed.median / R[id].control.median;
const B1 = id => ratio(id) >= 0.8;
const B2 = id => R[id].armed.lost <= R[id].control.lost + 1;
const B4 = id => R[id].armed.scholar <= R[id].control.scholar + 5;
const B5 = id => R[id].armed.dpd <= R[id].control.dpd * 1.10;
const sep = fn => !fn('leanlink-pilot') && fn('leanlinkrescue-pilot') && fn('leanlinkcap5-pilot') && fn('leanlinkcap5-confirm');
check('T3 B1 median separates', sep(B1) === true, `ratios leanlink ${ratio('leanlink-pilot').toFixed(3)} rescue ${ratio('leanlinkrescue-pilot').toFixed(3)} cap5p ${ratio('leanlinkcap5-pilot').toFixed(3)} cap5c ${ratio('leanlinkcap5-confirm').toFixed(3)}`);
check('T3 B2 lost-excess does NOT separate', sep(B2) === false, `excess confirm ${R['leanlinkcap5-confirm'].armed.lost - R['leanlinkcap5-confirm'].control.lost}`);
check('T3 B4 scholar does NOT separate', sep(B4) === false, `delta confirm ${R['leanlinkcap5-confirm'].armed.scholar - R['leanlinkcap5-confirm'].control.scholar}`);
check('T3 B5 death-rate does NOT separate', sep(B5) === false, `ratio confirm ${R['leanlinkcap5-confirm'].armed.dpd / R['leanlinkcap5-confirm'].control.dpd}`);
for (const b of BANDS) {
  check(`T3 ${b.id} starvation totals pass`, R[b.id].armed.starv <= R[b.id].control.starv + 2, `${R[b.id].armed.starv} vs ${R[b.id].control.starv}+2`);
}

// T4: decay inventories + ever gaps.
const EXPECT_DECAYS = {
  'leanlink-pilot': [73503, 73505], 'leanlinkrescue-pilot': [73501, 73504, 73505, 73506],
  'leanlinkcap5-pilot': [73507], 'leanlinkcap5-confirm': [73513],
};
const EXPECT_GAP = { 'leanlink-pilot': 2, 'leanlinkrescue-pilot': 4, 'leanlinkcap5-pilot': 1, 'leanlinkcap5-confirm': 1 };
for (const b of BANDS) {
  check(`T4 ${b.id} decays`, JSON.stringify(R[b.id].armed.decays) === JSON.stringify(EXPECT_DECAYS[b.id]), R[b.id].armed.decays.join(','));
  check(`T4 ${b.id} ever-end gap`, R[b.id].armed.natEver - R[b.id].armed.natEnd === EXPECT_GAP[b.id], `${R[b.id].armed.natEver}-${R[b.id].armed.natEnd}`);
  check(`T4 ${b.id} control ever 0`, R[b.id].control.natEver === 0, `${R[b.id].control.natEver}`);
}
// Beat-without-rank: leanlink 73502 (nat+glob beats, sampled ever regional);
// rescue 73501 (glob beat, sampled ever national), 73502 (nat+glob beats, regional).
const beatCheck = (band, seed, arm, field, everWant) => {
  const j = load(band, seed, arm);
  let ever = 'village';
  for (const w of (j.trustWeekly || [])) if (RO[w.rank] > RO[ever]) ever = w.rank;
  return (j.court || {})[field] > 0 && ever === everWant;
};
check('T4 leanlink 73502 nat beat without national sample', beatCheck(BANDS[0], 73502, 'armed', 'courtNational', 'regional'));
check('T4 leanlink 73502 glob beat without global sample', beatCheck(BANDS[0], 73502, 'armed', 'courtGlobal', 'regional'));
check('T4 rescue 73502 nat beat without national sample', beatCheck(BANDS[1], 73502, 'armed', 'courtNational', 'regional'));

// T5: analyzer agrees with this independent recount.
const ana = JSON.parse(execSync(`node ${path.join(__dirname, 'analyze-scale-costbar.js')} --json`, { encoding: 'utf8' }));
for (const b of BANDS) {
  const a = ana.bands[b.id].armed, r = R[b.id].armed;
  check(`T5 analyzer ${b.id} median/deaths/starv`, a.medianDays === r.median && a.deaths === r.deaths && a.starv === r.starv, `${a.medianDays}/${a.deaths}/${a.starv}`);
}
check('T5 analyzer separation B1', ana.separation.B1_median === true);
check('T5 analyzer separation B2/B4/B5 false', ana.separation.B2_lostExcess === false && ana.separation.B4_scholar === false && ana.separation.B5_deathRate === false);

console.log(failures === 0 ? 'TEST-OK' : `TEST-FAIL (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);
