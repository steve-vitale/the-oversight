#!/usr/bin/env node
// armory-transcripts-20261019.js — sense-testing probe for sim-armory.
//
// Re-runs an armed pilot seed (deterministic) with Game.say wrapped and
// captures SAY lines in windows around (a) wave-3 kills WITH companion
// damage and (b) armory-donation beats, for human reads of whether armed
// companions participate meaningfully. READ-ONLY.
//
// Kill days come from the pilot per-seed JSON (single source of truth).
// Writes evidence/2026-10-19/armory-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 ARMORY=1 \
//        POLICY=leadarmory SEED=63511 node scripts/armory-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL: the armory layer was deleted after the pilot NO-GO.
let AR = null;
try { AR = require(path.join(REPO, 'scripts', 'policies', 'armory')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/armory.js deleted per kill protocol (sim-armory NO-GO) — transcript probe not applicable.');
  process.exit(0);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
if (!AR.layerOn()) { console.error('STOP: ARMORY=1 required.'); process.exit(2); }

const POLICY = process.env.POLICY || 'leadarmory';
const SEED = parseInt(process.env.SEED || '63511', 10);
const policy = POLICY === 'leadarmory' ? AR.leadarmory : AR.belongarmory;

const diagFp = path.join(REPO, 'evidence', '2026-10-19', 'perseed-armory-pilot', `armed-${POLICY}-s${SEED}.json`);
let diag = null;
try { diag = JSON.parse(fs.readFileSync(diagFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read pilot ${diagFp} — run the sweep first.`); process.exit(2); }
const targets = (diag.kills || []).filter(k => k.dmg && (k.dmg.companion | 0) > 0);
console.log(`arming: donations=${diag.donations} armoryEnd=${diag.armoryEnd} armedCompanions=${diag.armedCompanions}`);
console.log(`transcribing ${targets.length} companion-damage kill(s): ` + targets.map(k => `d${k.d} ${k.mid} (comp ${k.dmg.companion})`).join(', '));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'armory-transcript', fullTelemetry: false });
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
  // windows: 30 lines before/after each target day + donation beats
  const out = [];
  const targetDays = new Set(targets.map(k => k.d));
  const dayIdx = [];
  lines.forEach((ln, i) => { const m = ln.match(/^\[d(\d+)\]/); if (m) dayIdx.push({ i, day: +m[1] }); });
  for (const t of targets) {
    out.push(`\n===== d${t.d} ${t.mid} — companion damage ${t.dmg.companion}/${t.dmg.scholar + t.dmg.companion + t.dmg.other} =====`);
    const idxs = dayIdx.filter(x => x.day >= t.d - 1 && x.day <= t.d + 1).map(x => x.i);
    if (!idxs.length) { out.push('(no SAY lines in window)'); continue; }
    const lo = Math.max(0, idxs[0] - 20), hi = Math.min(lines.length, idxs[idxs.length - 1] + 25);
    for (let i = lo; i < hi; i++) out.push(lines[i]);
  }
  // donation beats: SAY lines mentioning the armory
  const donateLines = lines.filter(ln => /armor/i.test(ln)).slice(0, 60);
  if (donateLines.length) {
    out.push('\n===== armory donation beats (first 60) =====');
    for (const ln of donateLines) out.push(ln);
  }
  const dir = path.join(REPO, 'evidence', '2026-10-19', 'armory-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${POLICY}-s${SEED}.txt`), out.join('\n') + '\n');
  console.log(`wrote armory-transcripts/${POLICY}-s${SEED}.txt (${out.length} lines)`);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
