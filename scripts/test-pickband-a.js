#!/usr/bin/env node
// scripts/test-pickband-a.js — sim-pickband-a census analyzer.
// PURE READS over the pickband corpus (+ the funnel-a corpus for
// the clearly-labeled pooled line only). No game code, no policy,
// no RNG. Classification is the departlag join rule VERBATIM:
// classifyPick imported from scripts/test-departlag-a.js — this
// file reimplements NOTHING about the join. Departhold verdicts
// are reported as context alongside a pick's fate, never as a
// reclassification.
// Usage:
//   node scripts/test-pickband-a.js [--evid <dir>] [--out <json>]
//     [--sense]
// Exit 0 only when DIAG legs 1 (8/8 valid) and 2 (UNKNOWN <= 1)
// pass; the JSON is written regardless, so a failed leg still
// leaves its numbers readable. Determinism, recorder-neutrality,
// and sense are checked by separate scripts and judged in the
// evidence file alongside these legs.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyPick, summarize } = require('./test-departlag-a');
const REPO = path.join(__dirname, '..');
const SEEDS = [75117, 75118, 75119, 75120, 75121, 75122, 75123, 75124];
const FUNNEL_SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108, 75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];
const mons = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const list = Array.isArray(mons) ? mons : (mons.monsters || []);
const WAVE4 = new Set(list.filter(m => (m.wave | 0) === 4).map(m => m.id));
const waveOf = (mid) => { const m = list.find(x => x.id === mid); return m ? (m.wave | 0) : null; };

function main() {
  const args = process.argv.slice(2);
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-pickband-a');
  const funnelDir = path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');
  const outPath = get('--out');
  const senseMode = args.indexOf('--sense') >= 0;
  const rows = [], problems = [], perSeed = {};
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(fn)) { problems.push(`missing row s${seed}`); perSeed[seed] = { valid: false, problem: 'missing' }; continue; }
    const r = JSON.parse(fs.readFileSync(fn, 'utf8'));
    rows.push(r);
    const chans = ['fieldparty', 'returns', 'funnel', 'departhold'];
    const bad = [];
    if (!(r.days > 0)) bad.push('days<=0');
    for (const c of chans) {
      const d = (r[c] || {}).diag || {};
      if (d.errs !== 0) bad.push(`${c}.errs=${d.errs}`);
      if (Object.values(d.overflow || {}).some(v => (v | 0) !== 0)) bad.push(`${c}.overflow`);
      if (d.installed !== true) bad.push(`${c}.not-installed`);
    }
    if (!Array.isArray((r.funnel || {}).picks)) bad.push('funnel.picks-missing');
    if (!Array.isArray((r.departhold || {}).evaluations)) bad.push('departhold.evaluations-missing');
    perSeed[seed] = { valid: bad.length === 0, problems: bad,
      days: r.days, endReason: r.endReason, won: r.won, waveReach: r.waveReach,
      nationalEver: r.nationalEver, nationalFinal: r.nationalFinal, table: r.table, entered: r.entered,
      deathTotal: r.deathTotal, starvationDeaths: r.starvationDeaths,
      funnelPicks: ((r.funnel || {}).picks || []).length, funnelNotes: ((r.funnel || {}).notes || []).length,
      departholdEvals: ((r.departhold || {}).evaluations || []).length,
      departholdOutside: ((r.departhold || {}).dangerOutside || []).length + ((r.departhold || {}).departOutside || []).length
        + ((r.departhold || {}).healOutside || []).length + ((r.departhold || {}).tightenOutside || []).length };
  }
  const wall = rows.length ? {
    n: rows.length, won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    wonLesser: rows.filter(r => r.won && !(r.tableState && r.tableState.seat === 'full')).length,
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: (() => { const s = rows.map(r => r.days).sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; })(),
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0),
    starvation: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc || 1)),
  } : null;
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  // Primary + secondary classification (departlag rule, verbatim import).
  const primary = [], secondary = [], unknownWave = [];
  const rowBySeed = {};
  for (const r of rows) rowBySeed[r.seed] = r;
  for (const r of rows) {
    for (const p of ((r.funnel || {}).picks || [])) {
      if (!p.chosen || p.chosen.kind !== 'HUNT' || !p.chosen.huntMid) continue;
      const w = waveOf(p.chosen.huntMid);
      if (w === null) { unknownWave.push(`${r.seed}:${p.vid}:${p.chosen.huntMid}`); continue; }
      const c = classifyPick(p, r);
      // Departhold verdict context: evaluations for this vid whose
      // part falls in [pick.part, next-event part or horizon].
      const evals = ((r.departhold || {}).evaluations || []).filter(e => e.vid === p.vid
        && (e.part | 0) >= (p.part | 0)
        && (c.depPart == null || (e.part | 0) <= (c.depPart | 0))
        && (c.nextPart == null || (e.part | 0) < (c.nextPart | 0)));
      const withVerdict = Object.assign({}, c, { departholdEvals: evals.map(e => ({ day: e.day, part: e.part, action: e.action, sub: e.sub, reason: e.reason, danger: (e.danger || []).map(d => d.verdict) })) });
      secondary.push(withVerdict);
      if (w === 4) primary.push(withVerdict);
    }
  }
  // Pooled line (SECONDARY ONLY, clearly labeled): funnel-a primary
  // recomputed from its corpus with the same rule — never hardcoded.
  let pooled = null;
  try {
    const fPrimary = [];
    for (const seed of FUNNEL_SEEDS) {
      const fn = path.join(funnelDir, `s${seed}-fresh.json`);
      if (!fs.existsSync(fn)) continue;
      const r = JSON.parse(fs.readFileSync(fn, 'utf8'));
      for (const p of ((r.funnel || {}).picks || [])) {
        if (!p.chosen || p.chosen.kind !== 'HUNT' || !WAVE4.has(p.chosen.huntMid)) continue;
        fPrimary.push(classifyPick(p, r));
      }
    }
    const by = {};
    for (const c of fPrimary.concat(primary)) by[c.cls] = (by[c.cls] || 0) + 1;
    pooled = { label: 'POOLED-SECONDARY-ONLY funnel-a primary + pickband primary', funnelA_n: fPrimary.length, pickband_n: primary.length, pooled_n: fPrimary.length + primary.length, by };
  } catch (e) { pooled = { label: 'POOLED-SECONDARY-ONLY (unavailable)', error: String(e.message).slice(0, 120) }; }
  const primSum = summarize(primary), secSum = summarize(secondary);
  const validCount = SEEDS.filter(s => perSeed[s] && perSeed[s].valid).length;
  const legs = { valid8of8: validCount === 8 && problems.length === 0, unknownLe1: primSum.unknown <= 1 };
  const go = legs.valid8of8 && legs.unknownLe1;
  const out = { rows: rows.length, problems, perSeed, wall, deathsByCause,
    legs, primary: primSum, primaryPicks: primary, secondary: secSum, secondaryPicks: secondary,
    unknownWave, pooled, wave4Ids: Array.from(WAVE4).sort() };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('=== sim-pickband-a census ===');
  console.log(`rows=${rows.length}/8 problems=${problems.length ? problems.join(';') : 'none'} valid=${validCount}/8`);
  if (wall) console.log(`WALL (n=8): won=${wall.won} (full=${wall.wonFull} lesser=${wall.wonLesser}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} deaths=${wall.deaths} starv=${wall.starvation}`);
  console.log(`PRIMARY (wave-4 HUNT picks): n=${primSum.n} by=${JSON.stringify(primSum.by)} unknown=${primSum.unknown} unknownWave=${unknownWave.length}`);
  console.log(`  departed lagDays=${JSON.stringify(primSum.departed.lagDays)} lagParts=${JSON.stringify(primSum.departed.lagParts)} sameDayShare=${primSum.departed.sameDayShare} twoPlusShare=${primSum.departed.twoPlusShare} staleShare=${primSum.departed.staleShare} dropped=${primSum.departed.droppedCount} buckets=${JSON.stringify(primSum.departed.lagBuckets)}`);
  console.log(`  superseded bySubKind=${JSON.stringify(primSum.superseded.bySubKind)} lagDays=${JSON.stringify(primSum.superseded.lagDays)} diedHolding=${primSum.diedHolding} heldToHorizon=${primSum.heldToHorizon}`);
  console.log(`SECONDARY (all HUNT picks by w4-memory holders): n=${secSum.n} by=${JSON.stringify(secSum.by)} unknown=${secSum.unknown}`);
  console.log(`POOLED (secondary only): ${JSON.stringify(pooled)}`);
  console.log(`LEGS: valid8of8=${legs.valid8of8 ? 'PASS' : 'FAIL'} unknownLe1=${legs.unknownLe1 ? 'PASS' : 'FAIL'} (determinism/neutrality/sense checked separately)`);
  if (senseMode) for (const c of primary) console.log(`  PICK s${c.seed} ${c.vid} ${c.mid} d${c.pickDay} part=${c.pickPart} ageAtPick=${c.ageAtPick} -> ${c.cls}: ${c.sub}`);
  if (!go) { console.log('PICKBAND-LEGS: FAIL'); process.exit(1); }
  console.log('PICKBAND-LEGS: PASS (validity + classification; determinism/neutrality/sense separate)');
}
if (require.main === module) main();
module.exports = { SEEDS };
