#!/usr/bin/env node
// scripts/test-departlag-a.js — sim-departlag-a lag census analyzer.
// PURE READS over the departlag corpus (+ the funnel-a corpus for
// the neutrality leg). No game code, no policy, no RNG. Implements
// the prereg join rule exactly: for each wave-4 HUNT pick, the
// earliest of (matching departure, next recorded pick, villager
// death) decides the class; a departure on the death day itself
// (day-granular death, part order unresolvable) is UNKNOWN.
// Usage:
//   node scripts/test-departlag-a.js [--evid <dir>] [--ref <dir>]
//     [--out <json>] [--sense]
// Exit 0 only when all DIAG-GO legs pass; the JSON is written
// regardless, so a failed leg still leaves its numbers readable.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108, 75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];
const WAVE4 = new Set();
const WAVEMAP = {};
try {
  const mons = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(mons) ? mons : (mons.monsters || []);
  for (const m of list) { WAVEMAP[m.id] = (m.wave | 0); if ((m.wave | 0) === 4) WAVE4.add(m.id); }
} catch (e) { /* wave lookup failure surfaces as unknownWave below */ }

// Wave of a monster id: a number when the id exists in
// monsters.json (any wave), null ONLY when the id is absent.
// (An earlier draft returned null for every non-wave-4 id, which
// wrongly pushed wave-1/2/3 picks into unknownWave and collapsed
// the secondary census onto the primary one.)
function waveOf(mid) { return Object.prototype.hasOwnProperty.call(WAVEMAP, mid) ? WAVEMAP[mid] : null; }

// Classify ONE pick against one seed row's channels. Pure function,
// shared with the fixtures script via module.exports.
function classifyPick(pick, row) {
  const ch = (pick && pick.chosen) || {};
  const vid = pick.vid, mid = ch.huntMid, huntDay = ch.huntDay;
  const picks = (row.funnel && row.funnel.picks) || [];
  const deps = (row.returns && row.returns.departures) || [];
  const drops = (row.returns && row.returns.drops) || [];
  const deaths = row.deathsList || [];
  const nextPick = picks.filter(p => p.vid === vid && (p.part | 0) > (pick.part | 0))
    .sort((a, b) => (a.part | 0) - (b.part | 0))[0] || null;
  const depCands = deps.filter(d => d.vid === vid && d.objective && d.objective.kind === 'HUNT'
    && d.objective.huntMid === mid && d.objective.huntDay === huntDay && (d.part | 0) >= (pick.part | 0))
    .sort((a, b) => (a.part | 0) - (b.part | 0));
  const dep = depCands[0] || null;
  const depBeforeNext = dep && (!nextPick || (dep.part | 0) < (nextPick.part | 0));
  const death = deaths.filter(d => d.who === vid && (d.day | 0) >= (pick.day | 0))
    .sort((a, b) => (a.day | 0) - (b.day | 0))[0] || null;
  const base = { seed: row.seed, vid, mid, huntDay, pickDay: pick.day, pickPart: pick.part,
    ageAtPick: (pick.day | 0) - (huntDay | 0) };
  const subDeath = death ? ` later died d${death.day} cause=${death.cause}` : '';
  if (depBeforeNext) {
    if (death && (death.day | 0) <= (dep.day | 0)) {
      return Object.assign({}, base, { cls: 'UNKNOWN',
        sub: `departure d${dep.day} on/after death day d${death.day} (day-granular death, part order unresolvable)`,
        depDay: dep.day, depPart: dep.part });
    }
    const drop = drops.filter(d => d.vid === vid && d.mid === mid && (d.part | 0) >= (dep.part | 0) && d.dropped === true)
      .sort((a, b) => (a.part | 0) - (b.part | 0))[0] || null;
    return Object.assign({}, base, { cls: 'DEPARTED', depDay: dep.day, depPart: dep.part,
      lagDays: (dep.day | 0) - (pick.day | 0), lagParts: (dep.part | 0) - (pick.part | 0),
      ageAtDeparture: (dep.day | 0) - (huntDay | 0),
      staleAtDeparture: ((dep.day | 0) - (huntDay | 0)) > 3,
      dropped: !!drop, dropDay: drop ? drop.day : null, dropPart: drop ? drop.part : null,
      sub: `departed d${dep.day} part=${dep.part} lag=${(dep.day | 0) - (pick.day | 0)}d/${(dep.part | 0) - (pick.part | 0)}p age ${((dep.day | 0) - (huntDay | 0))} (pick age ${base.ageAtPick})${drop ? ` true drop d${drop.day}` : ' no true drop'}` });
  }
  if (nextPick && (!dep || (nextPick.part | 0) < (dep.part | 0))) {
    const nk = (nextPick.chosen && nextPick.chosen.kind) || '?';
    const subKind = nk === 'HUNT' && nextPick.chosen.huntMid === mid ? 'RE-PICK'
      : nk === 'HUNT' ? 'OTHER-HUNT'
      : (nk === 'EAT' || nk === 'WATER') ? 'NEEDS' : 'OTHER';
    return Object.assign({}, base, { cls: 'SUPERSEDED', subKind, nextKind: nk,
      nextDay: nextPick.day, nextPart: nextPick.part,
      lagDays: (nextPick.day | 0) - (pick.day | 0), lagParts: (nextPick.part | 0) - (pick.part | 0),
      sub: `superseded d${nextPick.day} by ${nk} (${subKind}) lag=${(nextPick.day | 0) - (pick.day | 0)}d/${(nextPick.part | 0) - (pick.part | 0)}p${subDeath}` });
  }
  if (death) {
    return Object.assign({}, base, { cls: 'DIED-HOLDING', deathDay: death.day, deathCause: death.cause,
      sameDayAmbiguous: (death.day | 0) === (pick.day | 0),
      sub: `died d${death.day} cause=${death.cause}${(death.day | 0) === (pick.day | 0) ? ' (SAME-DAY-AMBIGUOUS)' : ''}` });
  }
  return Object.assign({}, base, { cls: 'HELD-TO-HORIZON', holdDays: (row.days | 0) - (pick.day | 0),
    sub: `held to horizon (row days=${row.days}, hold=${(row.days | 0) - (pick.day | 0)}d, horizon-capped)` });
}

function summarize(classified) {
  const by = {};
  for (const c of classified) by[c.cls] = (by[c.cls] || 0) + 1;
  const dep = classified.filter(c => c.cls === 'DEPARTED');
  const sup = classified.filter(c => c.cls === 'SUPERSEDED');
  const sorted = a => a.slice().sort((x, y) => x - y);
  const quartiles = (arr) => {
    if (!arr.length) return { n: 0, values: [], median: null, q1: null, q3: null };
    const s = sorted(arr);
    const q = p => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
    return { n: s.length, values: s, median: q(0.5), q1: q(0.25), q3: q(0.75) };
  };
  const lagDays = dep.map(c => c.lagDays), lagParts = dep.map(c => c.lagParts);
  const agesDep = dep.map(c => c.ageAtDeparture), agesPick = dep.map(c => c.ageAtPick);
  const stale = dep.filter(c => c.staleAtDeparture).length;
  const buckets = { '0d': 0, '1d': 0, '2+d': 0 };
  const bucketDrops = { '0d': { n: 0, dropped: 0 }, '1d': { n: 0, dropped: 0 }, '2+d': { n: 0, dropped: 0 } };
  for (const c of dep) {
    const b = c.lagDays === 0 ? '0d' : c.lagDays === 1 ? '1d' : '2+d';
    buckets[b]++; bucketDrops[b].n++; if (c.dropped) bucketDrops[b].dropped++;
  }
  const supByKind = {};
  for (const c of sup) supByKind[c.subKind] = (supByKind[c.subKind] || 0) + 1;
  return { n: classified.length, by,
    departed: { lagDays: quartiles(lagDays), lagParts: quartiles(lagParts),
      sameDayShare: dep.length ? dep.filter(c => c.lagDays === 0).length / dep.length : null,
      twoPlusShare: dep.length ? dep.filter(c => c.lagDays >= 2).length / dep.length : null,
      ageAtPick: quartiles(agesPick), ageAtDeparture: quartiles(agesDep),
      staleShare: dep.length ? stale / dep.length : null, staleCount: stale,
      droppedCount: dep.filter(c => c.dropped).length,
      lagBuckets: buckets, bucketDrops },
    superseded: { bySubKind: supByKind,
      lagDays: quartiles(sup.map(c => c.lagDays)), lagParts: quartiles(sup.map(c => c.lagParts)) },
    diedHolding: classified.filter(c => c.cls === 'DIED-HOLDING').length,
    heldToHorizon: classified.filter(c => c.cls === 'HELD-TO-HORIZON').length,
    unknown: classified.filter(c => c.cls === 'UNKNOWN').length };
}

function main() {
  const args = process.argv.slice(2);
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-departlag-a');
  const refDir = get('--ref') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');
  const outPath = get('--out');
  const senseMode = args.indexOf('--sense') >= 0;
  const rows = [], refRows = {}, problems = [];
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(fn)) { problems.push(`missing row s${seed}`); continue; }
    rows.push(JSON.parse(fs.readFileSync(fn, 'utf8')));
    const rf = path.join(refDir, `s${seed}-fresh.json`);
    if (fs.existsSync(rf)) refRows[seed] = JSON.parse(fs.readFileSync(rf, 'utf8'));
  }
  // Neutrality: deep-equal channels per seed + wall fields.
  const neuDiffs = [];
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (const r of rows) {
    const ref = refRows[r.seed];
    if (!ref) { neuDiffs.push(`s${r.seed}: no ref row`); continue; }
    for (const [sec, key] of [['fieldparty', 'meetings'], ['returns', 'meetings'], ['returns', 'departures'], ['returns', 'drops'], ['funnel', 'picks'], ['funnel', 'notes']]) {
      if (!eq((r[sec] || {})[key], (ref[sec] || {})[key])) neuDiffs.push(`s${r.seed}: ${sec}.${key} differs`);
    }
    for (const f of ['won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'days', 'deathTotal', 'starvationDeaths']) {
      if (r[f] !== ref[f]) neuDiffs.push(`s${r.seed}: field ${f} ${r[f]} vs ref ${ref[f]}`);
    }
    for (const sec of ['fieldparty', 'returns', 'funnel']) {
      const d1 = (r[sec] || {}).diag || {}, d2 = (ref[sec] || {}).diag || {};
      if (d1.errs !== d2.errs) neuDiffs.push(`s${r.seed}: ${sec} errs ${d1.errs} vs ${d2.errs}`);
    }
  }
  const judgedA = [];
  for (const r of rows) for (const m of ((r.fieldparty || {}).meetings || [])) {
    if ((m.wave | 0) === 4 && m.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar)) judgedA.push(m);
  }
  const wall = { won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: (() => { const s = rows.map(r => r.days).sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; })(),
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0), starvation: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    judgedA: judgedA.length,
    huntDepartures: rows.reduce((t, r) => t + ((r.returns || {}).departures || []).filter(d => d.objective && d.objective.kind === 'HUNT').length, 0),
    huntTrueDrops: rows.reduce((t, r) => t + ((r.returns || {}).drops || []).filter(d => d.dropped === true).length, 0) };
  const wallExpect = { won: 4, wonFull: 0, nationalEver: 13, nationalFinal: 9, table: 10, entered: 4, wave4: 11, wave5: 0, medianDays: 180, deaths: 600, starvation: 4, judgedA: 42 };
  const wallDiffs = Object.keys(wallExpect).filter(k => wall[k] !== wallExpect[k]).map(k => `${k} ${wall[k]} vs expect ${wallExpect[k]}`);
  // Primary + secondary classification.
  const primary = [], secondary = [], unknownWave = [];
  for (const r of rows) {
    for (const p of ((r.funnel || {}).picks || [])) {
      if (!p.chosen || p.chosen.kind !== 'HUNT' || !p.chosen.huntMid) continue;
      const w = waveOf(p.chosen.huntMid);
      if (w === null) { unknownWave.push(`${r.seed}:${p.vid}:${p.chosen.huntMid}`); continue; }
      const c = classifyPick(p, r);
      secondary.push(c);
      if (w === 4) primary.push(c);
    }
  }
  const primSum = summarize(primary), secSum = summarize(secondary);
  const legs = {
    joinCompleteness: primSum.unknown <= 1,
    neutrality: neuDiffs.length === 0 && wallDiffs.length === 0,
    determinismNote: 'checked separately by the evidence run (seed 75106 scratch re-run, cmp)',
  };
  const go = legs.joinCompleteness && legs.neutrality;
  const out = { rows: rows.length, problems, wall, wallDiffs, neuDiffs, legs,
    primary: primSum, primaryPicks: primary, secondary: secSum, secondaryPicks: secondary,
    unknownWave, wave4Ids: Array.from(WAVE4).sort() };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('=== sim-departlag-a lag census ===');
  console.log(`rows=${rows.length}/16 problems=${problems.length ? problems.join(';') : 'none'}`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} deaths=${wall.deaths} starv=${wall.starvation} judgedA=${wall.judgedA} huntDep=${wall.huntDepartures} huntTrueDrops=${wall.huntTrueDrops}`);
  if (wallDiffs.length) console.log(`WALL-DIFFS: ${wallDiffs.join('; ')}`);
  if (neuDiffs.length) console.log(`NEUTRALITY-DIFFS (${neuDiffs.length}): ${neuDiffs.slice(0, 20).join('; ')}`);
  console.log(`PRIMARY (wave-4 HUNT picks): n=${primSum.n} by=${JSON.stringify(primSum.by)} unknown=${primSum.unknown} unknownWave=${unknownWave.length}`);
  console.log(`  departed lagDays=${JSON.stringify(primSum.departed.lagDays)} lagParts=${JSON.stringify(primSum.departed.lagParts)} sameDayShare=${primSum.departed.sameDayShare} twoPlusShare=${primSum.departed.twoPlusShare}`);
  console.log(`  ageAtPick=${JSON.stringify(primSum.departed.ageAtPick)} ageAtDeparture=${JSON.stringify(primSum.departed.ageAtDeparture)} staleShare=${primSum.departed.staleShare} dropped=${primSum.departed.droppedCount} buckets=${JSON.stringify(primSum.departed.lagBuckets)} bucketDrops=${JSON.stringify(primSum.departed.bucketDrops)}`);
  console.log(`  superseded bySubKind=${JSON.stringify(primSum.superseded.bySubKind)} lagDays=${JSON.stringify(primSum.superseded.lagDays)}`);
  console.log(`SECONDARY (all HUNT picks by w4-memory holders): n=${secSum.n} by=${JSON.stringify(secSum.by)} unknown=${secSum.unknown}`);
  console.log(`  departed lagDays=${JSON.stringify(secSum.departed.lagDays)} sameDayShare=${secSum.departed.sameDayShare} twoPlusShare=${secSum.departed.twoPlusShare} staleShare=${secSum.departed.staleShare} dropped=${secSum.departed.droppedCount} buckets=${JSON.stringify(secSum.departed.lagBuckets)}`);
  console.log(`  superseded bySubKind=${JSON.stringify(secSum.superseded.bySubKind)} lagDays=${JSON.stringify(secSum.superseded.lagDays)}`);
  console.log(`LEGS: joinCompleteness=${legs.joinCompleteness ? 'PASS' : 'FAIL'} neutrality=${legs.neutrality ? 'PASS' : 'FAIL'} (determinism checked separately)`);
  if (senseMode) {
    for (const c of primary) console.log(`  PICK s${c.seed} ${c.vid} ${c.mid} d${c.pickDay} part=${c.pickPart} -> ${c.cls}: ${c.sub}`);
  }
  if (!go) { console.log('DEPARTLAG-LEGS: FAIL (see above; determinism leg is separate)'); process.exit(1); }
  console.log('DEPARTLAG-LEGS: PASS (join + neutrality; determinism separate)');
}
if (require.main === module) main();
module.exports = { classifyPick, summarize, SEEDS };
