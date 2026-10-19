#!/usr/bin/env node
// doorpositions-transcripts-20261019.js — sense-testing probe for
// sim-doorpositions (SENSE-TESTING LAW).
//
// Re-runs ONE armed sweep seed (deterministic) with Game.say wrapped and
// prints SAY lines in windows around wave-3 TB fights where companions
// JOINED — for a human read of whether the fix's extra joins read as
// people arriving, not teleports. READ-ONLY (does not alter the sweep).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//        POLICY=belongfeast SEED=63407 \
//        node scripts/doorpositions-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0' || process.env.NODEWITNESS !== '1') { console.error('STOP: SEATDRIVE=0 NODEWITNESS=1 required.'); process.exit(2); }
if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }

const POLICY = process.env.POLICY || 'belongfeast';
const SEED = parseInt(process.env.SEED || '63407', 10);
const policy = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
const sweep = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-18', 'perseed-doorpositions-armed', `${POLICY}-s${SEED}.json`), 'utf8'));
const targets = (sweep.fights || []).filter(f => (f.joiners || []).length > 0).slice(0, 4);
if (!targets.length) { console.log('no wave-3 fights with joiners in this run.'); process.exit(0); }
console.log('transcribing: ' + targets.map(f => `d${f.day} ${f.mid} joiners=[${(f.joiners || []).map(j => j.name).join(',')}]`).join(' | '));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'compresence', fullTelemetry: false });
  await setupGame(Game);
  const log = [];
  const _say = Game.say.bind(Game);
  Game.say = function (msg) { try { log.push({ d: (Game.state.scholar || {}).day, msg: String(msg) }); } catch (e) {} return _say(msg); };
  const _clog = console.log; console.log = () => {};
  try { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); }
  finally { console.log = _clog; }
  for (const t of targets) {
    _clog(`\n===== d${t.day} ${t.mid} — joiners: ${(t.joiners || []).map(j => j.name).join(', ')} =====`);
    const win = log.filter(l => l.d >= t.day - 1 && l.d <= t.day + 1).slice(-40);
    for (const l of win) _clog(`[d${l.d}] ${l.msg}`);
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
