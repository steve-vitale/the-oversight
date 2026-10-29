// test-pickcensus-a.js — EXPANDED WAVE-4 HUNT PICK CENSUS (sim-pickcensus-a).
// READ-ONLY DIAGNOSTIC. PURE READS over existing corpora. No game code,
// no sims, no RNG, no writes except --out JSON. Usage:
//   node scripts/test-pickcensus-a.js [--out <path>] [--sense]
//   EVID_FUNNEL=evidence/2026-10-29/perseed-funnel-a
//   EVID_LOTBASE=evidence/2026-10-29/perseed-lottery-base
//   EVID_LOTARM=evidence/2026-10-29/perseed-lottery-arm
// Prereg: evidence/2026-10-29/sim-pickcensus-a-prereg.md (binding).
// Taxonomy priority (per pick, first rule that fires) — copied from
// scripts/test-pickdepart-a.js, logic verbatim:
//   1 departed-pick-linked, 2 died-before-departure, 3 superseded-by-needs-pick,
//   4 candidate-null-after-pick, 5 superseded-by-re-pick, 6 gate-blocked,
//   7 horizon, 8 unknown.
// Pooled (binding): funnel-a (16 base-code seeds) + lottery-arm (8 lever-code
// seeds). Lottery-base is NEVER pooled: it is asserted byte-identical to
// same-seed funnel-a rows (dedup check) and used only for the pickdepart
// re-proof (base 2: needs 1, departed 1; arm 2: re-pick 1, candidate-null 1).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function waveMap() {
  const mons = load(path.join(ROOT, 'src/data/monsters.json'));
  const m = {};
  for (const d of mons) if (d && d.id) m[d.id] = d.wave | 0;
  return m;
}
function rows(dir) {
  return fs.readdirSync(dir).filter(f => /^s\d+-fresh\.json$/.test(f)).sort()
    .map(f => load(path.join(dir, f)));
}
function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

function classifyPick(row, pick) {
  const vid = pick.vid, mid = pick.chosen.huntMid;
  const picks = (row.funnel.picks || []).filter(p => p.vid === vid).sort((a, b) => a.part - b.part);
  const deps = (row.returns.departures || []).filter(d => d.vid === vid).sort((a, b) => a.part - b.part);
  const later = picks.filter(p => p.part > pick.part);
  const firstLater = later[0] || null;
  const linked = deps.filter(d => d.objective && d.objective.kind === 'HUNT'
    && d.objective.huntMid === mid && d.part >= pick.part
    && !picks.some(p => p.part > pick.part && p.part < d.part));
  if (linked.length) {
    const dep = linked[0];
    return { cls: 'departed-pick-linked', reason: 'dep d' + dep.day + ' part ' + dep.part +
      ' (lag ' + (dep.day - pick.day) + 'd, ' + (dep.part - pick.part) + ' parts), no intervening pick', dep };
  }
  const deaths = (row.deathsList || []).filter(d => d.who === vid && d.day >= pick.day)
    .sort((a, b) => a.day - b.day);
  if (!firstLater && deaths.length) {
    const sameDay = deaths[0].day === pick.day ? ' SAME-DAY (day granularity caveat)' : '';
    return { cls: 'died-before-departure', reason: 'death d' + deaths[0].day + ' cause ' + deaths[0].cause + ', no later pick' + sameDay, dep: null };
  }
  if (firstLater) {
    const ck = firstLater.chosen ? firstLater.chosen.kind : null;
    if (ck === 'EAT' || ck === 'WATER') {
      return { cls: 'superseded-by-needs-pick', reason: 'first later pick d' + firstLater.day + ' part ' + firstLater.part + ' chose ' + ck + ' (lag ' + (firstLater.day - pick.day) + 'd)', dep: null, firstLater };
    }
    const cand = firstLater.candidate;
    const candNull = !cand || cand.mid !== mid;
    if (candNull) {
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
    return { cls: 'superseded-by-re-pick', reason: 'first later pick d' + firstLater.day + ' part ' + firstLater.part + ' chose ' + ck + ' while candidate still ' + mid, dep: null, firstLater };
  }
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

// E1 eviction flag (diagnostic only, never changes a class): a funnel.notes
// record for the same vid whose evicted list contains the hunt mid, with
// note.part strictly between pick.part and the first later recorded pick's
// part (or after pick.part when there is no later pick).
function evictionFlag(row, pick, firstLaterPart) {
  const mid = pick.chosen.huntMid;
  const notes = (row.funnel.notes || []).filter(n => n.vid === pick.vid);
  for (const n of notes) {
    if (!(n.part > pick.part)) continue;
    if (firstLaterPart != null && !(n.part < firstLaterPart)) continue;
    const ev = (n.evicted || []).filter(e => e && e[0] === mid);
    if (ev.length) return { noteDay: n.day, notePart: n.part, evicted: ev };
  }
  return null;
}

function analyze(dir, waves, wantWave) {
  const out = { dir, picks: [], counts: {}, unknown: [] };
  for (const row of rows(dir)) {
    const rowPicks = (row.funnel.picks || []);
    for (const p of rowPicks) {
      const ch = p.chosen || {};
      if (ch.kind !== 'HUNT' || !ch.huntMid) continue;
      const w = waves[ch.huntMid];
      if (w === undefined) { out.picks.push({ seed: row.seed, pick: p, cls: 'unknown', reason: 'huntMid ' + ch.huntMid + ' absent from monsters.json (unknown-wave)', wave: null }); continue; }
      if (wantWave != null && w !== wantWave) continue;
      const c = classifyPick(row, p);
      const sameVidPicks = rowPicks.filter(q => q.vid === p.vid).sort((a, b) => a.part - b.part);
      const firstLater = sameVidPicks.filter(q => q.part > p.part)[0] || null;
      const evFlag = evictionFlag(row, p, firstLater ? firstLater.part : null);
      out.picks.push({ seed: row.seed, day: p.day, part: p.part, vid: p.vid, mid: ch.huntMid, huntDay: ch.huntDay, wave: w, cls: c.cls, reason: c.reason,
        dep: c.dep ? { day: c.dep.day, part: c.dep.part } : null,
        firstLater: firstLater ? { day: firstLater.day, part: firstLater.part, chosen: firstLater.chosen.kind, candidate: firstLater.candidate } : null,
        closedGates: c.closedGates || null, evictionInGap: evFlag });
    }
  }
  for (const p of out.picks) out.counts[p.cls] = (out.counts[p.cls] || 0) + 1;
  out.unknown = out.picks.filter(p => p.cls === 'unknown');
  return out;
}

function shares(counts, total) {
  const s = {};
  for (const k of Object.keys(counts).sort()) s[k] = total ? counts[k] + '/' + total + ' = ' + (counts[k] / total).toFixed(3) : counts[k];
  return s;
}
function maxClass(counts) {
  let best = null, bestN = -1;
  for (const k of Object.keys(counts)) if (counts[k] > bestN) { best = k; bestN = counts[k]; }
  return { cls: best, n: bestN };
}
function guards(dir) {
  const rs = rows(dir);
  const days = rs.map(r => r.days).sort((a, b) => a - b);
  return { seeds: rs.length, medianDays: days[Math.floor(days.length / 2)],
    starvationDeaths: rs.reduce((s, r) => s + (r.starvationDeaths || 0), 0),
    deathTotal: rs.reduce((s, r) => s + (r.deathTotal || 0), 0),
    wave4Reach: rs.filter(r => (r.waveReach || 0) >= 4).length + '/' + rs.length,
    wins: rs.filter(r => r.won).length, nationalEver: rs.filter(r => r.nationalEver).length };
}
function fmtPickLine(p) {
  const ch = p.chosen || {};
  const cand = p.candidate ? p.candidate.mid + '@(' + p.candidate.tx + ',' + p.candidate.ty + ')/day' + p.candidate.day : 'null';
  return 'PICK d' + p.day + ' part=' + p.part + ' ' + p.vid + ' chosen=' + ch.kind + (ch.huntMid ? '/' + ch.huntMid : '') + ' candidate=' + cand + ' pre=' + JSON.stringify(p.preSightings || []) + ' gates=' + JSON.stringify(p.gates || {});
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const sense = args.includes('--sense');
  const funnelDir = process.env.EVID_FUNNEL || 'evidence/2026-10-29/perseed-funnel-a';
  const lotBaseDir = process.env.EVID_LOTBASE || 'evidence/2026-10-29/perseed-lottery-base';
  const lotArmDir = process.env.EVID_LOTARM || 'evidence/2026-10-29/perseed-lottery-arm';
  const waves = waveMap();

  // DEDUP: every lottery-base row byte-identical to same-seed funnel-a row.
  const dedup = [];
  let dedupPass = true;
  for (const f of fs.readdirSync(lotBaseDir).filter(x => /^s\d+-fresh\.json$/.test(x)).sort()) {
    const a = fs.readFileSync(path.join(lotBaseDir, f));
    const bPath = path.join(funnelDir, f);
    let same = false;
    try { same = fs.existsSync(bPath) && crypto.createHash('sha256').update(a).digest('hex') === crypto.createHash('sha256').update(fs.readFileSync(bPath)).digest('hex'); } catch (e) { same = false; }
    dedup.push({ file: f, byteIdenticalToFunnelA: same });
    if (!same) dedupPass = false;
  }

  // RE-PROOF: pickdepart's 4-pick classification re-derived exactly.
  const reproofBase = analyze(lotBaseDir, waves, 4);
  const reproofArm = analyze(lotArmDir, waves, 4);
  const reproofExpect = { base: { 'superseded-by-needs-pick': 1, 'departed-pick-linked': 1 }, arm: { 'superseded-by-re-pick': 1, 'candidate-null-after-pick': 1 } };
  const reproofPass = JSON.stringify(reproofBase.counts) === JSON.stringify(reproofExpect.base)
    && JSON.stringify(reproofArm.counts) === JSON.stringify(reproofExpect.arm)
    && reproofBase.picks.length === 2 && reproofArm.picks.length === 2;

  // CENSUS: pooled = funnel-a + lottery-arm (lottery-base NEVER pooled).
  const funnel = analyze(funnelDir, waves, 4);
  const arm = analyze(lotArmDir, waves, 4);
  const pooledCounts = {};
  for (const a of [funnel, arm]) for (const k of Object.keys(a.counts)) pooledCounts[k] = (pooledCounts[k] || 0) + a.counts[k];
  const pooledTotal = funnel.picks.length + arm.picks.length;
  const pooledUnknown = funnel.unknown.length + arm.unknown.length;
  const pooledMax = maxClass(pooledCounts);
  const pooledMaxShare = pooledTotal ? pooledMax.n / pooledTotal : 0;
  const tied = (() => {
    const vals = Object.values(pooledCounts);
    return vals.length > 1 && vals.every(v => v === vals[0]);
  })();
  const replaced = (pooledCounts['superseded-by-needs-pick'] || 0) + (pooledCounts['superseded-by-re-pick'] || 0) + (pooledCounts['candidate-null-after-pick'] || 0);
  const departed = pooledCounts['departed-pick-linked'] || 0;
  const evFlagged = funnel.picks.concat(arm.picks).filter(p => p.evictionInGap);

  const funnelAll = analyze(funnelDir, waves, null);
  const armAll = analyze(lotArmDir, waves, null);
  const allCounts = {};
  for (const a of [funnelAll, armAll]) for (const k of Object.keys(a.counts)) allCounts[k] = (allCounts[k] || 0) + a.counts[k];

  const result = {
    prereg: 'evidence/2026-10-29/sim-pickcensus-a-prereg.md',
    dedup: { pass: dedupPass, rows: dedup, note: 'lottery-base excluded from pooled count (duplicate band)' },
    reproofPickdepart: { pass: reproofPass, base: reproofBase.counts, arm: reproofArm.counts, expected: reproofExpect },
    primary: {
      funnelA: { counts: funnel.counts, shares: shares(funnel.counts, funnel.picks.length), total: funnel.picks.length, unknown: funnel.unknown.length, picks: funnel.picks },
      lotteryArm: { counts: arm.counts, shares: shares(arm.counts, arm.picks.length), total: arm.picks.length, unknown: arm.unknown.length, picks: arm.picks },
      pooled: { counts: pooledCounts, shares: shares(pooledCounts, pooledTotal), total: pooledTotal, unknown: pooledUnknown, maxClass: pooledMax, maxShare: pooledMaxShare, tied, replacedBeforeDeparture: replaced, replacedShare: pooledTotal ? replaced / pooledTotal : 0, departed, departedShare: pooledTotal ? departed / pooledTotal : 0 },
      legs: {
        completeness: { pass: pooledUnknown <= 1, unknown: pooledUnknown },
        dominance: { pass: pooledTotal >= 10 && pooledMaxShare >= 0.50, n: pooledTotal, maxShare: pooledMaxShare, bar: 'n>=10 AND max class share>=0.50' },
      },
      verdict: (pooledUnknown <= 1 && pooledTotal >= 10 && pooledMaxShare >= 0.50) ? 'DIAG-GO' : 'DIAG-NO-GO',
    },
    secondaryAllWave: { funnelA: { counts: funnelAll.counts, total: funnelAll.picks.length }, lotteryArm: { counts: armAll.counts, total: armAll.picks.length }, pooled: { counts: allCounts, total: funnelAll.picks.length + armAll.picks.length } },
    evictionFlags: { count: evFlagged.length, picks: evFlagged.map(p => ({ seed: p.seed, day: p.day, part: p.part, vid: p.vid, mid: p.mid, cls: p.cls, evictionInGap: p.evictionInGap })) },
    guards: { funnelA: guards(funnelDir), lotteryArm: guards(lotArmDir) },
  };

  console.log('PICKCENSUS DEDUP lottery-base vs funnel-a: ' + (dedupPass ? 'PASS (all byte-identical, excluded from pooled)' : 'FAIL (see rows)'));
  for (const d of dedup) console.log('  ' + d.file + ' identical=' + d.byteIdenticalToFunnelA);
  console.log('REPROOF pickdepart: base ' + JSON.stringify(reproofBase.counts) + ' arm ' + JSON.stringify(reproofArm.counts) + ' -> ' + (reproofPass ? 'PASS (exact)' : 'FAIL'));
  console.log('PRIMARY wave-4 HUNT picks');
  console.log('  funnel-a: ' + funnel.picks.length + ' ' + JSON.stringify(funnel.counts));
  console.log('  lottery-arm: ' + arm.picks.length + ' ' + JSON.stringify(arm.counts));
  console.log('  pooled: ' + pooledTotal + ' ' + JSON.stringify(pooledCounts));
  console.log('  pooled shares: ' + JSON.stringify(result.primary.pooled.shares));
  console.log('  max class: ' + pooledMax.cls + ' ' + pooledMax.n + '/' + pooledTotal + ' = ' + pooledMaxShare.toFixed(3) + ' (bar >=0.50, n>=10)');
  console.log('  tied 1/1/1/1-style: ' + tied);
  console.log('  replaced-before-departure family: ' + replaced + '/' + pooledTotal + ' = ' + (pooledTotal ? (replaced / pooledTotal).toFixed(3) : 'n/a'));
  console.log('  departed share: ' + departed + '/' + pooledTotal);
  console.log('  unknown pooled: ' + pooledUnknown + ' (bar <=1)');
  console.log('  VERDICT: ' + result.primary.verdict);
  for (const p of funnel.picks.concat(arm.picks)) {
    console.log('  - [' + (funnel.picks.includes(p) ? 'funnel' : 'arm') + '] seed ' + p.seed + ' d' + p.day + ' part ' + p.part + ' ' + p.vid + '/' + p.mid + ' huntDay=' + p.huntDay + ' -> ' + p.cls + ' :: ' + p.reason + (p.evictionInGap ? ' [E1 eviction-in-gap d' + p.evictionInGap.noteDay + ' part ' + p.evictionInGap.notePart + ']' : ''));
  }
  console.log('SECONDARY all-wave HUNT picks (funnel-recorded only)');
  console.log('  funnel-a: ' + funnelAll.picks.length + ' ' + JSON.stringify(funnelAll.counts));
  console.log('  lottery-arm: ' + armAll.picks.length + ' ' + JSON.stringify(armAll.counts));
  console.log('  pooled: ' + (funnelAll.picks.length + armAll.picks.length) + ' ' + JSON.stringify(allCounts));
  console.log('E1 eviction-in-gap picks: ' + evFlagged.length);
  console.log('GUARDS ' + JSON.stringify(result.guards));
  if (sense) {
    console.log('--- SENSE: funnel-a-only band pick (seed 75109-75116 if present, else first funnel pick) ---');
    const extra = funnel.picks.filter(p => p.seed >= 75109)[0] || funnel.picks[0];
    if (extra) {
      const row = rows(funnelDir).find(r => r.seed === extra.seed);
      const vp = (row.funnel.picks || []).filter(p => p.vid === extra.vid).sort((a, b) => a.part - b.part);
      const idx = vp.findIndex(p => p.part === extra.part);
      for (const p of vp.slice(Math.max(0, idx - 2), idx + 4)) console.log('  ' + fmtPickLine(p));
      for (const d of (row.returns.departures || []).filter(d => d.vid === extra.vid && d.part >= extra.part - 10 && d.part <= extra.part + 30).sort((a, b) => a.part - b.part)) {
        const o = d.objective || {};
        console.log('  DEP d' + d.day + ' part=' + d.part + ' ' + o.kind + (o.huntMid ? '/' + o.huntMid : '') + ' -> (' + o.tx + ',' + o.ty + ')');
      }
      console.log('  classified: ' + extra.cls + ' :: ' + extra.reason);
    } else console.log('  (no funnel-a wave-4 HUNT picks to trace)');
    console.log('--- SENSE: nikos arm s75104 (carried from pickdepart, re-derived) ---');
    const rowA = rows(lotArmDir).find(r => r.seed === 75104);
    for (const p of (rowA.funnel.picks || []).filter(p => p.vid === 'nikos_papadopoulos' && p.day >= 171 && p.day <= 180).sort((a, b) => a.part - b.part)) console.log('  ' + fmtPickLine(p));
    for (const d of (rowA.returns.departures || []).filter(d => d.vid === 'nikos_papadopoulos' && d.day >= 174 && d.day <= 178).sort((a, b) => a.part - b.part)) {
      const o = d.objective || {};
      console.log('  DEP d' + d.day + ' part=' + d.part + ' ' + o.kind + (o.huntMid ? '/' + o.huntMid : '') + ' -> (' + o.tx + ',' + o.ty + ')');
    }
  }
  if (outIdx >= 0 && args[outIdx + 1]) {
    fs.writeFileSync(args[outIdx + 1], JSON.stringify(result, null, 2) + '\n');
    console.log('wrote ' + args[outIdx + 1]);
  }
  if (!dedupPass) { console.log('DEDUP FAIL — pooled exclusion still holds (subset band never pooled), but the difference is reported'); }
  if (!reproofPass) { console.log('REPROOF FAIL — classification logic diverges from pickdepart; do not trust pooled classes'); process.exitCode = 2; }
}
main();
