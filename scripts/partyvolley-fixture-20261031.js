#!/usr/bin/env node
// partyvolley-fixture-20261031.js — sim-partyvolley-b forced-meeting fixture band.
// MEASUREMENT ONLY. No game code is changed by this script; it only calls
// the real Game.fieldFight through the sim harness.
//
// Usage:
//   node scripts/partyvolley-fixture-20261031.js [outPath]
// Default out: evidence/2026-10-31/perseed-partyvolley-b/fixture-band.json
// The file contains NO timestamps or timings, so two runs on the same
// base are byte-comparable (the determinism gate in the prereg).
//
// Design (see evidence/2026-10-31/sim-partyvolley-b-prereg.md): three
// roster NPC fighters, fixed at age 35 / steady / 100 HP, restored
// before EVERY fight from snapshots (villager records in place + the
// FULL Game.state deep snapshot), so no trick observation, bond, deed,
// wound, or pattern learned in one fight leaks into the next (the
// volleyfix caveat-2 drift, frozen here by construction). Beast entity
// is fresh {hp: midpoint, maxHp: midpoint} per fight. No awareness
// (forced meeting). Party staging follows the engine's own cap: at most
// ONE ally joins from the start (allyFromStart); a second staged ally
// can enter only via the hopeless-shout branch.
// Leader gear tiers vary; allies carry no gear (ally strikes are flat
// [3,6] and ally hits take no armor in this engine — varying ally gear
// would be a null manipulation, stated in the prereg).
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

// Leader gear tiers. Ammo ON in every tier (8 units > 4-shot volley cap).
const TIERS = {
  BOW: [{ itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }],
  DUAL: [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }],
  BARK: [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'bark_armor', units: 1 }],
  HIDE: [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'hide_armor', units: 1 }],
  XBOW: [{ itemId: 'machete', units: 1 }, { itemId: 'crossbow', units: 1 }, { itemId: 'bolt', units: 8 }, { itemId: 'hide_armor', units: 1 }],
  SPEAR: [{ itemId: 'hunting_spear', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'hide_armor', units: 1 }],
};
const BEASTS = [
  { id: 'congregation', hpMid: 1000, speed: 2 },
  { id: 'influencer', hpMid: 950, speed: 3 },
  { id: 'eater', hpMid: 1050, speed: 4 },
  { id: 'audit', hpMid: 1200, speed: 2 },
  { id: 'algorithm', hpMid: 1100, speed: 3 },
];
const PILOT_VARIANTS = [
  { party: 1, tier: 'BOW', beast: 'congregation' },
  { party: 1, tier: 'DUAL', beast: 'congregation' },
  { party: 2, tier: 'DUAL', beast: 'congregation' },
  { party: 3, tier: 'DUAL', beast: 'congregation' },
  { party: 3, tier: 'HIDE', beast: 'congregation' },
  { party: 3, tier: 'DUAL', beast: 'eater' },
  { party: 3, tier: 'HIDE', beast: 'eater' },
  { party: 3, tier: 'HIDE', beast: 'audit' },
];
const CONFIRM_VARIANTS = [];
for (const p of [1, 2, 3]) for (const b of BEASTS) CONFIRM_VARIANTS.push({ party: p, tier: 'DUAL', beast: b.id });
for (const t of ['BOW', 'BARK', 'HIDE']) for (const b of BEASTS) CONFIRM_VARIANTS.push({ party: 3, tier: t, beast: b.id });
for (const b of BEASTS) CONFIRM_VARIANTS.push({ party: 1, tier: 'BOW', beast: b.id });
for (const b of BEASTS) CONFIRM_VARIANTS.push({ party: 3, tier: 'XBOW', beast: b.id });
CONFIRM_VARIANTS.push({ party: 3, tier: 'SPEAR', beast: 'congregation' });
const PILOT_STREAMS = [101, 102, 103, 104];
const CONFIRM_STREAMS = [201, 202, 203, 204, 205, 206, 207, 208];

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
function rate(arr, pred) { return arr.length ? arr.filter(pred).length / arr.length : null; }

function summarize(fights) {
  const outcomes = {};
  for (const f of fights) outcomes[f.outcome] = (outcomes[f.outcome] || 0) + 1;
  const dprs = fights.filter(f => f.rounds > 0).map(f => f.dpr);
  const kd = fights.filter(f => f.outcome === 'vKill' || f.outcome === 'mFlee').length;
  return {
    n: fights.length,
    medianTotalDmg: median(fights.map(f => f.totalDmg)),
    meanTotalDmg: mean(fights.map(f => f.totalDmg)),
    medianRounds: median(fights.map(f => f.rounds)),
    meanRounds: mean(fights.map(f => f.rounds)),
    medianDpr: median(dprs),
    meanDpr: mean(dprs),
    killDriveOff: kd, killDriveOffRate: fights.length ? kd / fights.length : null,
    outcomes,
    fromStartRate: rate(fights.filter(f => f.party >= 2), f => f.fromStartJoined),
    shoutRate: rate(fights.filter(f => f.party >= 3), f => f.shoutJoined),
    medianVolleyDmg: median(fights.map(f => f.volleyDmg || 0)),
    medianAllyDealt: median(fights.map(f => f.allyDealt || 0)),
    vDieRate: rate(fights, f => f.outcome === 'vDie'),
  };
}

async function main() {
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-partyvolley-b', 'fixture-band.json');
  let anchor = 'unknown';
  try { anchor = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'partyvolley-fixture' });
  if (loadFails && loadFails.length) { console.error('LOAD FAILS: ' + loadFails.join('; ')); process.exit(1); }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.error('NEED 3 NPC ROSTER, HAVE ' + roster.length); process.exit(1); }
  // Leader: boris_kowalski (steady, iron_stomach = food-only, no fieldFight
  // effect — verified by grep: no fieldFights.js/godpath.js reference).
  // Allies: first two other roster NPCs (their abilities are never read by
  // fieldFight — allies are bodies with flat [3,6] strikes — but recorded).
  const leaderVid = roster.indexOf('boris_kowalski') >= 0 ? 'boris_kowalski' : roster[0];
  const allyVidsAll = roster.filter(id => id !== leaderVid).slice(0, 2);
  const staged = [leaderVid, allyVidsAll[0], allyVidsAll[1]];
  const vpOf = (vid) => (Game.data.villagers || []).find(v => v.id === vid) || {};
  const heldAb = (vid) => { try { return Game.npcOwnedIds ? Game.npcOwnedIds(vid) : []; } catch (e) { return []; } };
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  for (const b of BEASTS) if (!mdef(b.id)) { console.error('MISSING MONSTER DEF: ' + b.id); process.exit(1); }
  for (const t of Object.keys(TIERS)) for (const it of TIERS[t]) {
    if (!(Game.data.items || []).some(i => i.id === it.itemId)) { console.error('MISSING ITEM DEF: ' + it.itemId); process.exit(1); }
  }
  // Fix the staged fighters: age 35, steady, then snapshot.
  for (const vid of staged) {
    const vp = vpOf(vid);
    vp.age = 35;
    try { vp.personality = { temperament: 'steady' }; } catch (e) {}
  }
  const vpSnaps = {};
  for (const vid of staged) vpSnaps[vid] = JSON.parse(JSON.stringify(vpOf(vid)));
  const stateSnap = JSON.parse(JSON.stringify(Game.state));
  const fighterInfo = {};
  for (const vid of staged) {
    fighterInfo[vid] = { age: 35, temperament: 'steady', health: 100, heldAbilities: heldAb(vid),
      speed: (Game.villagerSpeed ? Game.villagerSpeed(vid) : null) };
  }

  function restoreAll() {
    // Restore Game.state in place (same object identity).
    const st = Game.state;
    for (const k of Object.keys(st)) if (!(k in stateSnap)) delete st[k];
    for (const k of Object.keys(stateSnap)) st[k] = JSON.parse(JSON.stringify(stateSnap[k]));
    for (const vid of staged) {
      const vp = vpOf(vid), snap = vpSnaps[vid];
      for (const k of Object.keys(vp)) if (!(k in snap)) delete vp[k];
      for (const k of Object.keys(snap)) vp[k] = JSON.parse(JSON.stringify(snap[k]));
    }
  }
  function resetFighters(variant) {
    restoreAll();
    for (const vid of staged) {
      try { (Game.state.village.health = Game.state.village.health || {})[vid] = 100; } catch (e) {}
    }
    const leader = vpOf(leaderVid);
    leader.items = JSON.parse(JSON.stringify(TIERS[variant.tier]));
    try { delete leader.equipped; } catch (e) {}
    for (const avid of allyVidsAll) {
      const ap = vpOf(avid);
      ap.items = [];
      try { ap.equipped = {}; } catch (e) {}
    }
  }

  function runVariant(variant, streams, stage) {
    const fights = [];
    const beast = BEASTS.find(b => b.id === variant.beast);
    const allies = variant.party - 1;
    for (const s of streams) {
      resetFighters(variant);
      const m = { hp: beast.hpMid, maxHp: beast.hpMid };
      const opts = { rng: mulberry32(s) };
      if (allies > 0) { opts.allies = allies; opts.allyVids = allyVidsAll.slice(0, allies); opts.allyFromStart = true; }
      let rec;
      try { rec = Game.fieldFight(leaderVid, mdef(variant.beast), m, opts); }
      catch (e) { console.error('FIGHT THREW ' + JSON.stringify(variant) + '/' + s + ': ' + e.message); process.exit(1); }
      const vol = rec.volley || null;
      const volDmg = vol ? (vol.dmg || 0) : 0;
      const allyDealt = rec.allyDealt || 0;
      const total = rec.mDealt || 0;
      const log = Array.isArray(rec.log) ? rec.log.slice() : [];
      const logText = log.join('\n');
      const leader = vpOf(leaderVid);
      const eq = leader.equipped || {};
      const eqId = (slot) => (eq[slot] && (eq[slot].itemId || eq[slot].id)) || null;
      fights.push({
        stage, variant: 'P' + variant.party + '-' + variant.tier + 'x' + variant.beast,
        party: variant.party, tier: variant.tier, beast: variant.beast,
        beastStartHp: beast.hpMid, beastSpeed: beast.speed, stream: s,
        equippedMelee: eqId('melee') || eqId('weapon'), equippedRanged: eqId('ranged'),
        equippedTorso: eqId('torso'),
        volleyShots: vol ? (vol.shots || 0) : null, volleyHits: vol ? (vol.hits || 0) : null,
        volleyDmg: vol ? volDmg : null, ammoLeft: vol ? (vol.ammoLeft ?? null) : null,
        totalDmg: total, leaderDealt: total - volDmg - allyDealt, allyDealt,
        rounds: rec.rounds !== undefined ? rec.rounds : null,
        dpr: (rec.rounds > 0) ? total / rec.rounds : null,
        outcome: rec.outcome || 'unresolved', intent: rec.intent || null, intentWhy: rec.intentWhy || null,
        fromStartJoined: logText.indexOf('already at the door') >= 0,
        shoutJoined: logText.indexOf('shouts for help') >= 0,
        vTaken: rec.vTaken !== undefined ? rec.vTaken : null, vHpLeft: rec.vHpLeft !== undefined ? rec.vHpLeft : null,
        allyTaken: rec.allyTaken !== undefined ? rec.allyTaken : null, allyHpLeft: rec.allyHpLeft !== undefined ? rec.allyHpLeft : null,
        mHpLeft: rec.mHpLeft !== undefined ? rec.mHpLeft : null,
        log,
      });
    }
    return fights;
  }

  const pilotFights = [];
  for (const v of PILOT_VARIANTS) pilotFights.push(...runVariant(v, PILOT_STREAMS, 'pilot'));
  const pilotP3 = pilotFights.filter(f => f.party === 3);
  const pilotP3Sum = summarize(pilotP3);
  const pilotGate = {
    g1_fromStart: pilotP3Sum.fromStartRate,
    g2_medianRounds: pilotP3Sum.medianRounds,
    g3_medianTotalDmg: pilotP3Sum.medianTotalDmg,
  };
  const pilotPass = (pilotP3Sum.fromStartRate !== null && pilotP3Sum.fromStartRate >= 0.9)
    && (pilotP3Sum.medianRounds !== null && pilotP3Sum.medianRounds >= 3)
    && (pilotP3Sum.medianTotalDmg !== null && pilotP3Sum.medianTotalDmg >= 71);
  console.log('PILOT P3: ' + JSON.stringify(pilotP3Sum));
  console.log('PILOT GATE: ' + (pilotPass ? 'PASS -> confirm' : 'FAIL -> stop, no confirm'));

  let confirmFights = [], confirm = null, verdict = null;
  if (pilotPass) {
    for (const v of CONFIRM_VARIANTS) confirmFights.push(...runVariant(v, CONFIRM_STREAMS, 'confirm'));
    const p3hide = confirmFights.filter(f => f.variant.indexOf('P3-HIDEx') === 0);
    const p1bow = confirmFights.filter(f => f.variant.indexOf('P1-BOWx') === 0);
    const p3all = confirmFights.filter(f => f.party === 3);
    const sP3Hide = summarize(p3hide), sP1Bow = summarize(p1bow), sP3All = summarize(p3all);
    const p1 = sP3Hide.medianTotalDmg !== null && sP1Bow.medianTotalDmg !== null && sP3Hide.medianTotalDmg >= 2 * sP1Bow.medianTotalDmg;
    const p2 = sP3Hide.medianRounds !== null && sP3Hide.medianRounds >= 3;
    const p3 = sP3All.fromStartRate !== null && sP3All.fromStartRate >= 0.9;
    confirm = { p3hide: sP3Hide, p1bow: sP1Bow, p3all: sP3All,
      primary: { P1_medianTotalDmg_ge_2x_lone: p1, P2_medianRounds_ge_3: p2, P3_fromStart_ge_90pct: p3 } };
    verdict = (p1 && p2 && p3) ? 'DIAG-GO' : 'DIAG-NO-GO';
    console.log('CONFIRM: ' + JSON.stringify(confirm));
  } else {
    verdict = 'DIAG-NO-GO (pilot gate)';
  }

  // Per-variant summaries (both stages).
  const perVariant = {};
  for (const f of [...pilotFights, ...confirmFights]) {
    const k = f.stage + ':' + f.variant;
    perVariant[k] = perVariant[k] || { stage: f.stage, variant: f.variant, n: 0, fights: [] };
    perVariant[k].fights.push(f);
  }
  for (const k of Object.keys(perVariant)) {
    const p = perVariant[k], s = summarize(p.fights);
    perVariant[k] = { stage: p.stage, variant: p.variant, n: p.fights.length, summary: s };
  }
  // Per-band summaries: party x tier (confirm only).
  const perBand = {};
  for (const f of confirmFights) {
    const k = 'P' + f.party + '-' + f.tier;
    (perBand[k] = perBand[k] || []).push(f);
  }
  for (const k of Object.keys(perBand)) perBand[k] = summarize(perBand[k]);

  const out = {
    arm: 'sim-partyvolley-b', anchorCommit: anchor, harnessSeed: 4242,
    leader: leaderVid, allies: allyVidsAll, fighterInfo,
    pilotGate, pilotPass, pilotP3Summary: pilotP3Sum,
    confirm, confirmVerdict: verdict, perVariant, perBand,
    fights: [...pilotFights, ...confirmFights],
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('WROTE ' + outPath + ' fights=' + out.fights.length + ' verdict=' + verdict);
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
