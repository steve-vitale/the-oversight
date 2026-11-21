// test-costbar-b.js — proof test for the v2 scalemetric cost bar.
// Proves (prereg §6, sim-costbar-b-prereg.md):
//   T1 taxonomy: +64 expedition MONSTER KILLS move no cost term (synthetic).
//   T2 confirm quantities match an independent recount (separate code path).
//   T3 detection: the analyzer DETECTS the confirm band's real road-death
//       cost (attrRoad delta >= +5, flips = 3, earlierDays = 73).
//   T4 neutral bands PASS: A/A self-comparison; leanlinkcap5-pilot C1/C2.
//   T5 known-costly bands FAIL C1: leanlink-pilot, cap5-confirm; rescue passes.
//   T6 analyzer agrees with the independent recount on all calibration bands.
// Run: node scripts/test-costbar-b.js  (no game load; corpus analysis only)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const { judge } = require('./scalemetric-costbar-v2.js');

let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}
function approx(a, b, eps) { return Math.abs(a - b) <= eps; }

// ---------- independent recount (separate code path from the analyzer) ----------
const HOME = new Set(['starvation', 'thirst', 'dehydration', 'disease', 'sickness',
  'wound_fever', "a wound that wouldn't close", 'contest', 'the arena']);
const median = xs => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
function loadDir(globPattern) {
  const files = execSync(`ls -1 ${globPattern}`, { encoding: 'utf8', cwd: ROOT })
    .split('\n').filter(Boolean).map(f => path.join(ROOT, f));
  return files.sort().map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
}
function recount(files) {
  const rows = files.map(j => {
    const deaths = j.deaths || [];
    const days = j.gameDays || j.days;
    const people = deaths.filter(d => d.kind === 'villager' || d.kind === 'person');
    const starv = people.filter(d => d.cause === 'starvation');
    const launches = Array.isArray(j.v4departs)
      ? j.v4departs.filter(d => d.result === 'launch').map(d => ({
        day: d.day | 0,
        vids: new Set([d.vid, d.companion, d.companion2, ...(d.party || [])]),
      })) : null;
    let attrRoad = 0;
    if (launches) {
      for (const d of people) {
        if (HOME.has(d.cause)) continue;
        if (launches.some(ev => ev.vids.has(d.who) && ev.day <= (d.day | 0) && (d.day | 0) <= ev.day + 7)) attrRoad++;
      }
    }
    return {
      seed: j.seed, days, lost: j.endReason === 'village-lost',
      people: people.length, rate: people.length / days * 100,
      expKills: deaths.filter(d => d.cause === 'expedition').length,
      starv: starv.length, starvDays: starv.map(d => d.day | 0),
      attrRoad, launches: launches ? launches.length : null,
      national: j.scaleRank === 'national' || j.scaleRank === 'global' ? 1 : 0,
      table: j.table ? 1 : 0, won: j.won ? 1 : 0,
      wave4: (j.maxWave || 0) >= 4 ? 1 : 0, wave5: (j.maxWave || 0) >= 5 ? 1 : 0,
    };
  });
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  return {
    n: rows.length, rows,
    medianDays: median(rows.map(r => r.days)),
    lost: rows.filter(r => r.lost).length,
    people: sum('people'),
    rate: rows.reduce((a, r) => a + r.rate, 0) / rows.length,
    expKills: sum('expKills'),
    starv: sum('starv'),
    attrRoad: sum('attrRoad'),
    launches: rows.every(r => r.launches !== null) ? sum('launches') : null,
    national: sum('national'), table: sum('table'), won: sum('won'),
    wave4: sum('wave4'), wave5: sum('wave5'),
  };
}
function armOnly(rowsA, rowsB) {
  // A-arm-only starvation: A starv deaths minus the same-seed same-day
  // MULTISET intersection with B (analyze-scale-costbar.js definition:
  // iterate B's starvDays LIST, so a day with 2 A-deaths and 1 B-death
  // leaves 1 arm-only death, not 0).
  const bySeedB = new Map(rowsB.map(r => [r.seed, r.starvDays]));
  let matched = 0;
  for (const r of rowsA) {
    const counts = {};
    for (const d of r.starvDays) counts[d] = (counts[d] || 0) + 1;
    for (const d of (bySeedB.get(r.seed) || [])) if (counts[d]) { matched += 1; counts[d] -= 1; }
  }
  return rowsA.reduce((a, r) => a + r.starv, 0) - matched;
}
function flipsOf(offRows, onRows) {
  const offBy = new Map(offRows.map(r => [r.seed, r]));
  const flips = onRows.filter(r => !offBy.get(r.seed).lost && r.lost).length;
  const rev = onRows.filter(r => offBy.get(r.seed).lost && !r.lost).length;
  const earlier = onRows.reduce((a, r) => {
    const o = offBy.get(r.seed);
    return (o.lost && r.lost) ? a + Math.max(0, o.days - r.days) : a;
  }, 0);
  return { flips, rev, earlier };
}

const CONFIRM_OFF = 'evidence/2026-11-21/perseed-profilegate4-confirm-b-off/*.json';
const CONFIRM_ON = 'evidence/2026-11-21/perseed-profilegate4-confirm-b-on/*.json';
const SCALE = {
  'leanlink-pilot': ['evidence/2026-10-24/perseed-leanlink/s7350[1-8]-control.json', 'evidence/2026-10-24/perseed-leanlink/s7350[1-8]-armed.json'],
  'leanlinkrescue-pilot': ['evidence/2026-10-24/perseed-leanlinkrescue/s7350[1-8]-control.json', 'evidence/2026-10-24/perseed-leanlinkrescue/s7350[1-8]-armed.json'],
  'leanlinkcap5-pilot': ['evidence/2026-10-24/perseed-leanlinkcap5/s7350[1-8]-control.json', 'evidence/2026-10-24/perseed-leanlinkcap5/s7350[1-8]-armed.json'],
  'leanlinkcap5-confirm': ['evidence/2026-10-24/perseed-leanlinkcap5/s73509-control.json evidence/2026-10-24/perseed-leanlinkcap5/s7351[0-6]-control.json', 'evidence/2026-10-24/perseed-leanlinkcap5/s73509-armed.json evidence/2026-10-24/perseed-leanlinkcap5/s7351[0-6]-armed.json'],
};
function loadBandPatterns(patterns) {
  // patterns: [offPattern(s), onPattern(s)] — each may hold several globs separated by space.
  const expand = p => p.split(/\s+/).flatMap(g =>
    execSync(`ls -1 ${g}`, { encoding: 'utf8', cwd: ROOT }).split('\n').filter(Boolean)
      .map(f => path.join(ROOT, f))).sort();
  return [expand(patterns[0]), expand(patterns[1])];
}

// ---------- T1: taxonomy — +64 expedition monster kills move no cost term ----------
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'costbar-t1-'));
  const offDir = path.join(tmp, 'off'); const onDir = path.join(tmp, 'on');
  fs.mkdirSync(offDir); fs.mkdirSync(onDir);
  const seeds = [900001, 900002, 900003, 900004];
  const base = seed => ({
    seed, gameDays: 150, days: 150, endReason: 'survived',
    scaleRank: 'regional', standing: 199, maxWave: 4, won: false, table: false,
    v4departs: [{ day: 50, vid: 'holder_a', result: 'launch', companion: 'mate_b', companion2: null, party: ['mate_b'] }],
    deaths: [
      { day: 10, kind: 'villager', who: 'holder_a', cause: 'monster', player: false },
      { day: 52, kind: 'villager', who: 'mate_b', cause: 'the wild', player: false },
      { day: 60, kind: 'monster', who: 'belltoad', cause: 'villager combat', player: false },
    ],
  });
  for (const s of seeds) {
    fs.writeFileSync(path.join(offDir, `s${s}.json`), JSON.stringify(base(s)));
    const on = base(s);
    // +16 expedition monster kills per seed (+64 band-wide), nothing else changed.
    for (let i = 0; i < 16; i++) on.deaths.push({ day: 55 + i, kind: 'monster', who: 'sweeps_week', cause: 'expedition', player: false });
    fs.writeFileSync(path.join(onDir, `s${s}.json`), JSON.stringify(on));
  }
  const offFiles = fs.readdirSync(offDir).map(f => path.join(offDir, f)).sort();
  const onFiles = fs.readdirSync(onDir).map(f => path.join(onDir, f)).sort();
  const out = judge(offFiles, onFiles);
  check('T1 expKills delta is +64', out.on.expKills - out.off.expKills === 64, `${out.off.expKills} -> ${out.on.expKills}`);
  check('T1 C1 passes despite +64 expKills', out.bars.C1_peopleDeathRate === true, `rate ${out.off.peopleRate.toFixed(2)} -> ${out.on.peopleRate.toFixed(2)}`);
  check('T1 C2 passes despite +64 expKills', out.bars.C2_earlyLoss === true, `flips ${out.flips} earlier ${out.earlierDays}`);
  check('T1 C3 passes despite +64 expKills', out.bars.C3_launchAttrRoadDeaths === true, `attrRoad ${out.off.attrRoad} -> ${out.on.attrRoad}`);
  check('T1 synthetic verdict COST PASS', out.verdict === 'COST PASS', out.verdict);
  check('T1 synthetic attrRoad counts the launched mate', out.off.attrRoad === 4 && out.on.attrRoad === 4, `off ${out.off.attrRoad} on ${out.on.attrRoad}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ---------- T2: confirm quantities match the independent recount ----------
{
  const offFiles = loadDir(CONFIRM_OFF);
  const onFiles = loadDir(CONFIRM_ON);
  const ro = recount(offFiles); const rn = recount(onFiles);
  const anaOff = path.join(ROOT, 'evidence/2026-11-21/perseed-profilegate4-confirm-b-off');
  void anaOff;
  // Analyzer output via judge() on the same files.
  const offPaths = execSync(`ls -1 ${CONFIRM_OFF}`, { encoding: 'utf8', cwd: ROOT }).split('\n').filter(Boolean).map(f => path.join(ROOT, f)).sort();
  const onPaths = execSync(`ls -1 ${CONFIRM_ON}`, { encoding: 'utf8', cwd: ROOT }).split('\n').filter(Boolean).map(f => path.join(ROOT, f)).sort();
  const out = judge(offPaths, onPaths);
  const fl = flipsOf(ro.rows, rn.rows);
  check('T2 confirm peopleDeaths 205/201', ro.people === 205 && rn.people === 201, `${ro.people}/${rn.people}`);
  check('T2 confirm expKills 285/349', ro.expKills === 285 && rn.expKills === 349, `${ro.expKills}/${rn.expKills}`);
  check('T2 confirm starvation 10/11', ro.starv === 10 && rn.starv === 11, `${ro.starv}/${rn.starv}`);
  check('T2 confirm starvArmOnly 2/3', armOnly(ro.rows, rn.rows) === 2 && armOnly(rn.rows, ro.rows) === 3,
    `${armOnly(ro.rows, rn.rows)}/${armOnly(rn.rows, ro.rows)}`);
  check('T2 confirm median 150.5/151', ro.medianDays === 150.5 && rn.medianDays === 151, `${ro.medianDays}/${rn.medianDays}`);
  check('T2 confirm lost 5/6', ro.lost === 5 && rn.lost === 6, `${ro.lost}/${rn.lost}`);
  check('T2 confirm peopleRate 9.24/9.95', approx(ro.rate, 9.24227, 0.01) && approx(rn.rate, 9.95237, 0.01), `${ro.rate.toFixed(4)}/${rn.rate.toFixed(4)}`);
  check('T2 confirm attrRoad 27/38', ro.attrRoad === 27 && rn.attrRoad === 38, `${ro.attrRoad}/${rn.attrRoad}`);
  check('T2 confirm launches 227/281', ro.launches === 227 && rn.launches === 281, `${ro.launches}/${rn.launches}`);
  check('T2 confirm flips 3 rev 2 earlier 73', fl.flips === 3 && fl.rev === 2 && fl.earlier === 73, `${fl.flips}/${fl.rev}/${fl.earlier}`);
  check('T2 confirm wall: national 0 table 0 won 0 wave4 16 wave5 6/5',
    ro.national === 0 && rn.national === 0 && ro.table === 0 && rn.table === 0 &&
    ro.won === 0 && rn.won === 0 && ro.wave4 === 16 && rn.wave4 === 16 &&
    ro.wave5 === 6 && rn.wave5 === 5, `wave5 ${ro.wave5}/${rn.wave5}`);
  // Analyzer agrees with the recount on every quantity.
  check('T2 analyzer rates agree', approx(out.off.peopleRate, ro.rate, 1e-9) && approx(out.on.peopleRate, rn.rate, 1e-9));
  check('T2 analyzer counts agree',
    out.off.peopleDeaths === ro.people && out.on.peopleDeaths === rn.people &&
    out.off.expKills === ro.expKills && out.on.expKills === rn.expKills &&
    out.off.starv === ro.starv && out.on.starv === rn.starv &&
    out.off.starvArmOnly === 2 && out.on.starvArmOnly === 3 &&
    out.off.attrRoad === ro.attrRoad && out.on.attrRoad === rn.attrRoad &&
    out.flips === 3 && out.revFlips === 2 && out.earlierDays === 73);
}

// ---------- T3: detection — the analyzer DETECTS the confirm road-death cost ----------
{
  const offPaths = execSync(`ls -1 ${CONFIRM_OFF}`, { encoding: 'utf8', cwd: ROOT }).split('\n').filter(Boolean).map(f => path.join(ROOT, f)).sort();
  const onPaths = execSync(`ls -1 ${CONFIRM_ON}`, { encoding: 'utf8', cwd: ROOT }).split('\n').filter(Boolean).map(f => path.join(ROOT, f)).sort();
  const out = judge(offPaths, onPaths);
  check('T3 attrRoad delta >= +5 (detected)', out.attrDelta >= 5, `delta ${out.attrDelta}`);
  check('T3 flips = 3 (detected)', out.flips === 3, `${out.flips}`);
  check('T3 earlierDays = 73 (detected)', out.earlierDays === 73, `${out.earlierDays}`);
  check('T3 per-launch lethality rises (detected)', out.perLaunchRatio > 1.0, `${out.perLaunchRatio.toFixed(3)}`);
  check('T3 expKills rise reported as benefit, not cost', out.on.expKills - out.off.expKills === 64 && out.bars.C4_expKills_diagnosticOnly === null);
}

// ---------- T4: neutral bands PASS ----------
{
  const offPaths = execSync(`ls -1 ${CONFIRM_OFF}`, { encoding: 'utf8', cwd: ROOT }).split('\n').filter(Boolean).map(f => path.join(ROOT, f)).sort();
  const aa = judge(offPaths, offPaths);
  check('T4 A/A verdict COST PASS', aa.verdict === 'COST PASS', aa.verdict);
  check('T4 A/A all deltas zero', aa.attrDelta === 0 && aa.flips === 0 && aa.earlierDays === 0 && aa.rateDelta === 0, `attr ${aa.attrDelta} flips ${aa.flips} earlier ${aa.earlierDays} rateDelta ${aa.rateDelta}`);
  const [cap5pOff, cap5pOn] = loadBandPatterns(SCALE['leanlinkcap5-pilot']);
  const cap5p = judge(cap5pOff, cap5pOn);
  check('T4 cap5-pilot C1 passes', cap5p.bars.C1_peopleDeathRate === true, `ratio ${cap5p.rateRatio.toFixed(3)} delta ${cap5p.rateDelta.toFixed(2)}`);
  check('T4 cap5-pilot C2 passes', cap5p.bars.C2_earlyLoss === true, `flips ${cap5p.flips} earlier ${cap5p.earlierDays}`);
  check('T4 cap5-pilot C3 not_observed', cap5p.bars.C3_launchAttrRoadDeaths === null, `${cap5p.bars.C3_launchAttrRoadDeaths}`);
  check('T4 cap5-pilot verdict COST PASS', cap5p.verdict === 'COST PASS', cap5p.verdict);
}

// ---------- T5: known-costly bands FAIL C1; known-good rescue PASSES ----------
{
  const [llOff, llOn] = loadBandPatterns(SCALE['leanlink-pilot']);
  const ll = judge(llOff, llOn);
  check('T5 leanlink-pilot FAILs C1', ll.bars.C1_peopleDeathRate === false, `ratio ${ll.rateRatio.toFixed(3)} delta ${ll.rateDelta.toFixed(2)}`);
  check('T5 leanlink-pilot verdict COST FAIL', ll.verdict === 'COST FAIL', ll.verdict);
  const [ccOff, ccOn] = loadBandPatterns(SCALE['leanlinkcap5-confirm']);
  const cc = judge(ccOff, ccOn);
  check('T5 cap5-confirm FAILs C1', cc.bars.C1_peopleDeathRate === false, `ratio ${cc.rateRatio.toFixed(3)} delta ${cc.rateDelta.toFixed(2)}`);
  check('T5 cap5-confirm verdict COST FAIL', cc.verdict === 'COST FAIL', cc.verdict);
  const [resOff, resOn] = loadBandPatterns(SCALE['leanlinkrescue-pilot']);
  const res = judge(resOff, resOn);
  check('T5 rescue PASSES C1 (AND connective)', res.bars.C1_peopleDeathRate === true, `ratio ${res.rateRatio.toFixed(3)} delta ${res.rateDelta.toFixed(2)}`);
}

// ---------- T6: analyzer agrees with the independent recount on calibration bands ----------
for (const [id, pats] of Object.entries(SCALE)) {
  const [offPaths, onPaths] = loadBandPatterns(pats);
  const out = judge(offPaths, onPaths);
  const offFiles = offPaths.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  const onFiles = onPaths.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  const rOff = recount(offFiles); const rOn = recount(onFiles);
  const fl = flipsOf(rOff.rows, rOn.rows);
  check(`T6 ${id} rates agree`, approx(out.off.peopleRate, rOff.rate, 1e-9) && approx(out.on.peopleRate, rOn.rate, 1e-9),
    `${out.off.peopleRate.toFixed(4)}/${out.on.peopleRate.toFixed(4)}`);
  check(`T6 ${id} flips/earlier agree`, out.flips === fl.flips && out.revFlips === fl.rev && out.earlierDays === fl.earlier,
    `${out.flips}/${out.revFlips}/${out.earlierDays}`);
  check(`T6 ${id} expKills agree`, out.off.expKills === rOff.expKills && out.on.expKills === rOn.expKills,
    `${out.off.expKills}/${out.on.expKills}`);
}

console.log(failures === 0 ? 'TEST-OK' : `TEST-FAIL (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);
