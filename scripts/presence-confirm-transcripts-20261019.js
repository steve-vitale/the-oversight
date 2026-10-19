#!/usr/bin/env node
// presence-confirm-transcripts-20261019.js — sense-testing probe for sim-presence CONFIRM.
//
// Re-runs a presence confirm seed (deterministic) with Game.say wrapped and
// captures SAY lines in windows around wave-3 kills WITH companion damage,
// for human reads of whether the joining companions read as people fighting
// beside the scholar (SENSE-TESTING LAW). READ-ONLY.
//
// SYS-SAY FIX (sim-w5census lesson): sim-harness stubs Game.sysSay to a
// no-op; the probe restores it in the engine's format, routed through the
// wrapped say — otherwise every System-voiced beat vanishes and the fiction
// misreads as silent.
//
// Kill days come from the pilot per-seed JSON (single source of truth).
// Writes evidence/2026-10-19/presence-confirm-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 PRESENCE=1 \
//        POLICY=leadpresence SEED=63541 node scripts/presence-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL: the presence layer may be deleted after a pilot NO-GO.
let PR = null;
try { PR = require(path.join(REPO, 'scripts', 'policies', 'presence')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/presence.js deleted per kill protocol (sim-presence NO-GO) — transcript probe not applicable.');
  process.exit(0);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
if (!PR.layerOn()) { console.error('STOP: PRESENCE=1 required.'); process.exit(2); }

const POLICY = process.env.POLICY || 'leadpresence';
const SEED = parseInt(process.env.SEED || '63541', 10);
const policy = POLICY === 'leadpresence' ? PR.leadpresence : PR.belongpresence;

const diagFp = path.join(REPO, 'evidence', '2026-10-19', 'perseed-presence-confirm', `presence-${POLICY}-s${SEED}.json`);
let diag = null;
try { diag = JSON.parse(fs.readFileSync(diagFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read pilot ${diagFp} — run the sweep first.`); process.exit(2); }
const targets = (diag.kills || []).filter(k => k.dmg && (k.dmg.companion | 0) > 0);
console.log(`presence: goInside=${(diag.beat || {}).presenceGoInside} steps=${(diag.beat || {}).presenceStep}`);
console.log(`transcribing ${targets.length} companion-damage kill(s): ` + targets.map(k => `d${k.d} ${k.mid} (comp ${k.dmg.companion})`).join(', '));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'presence-transcript', fullTelemetry: false });
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
  // SYS-SAY RESTORE (sim-w5census): route the System's voice through the wrap.
  try {
    Game.sysSay = function (x) {
      try {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
        lines.push(`[d${day}] [SYSTEM] ${String(x).slice(0, 400)}`);
      } catch (e) {}
      return osay.call(this, '[SYSTEM] ' + x);
    };
  } catch (e) {}
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  // Keep windows around target kill days (±3 days).
  const keep = new Set();
  for (const t of targets) for (let d = t.d - 3; d <= t.d + 3; d++) keep.add(d);
  const out = lines.filter(l => {
    const m = /^\[d(\d+)\]/.exec(l);
    return m && keep.has(parseInt(m[1], 10));
  });
  const dir = path.join(REPO, 'evidence', '2026-10-19', 'presence-confirm-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(fp, out.join('\n') + '\n');
  console.log(`wrote ${fp} (${out.length} lines)`);
})().catch(e => { console.error('TRANSCRIPT FAIL', e); process.exit(1); });
