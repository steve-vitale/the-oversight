#!/usr/bin/env node
// killdisc-transcripts-20261018.js — sense-testing probe for sim-killdisc.
//
// Re-runs a diagnostic seed (deterministic) with Game.say wrapped and
// captures SAY lines in windows around wave-3 kills WITH companion damage,
// for human reads of whether the scholar-takes-the-kill-despite-companion-
// damage shape is sensible or noise. READ-ONLY.
//
// Kill days come from the diagnostic per-seed JSON (single source of truth).
// Writes evidence/2026-10-18/killdisc-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//        POLICY=leadfeast SEED=63204 node scripts/killdisc-transcripts-20261018.js
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
const SEED = parseInt(process.env.SEED || '63204', 10);
const policy = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;

const diagFp = path.join(REPO, 'evidence', '2026-10-18', 'perseed-killdisc-diag', `${POLICY}-s${SEED}.json`);
let diag = null;
try { diag = JSON.parse(fs.readFileSync(diagFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read diagnostic ${diagFp} — run the sweep first.`); process.exit(2); }
// Kills with companion damage (the kill-securing question's instances).
const targets = (diag.kills || []).filter(k => k.dmg && (k.dmg.companion | 0) > 0);
if (!targets.length) { console.log('no companion-damage w3 kills in this run — nothing to transcribe.'); process.exit(0); }
console.log(`transcribing ${targets.length} companion-damage kill(s): ` + targets.map(k => `d${k.d} ${k.mid} (comp ${k.dmg.companion})`).join(', '));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'killdisc-transcript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] ${String(x).slice(0, 400)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const outDir = path.join(REPO, 'evidence', '2026-10-18', 'killdisc-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const windows = [];
  for (const t of targets) {
    const win = lines.filter(l => {
      const m = /^\[d(\d+)\]/.exec(l);
      return m && Math.abs(parseInt(m[1], 10) - t.d) <= 2;
    });
    windows.push(`===== d${t.d} ${t.mid} — killer ${t.byName} (scholar) despite companion damage ${t.dmg.companion} vs scholar ${t.dmg.scholar} =====\n` + win.join('\n'));
  }
  const fp = path.join(outDir, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(fp, windows.join('\n\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say-lines captured)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e && e.stack || e); process.exit(2); });
