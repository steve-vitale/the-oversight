#!/usr/bin/env node
// scripts/analyze-dissolveprobe-a.js — sim-dissolveprobe-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the fresh corpus (and, for the substrate
// leg only, the draftflag corpus), never game state, never writes into
// either corpus. Judges the prereg
// (evidence/2026-10-30/sim-dissolveprobe-a-prereg.md): probe coverage,
// bracket rate + full bracket distribution, classification completeness,
// substrate identity, and wall numbers recomputed from the fresh corpus.
// Classification, cause/HP coverage, substrate, and wall numbers REUSE
// scripts/analyze-dissolvecause-a.js's analyze() by require — never
// re-implemented. The bracket analysis here reads the raw corpus rows
// for dissolveInCallProbe and applies the prereg bracket rule.
// Usage:
//   node scripts/analyze-dissolveprobe-a.js [--dir <dir>] [--out <file>]
//     [--seeds 75101,...] [--sense]
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze: causeAnalyze } = require('./analyze-dissolvecause-a');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-30', 'perseed-dissolveprobe-a');
const DRAFTFLAG = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const DEFAULT_SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108,
  75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];

function parseArgs(argv) {
  const out = { dir: EVID, out: null, seeds: DEFAULT_SEEDS, sense: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') out.dir = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
    else if (argv[i] === '--sense') out.sense = true;
    else if (argv[i] === '--seeds') out.seeds = argv[i + 1].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite), i++;
  }
  if (!out.out) out.out = path.join(REPO, 'evidence', '2026-10-30', 'sim-dissolveprobe-a-analysis.json');
  return out;
}

function bump(m, k) { m[k] = (m[k] || 0) + 1; }

// Prereg bracket rule (binding). Returns a bracket object; bracketed
// is true iff windowKind is 'call' or 'gap' (exactly one named call,
// or exactly one named gap between two consecutive events).
function computeBracket(probe) {
  if (!probe || !Array.isArray(probe.events) || !probe.events.length) {
    return { bracketed: false, reason: 'missing-log', windowKind: null,
      windowCall: null, windowContext: null, tbEndSeen: false, windowTurn: null,
      stackNamesAtNull: null, lastLiveEvent: null, nullEvent: null };
  }
  const evs = probe.events;
  let firstLiveIdx = -1;
  for (let i = 0; i < evs.length; i++) if (evs[i].state === 'live') { firstLiveIdx = i; break; }
  if (firstLiveIdx < 0) {
    return { bracketed: false, reason: 'no-live-event', windowKind: null,
      windowCall: null, windowContext: null, tbEndSeen: false, windowTurn: null,
      stackNamesAtNull: null, lastLiveEvent: null, nullEvent: null };
  }
  let nullIdx = -1;
  for (let i = firstLiveIdx + 1; i < evs.length; i++) {
    if (evs[i].state === 'over' || evs[i].state === 'null') { nullIdx = i; break; }
  }
  if (nullIdx < 0) {
    return { bracketed: false, reason: 'no-null-event', windowKind: null,
      windowCall: null, windowContext: null, tbEndSeen: false, windowTurn: null,
      stackNamesAtNull: null, lastLiveEvent: null, nullEvent: null };
  }
  const nullEvent = evs[nullIdx];
  const prevEvent = nullIdx > 0 ? evs[nullIdx - 1] : null;
  let lastLiveIdx = -1;
  for (let i = nullIdx - 1; i >= firstLiveIdx; i--) {
    if (evs[i].state === 'live') { lastLiveIdx = i; break; }
  }
  const lastLiveEvent = lastLiveIdx >= 0 ? evs[lastLiveIdx] : null;
  let tbEndSeen = false;
  for (let i = firstLiveIdx; i <= nullIdx; i++) if (evs[i].fn === 'tbEnd') { tbEndSeen = true; break; }
  const windowTurn = { turnIdx: nullEvent.turnIdx, round: nullEvent.round,
    currentKey: nullEvent.currentKey, playerHp: nullEvent.playerHp,
    nMonFighting: nullEvent.nMonFighting };
  const stackNamesAtNull = nullEvent.stackNames || null;
  const slim = (e) => (e ? { fn: e.fn, phase: e.phase, state: e.state,
    turnIdx: e.turnIdx, round: e.round, currentKey: e.currentKey } : null);
  if (nullEvent.phase === 'exit') {
    // That call's exit first shows the null: the call is the window.
    // (If the exiting call is startCombat itself, the window is the
    // whole call — still one named window per the prereg rule; the
    // refined gap below names the last live event for precision.)
    const nesting = (nullEvent.callStack || []).slice();
    return { bracketed: true, reason: null, windowKind: 'call',
      windowCall: nullEvent.fn,
      windowContext: nesting.length > 1 ? nesting.slice(0, -1).join('>') : null,
      windowNesting: nesting, tbEndSeen, windowTurn, stackNamesAtNull,
      lastLiveEvent: slim(lastLiveEvent), nullEvent: slim(nullEvent) };
  }
  // Enter-phase null: the nulling happened in unwrapped code between
  // the previous event and this entry. Window = that gap; context =
  // the innermost wrapped call common to both events' stacks.
  const a = (prevEvent && prevEvent.callStack) || [];
  const b = (nullEvent.callStack || []);
  let common = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) common.push(a[i]); else break;
  }
  return { bracketed: true, reason: null, windowKind: 'gap',
    windowCall: 'gap:' + (prevEvent ? prevEvent.fn : '?') + '->' + nullEvent.fn,
    windowContext: common.length ? common[common.length - 1] : 'startCombat-body',
    windowNesting: nullEvent.callStack || [], tbEndSeen, windowTurn,
    stackNamesAtNull, lastLiveEvent: slim(lastLiveEvent), nullEvent: slim(nullEvent) };
}

function analyzeProbe(dir, seeds, draftflagDir) {
  draftflagDir = draftflagDir || DRAFTFLAG;
  const base = causeAnalyze(dir, seeds, draftflagDir);
  const probeRows = [];
  const probeDiagPerSeed = {};
  let probeValidSeeds = 0;
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const meetings = (row.scholarmelt && row.scholarmelt.meetings) || [];
    const pdiag = (row.scholarmelt && row.scholarmelt.diag && row.scholarmelt.diag.dissolveprobe) || null;
    const pValid = !!pdiag && pdiag.errs === 0
      && Object.values(pdiag.overflow || {}).every(v => (v | 0) === 0)
      && pdiag.installed === true && (pdiag.windows | 0) > 0;
    if (pValid) probeValidSeeds++;
    probeDiagPerSeed[seed] = pdiag ? { errs: pdiag.errs, overflow: pdiag.overflow,
      installed: pdiag.installed, windows: pdiag.windows, attached: pdiag.attached,
      valid: pValid } : { valid: false, missing: true };
    for (const m of meetings) {
      if (m.result !== 'dissolved-no-tbend') continue;
      const probe = m.dissolveInCallProbe || null;
      const hasProbe = !!probe && Array.isArray(probe.events) && probe.events.length > 0;
      const bracket = computeBracket(probe);
      probeRows.push({ seed, fightSeq: m.fightSeq, dayStart: m.dayStart,
        intendedMid: m.intendedMid, dissolveCause: m.dissolveCause || null,
        hasProbe, events: hasProbe ? probe.events.length : 0,
        overflow: !!(probe && probe.overflow), bracket });
    }
  }
  const withProbe = probeRows.filter(r => r.hasProbe);
  const bracketed = withProbe.filter(r => r.bracket.bracketed);
  const windowCounts = {};
  const windowTbEndCounts = {};
  const kindCounts = {};
  const reasonCounts = {};
  for (const r of probeRows) {
    if (!r.hasProbe) { bump(reasonCounts, 'missing-log'); continue; }
    if (!r.bracket.bracketed) { bump(reasonCounts, r.bracket.reason || 'unbracketed'); continue; }
    bump(kindCounts, r.bracket.windowKind);
    bump(windowCounts, r.bracket.windowCall);
    bump(windowTbEndCounts, r.bracket.windowCall + '|tbEnd=' + (r.bracket.tbEndSeen ? 'yes' : 'no'));
  }
  const dominant = Object.keys(windowCounts).sort((a, b) => windowCounts[b] - windowCounts[a]);
  return { base, probeRows, probeDiagPerSeed, probeValidSeeds,
    coverage: { dissolvedTotal: probeRows.length, withProbe: withProbe.length,
      probePct: probeRows.length ? withProbe.length / probeRows.length : null,
      bracketed: bracketed.length, bracketDenominator: withProbe.length,
      bracketPct: withProbe.length ? bracketed.length / withProbe.length : null },
    windowCounts, windowTbEndCounts, kindCounts, reasonCounts,
    dominantWindow: dominant.length ? dominant[0] : null,
    dominantWindowCount: dominant.length ? windowCounts[dominant[0]] : 0 };
}

function main(argv) {
  const args = parseArgs(argv);
  const res = analyzeProbe(args.dir, args.seeds);
  fs.writeFileSync(args.out, JSON.stringify(res, null, 2) + '\n');
  const c = res.coverage;
  console.log(`DISSOLVEPROBE: seeds=${args.seeds.length} baseValid=${res.base.validSeeds} probeValid=${res.probeValidSeeds} dissolved=${c.dissolvedTotal} ` +
    `probe=${c.withProbe}/${c.dissolvedTotal} bracketed=${c.bracketed}/${c.bracketDenominator}`);
  console.log(`WINDOWS: ${JSON.stringify(res.windowCounts)}`);
  console.log(`WINDOWS x TBEND: ${JSON.stringify(res.windowTbEndCounts)}`);
  console.log(`KINDS: ${JSON.stringify(res.kindCounts)} UNBRACKETED-REASONS: ${JSON.stringify(res.reasonCounts)}`);
  console.log(`DOMINANT: ${res.dominantWindow} (${res.dominantWindowCount})`);
  console.log(`BASE: cause=${JSON.stringify(res.base.causeCounts)} fates=${JSON.stringify(res.base.fateCounts)} unclassified=${res.base.unclassified} substrateAll=${res.base.substrate.all} rowsRaw=${res.base.substrate.allRowsRaw}`);
  console.log(`WALL: won=${res.base.wall.won} natEver=${res.base.wall.nationalEver} natFinal=${res.base.wall.nationalFinal} table=${res.base.wall.tableReached} entered=${res.base.wall.tableEntered} wave=${JSON.stringify(res.base.wall.waveReach)} median=${res.base.wall.medianDays} deaths=${res.base.wall.deaths}`);
  if (args.sense) {
    for (const r of res.probeRows) {
      const b = r.bracket;
      console.log(`BRACKET s${r.seed} seq=${r.fightSeq} d${r.dayStart} ${r.intendedMid} probe=${r.hasProbe ? r.events : 0} ` +
        (b.bracketed
          ? `window=${b.windowKind}:${b.windowCall} ctx=${b.windowContext} tbEnd=${b.tbEndSeen ? 'yes' : 'no'} turn=${JSON.stringify(b.windowTurn)} lastLive=${b.lastLiveEvent ? b.lastLiveEvent.fn + '/' + b.lastLiveEvent.phase : '?'} stack=${JSON.stringify(b.stackNamesAtNull)}`
          : `UNBRACKETED reason=${b.reason}`));
    }
  }
  return res;
}

module.exports = { analyzeProbe, computeBracket };
if (require.main === module) main(process.argv.slice(2));
