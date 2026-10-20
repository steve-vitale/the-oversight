#!/usr/bin/env node
// villagergear-transcripts-20261020.js — sense-testing probe for
// sim-villagergear. Re-runs a sweep seed (deterministic) with Game.say
// wrapped and captures SAY lines around the run's first villager wave-4
// kill (or the first wave-4 kill if none), for a human read of whether
// armed villagers behave like people fighting a herald — or stat-bags
// (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-20/villagergear-transcripts/<arm>-<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   POLICY=leadfeast ARM=vgear SEED=64001 node scripts/villagergear-transcripts-20261020.js
// (VGEAR=1 required when ARM=vgear.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const ARM = process.env.ARM || 'vgear';
const SEED = parseInt(process.env.SEED || '64001', 10);
if (ARM === 'vgear' && process.env.VGEAR !== '1') { console.error('STOP: VGEAR=1 required for ARM=vgear.'); process.exit(2); }

const EVIDSEED = path.join(REPO, 'evidence', '2026-10-20', 'perseed-villagergear-pilot',
  `${ARM}-${POLICY}${ARM === 'vgear' ? '-vgear' : ''}-s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const kills = (seedRec.w4killsDetail || []).slice().sort((a, b) => a.d - b.d);
const vill = kills.find(k => k.by && k.via && k.via !== 'player');
const anchor = vill ? vill.d : (kills.length ? kills[0].d : Math.max(1, (seedRec.gameDays || 60) - 15));
const keep = new Set();
for (let d = anchor - 2; d <= anchor + 5; d++) if (d >= 1) keep.add(d);

const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const VG = require(path.join(REPO, 'scripts', 'policies', 'villagergear'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-windefer', tag + '-windefer + seatdrive');
  if (ARM === 'vgear') return VG.withVillagerGear(s, tag + '-vgear', tag + ' + villagergear');
  return s;
}

(async () => {
  const base = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const policy = stackFor(base, POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'villagergear-xscript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (keep.has(day)) lines.push(`[d${day}] SAY: ${String(x).slice(0, 700)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const dir = path.join(REPO, 'evidence', '2026-10-20', 'villagergear-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${ARM}-${POLICY}-s${SEED}.txt`);
  const head = `# ${ARM} ${POLICY} s${SEED} — window d${anchor - 2}..d${anchor + 5} around ` +
    (vill ? `VILLAGER wave-4 kill (${vill.mid} by ${vill.byName} via=${vill.via} d${vill.d})` :
      kills.length ? `first wave-4 kill (${kills[0].mid} d${kills[0].d})` : 'run tail (no wave-4 kills)') + '\n\n';
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} SAY lines)`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
