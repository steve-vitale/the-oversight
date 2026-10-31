#!/usr/bin/env node
// spearxbow-fixture-20261031.js — sim-spearxbow-a forced-meeting fixture band.
// MEASUREMENT ONLY. No game code is changed by this script; it only calls
// the real Game.fieldFight through the sim harness.
//
// Usage:
//   node scripts/spearxbow-fixture-20261031.js [outPath]
// Default out: evidence/2026-10-31/perseed-spearxbow-a/fixture-band.json
// The file contains NO timestamps or timings, so two runs on the same
// base are byte-comparable (the determinism gate in the prereg).
//
// Design (see evidence/2026-10-31/sim-spearxbow-a-prereg.md): two roster
// NPC fighters (leader + 1 from-start ally — the largest party
// fieldFight can actually field; the shout path cannot fire in a
// from-start fight, so no ghost third fighter is staged), fixed at age
// 35 / steady / 100 HP, restored before EVERY fight from snapshots
// (villager records in place + the FULL Game.state deep snapshot), so
// nothing learned in one fight leaks into the next. Beast entity is
// fresh {hp: midpoint, maxHp: midpoint} per fight. No awareness (forced
// meeting). All leader tiers share machete + hide_armor; only the
// ranged-slot contents vary. Sensed channel for the ally: CO-PRESENCE
// AT THE MEETING ("already at the door").
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

// Leader tiers. Ammo ON in every tier (8 units > 4-shot volley cap).
// SPEAR carries the bow + arrows too: the slot-conflict proof is that
// autoEquip still puts the SPEAR in the ranged slot and the volley is
// null/0 despite a bow and arrows in hand.
const TIERS = {
  BOW: [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'hide_armor', units: 1 }],
  XBOW: [{ itemId: 'machete', units: 1 }, { itemId: 'crossbow', units: 1 }, { itemId: 'bolt', units: 8 }, { itemId: 'hide_armor', units: 1 }],
  SLING: [{ itemId: 'machete', units: 1 }, { itemId: 'sling', units: 1 }, { itemId: 'stone', units: 8 }, { itemId: 'hide_armor', units: 1 }],
  SPEAR: [{ itemId: 'machete', units: 1 }, { itemId: 'hunting_spear', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'hide_armor', units: 1 }],
};
const BEASTS = [
  { id: 'congregation', hpMid: 1000, speed: 2 },
  { id: 'eater', hpMid: 1050, speed: 4 },
  { id: 'audit', hpMid: 1200, speed: 2 },
];
// variant: { tier, beast, allySpear }
const PILOT_VARIANTS = [
  { tier: 'BOW', beast: 'congregation', allySpear: false },
  { tier: 'XBOW', beast: 'congregation', allySpear: false },
  { tier: 'SLING', beast: 'congregation', allySpear: false },
  { tier: 'SPEAR', beast: 'congregation', allySpear: false },
  { tier: 'BOW', beast: 'congregation', allySpear: true },
];
const CONFIRM_VARIANTS = [];
for (const t of ['BOW', 'XBOW', 'SLING', 'SPEAR']) for (const b of BEASTS) CONFIRM_VARIANTS.push({ tier: t, beast: b.id, allySpear: false });
CONFIRM_VARIANTS.push({ tier: 'BOW', beast: 'congregation', allySpear: true });
const PILOT_STREAMS = [101, 102, 103, 104];
const CONFIRM_STREAMS = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212];

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
    fromStartRate: rate(fights, f => f.fromStartJoined),
    shoutRate: rate(fights, f => f.shoutJoined),
    medianVolleyDmg: median(fights.map(f => f.volleyDmg === null ? 0 : f.volleyDmg)),
    meanVolleyDmg: mean(fights.map(f => f.volleyDmg === null ? 0 : f.volleyDmg)),
    volleyNullRate: rate(fights, f => f.volleyShots === null),
    medianAllyDealt: median(fights.map(f => f.allyDealt || 0)),
    meanAllyDealt: mean(fights.map(f => f.allyDealt || 0)),
    vDieRate: rate(fights, f => f.outcome === 'vDie'),
    spearRangedRate: rate(fights, f => f.equippedRanged === 'hunting_spear'),
  };
}

async function main() {
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-spearxbow-a', 'fixture-band.json');
  let anchor = 'unknown';
  try { anchor = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'spearxbow-fixture' });
  if (loadFails && loadFails.length) { console.error('LOAD FAILS: ' + loadFails.join('; ')); process.exit(1); }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 2) { console.error('NEED 2 NPC ROSTER, HAVE ' + roster.length); process.exit(1); }
  // Leader: boris_kowalski (steady, iron_stomach = food-only, no fieldFight
  // effect — verified by grep: no fieldFights.js/godpath.js reference).
  // Ally: first other roster NPC (its abilities are never read by
  // fieldFight — allies are bodies with flat [3,6] strikes — but recorded).
  const leaderVid = roster.indexOf('boris_kowalski') >= 0 ? 'boris_kowalski' : roster[0];
  const allyVid = roster.filter(id => id !== leaderVid)[0];
  const staged = [leaderVid, allyVid];
  const vpOf = (vid) => (Game.data.villagers || []).find(v => v.id === vid) || {};
  const heldAb = (vid) => { try { return Game.npcOwnedIds ? Game.npcOwnedIds(vid) : []; } catch (e) { return []; } };
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  for (const b of BEASTS) if (!mdef(b.id)) { console.error('MISSING MONSTER DEF: ' + b.id); process.exit(1); }
  for (const t of Object.keys(TIERS)) for (const it of TIERS[t]) {
    if (!(Game.data.items || []).some(i => i.id === it.itemId)) { console.error('MISSING ITEM DEF: ' + it.itemId); process.exit(1); }
  }
  if (!(Game.data.items || []).some(i => i.id === 'hunting_spear')) { console.error('MISSING ITEM DEF: hunting_spear'); process.exit(1); }
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
    const ap = vpOf(allyVid);
    ap.items = variant.allySpear ? [{ itemId: 'hunting_spear', units: 1 }] : [];
    try { ap.equipped = {}; } catch (e) {}
  }

  function variantName(v) { return 'P2-' + v.tier + (v.allySpear ? '-ALLY SPEAR' : '') + 'x' + v.beast; }
  function runVariant(variant, streams, stage) {
    const fights = [];
    const beast = BEASTS.find(b => b.id === variant.beast);
    for (const s of streams) {
      resetFighters(variant);
      const m = { hp: beast.hpMid, maxHp: beast.hpMid };
      const opts = { rng: mulberry32(s), allies: 1, allyVids: [allyVid], allyFromStart: true };
      let rec;
      try { rec = Game.fieldFight(leaderVid, mdef(variant.beast), m, opts); }
      catch (e) { console.error('FIGHT THREW ' + JSON.stringify(variant) + '/' + s + ': ' + e.message); process.exit(1); }
      const vol = rec.volley || null;
      const volDmg = vol ? (vol.dmg || 0) : null;
      const allyDealt = rec.allyDealt || 0;
      const total = rec.mDealt || 0;
      const log = Array.isArray(rec.log) ? rec.log.slice() : [];
      const logText = log.join('\n');
      const leader = vpOf(leaderVid);
      const eq = leader.equipped || {};
      const eqId = (slot) => (eq[slot] && (eq[slot].itemId || eq[slot].id)) || null;
      fights.push({
        stage, variant: variantName(variant),
        party: 2, tier: variant.tier, allySpear: variant.allySpear, beast: variant.beast,
        beastStartHp: beast.hpMid, beastSpeed: beast.speed, stream: s,
        equippedMelee: eqId('melee') || eqId('weapon'), equippedRanged: eqId('ranged'),
        equippedTorso: eqId('torso'),
        volleyShots: vol ? (vol.shots || 0) : null, volleyHits: vol ? (vol.hits || 0) : null,
        volleyDmg: volDmg, ammoLeft: vol ? (vol.ammoLeft ?? null) : null,
        totalDmg: total, leaderDealt: total - (volDmg || 0) - allyDealt, allyDealt,
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
  const pilotSpear = pilotFights.filter(f => f.tier === 'SPEAR' && !f.allySpear);
  const pilotXbow = pilotFights.filter(f => f.tier === 'XBOW');
  const pilotGate = {
    m1_fromStartRate: summarize(pilotFights).fromStartRate,
    m2_xbowVolleyFired: rate(pilotXbow, f => f.volleyShots !== null && f.volleyShots > 0),
    m3_spearRangedRate: rate(pilotSpear, f => f.equippedRanged === 'hunting_spear'),
  };
  const pilotPass = pilotGate.m1_fromStartRate >= 0.9 && pilotGate.m2_xbowVolleyFired === 1 && pilotGate.m3_spearRangedRate === 1;
  console.log('PILOT: ' + JSON.stringify(summarize(pilotFights)));
  console.log('PILOT GATE: ' + JSON.stringify(pilotGate) + ' -> ' + (pilotPass ? 'PASS -> confirm' : 'FAIL -> stop, no confirm'));

  let confirmFights = [], confirm = null, verdict = null;
  if (pilotPass) {
    for (const v of CONFIRM_VARIANTS) confirmFights.push(...runVariant(v, CONFIRM_STREAMS, 'confirm'));
    const byTier = {};
    for (const t of ['BOW', 'XBOW', 'SLING', 'SPEAR']) byTier[t] = summarize(confirmFights.filter(f => f.tier === t && !f.allySpear));
    const spear = confirmFights.filter(f => f.tier === 'SPEAR' && !f.allySpear);
    const s1 = rate(spear, f => f.equippedRanged === 'hunting_spear');
    const s2 = rate(spear, f => f.volleyShots === null || f.volleyShots === 0);
    const x1 = byTier.XBOW.medianVolleyDmg > byTier.BOW.medianVolleyDmg
      && byTier.XBOW.medianVolleyDmg > byTier.SLING.medianVolleyDmg
      && byTier.XBOW.medianVolleyDmg > byTier.SPEAR.medianVolleyDmg;
    const x2 = byTier.XBOW.medianTotalDmg >= byTier.BOW.medianTotalDmg;
    const allySpearSum = summarize(confirmFights.filter(f => f.allySpear));
    const bowCong = summarize(confirmFights.filter(f => f.tier === 'BOW' && !f.allySpear && f.beast === 'congregation'));
    confirm = { byTier,
      spear: { s1_spearRangedRate: s1, s2_volleyZeroRate: s2, pass: s1 >= 0.9 && s2 >= 0.9 },
      xbow: { x1_volleyRankFirst: x1, x2_totalGeBow: x2, pass: x1 && x2 },
      allySpear: allySpearSum, bowCongregation: bowCong,
    };
    verdict = 'SPEAR:' + (confirm.spear.pass ? 'GO' : 'NO-GO') + ' XBOW:' + (confirm.xbow.pass ? 'GO' : 'NO-GO');
    console.log('CONFIRM: ' + JSON.stringify(confirm));
  } else {
    verdict = 'KILLED-AT-PILOT';
  }

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
  // Per-tier-per-beast summaries (confirm only).
  const perTierBeast = {};
  for (const f of confirmFights) {
    const k = f.variant;
    (perTierBeast[k] = perTierBeast[k] || []).push(f);
  }
  for (const k of Object.keys(perTierBeast)) perTierBeast[k] = summarize(perTierBeast[k]);

  const out = {
    arm: 'sim-spearxbow-a', anchorCommit: anchor, harnessSeed: 4242,
    leader: leaderVid, ally: allyVid, fighterInfo,
    pilotGate, pilotPass,
    confirm, confirmVerdict: verdict, perVariant, perTierBeast,
    fights: [...pilotFights, ...confirmFights],
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('WROTE ' + outPath + ' fights=' + out.fights.length + ' verdict=' + verdict);
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
