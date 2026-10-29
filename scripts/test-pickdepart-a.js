// test-pickdepart-a.js — PICK-TO-DEPARTURE decomposition (sim-pickdepart-a).
// PURE READS over the existing lottery corpora. No game code, no sims,
// no RNG, no writes except --out JSON. Usage:
//   node scripts/test-pickdepart-a.js [--out <path>] [--sense]
//   EVID_BASE=evidence/2026-10-29/perseed-lottery-base
//   EVID_ARM=evidence/2026-10-29/perseed-lottery-arm
// Prereg: evidence/2026-10-29/sim-pickdepart-a-prereg.md (binding).
// Taxonomy priority (per pick, first rule that fires):
//   1 departed-pick-linked, 2 died-before-departure, 3 superseded-by-needs-pick,
//   4 candidate-null-after-pick, 5 superseded-by-re-pick, 6 gate-blocked,
//   7 horizon, 8 unknown.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function waveMap() {
  const mons = load(path.join(ROOT, 'src/data/monsters.json'));
  const m = {};
  for (const d of mons) if (d && d.id) m[d.id] = d.wave | 0;
  return m;
}
function rows(dir) {
  return fs.readdirSync(dir).filter(f => /^s75\d+-fresh\.json$/.test(f)).sort()
    .map(f => load(path.join(dir, f)));
}
// Chebyshev distance, matching objDist's grid metric for adjacent-tile logic.
function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

function classifyPick(row, pick, waves) {
  const vid = pick.vid, mid = pick.chosen.huntMid;
  const picks = (row.funnel.picks || []).filter(p => p.vid === vid).sort((a, b) => a.part - b.part);
  const deps = (row.returns.departures || []).filter(d => d.vid === vid).sort((a, b) => a.part - b.part);
  const later = picks.filter(p => p.part > pick.part);
  const firstLater = later[0] || null;
  // 1. departed-pick-linked: same vid+mid, dep.part >= pick.part, no
  // intervening pick with part strictly between.
  const linked = deps.filter(d => d.objective && d.objective.kind === 'HUNT'
    && d.objective.huntMid === mid && d.part >= pick.part
    && !picks.some(p => p.part > pick.part && p.part < d.part));
  if (linked.length) {
    const dep = linked[0];
    return { cls: 'departed-pick-linked', reason: 'dep d' + dep.day + ' part ' + dep.part +
      ' (lag ' + (dep.day - pick.day) + 'd, ' + (dep.part - pick.part) + ' parts), no intervening pick', dep };
  }
  // 2. died-before-departure: death recorded, no later pick at all.
  const deaths = (row.deathsList || []).filter(d => d.who === vid && d.day >= pick.day)
    .sort((a, b) => a.day - b.day);
  if (!firstLater && deaths.length) {
    const sameDay = deaths[0].day === pick.day ? ' SAME-DAY (day granularity caveat)' : '';
    return { cls: 'died-before-departure', reason: 'death d' + deaths[0].day + ' cause ' + deaths[0].cause + ', no later pick' + sameDay, dep: null };
  }
  if (firstLater) {
    const ck = firstLater.chosen ? firstLater.chosen.kind : null;
    // 3. needs supersession.
    if (ck === 'EAT' || ck === 'WATER') {
      return { cls: 'superseded-by-needs-pick', reason: 'first later pick d' + firstLater.day + ' part ' + firstLater.part + ' chose ' + ck + ' (lag ' + (firstLater.day - pick.day) + 'd)', dep: null, firstLater };
    }
    // 4. candidate-null-after-pick: first later pick's candidate is null or
    // for another mid (hunt no longer offered for this memory).
    const cand = firstLater.candidate;
    const candNull = !cand || cand.mid !== mid;
    if (candNull) {
      // Name the closed gate(s) from the later pick's gates + memory age.
      const mem = (firstLater.preSightings || []).find(s => s[0] === mid) || (pick.preSightings || []).find(s => s[0] === mid);
      const memDay = mem ? mem[3] : null;
      const age = memDay != null ? firstLater.day - memDay : null;
      const fails = [];
      if (age != null && (age < 0 || age > 3)) fails.push('age=' + age + ' (>3, stale)');
      if (firstLater.gates) {
        if (firstLater.gates.postFleeResting) fails.push('postFleeResting');
        if (firstLater.gates.sheltered) fails.push('sheltered');
        if (firstLater.gates.armed === false) fails.push('unarmed');
        if (cand && cand.tx != null && firstLater.hx != null && firstLater.gates.maxD != null) {
          const d = cheb(cand.tx, cand.ty, firstLater.hx, firstLater.hy);
          if (d < 1 || d > firstLater.gates.maxD) fails.push('range d=' + d + ' maxD=' + firstLater.gates.maxD);
        }
      }
      return { cls: 'candidate-null-after-pick', reason: 'first later pick d' + firstLater.day + ' part ' + firstLater.part + ' chose ' + ck + ', candidate ' + (cand ? cand.mid + '@(' + cand.tx + ',' + cand.ty + ')' : 'null') + '; closed gate(s): ' + (fails.length ? fails.join(', ') : 'none readable (candidate null, gates green — see metric review)'), dep: null, firstLater, closedGates: fails };
    }
    // 5. re-pick supersession (candidate still offered, chose something else).
    return { cls: 'superseded-by-re-pick', reason: 'first later pick d' + firstLater.day + ' part ' + firstLater.part + ' chose ' + ck + ' while candidate still ' + mid, dep: null, firstLater };
  }
  // No later pick, no departure, no death-before: gate-blocked vs horizon.
  const g = pick.gates || {};
  const blocking = [];
  if (g.postFleeResting) blocking.push('postFleeResting');
  if (g.sheltered) blocking.push('sheltered');
  if (g.armed === false) blocking.push('unarmed');
  if (pick.chosen && pick.chosen.huntTx != null && pick.hx != null && g.maxD != null) {
    const d = cheb(pick.chosen.huntTx, pick.chosen.huntTy, pick.hx, pick.hy);
    if (d < 1 || d > g.maxD) blocking.push('range d=' + d + ' maxD=' + g.maxD);
  }
  if (blocking.length) return { cls: 'gate-blocked', reason: 'no later pick/departure; pick-time gates blocking: ' + blocking.join(', '), dep: null };
  return { cls: 'horizon', reason: 'no later pick, no departure, villager alive at corpus end (row days ' + row.days + '), gates green at pick', dep: null };
}

function analyze(dir, waves, wantWave) {
  const out = { dir, picks: [], counts: {}, unknown: [] };
  for (const row of rows(dir)) {
    for (const p of (row.funnel.picks || [])) {
      const ch = p.chosen || {};
      if (ch.kind !== 'HUNT' || !ch.huntMid) continue;
      const w = waves[ch.huntMid];
      if (w === undefined) { out.picks.push({ seed: row.seed, pick: p, cls: 'unknown', reason: 'huntMid ' + ch.huntMid + ' absent from monsters.json (unknown-wave)', wave: null }); continue; }
      if (wantWave != null && w !== wantWave) continue;
      const c = classifyPick(row, p, waves);
      out.picks.push({ seed: row.seed, day: p.day, part: p.part, vid: p.vid, mid: ch.huntMid, huntDay: ch.huntDay, wave: w, cls: c.cls, reason: c.reason, dep: c.dep || null, firstLater: c.firstLater ? { day: c.firstLater.day, part: c.firstLater.part, chosen: c.firstLater.chosen.kind, candidate: c.firstLater.candidate } : null, closedGates: c.closedGates || null });
    }
  }
  for (const p of out.picks) out.counts[p.cls] = (out.counts[p.cls] || 0) + 1;
  out.unknown = out.picks.filter(p => p.cls === 'unknown');
  return out;
}

function fmtPickLine(row, p) {
  const ch = p.chosen || {};
  const cand = p.candidate ? p.candidate.mid + '@(' + p.candidate.tx + ',' + p.candidate.ty + ')/day' + p.candidate.day : 'null';
  const pre = JSON.stringify(p.preSightings || []);
  return 'PICK d' + p.day + ' part=' + p.part + ' ' + p.vid + ' chosen=' + ch.kind + (ch.huntMid ? '/' + ch.huntMid : '') + ' candidate=' + cand + ' pre=' + pre + ' gates=' + JSON.stringify(p.gates || {});
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const sense = args.includes('--sense');
  const baseDir = process.env.EVID_BASE || 'evidence/2026-10-29/perseed-lottery-base';
  const armDir = process.env.EVID_ARM || 'evidence/2026-10-29/perseed-lottery-arm';
  const waves = waveMap();
  const base = analyze(baseDir, waves, 4);
  const arm = analyze(armDir, waves, 4);
  const baseAll = analyze(baseDir, waves, null);
  const armAll = analyze(armDir, waves, null);
  const pooled = {};
  for (const a of [base, arm]) for (const k of Object.keys(a.counts)) pooled[k] = (pooled[k] || 0) + a.counts[k];
  const total = base.picks.length + arm.picks.length;
  const guards = {};
  for (const [name, dir] of [['base', baseDir], ['arm', armDir]]) {
    const rs = rows(dir);
    const days = rs.map(r => r.days).sort((a, b) => a - b);
    guards[name] = {
      seeds: rs.length, medianDays: days[Math.floor(days.length / 2)],
      starvationDeaths: rs.reduce((s, r) => s + (r.starvationDeaths || 0), 0),
      deathTotal: rs.reduce((s, r) => s + (r.deathTotal || 0), 0),
      wave4Reach: rs.filter(r => (r.waveReach || 0) >= 4).length + '/' + rs.length,
      wins: rs.filter(r => r.won).length, nationalEver: rs.filter(r => r.nationalEver).length,
    };
  }
  const result = { primary: { base, arm, pooled, total }, secondaryAllWave: { base: baseAll, arm: armAll }, guards };
  console.log('PICKDEPART PRIMARY (wave-4 HUNT picks)');
  console.log('  base: ' + base.picks.length + ' picks ' + JSON.stringify(base.counts));
  console.log('  arm:  ' + arm.picks.length + ' picks ' + JSON.stringify(arm.counts));
  console.log('  pooled: ' + total + ' picks ' + JSON.stringify(pooled));
  console.log('  unknown total: ' + (base.unknown.length + arm.unknown.length) + ' (prereg bar: <=1)');
  for (const p of base.picks.concat(arm.picks)) {
    console.log('  - seed ' + p.seed + ' d' + p.day + ' part ' + p.part + ' ' + p.vid + '/' + p.mid + ' huntDay=' + p.huntDay + ' -> ' + p.cls + ' :: ' + p.reason);
  }
  console.log('SECONDARY all-wave HUNT picks (funnel-recorded only: wave-4-memory holders)');
  console.log('  base: ' + baseAll.picks.length + ' ' + JSON.stringify(baseAll.counts));
  console.log('  arm:  ' + armAll.picks.length + ' ' + JSON.stringify(armAll.counts));
  console.log('GUARDS ' + JSON.stringify(guards));
  const unknownTotal = base.unknown.length + arm.unknown.length;
  const replaced = (pooled['superseded-by-needs-pick'] || 0) + (pooled['superseded-by-re-pick'] || 0) + (pooled['candidate-null-after-pick'] || 0);
  console.log('REPLACED-BEFORE-DEPARTURE family: ' + replaced + '/' + total);
  console.log(unknownTotal <= 1 ? 'MACHINE LEGS: unknown bar PASS' : 'MACHINE LEGS: unknown bar FAIL');
  if (sense) {
    console.log('--- SENSE: nikos arm s75104 (verbatim pick/dep lines) ---');
    const row = rows(armDir).find(r => r.seed === 75104);
    const picks = (row.funnel.picks || []).filter(p => p.vid === 'nikos_papadopoulos' && p.day >= 171 && p.day <= 180).sort((a, b) => a.part - b.part);
    for (const p of picks) console.log('  ' + fmtPickLine(row, p));
    for (const d of (row.returns.departures || []).filter(d => d.vid === 'nikos_papadopoulos' && d.day >= 174 && d.day <= 178).sort((a, b) => a.part - b.part)) {
      const o = d.objective || {};
      console.log('  DEP d' + d.day + ' part=' + d.part + ' ' + o.kind + (o.huntMid ? '/' + o.huntMid : '') + ' -> (' + o.tx + ',' + o.ty + ')');
    }
    console.log('--- SENSE: baseline departed case visjoin_115 s75106 ---');
    const rowB = rows(baseDir).find(r => r.seed === 75106);
    for (const p of (rowB.funnel.picks || []).filter(p => p.vid === 'visjoin_115' && p.day >= 133 && p.day <= 138).sort((a, b) => a.part - b.part)) console.log('  ' + fmtPickLine(rowB, p));
    for (const d of (rowB.returns.departures || []).filter(d => d.vid === 'visjoin_115' && d.day >= 135 && d.day <= 137).sort((a, b) => a.part - b.part)) {
      const o = d.objective || {};
      console.log('  DEP d' + d.day + ' part=' + d.part + ' ' + o.kind + (o.huntMid ? '/' + o.huntMid : '') + ' -> (' + o.tx + ',' + o.ty + ')');
    }
  }
  if (outIdx >= 0 && args[outIdx + 1]) {
    fs.writeFileSync(args[outIdx + 1], JSON.stringify(result, null, 2) + '\n');
    console.log('wrote ' + args[outIdx + 1]);
  }
}
main();
