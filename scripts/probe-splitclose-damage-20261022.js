#!/usr/bin/env node
// probe-splitclose-damage-20261022.js — design probe for sim-splitclose.
//
// Measures, on the armorydrive substrate (ARMORYDRIVE=1, SPLITCLOSE unset),
// the companion damage distribution vs wave-4 monsters in scholar TB
// fights, so the splitclose layer's YIELD BAND is anchored in observed
// data rather than invented. The sibling sim-dmg-bands arm has published
// no numbers yet — this probe is the band's provenance.
//
// Differences from the splitkill probe (scripts/probe-splitkill-damage-20261022.js):
//   1. Substrate: armorydrive's armedFor (companions staged + armed) — the
//      channel where companion wave-4 kills actually happen (armorydrive-
//      confirm: 8/8 villager wave-4 kills were TB via=companion TRICKTAG
//      kills; 0 field-channel kills on that substrate).
//   2. Companion per-round damage is split by FEASTED state — the
//      drivenofeast kill (finding #794) proved companion wave-4 kills rode
//      the FEASTED x2.53 multiplier. The splitclose discipline uses the
//      multiplier HONESTLY: the yield band is feasted-aware, and the
//      evidence attributes kills by FEASTED-window.
//   3. Records engaged-companion presence per wave-4 fight (the splitkill
//      failure mode: engagedCompanions() empty in all 59 fights).
//   4. Measures the scholar's max single-hit damage for the overshoot
//      guard (SCHOLAR_EST_INIT), on THIS substrate (FEASTED scholar hits
//      harder than the splitkill probe's 202).
//
// Records per (fight,round): companion damage (sum + max single hit),
// scholar max single hit, feasted flag. Titan-class monsters
// (herald/nielsen/finale) excluded from the wave-4 set.
//
// This is a DESIGN instrument (calibrates layer parameters), not the
// pre-registered measurement. Band definitions + probe provenance go in
// the evidence header before the pilot.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 SEEDS=65601,65602 node scripts/probe-splitclose-damage-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.ARMORYDRIVE !== '1') { console.error('PROBE STOP: ARMORYDRIVE=1 required (the staging substrate).'); process.exit(2); }
for (const k of ['SPLITCLOSE', 'KILLDISC', 'FEASTDISC']) {
  if (process.env[k] === '1') { console.error(`PROBE STOP: ${k} must be unset for the probe substrate.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const TITANS = new Set(['herald', 'nielsen', 'finale']);
function midOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; }
  catch (e) { return 1; }
}
function srcKind(Game, sourceLabel, sourceKey) {
  try {
    const sf = (typeof Game.tbFighter === 'function') ? Game.tbFighter(sourceKey) : null;
    if (sf && (sf.kind === 'villager' || sf.kind === 'ally')) return 'companion';
  } catch (e) {}
  const lab = String(sourceLabel || '');
  if (/^(you|your)\b/i.test(lab) || sourceKey === 'p') return 'scholar';
  return 'other';
}
function feastedNow(Game) {
  try { return !!(Game.feastedActive && Game.feastedActive()); } catch (e) { return false; }
}
// Engaged party companions in the current TB fight (splitkill's read).
function engagedCompanions(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    const party = (Game.partyMembers ? Game.partyMembers() : []) || [];
    return (f.fighters || []).filter(x => x && x.alive && !x.fled &&
      (x.kind === 'villager' || x.kind === 'ally') &&
      x.villagerId && party.includes(x.villagerId));
  } catch (e) { return []; }
}

async function oneRun(seed, baseId) {
  const policy = AD.armedFor(baseId);
  const { Game } = await loadGame({ seed, mode: 'splitclose-probe', fullTelemetry: false });
  const rounds = {};   // key fightId::round -> {comp, compMaxHit, scholarMaxHit, compHits, feasted}
  const fights = {};   // fightId -> {wave4: bool, hadCompanion: bool, feastedEver: bool}
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
        const fid = String(f.id);
        const fr = fights[fid] || (fights[fid] = { wave4: true, hadCompanion: false, feastedEver: false });
        const feasted = feastedNow(Game);
        if (feasted) fr.feastedEver = true;
        const key = fid + '::' + (f.round || 0) + '::' + (feasted ? 'F' : 'S');
        const rec = rounds[key] || (rounds[key] = { comp: 0, compMaxHit: 0, scholarMaxHit: 0, compHits: 0, feasted });
        if (kind === 'companion') {
          rec.comp += final; rec.compHits++;
          if (final > rec.compMaxHit) rec.compMaxHit = final;
          fr.hadCompanion = true;
        } else if (final > rec.scholarMaxHit) rec.scholarMaxHit = final;
      } catch (e) {}
      return r;
    };
  }
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { Game.tbDamage = orig; } catch (e) {}
  // Engaged-companion presence per wave-4 fight is approximated by
  // hadCompanion (any companion damage landed) — the splitkill failure
  // mode was zero presence at all.
  const gameDays = ((Game.state || {}).scholar || {}).day || 0;
  return { seed, baseId, gameDays, rounds, fights };
}

function pct(arr, q) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.floor(q * s.length));
  return s[i];
}

async function main() {
  const seeds = (process.env.SEEDS || '65601,65602').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const bases = ['leadfeast', 'belongfeast'];
  const all = [];
  for (const seed of seeds) {
    for (const b of bases) {
      const r = await oneRun(seed, b);
      const nR = Object.keys(r.rounds).length;
      const nF = Object.keys(r.fights).length;
      const withComp = Object.values(r.fights).filter(f => f.hadCompanion).length;
      console.log(`probe done: seed ${seed} ${b} days=${r.gameDays} w4fights=${nF} withCompanion=${withComp} w4-fight-rounds=${nR}`);
      all.push(r);
    }
  }
  const compRoundF = [], compRoundS = [], compMaxHitF = [], compMaxHitS = [], scholarMaxHit = [];
  for (const r of all) {
    for (const key of Object.keys(r.rounds)) {
      const rec = r.rounds[key];
      if (rec.compHits > 0) {
        if (rec.feasted) { compRoundF.push(rec.comp); compMaxHitF.push(rec.compMaxHit); }
        else { compRoundS.push(rec.comp); compMaxHitS.push(rec.compMaxHit); }
      }
      if (rec.scholarMaxHit > 0) scholarMaxHit.push(rec.scholarMaxHit);
    }
  }
  const nFights = all.reduce((t, r) => t + Object.keys(r.fights).length, 0);
  const nWithComp = all.reduce((t, r) => t + Object.values(r.fights).filter(f => f.hadCompanion).length, 0);
  console.log('--- channel check ---');
  console.log(`wave-4 TB fights: ${nFights}, with companion damage: ${nWithComp}`);
  console.log('--- companion per-(fight,round) damage vs wave-4 (rounds with >=1 companion hit) ---');
  console.log(`FEASTED   n=${compRoundF.length} p50=${pct(compRoundF, 0.5)} p75=${pct(compRoundF, 0.75)} p90=${pct(compRoundF, 0.9)} max=${compRoundF.length ? Math.max(...compRoundF) : null}`);
  console.log(`SOBER     n=${compRoundS.length} p50=${pct(compRoundS, 0.5)} p75=${pct(compRoundS, 0.75)} p90=${pct(compRoundS, 0.9)} max=${compRoundS.length ? Math.max(...compRoundS) : null}`);
  console.log('--- companion max single hit ---');
  console.log(`FEASTED   p50=${pct(compMaxHitF, 0.5)} p90=${pct(compMaxHitF, 0.9)} max=${compMaxHitF.length ? Math.max(...compMaxHitF) : null}`);
  console.log(`SOBER     p50=${pct(compMaxHitS, 0.5)} p90=${pct(compMaxHitS, 0.9)} max=${compMaxHitS.length ? Math.max(...compMaxHitS) : null}`);
  console.log('--- scholar max single hit (overshoot guard) ---');
  console.log(`n=${scholarMaxHit.length} p50=${pct(scholarMaxHit, 0.5)} p90=${pct(scholarMaxHit, 0.9)} max=${scholarMaxHit.length ? Math.max(...scholarMaxHit) : null}`);
}

main().catch(e => { console.error('PROBE FAIL: ' + (e && e.stack || e)); process.exit(1); });
