#!/usr/bin/env node
// scripts/analyze-refusalsay-a.js — sim-refusalsay-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the fresh corpus (and, for the substrate
// leg only, the draftflag corpus), never game state, never writes into
// either corpus. Judges the prereg
// (evidence/2026-10-30/sim-refusalsay-a-prereg.md, as amended
// pre-analysis): probe coverage, refusal bracket rate + full gate
// distribution, gate identification from say text, muster have/need
// capture, classification completeness, substrate identity modulo
// recorded paths and wrapper frames, and wall numbers recomputed
// from the fresh corpus.
// Classification, cause/HP coverage, substrate, and wall numbers
// REUSE scripts/analyze-dissolvecause-a.js's analyze() by require —
// never re-implemented. Live-window brackets REUSE the dissolveprobe
// analyzer's computeBracket() by require — never re-implemented.
// The refusal analysis here reads the raw corpus rows for
// refusalSayProbe and applies the prereg refusal rule + gate parser.
// Usage:
//   node scripts/analyze-refusalsay-a.js [--dir <dir>] [--out <file>]
//     [--seeds 75101,...] [--sense]
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze: causeAnalyze } = require('./analyze-dissolvecause-a');
const { computeBracket } = require('./analyze-dissolveprobe-a');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-30', 'perseed-refusalsay-a');
const DRAFTFLAG = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const DEFAULT_SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];

function parseArgs(argv) {
  const out = { dir: EVID, out: null, seeds: DEFAULT_SEEDS, sense: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') out.dir = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
    else if (argv[i] === '--sense') out.sense = true;
    else if (argv[i] === '--seeds') out.seeds = argv[i + 1].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite), i++;
  }
  if (!out.out) out.out = path.join(REPO, 'evidence', '2026-10-30', 'sim-refusalsay-a-analysis.json');
  return out;
}

function bump(m, k) { m[k] = (m[k] || 0) + 1; }

// Prereg gate parser (binding). Applied to the single say call's text.
function parseGateSay(text) {
  if (typeof text !== 'string' || !text.length) return null;
  let title = null;
  const tm = text.match(/^⛔\s+(.+?)\s+does not notice you/);
  if (tm) title = tm[1];
  let m = text.match(/muster (\d+) allied blades \(you have (\d+)\)/);
  if (m) return { gate: 'muster', need: parseInt(m[1], 10), have: parseInt(m[2], 10), gateSource: 'say-text', titanTitle: title };
  m = text.match(/demands (\d+) surviving blades — the march has (\d+)/);
  if (m) return { gate: 'campaign', need: parseInt(m[1], 10), have: parseInt(m[2], 10), gateSource: 'say-text', titanTitle: title };
  if (/THE HEART is not here yet/.test(text)) return { gate: 'campaign', need: null, have: null, gateSource: 'say-text', titanTitle: title };
  return { gate: 'unknown-say', need: null, have: null, gateSource: 'say-text-unparsed', titanTitle: title };
}

// Prereg refusal bracket rule (binding). Returns a unified bracket
// object; bracketed is true iff windowKind is 'refusal', 'call', or
// 'gap'. Live-window rows delegate to the reused computeBracket.
function computeRefusal(probe, intendedMid) {
  const base = { bracketed: false, reason: null, windowKind: null,
    windowCall: null, windowContext: null, tbEndSeen: false,
    sayCalls: 0, everLive: false, gate: null, have: null, need: null,
    gateSource: null, titanTitle: null, sayText: null, eventCount: 0,
    exitState: null };
  if (!probe || !Array.isArray(probe.events) || !probe.events.length) {
    base.reason = 'missing-log';
    return base;
  }
  const evs = probe.events;
  base.eventCount = evs.length;
  base.everLive = evs.some(e => e.state === 'live');
  const sayEnters = evs.filter(e => (e.fn === 'say' || e.fn === 'sysSay') && e.phase === 'enter');
  base.sayCalls = sayEnters.length;
  base.tbEndSeen = evs.some(e => e.fn === 'tbEnd');
  if (sayEnters.length) base.sayText = (typeof sayEnters[0].argText === 'string' ? sayEnters[0].argText : null);
  let exitEv = null;
  for (let i = evs.length - 1; i >= 0; i--) {
    if (evs[i].fn === 'startCombat' && (evs[i].phase === 'exit' || evs[i].phase === 'throw')) { exitEv = evs[i]; break; }
  }
  base.exitState = exitEv ? exitEv.state : null;
  if (base.everLive) {
    const b = computeBracket(probe);
    base.bracketed = b.bracketed;
    base.reason = b.reason;
    base.windowKind = b.windowKind;
    base.windowCall = b.windowCall;
    base.windowContext = b.windowContext;
    base.tbEndSeen = b.tbEndSeen;
    base.windowTurn = b.windowTurn || null;
    return base;
  }
  if (base.sayCalls === 0) { base.reason = 'never-live-no-say'; return base; }
  if (base.sayCalls !== 1) { base.reason = 'never-live-multi-say'; return base; }
  if (base.exitState !== 'null') { base.reason = 'refusal-exit-not-null'; return base; }
  if (base.tbEndSeen) { base.reason = 'refusal-tbend-seen'; return base; }
  // Refusal bracket.
  base.bracketed = true;
  base.windowKind = 'refusal';
  if (typeof base.sayText === 'string' && base.sayText.length) {
    const parsed = parseGateSay(base.sayText);
    base.gate = parsed.gate;
    base.have = parsed.have;
    base.need = parsed.need;
    base.gateSource = parsed.gateSource;
    base.titanTitle = parsed.titanTitle;
  } else {
    // Capture failure: elimination only, never a quoted have/need.
    base.gate = (intendedMid === 'herald' ? 'muster' : 'elimination-unknown');
    base.have = null;
    base.need = null;
    base.gateSource = 'elimination';
    base.titanTitle = null;
  }
  base.windowCall = 'refusal:' + base.gate;
  base.windowContext = base.titanTitle;
  return base;
}

// --- Substrate frame-reconciled diagnostic (prereg) ---
function stripScholarmelt(row) { const c = JSON.parse(JSON.stringify(row)); delete c.scholarmelt; return c; }
function normalizeWorktreePaths(s) {
  return String(s)
    .replace(/\/home\/hatch\/workspace\/worktrees\/[^\/\s)"']+/g, '<worktree>')
    .replace(/\/home\/hatch\/workspace\/the-scattering/g, '<worktree>');
}
function diffPaths(a, b, prefix, out) {
  if (out.length >= 100) return;
  if (a === b) return;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) { out.push(prefix + '[len:' + a.length + '!=' + b.length + ']'); return; }
    for (let i = 0; i < a.length; i++) diffPaths(a[i], b[i], prefix + '[' + i + ']', out);
    return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set(Object.keys(a).concat(Object.keys(b)));
    for (const k of keys) {
      if (!(k in a) || !(k in b)) { out.push(prefix + '.' + k + '[missing]'); continue; }
      diffPaths(a[k], b[k], prefix + '.' + k, out);
    }
    return;
  }
  out.push(prefix);
}
function frameReconciled(freshRow, dfRow) {
  // Returns { diffCount, diffPaths, frameOnly }: frameOnly is true iff
  // every difference lies under a removal-stack field (stack text),
  // i.e. no game field differs. An empty diff also yields frameOnly
  // true (the normalized comparison already passed).
  const a = JSON.parse(normalizeWorktreePaths(JSON.stringify(stripScholarmelt(freshRow), null, 1)));
  const b = JSON.parse(normalizeWorktreePaths(JSON.stringify(stripScholarmelt(dfRow), null, 1)));
  const diffs = [];
  diffPaths(a, b, '$', diffs);
  return { diffCount: diffs.length, diffPaths: diffs.slice(0, 20),
    frameOnly: diffs.every(p => p.indexOf('.stack.') >= 0) };
}

function analyzeRefusal(dir, seeds, draftflagDir) {
  draftflagDir = draftflagDir || DRAFTFLAG;
  const base = causeAnalyze(dir, seeds, draftflagDir);
  const probeRows = [];
  const rsDiagPerSeed = {};
  let rsValidSeeds = 0;
  const substrateFrame = {};
  let substrateJudgedSeeds = 0;
  let substrateJudgedPass = 0;
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const meetings = (row.scholarmelt && row.scholarmelt.meetings) || [];
    const pdiag = (row.scholarmelt && row.scholarmelt.diag && row.scholarmelt.diag.refusalsay) || null;
    const pValid = !!pdiag && pdiag.errs === 0
      && Object.values(pdiag.overflow || {}).every(v => (v | 0) === 0)
      && pdiag.installed === true && (pdiag.windows | 0) > 0;
    if (pValid) rsValidSeeds++;
    rsDiagPerSeed[seed] = pdiag ? { errs: pdiag.errs, overflow: pdiag.overflow,
      installed: pdiag.installed, windows: pdiag.windows, attached: pdiag.attached,
      valid: pValid } : { valid: false, missing: true };
    // Substrate frame-reconciled diagnostic (pilot seeds only in
    // practice: confirm seeds have no draftflag comparator file).
    const dfPath = path.join(draftflagDir, `s${seed}-fresh.json`);
    if (fs.existsSync(dfPath)) {
      substrateJudgedSeeds++;
      const dfRow = JSON.parse(fs.readFileSync(dfPath, 'utf8'));
      const fr = frameReconciled(row, dfRow);
      const normalized = (base.substrate.perSeedRow[seed] === true);
      const census = (base.substrate.perSeedCensus[seed] === true);
      const judgedPass = (normalized || fr.frameOnly) && census;
      if (judgedPass) substrateJudgedPass++;
      substrateFrame[seed] = { hasComparator: true, normalized, census,
        frameReconciled: fr.frameOnly, diffCount: fr.diffCount,
        diffPaths: fr.diffPaths, judgedPass };
    } else {
      substrateFrame[seed] = { hasComparator: false, normalized: null, census: null,
        frameReconciled: null, diffCount: null, diffPaths: null, judgedPass: null };
    }
    for (const m of meetings) {
      if (m.result !== 'dissolved-no-tbend') continue;
      const probe = m.refusalSayProbe || null;
      const hasProbe = !!probe && Array.isArray(probe.events) && probe.events.length > 0;
      const bracket = computeRefusal(probe, m.intendedMid);
      probeRows.push({ seed, fightSeq: m.fightSeq, dayStart: m.dayStart,
        intendedMid: m.intendedMid, dissolveCause: m.dissolveCause || null,
        hasProbe, events: hasProbe ? probe.events.length : 0,
        overflow: !!(probe && probe.overflow), bracket });
    }
  }
  const withProbe = probeRows.filter(r => r.hasProbe);
  const bracketed = withProbe.filter(r => r.bracket.bracketed);
  const refusalRows = withProbe.filter(r => r.bracket.windowKind === 'refusal');
  const gateIdentified = refusalRows.filter(r => r.bracket.gateSource === 'say-text'
    && (r.bracket.gate === 'muster' || r.bracket.gate === 'campaign'));
  const musterRows = refusalRows.filter(r => r.bracket.gate === 'muster');
  const musterHaveNeed = musterRows.filter(r => r.bracket.gateSource === 'say-text'
    && Number.isInteger(r.bracket.have) && Number.isInteger(r.bracket.need));
  const windowCounts = {};
  const gateCounts = {};
  const kindCounts = {};
  const reasonCounts = {};
  for (const r of probeRows) {
    if (!r.hasProbe) { bump(reasonCounts, 'missing-log'); continue; }
    if (!r.bracket.bracketed) { bump(reasonCounts, r.bracket.reason || 'unbracketed'); continue; }
    bump(kindCounts, r.bracket.windowKind);
    bump(windowCounts, r.bracket.windowCall);
    if (r.bracket.windowKind === 'refusal') bump(gateCounts, r.bracket.gate + '|src=' + r.bracket.gateSource);
  }
  const dominant = Object.keys(windowCounts).sort((a, b) => windowCounts[b] - windowCounts[a]);
  const substrateJudged = substrateJudgedSeeds > 0
    ? { seeds: substrateJudgedSeeds, pass: substrateJudgedPass, all: substrateJudgedPass === substrateJudgedSeeds }
    : null;
  return { base, probeRows, rsDiagPerSeed, rsValidSeeds, substrateFrame, substrateJudged,
    coverage: { dissolvedTotal: probeRows.length, withProbe: withProbe.length,
      probePct: probeRows.length ? withProbe.length / probeRows.length : null,
      bracketed: bracketed.length, bracketDenominator: withProbe.length,
      bracketPct: withProbe.length ? bracketed.length / withProbe.length : null,
      refusalRows: refusalRows.length,
      refusalPct: withProbe.length ? refusalRows.length / withProbe.length : null,
      gateIdentified: gateIdentified.length, gateDenominator: refusalRows.length,
      gateIdentifiedPct: refusalRows.length ? gateIdentified.length / refusalRows.length : null,
      musterRows: musterRows.length, musterHaveNeed: musterHaveNeed.length,
      haveNeedPct: musterRows.length ? musterHaveNeed.length / musterRows.length : null },
    windowCounts, gateCounts, kindCounts, reasonCounts,
    dominantWindow: dominant.length ? dominant[0] : null,
    dominantWindowCount: dominant.length ? windowCounts[dominant[0]] : 0 };
}

function main(argv) {
  const args = parseArgs(argv);
  const res = analyzeRefusal(args.dir, args.seeds);
  fs.writeFileSync(args.out, JSON.stringify(res, null, 2) + '\n');
  const c = res.coverage;
  console.log(`REFUSALSAY: seeds=${args.seeds.length} baseValid=${res.base.validSeeds} rsValid=${res.rsValidSeeds} dissolved=${c.dissolvedTotal} ` +
    `probe=${c.withProbe}/${c.dissolvedTotal} bracketed=${c.bracketed}/${c.bracketDenominator} refusal=${c.refusalRows} ` +
    `gateIdent=${c.gateIdentified}/${c.gateDenominator} musterHaveNeed=${c.musterHaveNeed}/${c.musterRows}`);
  console.log(`WINDOWS: ${JSON.stringify(res.windowCounts)}`);
  console.log(`GATES: ${JSON.stringify(res.gateCounts)}`);
  console.log(`KINDS: ${JSON.stringify(res.kindCounts)} UNBRACKETED-REASONS: ${JSON.stringify(res.reasonCounts)}`);
  console.log(`DOMINANT: ${res.dominantWindow} (${res.dominantWindowCount})`);
  console.log(`SUBSTRATE-JUDGED: ${res.substrateJudged ? JSON.stringify(res.substrateJudged) : 'n/a (no comparator seeds)'} BASE: all=${res.base.substrate.all} rows=${res.base.substrate.allRows} rowsRaw=${res.base.substrate.allRowsRaw} census=${res.base.substrate.allCensus}`);
  console.log(`BASE: cause=${JSON.stringify(res.base.causeCounts)} fates=${JSON.stringify(res.base.fateCounts)} unclassified=${res.base.unclassified}`);
  console.log(`WALL: won=${res.base.wall.won} natEver=${res.base.wall.nationalEver} natFinal=${res.base.wall.nationalFinal} table=${res.base.wall.tableReached} entered=${res.base.wall.tableEntered} wave=${JSON.stringify(res.base.wall.waveReach)} median=${res.base.wall.medianDays} deaths=${res.base.wall.deaths}`);
  if (args.sense) {
    for (const r of res.probeRows) {
      const b = r.bracket;
      console.log(`REFUSAL s${r.seed} seq=${r.fightSeq} d${r.dayStart} ${r.intendedMid} probe=${r.hasProbe ? r.events : 0} ` +
        (b.bracketed
          ? `window=${b.windowKind}:${b.windowCall} gate=${b.gate} src=${b.gateSource} have=${b.have} need=${b.need} title=${b.titanTitle} say=${JSON.stringify(b.sayText)}`
          : `UNBRACKETED reason=${b.reason} sayCalls=${b.sayCalls} everLive=${b.everLive}`));
    }
  }
  return res;
}

module.exports = { analyzeRefusal, computeRefusal, parseGateSay, frameReconciled };
if (require.main === module) main(process.argv.slice(2));
