#!/usr/bin/env node
// vetarm-transcripts-20261019.js — sense-testing probe for sim-vetarm.
//
// Re-runs an armed pilot seed (deterministic) with Game.say wrapped and
// captures SAY lines in windows around (a) wave-3 kills WITH companion
// damage and (b) armory-donation / patrol-assignment beats, for human
// reads of whether armed companions behave sensibly. READ-ONLY.
//
// Kill days come from the pilot per-seed JSON (single source of truth).
// Writes evidence/2026-10-19/vetarm-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETARM=1 \
//        POLICY=leadvetarm SEED=63504 node scripts/vetarm-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL: the vetarm layer was deleted after the pilot NO-GO.
let VA = null;
try { VA = require(path.join(REPO, 'scripts', 'policies', 'vetarm')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/vetarm.js deleted per kill protocol (sim-vetarm NO-GO) — transcript probe not applicable.');
  process.exit(0);
}
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }
if (!VA.layerOn()) { console.error('STOP: VETARM=1 required.'); process.exit(2); }

const POLICY = process.env.POLICY || 'leadvetarm';
const SEED = parseInt(process.env.SEED || '63504', 10);
const policy = POLICY === 'leadvetarm' ? VA.leadvetarm : VA.belongvetarm;

const diagFp = path.join(REPO, 'evidence', '2026-10-19', 'perseed-vetarm-pilot', `vetarm-${POLICY}-s${SEED}.json`);
let diag = null;
try { diag = JSON.parse(fs.readFileSync(diagFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read pilot ${diagFp} — run the sweep first.`); process.exit(2); }
const targets = (diag.kills || []).filter(k => k.dmg && (k.dmg.companion | 0) > 0);
console.log(`arming: donations=${diag.donations} patrolAssigns=${diag.patrolAssigns} armoryEnd=${diag.armoryEnd} armedCompanions=${diag.armedCompanions}`);
console.log(`transcribing ${targets.length} companion-damage kill(s): ` + targets.map(k => `d${k.d} ${k.mid} (comp ${k.dmg.companion})`).join(', '));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'vetarm-transcript', fullTelemetry: false });
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
  const outDir = path.join(REPO, 'evidence', '2026-10-19', 'vetarm-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const windows = [];
  for (const t of targets) {
    const win = lines.filter(l => {
      const m = /^\[d(\d+)\]/.exec(l);
      return m && Math.abs(parseInt(m[1], 10) - t.d) <= 2;
    });
    windows.push(`===== d${t.d} ${t.mid} — killer ${t.byName} (companion dmg ${t.dmg.companion} vs scholar ${t.dmg.scholar}, shape ${t.shape}) =====\n` + win.join('\n'));
  }
  // armory/patrol beat lines across the whole run (grep the full log)
  const beatLines = lines.filter(l => /armory|donat|patrol|perimeter|stone knife|Stone knife/i.test(l));
  windows.push(`===== ARMING/PATROL BEAT LINES (${beatLines.length}) =====\n` + beatLines.slice(0, 120).join('\n'));
  const fp = path.join(outDir, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(fp, windows.join('\n\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say-lines captured)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e && e.stack || e); process.exit(2); });
