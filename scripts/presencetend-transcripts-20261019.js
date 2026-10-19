#!/usr/bin/env node
// presencetend-transcripts-20261019.js — sense-testing probe for sim-presencetend.
//
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines in windows around (a) wave-3 kills WITH companion damage (the
// presence half: joined companions fighting beside the scholar) and (b)
// tend firings (the tend half), for human reads of whether the joined
// companions read as people and whether the tend beat reads sensibly
// (SENSE-TESTING LAW). READ-ONLY.
//
// SYS-SAY FIX (sim-w5census lesson): sim-harness stubs Game.sysSay to a
// no-op; the probe restores it in the engine's format, routed through the
// wrapped say — otherwise every System-voiced beat vanishes and the fiction
// misreads as silent.
//
// Kill days / tend activity come from the sweep per-seed JSON (single source
// of truth). Writes evidence/2026-10-19/presencetend-transcripts/<arm>-<policy>-s<seed>.txt.
//
// COMMIT THIS SCRIPT with the run — the winsupportdecomp probe was lost
// uncommitted with the removed tree, and the sense-testing for that arm
// rested on a parked control transcript. Never again.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 KILLDISC=1 \
//   ARM=presencetend POLICY=leadpresencetend SEED=65201 PRESTEND=1 \
//   node scripts/presencetend-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
// KILL-PROTOCOL: the presencetend layer may be deleted after a NO-GO.
let PT = null;
try { PT = require(path.join(REPO, 'scripts', 'policies', 'presencetend')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/presencetend.js deleted per kill protocol (sim-presencetend NO-GO) — transcript probe not applicable.');
  process.exit(0);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }

const ARM = process.env.ARM || 'presencetend';
const POLICY = process.env.POLICY || 'leadpresencetend';
const SEED = parseInt(process.env.SEED || '65201', 10);
if (ARM !== 'control' && ARM !== 'presencetend') { console.error('STOP: ARM must be control|presencetend.'); process.exit(2); }
if (ARM === 'presencetend' && !PT.layerOn()) { console.error('STOP: PRESTEND=1 required for ARM=presencetend.'); process.exit(2); }

function policyFor() {
  const base = POLICY === 'leadpresencetend' || POLICY === 'leadfeast' ? 'lead' : 'belong';
  const policyId = base === 'lead' ? 'leadfeast' : 'belongfeast';
  const tfBase = base === 'lead' ? TF.leadfeast : TF.belongfeast;
  const rp = RP.withReposition(tfBase, `${base}-rp`, `${policyId} + reposition`);
  const vet = VR.withVetrel(rp, `${base}-vetrel-rp`, `${policyId} + reposition + VETREL=1`);
  const wd = WD.withWinDefer(vet, `${base}-windefer`, `${policyId} + win-side layers`);
  const sd = SD.withSeatDrive(wd, `${base}-windefer`, `${policyId} + win-side stack`);
  if (ARM === 'presencetend') return PT.withPresencetend(sd, `${base}-presencetend`, `${policyId} + PRESTEND=1`);
  return sd;
}

const diagFp = path.join(REPO, 'evidence', '2026-10-19', 'perseed-presencetend', `${ARM}-${POLICY}-s${SEED}.json`);
let diag = null;
try { diag = JSON.parse(fs.readFileSync(diagFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read sweep ${diagFp} — run the sweep first.`); process.exit(2); }
const compKills = (diag.kills || []).filter(k => k.dmg && (k.dmg.companion | 0) > 0);
const tendFires = (diag.beat || {}).presencetendTends || 0;
console.log(`presencetend: goInside=${(diag.beat || {}).presencetendGoInside} steps=${(diag.beat || {}).presencetendStep} tends=${tendFires}`);
console.log(`transcribing ${compKills.length} companion-damage kill(s): ` + compKills.map(k => `d${k.d} ${k.mid} (comp ${k.dmg.companion})`).join(', '));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'presencetend-transcript', fullTelemetry: false });
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
  // Tend telemetry: wrap tendVillager to stamp tend firings into the log.
  try {
    const ot = Game.tendVillager.bind(Game);
    Game.tendVillager = function (vid) {
      try {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
        let nm = vid;
        try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.name) nm = String(p.name).split(' ')[0]; } catch (e2) {}
        lines.push(`[d${day}] [TEND] scholar tends ${nm}`);
      } catch (e) {}
      return ot.apply(this, arguments);
    };
  } catch (e) {}
  await quietLog(async () => { await runDays(Game, policyFor(), { days: 180, manifest: undefined, sampleEvery: 30 }); });

  // Keep windows around companion-damage kill days (±3 days); and if tend
  // fired, also keep ±3d around the logged [TEND] days.
  const keep = new Set();
  for (const t of compKills) for (let d = t.d - 3; d <= t.d + 3; d++) keep.add(d);
  for (const l of lines) {
    const m = /^\[d(\d+)\] \[TEND\]/.exec(l);
    if (m) { const d = parseInt(m[1], 10); for (let dd = d - 3; dd <= d + 3; dd++) keep.add(dd); }
  }
  const out = lines.filter(l => {
    const m = /^\[d(\d+)\]/.exec(l);
    return m && keep.has(parseInt(m[1], 10));
  });
  const dir = path.join(REPO, 'evidence', '2026-10-19', 'presencetend-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${ARM}-${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(fp, out.join('\n') + '\n');
  console.log(`wrote ${fp} (${out.length} lines; ${compKills.length} companion kills, tend markers ${lines.filter(l => /\[TEND\]/.test(l)).length})`);
})().catch(e => { console.error('TRANSCRIPT FAIL', e); process.exit(1); });
