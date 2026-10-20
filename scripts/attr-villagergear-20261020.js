#!/usr/bin/env node
// attr-villagergear-20261020.js — mechanism attribution for the pilot GO
// seeds. Re-runs an armed seed deterministically with call-through hooks:
// inviteToParty (vid+day), wave-4 unlock day (sleep sample), party at each
// wave-4 kill, and tbPlayerWait calls during wave-4 fights (yield live?).
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VGEAR=1 SEED=64006 POLICY=leadfeast
//   node scripts/attr-villagergear-20261020.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0' || process.env.VGEAR !== '1') { console.error('STOP: SEATDRIVE=0 VGEAR=1 required.'); process.exit(2); }
const SEED = parseInt(process.env.SEED || '64006', 10);
const POLICY = process.env.POLICY || 'leadfeast';

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
  return VG.withVillagerGear(s, tag + '-vgear', tag + ' + villagergear');
}

(async () => {
  const base = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const policy = stackFor(base, POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'villagergear-attr', fullTelemetry: false });

  const invites = [];
  const oInv = Game.inviteToParty.bind(Game);
  Game.inviteToParty = function (vid, ...a) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const r = oInv(vid, ...a);
    invites.push({ day, vid, ok: !!(r && r.ok) });
    return r;
  };
  let w4day = null;
  const oSleep = Game.sleep.bind(Game);
  Game.sleep = function (...a) {
    try {
      if (w4day == null && Game.unlockedWave && Game.unlockedWave() >= 4)
        w4day = ((Game.state || {}).scholar || {}).day || 0;
    } catch (e) {}
    return oSleep(...a);
  };
  const waits = [];
  const oWait = Game.tbPlayerWait.bind(Game);
  Game.tbPlayerWait = function (...a) {
    try {
      const f = Game.tbfight;
      const w4live = f && (f.fighters || []).some(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled &&
        ((Game.data.monsters || []).find(m => m.id === (x.monsterId || (x.mdef || {}).id)) || {}).wave === 4);
      waits.push({ day: ((Game.state || {}).scholar || {}).day || 0, w4live: !!w4live });
    } catch (e) {}
    return oWait(...a);
  };

  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  const nameOf = (vid) => { try { const p = Game.getPerson(vid); return p && p.name ? String(p.name).split(' ')[0] : vid; } catch (e) { return vid; } };
  console.log(`seed ${SEED} ${POLICY}: wave-4 unlocked day ${w4day}`);
  console.log('invites: ' + invites.map(i => `d${i.day} ${nameOf(i.vid)}${i.ok ? '' : '(refused)'}`).join(', '));
  const wkl = ((Game.state || {}).waveKillLog || []).filter(e => e && (e.w | 0) === 4);
  for (const k of wkl) {
    const inv = invites.find(i => i.vid === k.by && i.ok);
    console.log(`  d${k.d} ${k.mid} by=${nameOf(k.by)} via=${k.via}${k.via === 'companion' ? (inv ? ` (INVITED d${inv.day})` : ' (NOT layer-invited)') : ''}`);
  }
  const w4waits = waits.filter(w => w.w4live);
  console.log(`tbPlayerWait calls during live wave-4 fights: ${w4waits.length} (days ${[...new Set(w4waits.map(w => w.day))].join(',')})`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
