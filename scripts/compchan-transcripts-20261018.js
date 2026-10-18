#!/usr/bin/env node
// compchan-transcripts-20261018.js — sense-testing probe for sim-compchan.
// Re-runs a census seed (deterministic) with Game.say wrapped and captures
// SAY lines in windows around each COMPANION wave-3+ kill day, for human
// reads of whether the base policy's organic companion blooding is sensible
// (collective fiction, consequences) or noise. READ-ONLY.
//
// Kill days come from the census per-seed JSON (single source of truth).
// Writes evidence/2026-10-18/compchan-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//        POLICY=leadfeast SEED=63101 node scripts/compchan-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }

const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '63101', 10);
const policy = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;

// Companion kill days from the census per-seed JSON (single source of truth).
const censusFp = path.join(REPO, 'evidence', '2026-10-18', 'perseed-compchan', `${POLICY}-s${SEED}.json`);
let census = null;
try { census = JSON.parse(fs.readFileSync(censusFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read census ${censusFp} — run the sweep first.`); process.exit(2); }
const compKills = (census.kills || []).filter(k => k.companion);
if (!compKills.length) { console.log('no companion w3+ kills in this run — nothing to transcribe.'); process.exit(0); }

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'compchan-transcript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] ${String(x).slice(0, 500)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  // Determinism check: the re-run's companion kill set must match the census.
  const scholarVidEnd = Game.villagerId || null;
  const reKills = [];
  try {
    for (const e of (Game.state.waveKillLog || [])) {
      if (!e || (e.w | 0) < 3 || !e.by || e.by === scholarVidEnd) continue;
      reKills.push(`${e.d}|${e.mid}|${String(e.by).slice(0, 8)}`);
    }
  } catch (e) {}
  const ceKills = compKills.map(k => `${k.d}|${k.mid}|${String(k.by).slice(0, 8)}`);
  const same = reKills.length === ceKills.length && reKills.every((x, i) => x === ceKills[i]);
  const keep = new Set();
  for (const k of compKills) for (let d = k.d - 2; d <= k.d + 2; d++) if (d >= 1) keep.add(d);
  const win = lines.filter(l => {
    const m = /^\[d(\d+)\]/.exec(l);
    return m && keep.has(parseInt(m[1], 10));
  });
  const dir = path.join(REPO, 'evidence', '2026-10-18', 'compchan-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const head = `# compchan transcript — ${POLICY} seed ${SEED} (base policy, no staffing)\n` +
    `# determinism vs census: ${same ? 'MATCH' : 'MISMATCH'} (${reKills.length} re-run vs ${ceKills.length} census companion kills)\n` +
    `# companion wave-3+ kills in run:\n` +
    compKills.map(k => `d${k.d} ${k.mid} by=${k.byName} (${String(k.by).slice(0, 8)}) via=${k.via} shape=${k.shape}${k.inParty ? ' IN-PARTY' : ''}${k.misTag ? ' MIS-TAG' : ''}`).join('\n') +
    `\n# say-lines in d[kill-2, kill+2] windows: ${win.length} (of ${lines.length} total)\n\n`;
  fs.writeFileSync(fp, head + win.join('\n') + '\n');
  console.log(`wrote ${fp} (${win.length} window lines, ${compKills.length} companion kills, determinism ${same ? 'MATCH' : 'MISMATCH'})`);
  if (!same) process.exit(3);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
