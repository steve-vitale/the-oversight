#!/usr/bin/env node
// sim-envoyaccord-sweep.js — ENVOY->ACCORD census on CURRENT master (arm
// sim-envoyaccord, axis scale-onramp). DIAG arm: instrument-only, ZERO
// src/js changes, ZERO policy changes (pure scripts/policies/
// competent.js as-is; read-only recorders only: scripts/
// sim-envoyaccord-instrument.js + scripts/postunlock-instrument.js).
//
// PRE-REGISTRATION (binding, MEASUREMENT.md §14 — written in the
// evidence header BEFORE this sweep ran; the sweep only executes it):
//   POLICY: pure competent, no env-gated levers, no wallseg/
//     trustbuffer/vetformation stack (same substrate as sim-rerunclock).
//   SEEDS: FRESH band 73301-73308 x competent = 8 configs (pilot).
//     Verified unused at run start: no s7330x filename in this
//     worktree's evidence/ tree.
//   HORIZON: 180d death-aware (dead villages stop; +10d tail max).
//   EXTENSION RULE (decided now): if envoy-arrival events (ledger
//     beats with epithet 'the Indispensable') number < 4 after the
//     pilot, extend to 73309-73316 (8 more). If still < 4, verdict is
//     NO-GO (population too thin — do NOT import wallseg-stack envoys
//     as the primary population).
//   PRIMARY: census complete AND every envoy-arrival event attributed
//     to an accord outcome (classifyEnvoyEvent, engine-grounded).
//     GO iff one failing condition accounts for >= 50% of
//     envoy-no-accord events AND the census is complete AND >= 1
//     envoy event AND >= 1 no-accord event (backlog #894 fix — the
//     analyzer's diagGo MUST require qualifying events).
//   BALANCED PANEL (§15): N/A by construction for a DIAG census.
//   §14c: villager (non-scholar) combat deaths are co-primary
//     alongside scholar metrics (postunlock death rows).
//
// Sweep outputs to the worktree evidence dir, NEVER /tmp. Per-seed
// writes go through the proven fresh-process chunked writer
// scripts/sim-postunlock2-b-writer.js (read-only reuse) because the
// container EPERM/read-taint class kills large in-process writes
// from game-loaded processes.
//
// Modes (env):
//   SEEDS=csv DAYS=180 EVID=<dir>  — census sweep (default pilot band).
//   PROBE=1 SEEDS=73399            — throwaway pre-pilot substrate
//     probe (seed MUST be outside 73301-73316); writes
//     probe-<seed>-competent.json and prints the §14b checklist.
//   SENSE=1 SEEDS=<one>            — narration:true replay, writes
//     sense-<seed>.txt ONLY (MARKED NON-MEASURED; narration replays
//     diverge from measured runs). Never a census file.
// Usage:
//   node scripts/sim-envoyaccord-sweep.js [SEEDS=... EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
const EI = require(path.join(REPO, 'scripts', 'sim-envoyaccord-instrument'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const BAND = [];
for (let s = 73301; s <= 73316; s++) BAND.push(s);
const PROBE = process.env.PROBE === '1';
const SENSE = process.env.SENSE === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : BAND.slice(0, 8)).filter(Number.isFinite);
if (PROBE) {
  for (const s of SEEDS) {
    if (BAND.indexOf(s) >= 0) { console.error(`SWEEP STOP: PROBE seed ${s} is inside the census band 73301-73316.`); process.exit(2); }
  }
}
if (SENSE) {
  // SENSE writes ONLY sense-<seed>.txt (never a census JSON) and the
  // analyzer globs s733*.json, so a census seed is safe here — and
  // required when the sense target is an envoy-bearing seed.
  if (SEEDS.length !== 1) { console.error('SWEEP STOP: SENSE takes exactly one seed.'); process.exit(2); }
}
if (!PROBE && !SENSE) {
  for (const s of SEEDS) {
    if (BAND.indexOf(s) < 0) { console.error(`SWEEP STOP: seed ${s} is outside the fresh 733xx band (73301-73316).`); process.exit(2); }
  }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-envoyaccord');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'sim-envoyaccord-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function seedFile(seed) {
  if (PROBE) return path.join(EVID, `probe-${seed}-competent.json`);
  return path.join(EVID, `s${seed}-competent.json`);
}
function writeViaWriter(fn, body) {
  let wrote = false, lastErr = null;
  for (let attempt = 0; attempt < 10 && !wrote; attempt++) {
    try {
      const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), fn], { input: body, encoding: 'utf8', timeout: 600000 });
      if (r.error) throw r.error;
      if (r.status !== 0) throw new Error(`writer exit ${r.status}: ${(r.stderr || '').trim()}`);
      wrote = true;
    } catch (e) {
      lastErr = e;
      const waitMs = Math.min(60000, 2000 * Math.pow(2, attempt));
      logLine(`WRITE-RETRY ${fn} attempt ${attempt + 1}/10: ${String((e && e.message) || e)}; waiting ${waitMs}ms`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
    }
  }
  if (!wrote) { console.error(`WRITE-DENIAL after 10 child-writer attempts for ${fn}: ${String((lastErr && lastErr.message) || lastErr)}`); process.exit(3); }
}
function payloadComplete(d, seed, anchor) {
  return d && d.seed === seed && d.anchorCommit === anchor &&
    Array.isArray(d.envoyDaily) && d.envoyDaily.length > 0 &&
    Array.isArray(d.envoyBeats) &&
    Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights) &&
    d.unlock && ('w4Day' in d.unlock) && ('w5Day' in d.unlock) && !!d.finalSnap;
}

async function oneRun(seed, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  const sense = !!opts.sense;
  const t = {};
  const { Game } = await loadGame({ seed, mode: 'envoyaccord', fullTelemetry: false, narration: sense });
  const senseLines = [];
  let sayOrig = null;
  if (sense) {
    try {
      sayOrig = Game.say;
      Game.say = function () {
        try { const line = Array.prototype.slice.call(arguments).join(' '); if (senseLines.length < 20000) senseLines.push(line); } catch (e) {}
        return sayOrig ? sayOrig.apply(this, arguments) : undefined;
      };
    } catch (e) { t.envoyErrors = t.envoyErrors || []; t.envoyErrors.push('sense.saywrap: ' + String((e && e.message) || e)); }
  }
  const uninstallPI = PI.install(Game, t);
  const uninstallEI = EI.install(Game, t);
  const policy = EI.wrapPolicy(competent, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  // Final accord snapshot + known detail AFTER the run (reads only;
  // judgeLink is never called, so no RNG is drawn by this read).
  let finalSnap = null, finalKnown = [];
  try { finalSnap = EI.accordSnapshot(Game); } catch (e) {}
  try { finalKnown = EI.knownDetail(Game, t); } catch (e) {}
  try { uninstallEI(); } catch (e) {}
  try { uninstallPI(); } catch (e) {}
  if (sayOrig) { try { Game.say = sayOrig; } catch (e) {} }

  let rankAtEnd = 'village', national = 0, table = 0, exiled = 0, won = 0;
  try { rankAtEnd = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (rankAtEnd === 'national' || rankAtEnd === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const out = { seed, base: 'competent', policyId: 'competent',
    instrument: 'sim-envoyaccord-instrument (ledgerBeat envoy beats + daily accord snapshot + verb call log, read-only) + postunlock-instrument fights/deaths (read-only)',
    substrate: 'PURE competent policy, no env-gated levers (same substrate as sim-rerunclock)',
    anchorCommit: ANCHOR, priorCensus: 'sim-rerunclock (731xx, 0/16 national/regional, envoys arrive with no accord following)',
    unlock: t.unlock || { w4Day: null, w5Day: null },
    maxWave: result.maxWaveUnlocked || 1, national, table, won, exiled, rankAtEnd,
    days: result.days, endReason: result.endReason,
    envoyDaily: t.envoyDaily || [], envoyBeats: t.envoyBeats || [], envoyVerbs: t.envoyVerbs || {},
    finalSnap, finalKnown,
    envoyErrors: t.envoyErrors || [],
    nPostunlockDeaths: (t.postunlockDeaths || []).length, postunlockDeaths: t.postunlockDeaths || [],
    nPostunlockFights: (t.postunlockFights || []).length, postunlockFights: t.postunlockFights || [],
    nSayRing: (t.sayRing || []).length, sayRing: t.sayRing || [], sayLive: !!t.sayLive,
    instrumentErrors: t.instrumentErrors || [] };
  if (sense) {
    const fn = path.join(evidDir, `sense-${seed}.txt`);
    const header = 'NON-MEASURED SENSE REPLAY — narration:true replay of seed ' + seed + ' (competent, ' + days + 'd). '
      + 'Narration replays DIVERGE from measured runs; this file is sense evidence only, never census.\n'
      + 'anchor=' + ANCHOR + ' endReason=' + result.endReason + ' days=' + result.days + ' rankAtEnd=' + rankAtEnd + '\n'
      + 'NOTE: astral-plane characters (emoji) are rendered as <U+XXXX> escapes below — the shared chunked writer slices bodies by UTF-16 code units, so a chunk boundary inside a surrogate pair corrupts its hash check (the 2026-10-24 sense-write failure: 10/10 hash mismatches on the raw text). BMP text is unaffected, so the transcript is complete in meaning.\n---\n';
    // Astral-escape BEFORE the chunked write (see header note): without
    // this, any chunk boundary landing inside a surrogate pair makes
    // the writer's hash check fail on every retry.
    const safeLines = senseLines.map(l => String(l).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ch => '<U+' + ch.codePointAt(0).toString(16).toUpperCase() + '>'));
    if (write) writeViaWriter(fn, header + safeLines.join('\n') + '\n');
    out.senseLines = senseLines.length;
    out.senseFile = fn;
    return out;
  }
  if (write) {
    fs.mkdirSync(evidDir, { recursive: true });
    writeViaWriter(seedFile(seed), JSON.stringify(out, null, 1) + '\n');
  }
  return out;
}

async function main() {
  const rows = [];
  for (const s of SEEDS) {
    const fn = seedFile(s);
    if (!SENSE) {
      let skip = false;
      if (fs.existsSync(fn)) {
        try { const d = JSON.parse(fs.readFileSync(fn, 'utf8')); if (payloadComplete(d, s, ANCHOR)) { skip = true; logLine(`skip ${s} (resume, anchor ${ANCHOR})`); } } catch (e) {}
      }
      if (skip) { rows.push({ seed: s, skipped: true }); continue; }
    }
    const r = await oneRun(s, { sense: SENSE });
    const envoyN = (r.envoyBeats || []).filter(b => b.isEnvoy).length;
    const row = { seed: r.seed, w4Day: r.unlock.w4Day, w5Day: r.unlock.w5Day, days: r.days,
      endReason: r.endReason, maxWave: r.maxWave, rankAtEnd: r.rankAtEnd, national: r.national,
      table: r.table, won: r.won, beats: (r.envoyBeats || []).length, envoyEvents: envoyN,
      nLinksAtEnd: r.finalSnap ? r.finalSnap.nLinksActive : null,
      proposeCalls: ((r.envoyVerbs.proposeLink || []).length + (r.envoyVerbs.proposeCovenant || []).length + (r.envoyVerbs.proposeTrade || []).length),
      envoyErrors: (r.envoyErrors || []).length };
    rows.push(row);
    logLine(JSON.stringify(row));
    if (PROBE) {
      const beats = r.envoyBeats || [];
      const byEp = {};
      for (const b of beats) byEp[b.epithet || '?'] = (byEp[b.epithet || '?'] || 0) + 1;
      logLine('PROBE-14b contact: ledgerBeats=' + beats.length + ' byEpithet=' + JSON.stringify(byEp) + ' envoyEvents=' + envoyN);
      logLine('PROBE-14b pool: finalSnap=' + JSON.stringify(r.finalSnap) + ' finalKnown=' + JSON.stringify(r.finalKnown));
      logLine('PROBE-14b verbs: proposeLinkFn=' + (typeof r.envoyVerbs !== 'undefined') + ' verbCalls=' + JSON.stringify(row.proposeCalls) + ' accordCalls=' + ((r.envoyVerbs.answerAccord || []).length) + ' formLinks=' + ((r.envoyVerbs._formLink || []).length));
      logLine('PROBE-14b horizon: days=' + r.days + ' endReason=' + r.endReason + ' dailyRows=' + (r.envoyDaily || []).length);
    }
  }
  logLine((PROBE ? 'SIM-ENVOYACCORD-PROBE-DONE ' : SENSE ? 'SIM-ENVOYACCORD-SENSE-DONE ' : 'SIM-ENVOYACCORD-SWEEP-DONE ') + JSON.stringify({ seeds: SEEDS, anchor: ANCHOR }));
}
if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, seedFile, payloadComplete, BAND, SEEDS, ANCHOR };
