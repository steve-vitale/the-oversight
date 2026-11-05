// analyze-journey-scale-r101-20261104.js -- R101 SCALE analyzer
// (tooling only, zero game code). Reads per-seed JSONs written by
// scripts/journey-scale-r101-20261104.js and reports the pre-registered
// S-NAT / S-TABLE / S-FEEL / S-SENSE / S-ALIVE / STAY-GREEN verdicts.
//
// S-NAT: rung transitions from standingTrace (consecutive scale
// changes), first day at each rung, final scale, max standing.
// S-TABLE: `national` / `global` choice events + table-path markers
// in the per-seed log lines (driver logs ev:'national'/'global').
// S-FEEL: for each in-window (>= day 80) transition, the analyzer
// prints the transition day so the run note can judge the beat from
// the log lines around it — the analyzer does NOT claim a beat from
// a count; the human read in the run note is the verdict.
// S-SENSE: transcript files are read in full by the run note's people
// check; this analyzer only counts scale-window transcripts present.
// STAY-GREEN: deathHonesty.mislabels + revisit agreement flags.
//
// Usage: node scripts/analyze-journey-scale-r101-20261104.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-04');
const EVIDIR = process.argv[2] || process.env.EVIDIR || DEFAULT_EVIDIR;
const SEEDS = [94001, 94002, 94003, 94004];

function transitions(trace) {
  const out = [];
  let prev = null;
  for (const t of (trace || [])) {
    if (!t) continue;
    if (prev !== null && t.scale !== prev) out.push({ day: t.day, from: prev, to: t.scale, standing: t.standing, networkLive: !!t.networkLive });
    prev = t.scale;
  }
  return out;
}

function summarizeSeed(s) {
  const trace = s.standingTrace || [];
  const trans = transitions(trace);
  const inWindow = trans.filter(t => t.day >= 80);
  let maxStanding = null;
  for (const t of trace) { if (t && t.standing != null && (maxStanding == null || t.standing > maxStanding)) maxStanding = t.standing; }
  // R101 fix (analyzer bug, caught reading the after-panel): national /
  // global answers live in regionalLog, not in a `log` array — the first
  // analyzer run reported "none" for a seed that had in fact answered
  // both beats. regionalLog is the driver's own event list.
  const rl = s.regionalLog || [];
  const natEvents = rl.filter(l => l && (l.ev === 'national' || l.ev === 'global'));
  const proposeEvents = rl.filter(l => l && l.ev === 'propose');
  const skipEvents = rl.filter(l => l && l.ev === 'propose-skip');
  const census = (s.census || []).filter(c => c.alive);
  return {
    seed: s.seed, maxGameDay: s.maxGameDay, endReason: s.endReason,
    finalWave: s.finalWave, finalScale: s.finalScale,
    popAlive: census.length, popTotal: (s.census || []).length,
    maxStanding, transitions: trans, inWindowTransitions: inWindow,
    nationalEvents: natEvents,
    proposeEvents: proposeEvents,
    skipEvents: skipEvents,
    mislabels: ((s.deathHonesty || {}).mislabels || []).length,
    revisit: s.revisitAttempts || [],
    standingAtEnd: trace.length ? trace[trace.length - 1] : null,
  };
}

function main() {
  const out = [];
  for (const seed of SEEDS) {
    const fp = path.join(EVIDIR, `journey-scale-r101-seed${seed}.json`);
    if (!fs.existsSync(fp)) { out.push({ seed, missing: true }); continue; }
    const s = JSON.parse(fs.readFileSync(fp, 'utf8'));
    out.push(summarizeSeed(s));
  }
  for (const o of out) {
    if (o.missing) { console.log(`seed ${o.seed}: MISSING`); continue; }
    console.log(`seed ${o.seed}: day=${o.maxGameDay} end=${o.endReason} wave=${o.finalWave} scale=${o.finalScale} pop=${o.popAlive}/${o.popTotal} maxStanding=${o.maxStanding} mislabels=${o.mislabels}`);
    console.log(`  transitions: ${o.transitions.map(t => `${t.from}->${t.to}@d${t.day}`).join(', ') || 'none'}`);
    console.log(`  in-window(>=80) transitions: ${o.inWindowTransitions.map(t => `${t.from}->${t.to}@d${t.day}`).join(', ') || 'none'}`);
    console.log(`  national/global events: ${o.nationalEvents.length ? JSON.stringify(o.nationalEvents) : 'none'}`);
    console.log(`  proposes: ${o.proposeEvents.map(p => `${p.target}:${p.result}@d${p.day}`).join(', ') || 'none'}; skips: ${o.skipEvents.map(p => `${p.reason}@d${p.day}`).join(', ') || 'none'}`);
    console.log(`  revisit attempts: ${JSON.stringify(o.revisit)}`);
  }
  // Panel verdicts (counts only; feel/sense judged by the human read).
  const present = out.filter(o => !o.missing);
  const reachedNat = present.filter(o => o.finalScale === 'national' || o.finalScale === 'global' || (o.transitions || []).some(t => t.to === 'national' || t.to === 'global'));
  const alive140 = present.filter(o => o.maxGameDay >= 140);
  console.log(`\nPANEL: seeds=${present.length} alive@140=${alive140.length} reachedNationalOrHigher=${reachedNat.length} totalMislabels=${present.reduce((a, o) => a + o.mislabels, 0)}`);
  return out;
}
if (require.main === module) main();
module.exports = { summarizeSeed, transitions };
