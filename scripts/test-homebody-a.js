#!/usr/bin/env node
// scripts/test-homebody-a.js — sim-homebody-a HOMEBODY CENSUS analyzer.
// MEASUREMENT ONLY: pure reads of sim corpora, never game state.
// Primary: evidence/2026-10-29/perseed-homebody-a/s<seed>-fresh.json
//   (funnel-a sweep verbatim, EVID override, seeds 75101-75116).
// Reference: evidence/2026-10-29/perseed-funnel-a/ (funnel-a corpus,
//   read-only) for the recorder-neutrality reproduction.
// Triples: REUSED VERBATIM from the funnel analyzer — run
//   EVID=<perseed-homebody-a> node scripts/test-funnel-a.js
//   --out <funnel-json> first; this analyzer consumes that JSON
//   (FUNNEL_JSON env or --funnel-json arg) and never re-derives
//   triples with a second implementation.
// Census (see sim-homebody-a-prereg.md for fixed definitions):
//   (a) maxD distribution over pick-recorded villagers + wave-4
//       memories held by maxD-0 villagers (held-at-pick and
//       formed views, labeled);
//   (b) per-triple range classification (homebodyFreshBlocked /
//       outOfRangeFreshBlocked / otherGateFresh / offeredFresh);
//   (c) offered-pick counts by per-pick range class;
//   (d) counterfactual upper bound: triples with
//       homebodyFreshBlocked true (lottery-eligibility only —
//       NOT a take, departure, or meeting forecast).
// Exit 1 on corpus invalidity, neutrality mismatch, any offered
// pick with maxD == 0 (structural contradiction), triple count
// != 19, funnel OTHER > 1, or any triple without a range verdict.
// Usage: node scripts/test-homebody-a.js [--out <path>]
//   [--funnel-json <path>]
// When required as a module, main() does NOT run; the range
// functions are exported for the fixtures file.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS16 = [];
for (let s = 75101; s <= 75116; s++) SEEDS16.push(s);

function cheb(ax, ay, bx, by) {
  if (ax == null || ay == null || bx == null || by == null) return null;
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}
function rangeClass(maxD) {
  if (maxD == null) return 'unknown';
  if (maxD === 0) return '0';
  if (maxD === 1) return '1';
  if (maxD === 2) return '2';
  return '>=3';
}
function loadWaveMap() {
  const map = {};
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const arr = Array.isArray(raw) ? raw : (raw.monsters || raw.data || []);
    for (const d of (arr || [])) if (d && d.id) map[d.id] = (d.wave | 0) || null;
  } catch (e) { /* best-effort */ }
  return map;
}

// classifyFreshPick(pick, mid) — the prereg's range distinction.
// Returns { hasEntry, fresh, homebodyBlocked, outOfRangeBlocked,
//   otherGate, offered, distances, reasons } where:
//   homebodyBlocked: fresh entry, candidate null, maxD == 0,
//     other gates green (armed true, sheltered false,
//     postFleeResting false).
//   outOfRangeBlocked: fresh entry, candidate null, maxD > 0,
//     other gates green, no fresh entry in 1..maxD.
//   otherGate: fresh entry, candidate null, another gate red
//     (unarmed / sheltered / post-flee) — range is NOT the
//     binding block here, even if maxD == 0.
//   offered: candidate.mid == mid (implies fresh by gate).
function classifyFreshPick(pick, mid) {
  const entries = (pick.preSightings || []).filter(s => s[0] === mid);
  if (!entries.length) return { hasEntry: false, fresh: false, homebodyBlocked: false, outOfRangeBlocked: false, otherGate: false, offered: false, distances: [], reasons: [] };
  const ages = entries.map(s => (pick.day != null && s[3] != null) ? (pick.day - s[3]) : null);
  const freshIdx = entries.map((s, i) => i).filter(i => ages[i] != null && ages[i] >= 0 && ages[i] <= 3);
  if (!freshIdx.length) return { hasEntry: true, fresh: false, homebodyBlocked: false, outOfRangeBlocked: false, otherGate: false, offered: false, distances: [], reasons: [] };
  const g = pick.gates || {};
  const reasons = [];
  if (g.armed === false) reasons.push('UNARMED');
  if (g.sheltered === true) reasons.push('SHELTERED');
  if (g.postFleeResting === true) reasons.push('POST-FLEE');
  const otherGreen = reasons.length === 0;
  const distances = freshIdx.map(i => cheb(entries[i][1], entries[i][2], pick.hx, pick.hy));
  const anyInRange = freshIdx.some((i, k) => distances[k] != null && distances[k] >= 1 && g.maxD != null && distances[k] <= g.maxD);
  if (!anyInRange) reasons.push('OUT-OF-RANGE');
  const candidateNull = !pick.candidate;
  const offered = !!(pick.candidate && pick.candidate.mid === mid);
  const homebodyBlocked = candidateNull && g.maxD === 0 && otherGreen;
  const outOfRangeBlocked = candidateNull && g.maxD != null && g.maxD > 0 && otherGreen && !anyInRange;
  const otherGate = candidateNull && !otherGreen;
  return { hasEntry: true, fresh: true, homebodyBlocked, outOfRangeBlocked, otherGate, offered, distances, reasons };
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-homebody-a');
  const refDir = process.env.REF_EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');
  let funnelJson = process.env.FUNNEL_JSON || path.join(REPO, 'evidence', '2026-10-29', 'homebody-a-funnel.json');
  const fjIdx = args.indexOf('--funnel-json');
  if (fjIdx >= 0 && args[fjIdx + 1]) funnelJson = args[fjIdx + 1];
  const problems = [];
  const rows = [];
  const refRows = [];
  for (const seed of SEEDS16) {
    const p = path.join(evidDir, `s${seed}-fresh.json`);
    const rp = path.join(refDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(p)) { problems.push(`missing s${seed}-fresh.json`); continue; }
    if (!fs.existsSync(rp)) { problems.push(`missing ref s${seed}-fresh.json`); continue; }
    try { rows.push(JSON.parse(fs.readFileSync(p, 'utf8'))); } catch (e) { problems.push(`seed ${seed}: unparsable`); }
    try { refRows.push(JSON.parse(fs.readFileSync(rp, 'utf8'))); } catch (e) { problems.push(`ref seed ${seed}: unparsable`); }
  }
  // Neutrality: per-seed deep equality of the recorded channels
  // + wall fields + death totals.
  const neutralityDiffs = [];
  const wallFields = ['won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths', 'days', 'gameDays', 'endReason'];
  for (let i = 0; i < rows.length && i < refRows.length; i++) {
    const r = rows[i], q = refRows[i];
    for (const ch of [['fieldparty', 'meetings'], ['returns', 'meetings'], ['returns', 'departures'], ['returns', 'drops'], ['funnel', 'picks'], ['funnel', 'notes']]) {
      if (JSON.stringify(((r[ch[0]] || {})[ch[1]]) || []) !== JSON.stringify(((q[ch[0]] || {})[ch[1]]) || [])) neutralityDiffs.push(`seed ${r.seed}: ${ch[0]}.${ch[1]} differs`);
    }
    for (const f of wallFields) if (r[f] !== q[f]) neutralityDiffs.push(`seed ${r.seed}: wall ${f} ${r[f]} vs ${q[f]}`);
    if (JSON.stringify(r.deaths || {}) !== JSON.stringify(q.deaths || {})) neutralityDiffs.push(`seed ${r.seed}: deaths map differs`);
    for (const key of ['fieldparty', 'returns', 'funnel']) {
      const d = (r[key] || {}).diag || {};
      if (d.errs) neutralityDiffs.push(`seed ${r.seed}: ${key} errs=${d.errs}`);
      if (JSON.stringify(d.overflow || {}) !== '{}') neutralityDiffs.push(`seed ${r.seed}: ${key} overflow`);
    }
  }
  const neutralityPass = problems.length === 0 && neutralityDiffs.length === 0;
  // Funnel triple table (verbatim reuse).
  let funnel = null;
  try { funnel = JSON.parse(fs.readFileSync(funnelJson, 'utf8')); } catch (e) { problems.push(`funnel JSON unreadable: ${funnelJson} (run test-funnel-a.js with EVID=${evidDir} --out first)`); }
  const triples = (funnel && funnel.triples) || [];
  const tripleClassCounts = (funnel && funnel.tripleClassCounts) || {};
  const otherCount = triples.filter(t => t.cls === 'OTHER').length;
  const wall = {
    won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered || 0), 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: (() => { const s = rows.map(r => r.days).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; })(),
    starvationTotal: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
    deathTotal: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  const waveMap = loadWaveMap();
  // (a) Villager maxD classes + held memories.
  const allPicks = [];
  const allNotes = [];
  for (const r of rows) {
    for (const p of ((r.funnel || {}).picks || [])) allPicks.push(Object.assign({ seed: r.seed }, p));
    for (const n of ((r.funnel || {}).notes || [])) allNotes.push(Object.assign({ seed: r.seed }, n));
  }
  const vilMax = new Map();
  for (const p of allPicks) {
    const k = `${p.seed}|${p.vid}`;
    if (!vilMax.has(k)) vilMax.set(k, { seed: p.seed, vid: p.vid, values: {}, picks: 0 });
    const e = vilMax.get(k);
    e.picks++;
    const mv = (p.gates || {}).maxD;
    e.values[String(mv)] = (e.values[String(mv)] || 0) + 1;
  }
  for (const e of vilMax.values()) {
    const vals = Object.keys(e.values);
    e.maxDClass = vals.length === 1 ? rangeClass(vals[0] === 'null' ? null : parseInt(vals[0], 10)) : ('MIXED:' + vals.sort().join(','));
    e.modalMaxD = vals.length === 1 ? (vals[0] === 'null' ? null : parseInt(vals[0], 10)) : null;
  }
  const dist = {};
  for (const e of vilMax.values()) dist[e.maxDClass] = (dist[e.maxDClass] || 0) + 1;
  const heldAtPick = new Map();
  for (const p of allPicks) for (const s of (p.preSightings || [])) if (waveMap[s[0]] === 4) heldAtPick.set(`${p.seed}|${p.vid}|${s[0]}`, { seed: p.seed, vid: p.vid, mid: s[0] });
  const heldAtPickList = Array.from(heldAtPick.values());
  const heldAtPickHomebody = heldAtPickList.filter(h => { const e = vilMax.get(`${h.seed}|${h.vid}`); return e && e.maxDClass === '0'; });
  const formed = new Map();
  for (const n of allNotes) if (waveMap[n.mid] === 4) formed.set(`${n.seed}|${n.vid}|${n.mid}`, { seed: n.seed, vid: n.vid, mid: n.mid });
  const formedList = Array.from(formed.values());
  const formedKnown = formedList.filter(h => vilMax.has(`${h.seed}|${h.vid}`));
  const formedKnownHomebody = formedKnown.filter(h => vilMax.get(`${h.seed}|${h.vid}`).maxDClass === '0');
  // (c) Offered picks by per-pick range class.
  const offeredByClass = {};
  for (const p of allPicks) {
    const c = rangeClass((p.gates || {}).maxD);
    if (!offeredByClass[c]) offeredByClass[c] = { picks: 0, offered: 0, huntChosenAmongOffered: 0 };
    offeredByClass[c].picks++;
    if (p.candidate) {
      offeredByClass[c].offered++;
      if (p.chosen && p.chosen.kind === 'HUNT') offeredByClass[c].huntChosenAmongOffered++;
    }
  }
  const offeredMaxD0 = (offeredByClass['0'] || {}).offered || 0;
  // (b) Per-triple range classification.
  const picksByVil = new Map();
  for (const p of allPicks) {
    const k = `${p.seed}|${p.vid}`;
    if (!picksByVil.has(k)) picksByVil.set(k, []);
    picksByVil.get(k).push(p);
  }
  const tripleRanges = [];
  for (const t of triples) {
    const vil = vilMax.get(`${t.seed}|${t.vid}`);
    const vilClass = vil ? vil.maxDClass : 'unknown';
    const vilPicks = (picksByVil.get(`${t.seed}|${t.vid}`) || []).filter(p => (p.preSightings || []).some(s => s[0] === t.mid));
    let freshPicks = 0, homebodyFreshBlocked = false, outOfRangeFreshBlocked = false, otherGateFresh = false, offeredFresh = 0;
    const freshExamples = [];
    for (const p of vilPicks) {
      const d = classifyFreshPick(p, t.mid);
      if (!d.fresh) continue;
      freshPicks++;
      if (d.homebodyBlocked) { homebodyFreshBlocked = true; if (freshExamples.length < 3) freshExamples.push({ day: p.day, part: p.part, maxD: (p.gates || {}).maxD, candidate: p.candidate, distances: d.distances }); }
      if (d.outOfRangeBlocked) outOfRangeFreshBlocked = true;
      if (d.otherGate) otherGateFresh = true;
      if (d.offered) offeredFresh++;
    }
    tripleRanges.push({
      seed: t.seed, vid: t.vid, mid: t.mid, anchorDay: t.anchorDay,
      funnelCls: t.cls, funnelStage: t.stage, funnelSub: t.sub, funnelCounts: t.counts,
      villagerMaxD: vilClass, picksWithMid: vilPicks.length, freshPicks,
      homebodyFreshBlocked, outOfRangeFreshBlocked, otherGateFresh, offeredFresh,
      freshHomebodyExamples: freshExamples,
      rangeVerdict: homebodyFreshBlocked ? 'HOMEBODY-RANGE' : (outOfRangeFreshBlocked ? 'OUT-OF-RANGE' : (otherGateFresh ? 'OTHER-GATE' : (offeredFresh > 0 ? 'OFFERED' : 'NO-FRESH-PICK'))),
    });
  }
  const noVerdict = tripleRanges.filter(t => !t.rangeVerdict).length;
  const upperBound = tripleRanges.filter(t => t.homebodyFreshBlocked);
  const maxD0Triples = tripleRanges.filter(t => t.villagerMaxD === '0');
  const tripleWindowOfferedByClass = {};
  for (const t of tripleRanges) {
    const c = t.villagerMaxD;
    if (!tripleWindowOfferedByClass[c]) tripleWindowOfferedByClass[c] = { triples: 0, offeredPicks: 0 };
    tripleWindowOfferedByClass[c].triples++;
    tripleWindowOfferedByClass[c].offeredPicks += ((t.funnelCounts || {}).offeredPicks || 0);
  }
  const goLeg1 = triples.length === 19 && noVerdict === 0 && otherCount <= 1;
  const goLeg3 = neutralityPass;
  console.log('=== sim-homebody-a census ===');
  console.log(`corpus: rows=${rows.length}/16 problems=${problems.join('; ') || 'none'}`);
  console.log(`NEUTRALITY vs funnel-a: ${neutralityPass ? 'PASS' : 'FAIL'} ${neutralityDiffs.slice(0, 10).join('; ')}`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal} (expect 4/0/13/9/10/4/11/0/180/4/600)`);
  console.log(`FUNNEL TRIPLES: ${triples.length} (expect 19) classes=${JSON.stringify(tripleClassCounts)} OTHER=${otherCount}`);
  console.log(`(a) PICK-RECORDED VILLAGERS: ${vilMax.size} dist=${JSON.stringify(dist)}`);
  console.log(`(a) HELD-AT-PICK wave-4 memories: ${heldAtPickList.length} distinct (seed,vid,mid); maxD-0 held: ${heldAtPickHomebody.length}`);
  console.log(`(a) FORMED wave-4 memories: ${formedList.length} distinct; known-villager subset: ${formedKnown.length}; maxD-0 among known: ${formedKnownHomebody.length}`);
  console.log(`(c) OFFERED BY PER-PICK RANGE CLASS: ${JSON.stringify(offeredByClass)} (structural: offered maxD-0 must be 0, got ${offeredMaxD0})`);
  console.log(`(b/d) TRIPLE RANGES: homebodyFreshBlocked=${upperBound.length} maxD0Triples=${maxD0Triples.length} tripleWindowOfferedByClass=${JSON.stringify(tripleWindowOfferedByClass)}`);
  console.log('PER-TRIPLE:');
  for (const t of tripleRanges) {
    console.log(`  [s${t.seed} ${t.vid} ${t.mid} anchor d${t.anchorDay} funnel=${t.funnelCls} maxD=${t.villagerMaxD} picksWithMid=${t.picksWithMid} fresh=${t.freshPicks} homebodyBlock=${t.homebodyFreshBlocked} outOfRange=${t.outOfRangeFreshBlocked} otherGate=${t.otherGateFresh} offeredFresh=${t.offeredFresh}] => ${t.rangeVerdict}`);
  }
  console.log(`COUNTERFACTUAL UPPER BOUND (lottery-eligibility only, NOT a lever result): ${upperBound.length} triples: ${upperBound.map(t => `s${t.seed} ${t.vid}/${t.mid} (${t.funnelCls})`).join('; ') || 'none'}`);
  console.log(`GO: leg1 triples==19 + range verdicts + OTHER<=1 ${goLeg1 ? 'PASS' : 'FAIL'} | leg2 determinism checked separately (seed 75106 re-run diff) | leg3 neutrality ${goLeg3 ? 'PASS' : 'FAIL'}`);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) {
    fs.mkdirSync(path.dirname(args[outIdx + 1]), { recursive: true });
    fs.writeFileSync(args[outIdx + 1], JSON.stringify({ corpusOk: problems.length === 0, neutralityPass, neutralityDiffs, wall,
      funnelTriples: triples.length, tripleClassCounts, otherCount,
      villagerDist: dist, villagerCount: vilMax.size,
      heldAtPick: { total: heldAtPickList.length, homebody: heldAtPickHomebody.length, homebodyList: heldAtPickHomebody },
      formed: { total: formedList.length, knownTotal: formedKnown.length, knownHomebody: formedKnownHomebody.length, knownHomebodyList: formedKnownHomebody },
      offeredByClass, offeredMaxD0,
      tripleRanges, upperBound: upperBound.map(t => ({ seed: t.seed, vid: t.vid, mid: t.mid, funnelCls: t.funnelCls })),
      upperBoundCount: upperBound.length, maxD0TripleCount: maxD0Triples.length,
      tripleWindowOfferedByClass, goLeg1, goLeg3,
    }, null, 1) + '\n');
    console.log(`wrote ${args[outIdx + 1]}`);
  }
  if (problems.length) { console.log('CENSUS: FAIL (corpus problems)'); process.exit(1); }
  if (!neutralityPass) { console.log('NEUTRALITY: FAIL — do not judge census against a perturbed corpus'); process.exit(1); }
  if (offeredMaxD0 > 0) { console.log('STRUCTURAL: FAIL — offered pick with maxD 0 contradicts the range rule'); process.exit(1); }
  if (triples.length !== 19) { console.log('TRIPLES: FAIL (expected 19)'); process.exit(1); }
  if (otherCount > 1) { console.log('TAXONOMY: FAIL (OTHER > 1)'); process.exit(1); }
  if (noVerdict > 0) { console.log('RANGE: FAIL (triple without range verdict)'); process.exit(1); }
  console.log('HOMEBODY-CENSUS: PASS (legs 1 + 3; leg 2 determinism + sense live in evidence)');
}

if (require.main === module) main();
module.exports = { classifyFreshPick, cheb, rangeClass };
