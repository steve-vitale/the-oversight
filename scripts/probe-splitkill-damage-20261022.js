#!/usr/bin/env node
// probe-splitkill-damage-20261022.js — design probe for sim-splitkill.
//
// Measures, on the pre-seat control substrate (SPLITKILL unset, VGEAR
// unset), the companion damage distribution vs wave-4 monsters in scholar
// TB fights, so the splitkill layer's YIELD BAND is anchored in observed
// data rather than invented. Also measures the scholar's per-hit damage
// to calibrate the overshoot guard.
//
// Records per (fight, round): companion damage (sum + max single hit),
// scholar max single hit. Titan-class monsters (herald/nielsen/finale)
// are excluded from the wave-4 set.
//
// This is a DESIGN instrument (calibrates a layer parameter), not the
// pre-registered measurement. The band definition + probe provenance go
// in the evidence header before the pilot.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   SEEDS=65501,65502 node scripts/probe-splitkill-damage-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('PROBE STOP: NODEWITNESS=1 required.'); process.exit(2); }
for (const k of ['VGEAR', 'SPLITKILL', 'VETREL', 'REPOSITION', 'KILLDISC']) {
  if (process.env[k] === '1') { console.error(`PROBE STOP: ${k} must be unset for the control substrate.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));

const TITANS = new Set(['herald', 'nielsen', 'finale']);
function midOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; }
  catch (e) { return 1; }
}
function srcKind(Game, sourceLabel, sourceKey) {
  try {
    const sf = (typeof Game.tbFighter === 'function') ? Game.tbFighter(sourceKey) : null;
    if (sf && sf.kind === 'villager') return 'companion';
  } catch (e) {}
  const lab = String(sourceLabel || '');
  if (/^(you|your)\b/i.test(lab) || sourceKey === 'p') return 'scholar';
  return 'other';
}

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  return SD.withSeatDrive(w, tag + '-seatdrive', tag + ' seatdrive');
}

async function oneRun(seed, baseId) {
  const base = baseId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const policy = stackFor(base, baseId);
  const { Game } = await loadGame({ seed, mode: 'splitkill-probe', fullTelemetry: false });
  // per (fight,round): {comp: total, compMaxHit, scholarMaxHit, compRounds:Set-ish count}
  const rounds = {};
  const fightWaves = {};
  const orig = Game.tbDamage;
  if (typeof orig === 'function') {
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey) {
      let r;
      try { r = orig.apply(this, arguments); } catch (e) { throw e; }
      try {
        const f = Game.tbfight;
        if (!f) return r;
        const tgt = (typeof Game.tbFighter === 'function') ? Game.tbFighter(targetKey) : null;
        if (!tgt || tgt.kind !== 'monster') return r;
        const mid = midOf(tgt);
        if (TITANS.has(mid)) return r;
        if ((waveOf(Game, mid) | 0) !== 4) return r;
        const final = +r || 0;
        if (!(final > 0)) return r;
        const kind = srcKind(Game, sourceLabel, sourceKey);
        if (kind === 'other') return r;
        const key = String(f.id) + '::' + (f.round || 0);
        const rec = rounds[key] || (rounds[key] = { comp: 0, compMaxHit: 0, scholarMaxHit: 0, compHits: 0 });
        if (kind === 'companion') { rec.comp += final; rec.compHits++; if (final > rec.compMaxHit) rec.compMaxHit = final; }
        else if (final > rec.scholarMaxHit) rec.scholarMaxHit = final;
        fightWaves[String(f.id)] = 4;
      } catch (e) {}
      return r;
    };
  }
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { Game.tbDamage = orig; } catch (e) {}
  const gameDays = ((Game.state || {}).scholar || {}).day || 0;
  return { seed, baseId, gameDays, rounds };
}

async function main() {
  const seeds = (process.env.SEEDS || '65501,65502').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const bases = ['leadfeast', 'belongfeast'];
  const all = [];
  for (const seed of seeds) {
    for (const b of bases) {
      const r = await oneRun(seed, b);
      const nR = Object.keys(r.rounds).length;
      console.log(`probe done: seed ${seed} ${b} days=${r.gameDays} w4-fight-rounds=${nR}`);
      all.push(r);
    }
  }
  // Aggregate per-round companion damage (rounds with >=1 companion hit).
  const compRound = [], compMaxHit = [], scholarMaxHit = [];
  for (const r of all) {
    for (const k of Object.keys(r.rounds)) {
      const rec = r.rounds[k];
      if (rec.compHits > 0) { compRound.push(rec.comp); compMaxHit.push(rec.compMaxHit); }
      if (rec.scholarMaxHit > 0) scholarMaxHit.push(rec.scholarMaxHit);
    }
  }
  const pct = (arr, p) => {
    if (!arr.length) return null;
    const s = arr.slice().sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))];
  };
  const out = {
    nFightRounds: Object.keys(all.reduce((a, r) => Object.assign(a, r.rounds), {})).length,
    compRounds: compRound.length,
    compPerRound: { n: compRound.length, p50: pct(compRound, 0.5), p75: pct(compRound, 0.75), p90: pct(compRound, 0.9), max: pct(compRound, 0.999) },
    compMaxHit: { n: compMaxHit.length, p50: pct(compMaxHit, 0.5), p90: pct(compMaxHit, 0.9), max: pct(compMaxHit, 0.999) },
    scholarMaxHit: { n: scholarMaxHit.length, p50: pct(scholarMaxHit, 0.5), p90: pct(scholarMaxHit, 0.9), max: pct(scholarMaxHit, 0.999) },
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch(e => { console.error('PROBE FAIL:', e && e.stack || e); process.exit(1); });
