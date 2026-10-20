#!/usr/bin/env node
// vgearbeats-transcripts-20261020.js — sense-testing probe for sim-vgearbeats.
// Re-runs a beats-on sweep seed (deterministic) with Game.say wrapped and
// Game.sysSay restored, buffers ALL say lines with day stamps, then writes
// full-transcript windows (±2d) around the first donation beat, first
// invite beat, and first yield beat, for a human read of the voice:
// do the beats read like people (one-beat-at-a-time), do they name the
// right villagers/weapons, do they repeat?
// (SENSE-TESTING LAW.)
//
// READ-ONLY. Writes evidence/2026-10-20/vgearbeats-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VGEAR=1 VGEARBEATS=1 \
//   POLICY=leadfeast SEED=64023 node scripts/vgearbeats-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const VG = require(path.join(REPO, 'scripts', 'policies', 'villagergear'));
const VB = require(path.join(REPO, 'scripts', 'policies', 'vgearbeats'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'VGEAR', 'VGEARBEATS']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64023', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVIDSEED = path.join(REPO, 'evidence', '2026-10-20', 'perseed-vgearbeats', `vbeats-${POLICY}-vbeats-s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-windefer', tag + '-windefer + seatdrive');
  const g = VG.withVillagerGear(s, tag + '-vgear', tag + ' + villagergear');
  return VB.withVGearBeats(g, tag + '-vbeats', tag + ' + vgearbeats');
}

const BEAT_RES = [/on the armory rack/, /joins the armory/, /stand ready/, /hold your strike/, /This kill belongs to/];
function isBeatLine(s) { return BEAT_RES.some(re => re.test(s)); }

(async () => {
  const base = POLICY === 'belongfeast' ? TF.belongfeast : TF.leadfeast;
  const policy = stackFor(base, POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'vgearbeats-transcripts', fullTelemetry: false });
  await setupGame(Game);
  const buf = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      buf.push({ day, line: `[d${day}] SAY: ${String(x).slice(0, 700)}` });
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  // sysSay restore (probe-artifact lesson): the System voice must be audible.
  try {
    const osys = Game.sysSay ? Game.sysSay.bind(Game) : null;
    Game.sysSay = function (text) {
      try {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
        buf.push({ day, line: `[d${day}] SYS: ${String(text).slice(0, 700)}` });
      } catch (e) {}
      if (osys) return osys.apply(this, arguments);
    };
  } catch (e) {}
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });

  // Windows around the first beat of each type (±2d).
  const firsts = {};
  for (const b of buf) {
    if (!isBeatLine(b.line)) continue;
    const kind = /armory/.test(b.line) ? 'donation' : /stand ready/.test(b.line) ? 'invite' : 'yield';
    if (!(kind in firsts)) firsts[kind] = b.day;
  }
  const keep = new Set();
  for (const k of Object.values(firsts)) for (let d = k - 2; d <= k + 2; d++) if (d >= 1) keep.add(d);
  if (!keep.size) for (let d = 1; d <= 10; d++) keep.add(d);
  const lines = buf.filter(b => keep.has(b.day)).map(b => b.line);
  const outDir = path.join(REPO, 'evidence', '2026-10-20', 'vgearbeats-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const fp = path.join(outDir, `${POLICY}-s${SEED}.txt`);
  const header = `# vgearbeats ${POLICY} s${SEED} — sense windows around first beats\n` +
    `# first beats: ${JSON.stringify(firsts)} (sweep: don=${seedRec.vgDonations}/${seedRec.beatsDon} inv=${seedRec.vgInvitesOk}/${seedRec.beatsInv} yld=${seedRec.vgYields}/${seedRec.beatsYield})\n\n`;
  fs.writeFileSync(fp, header + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} lines, windows ${JSON.stringify(firsts)})`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
