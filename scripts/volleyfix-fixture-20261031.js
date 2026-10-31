#!/usr/bin/env node
// volleyfix-fixture-20261031.js — sim-volleyfix-b forced-meeting fixture band.
// MEASUREMENT ONLY. No game code is changed by this script; it only calls
// the real Game.fieldFight through the sim harness.
//
// Usage:
//   node scripts/volleyfix-fixture-20261031.js [outPath]
// Default out: evidence/2026-10-31/perseed-volleyfix-b/fixture-band.json
// The file contains NO timestamps or timings, so two runs on the same
// base are byte-comparable (the determinism gate in the prereg).
//
// Design (see evidence/2026-10-31/sim-volleyfix-b-prereg.md): one roster
// NPC, fixed at age 35 / steady / 100 HP, reset before EVERY fight from
// a snapshot (villager record + health + agency xp entry), so each
// ON/OFF pair shares one rng stream and differs ONLY in ammo on hand.
// Beast entity is fresh {hp: midpoint, maxHp: midpoint} per fight.
// No awareness (forced meeting), no allies (solo), no policy.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const WEAPONS = {
  bow: { weaponId: 'crude_bow', ammoId: 'arrow' },
  sling: { weaponId: 'sling', ammoId: 'stone' },
  crossbow: { weaponId: 'crossbow', ammoId: 'bolt' },
};
const BEASTS = [
  { id: 'congregation', hpMid: 1000, speed: 2 },
  { id: 'influencer', hpMid: 950, speed: 3 },
  { id: 'eater', hpMid: 1050, speed: 4 },
  { id: 'audit', hpMid: 1200, speed: 2 },
  { id: 'algorithm', hpMid: 1100, speed: 3 },
];
const PILOT_VARIANTS = [];
for (const w of ['bow', 'sling']) for (const b of BEASTS.slice(0, 4)) PILOT_VARIANTS.push({ weapon: w, beast: b.id, ammoUnits: 8 });
const CONFIRM_VARIANTS = [];
for (const w of ['bow', 'sling', 'crossbow']) for (const b of BEASTS) CONFIRM_VARIANTS.push({ weapon: w, beast: b.id, ammoUnits: 8 });
CONFIRM_VARIANTS.push({ weapon: 'bow', beast: 'congregation', ammoUnits: 1 });
const PILOT_STREAMS = [101, 102, 103, 104];
const CONFIRM_STREAMS = [201, 202, 203, 204, 205, 206, 207, 208];

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }

function summarize(fights) {
  const on = fights.filter(f => f.arm === 'ON');
  const shotsPos = on.filter(f => (f.volleyShots || 0) > 0).length;
  const volDmg = on.map(f => f.volleyDmg || 0);
  const shares = on.map(f => f.volleyShare);
  const fracs = on.map(f => f.volleyFracHp);
  const flips = fights.filter(f => f.arm === 'ON' && f.flip).length;
  const outcomes = {};
  for (const f of on) outcomes[f.outcome] = (outcomes[f.outcome] || 0) + 1;
  const offOutcomes = {};
  for (const f of fights.filter(f => f.arm === 'OFF')) offOutcomes[f.outcome] = (offOutcomes[f.outcome] || 0) + 1;
  return {
    nOn: on.length, nOff: fights.length - on.length,
    shotsPos, shotsRate: on.length ? shotsPos / on.length : null,
    medianVolleyDmg: median(volDmg), meanVolleyDmg: mean(volDmg),
    medianVolleyShare: median(shares), meanVolleyShare: mean(shares),
    medianVolleyFracHp: median(fracs), meanVolleyFracHp: mean(fracs),
    flips, onOutcomes: outcomes, offOutcomes,
  };
}

async function main() {
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-volleyfix-b', 'fixture-band.json');
  let anchor = 'unknown';
  try { anchor = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'volleyfix-fixture' });
  if (loadFails && loadFails.length) { console.error('LOAD FAILS: ' + loadFails.join('; ')); process.exit(1); }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (!roster.length) { console.error('NO NPC ROSTER'); process.exit(1); }
  const vid = roster[0];
  const vp = (Game.data.villagers || []).find(v => v.id === vid) || {};
  // Fix the fighter: age 35, steady, day-0 record otherwise untouched.
  vp.age = 35;
  try { vp.personality = { temperament: 'steady' }; } catch (e) {}
  let heldAbilities = [];
  try { heldAbilities = (typeof Game.npcOwnedIds === 'function') ? Game.npcOwnedIds(vid) : (((Game.state.village || {}).npcAbilities || {})[vid] || []).slice(); } catch (e) {}
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  for (const b of BEASTS) if (!mdef(b.id)) { console.error('MISSING MONSTER DEF: ' + b.id); process.exit(1); }
  for (const w of Object.keys(WEAPONS)) if (!(Game.data.items || []).some(i => i.id === WEAPONS[w].weaponId)) { console.error('MISSING WEAPON DEF: ' + w); process.exit(1); }

  // Snapshot AFTER fixing age/personality, BEFORE any fight.
  const vpSnap = JSON.parse(JSON.stringify(vp));
  const healthSnap = ((Game.state.village.health || {})[vid] !== undefined) ? (Game.state.village.health[vid]) : null;
  let agencySnap = null;
  try {
    const ag = Game.agencyOf ? Game.agencyOf(vid) : null;
    const xp = ag && ag.xp && ag.xp[vid] ? JSON.parse(JSON.stringify(ag.xp[vid])) : null;
    if (xp) agencySnap = xp;
  } catch (e) {}

  function resetFighter(weapon, ammoUnits) {
    // Restore the villager record in place (same object identity), then
    // apply exactly the fixture gear. Health and agency xp restored too,
    // so each fight starts from the same fighter state.
    try {
      for (const k of Object.keys(vp)) if (!(k in vpSnap)) delete vp[k];
      for (const k of Object.keys(vpSnap)) vp[k] = JSON.parse(JSON.stringify(vpSnap[k]));
    } catch (e) {}
    try { (Game.state.village.health = Game.state.village.health || {})[vid] = 100; } catch (e) {}
    try {
      if (agencySnap) {
        const ag = Game.agencyOf(vid);
        if (ag && ag.xp) ag.xp[vid] = JSON.parse(JSON.stringify(agencySnap));
      }
    } catch (e) {}
    const w = WEAPONS[weapon];
    vp.items = [{ itemId: w.weaponId, units: 1 }];
    if (ammoUnits > 0) vp.items.push({ itemId: w.ammoId, units: ammoUnits });
    try { delete vp.equipped; } catch (e) {}
  }

  function runVariant(variant, streams) {
    const fights = [];
    const beast = BEASTS.find(b => b.id === variant.beast);
    for (const s of streams) {
      const pair = {};
      for (const arm of ['OFF', 'ON']) {
        const ammoUnits = arm === 'ON' ? variant.ammoUnits : 0;
        resetFighter(variant.weapon, ammoUnits);
        const m = { hp: beast.hpMid, maxHp: beast.hpMid };
        let rec;
        try { rec = Game.fieldFight(vid, mdef(variant.beast), m, { rng: mulberry32(s) }); }
        catch (e) { console.error('FIGHT THREW ' + variant.weapon + '/' + variant.beast + '/' + arm + ': ' + e.message); process.exit(1); }
        const vol = rec.volley || null;
        const volDmg = vol ? (vol.dmg || 0) : 0;
        const total = rec.mDealt || 0;
        const row = {
          stage: null, variant: variant.weapon + 'x' + variant.beast + 'x' + variant.ammoUnits,
          weapon: variant.weapon, weaponId: WEAPONS[variant.weapon].weaponId,
          ammoId: WEAPONS[variant.weapon].ammoId, ammoUnitsAtStart: ammoUnits,
          beast: variant.beast, beastStartHp: beast.hpMid, beastSpeed: beast.speed,
          stream: s, arm,
          volleyShots: vol ? (vol.shots || 0) : null, volleyHits: vol ? (vol.hits || 0) : null,
          volleyDmg: vol ? volDmg : null, ammoLeft: vol ? (vol.ammoLeft ?? null) : null,
          totalDmg: total, meleeDmg: total - (vol ? volDmg : 0),
          rounds: rec.rounds !== undefined ? rec.rounds : null,
          outcome: rec.outcome || 'unresolved', intent: rec.intent || null, intentWhy: rec.intentWhy || null,
          vTaken: rec.vTaken !== undefined ? rec.vTaken : null, vHpLeft: rec.vHpLeft !== undefined ? rec.vHpLeft : null,
          mHpLeft: rec.mHpLeft !== undefined ? rec.mHpLeft : null,
          volleyShare: total > 0 ? volDmg / total : (volDmg > 0 ? 1 : 0),
          volleyFracHp: volDmg / beast.hpMid,
          log: arm === 'ON' ? (Array.isArray(rec.log) ? rec.log.slice() : []) : undefined,
        };
        pair[arm] = row;
        fights.push(row);
      }
      const on = pair.ON, off = pair.OFF;
      on.flip = on.outcome !== off.outcome;
      on.offOutcome = off.outcome;
      on.flipKind = on.flip ? (off.outcome + '->' + on.outcome) : null;
      off.offOutcome = null; off.flip = null; off.flipKind = null;
    }
    return fights;
  }

  const pilotFights = [];
  for (const v of PILOT_VARIANTS) { const fs = runVariant(v, PILOT_STREAMS); fs.forEach(f => { f.stage = 'pilot'; }); pilotFights.push(...fs); }
  const pilot = summarize(pilotFights);
  const pilotPass = pilot.shotsRate !== null && pilot.shotsRate >= 0.75 && (pilot.medianVolleyDmg || 0) > 0;
  console.log('PILOT: ' + JSON.stringify(pilot));
  console.log('PILOT GATE: ' + (pilotPass ? 'PASS -> confirm' : 'FAIL -> stop, no confirm'));

  let confirmFights = [], confirm = null;
  if (pilotPass) {
    for (const v of CONFIRM_VARIANTS) { const fs = runVariant(v, CONFIRM_STREAMS); fs.forEach(f => { f.stage = 'confirm'; }); confirmFights.push(...fs); }
    confirm = summarize(confirmFights);
    console.log('CONFIRM: ' + JSON.stringify(confirm));
  }

  const perVariant = {};
  for (const f of [...pilotFights, ...confirmFights].filter(x => x.arm === 'ON')) {
    const k = f.stage + ':' + f.variant;
    perVariant[k] = perVariant[k] || { stage: f.stage, variant: f.variant, n: 0, shotsPos: 0, volDmg: [], shares: [], fracs: [], flips: 0, outcomes: {} };
    const p = perVariant[k];
    p.n++; if ((f.volleyShots || 0) > 0) p.shotsPos++;
    p.volDmg.push(f.volleyDmg || 0); p.shares.push(f.volleyShare); p.fracs.push(f.volleyFracHp);
    if (f.flip) p.flips++;
    p.outcomes[f.outcome] = (p.outcomes[f.outcome] || 0) + 1;
  }
  for (const k of Object.keys(perVariant)) {
    const p = perVariant[k];
    p.shotsRate = p.n ? p.shotsPos / p.n : null;
    p.medianVolleyDmg = median(p.volDmg); p.medianVolleyShare = median(p.shares); p.medianVolleyFracHp = median(p.fracs);
    delete p.volDmg; delete p.shares; delete p.fracs;
  }

  const out = {
    arm: 'sim-volleyfix-b', anchorCommit: anchor, harnessSeed: 4242, fighter: vid,
    fighterFixed: { age: 35, temperament: 'steady', health: 100, heldAbilities },
    pilot, pilotPass, confirm,
    confirmVerdict: !pilotPass ? 'DIAG-NO-GO (pilot gate)' : (confirm.shotsRate >= 0.75 && (confirm.medianVolleyDmg || 0) > 0 ? 'DIAG-GO' : 'DIAG-NO-GO'),
    perVariant, fights: [...pilotFights, ...confirmFights],
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('WROTE ' + outPath + ' fights=' + out.fights.length + ' verdict=' + out.confirmVerdict);
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
